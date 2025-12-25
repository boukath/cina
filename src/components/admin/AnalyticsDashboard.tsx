import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Banknote, 
  Calendar,
  Scissors,
  UserCheck,
  CreditCard,
  Clock
} from 'lucide-react';

interface Stylist {
  id: string;
  name: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  averageTicket: number;
  revenueByMonth: { month: string; revenue: number }[];
  revenueByStylist: { name: string; revenue: number; bookings: number }[];
  revenueByService: { name: string; revenue: number; count: number }[];
  revenueByPaymentMethod: { method: string; amount: number }[];
  bookingsByStatus: { status: string; count: number }[];
  topClients: { name: string; totalSpent: number; visits: number }[];
  invitedClients: { invitedBy: string; count: number; revenue: number }[];
}

const COLORS = ['#D4A574', '#B8956A', '#9C8060', '#806B56', '#64564C', '#C9B896'];

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Fetch all data
    const [bookingsRes, servicesRes, stylistsRes] = await Promise.all([
      supabase.from('bookings').select('*'),
      supabase.from('services').select('*'),
      supabase.from('stylists').select('*')
    ]);

    const bookings = bookingsRes.data || [];
    const services = servicesRes.data || [];
    const fetchedStylists = stylistsRes.data || [];
    
    setStylists(fetchedStylists);

    const servicesPriceMap = new Map(services.map(s => [s.name, Number(s.price)]));
    const stylistsMap = new Map(fetchedStylists.map(s => [s.id, s.name]));

    // Filter completed bookings in the period
    const completedInPeriod = bookings.filter(b => 
      b.status === 'completed' && 
      new Date(b.event_date) >= startDate
    );

    const allCompleted = bookings.filter(b => b.status === 'completed');

    // Calculate total revenue
    const totalRevenue = completedInPeriod.reduce((sum, b) => {
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      return sum + paid;
    }, 0);

    // Average ticket
    const averageTicket = completedInPeriod.length > 0 
      ? totalRevenue / completedInPeriod.length 
      : 0;

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthRevenue = allCompleted
        .filter(b => {
          const date = new Date(b.event_date);
          return date >= monthDate && date <= monthEnd;
        })
        .reduce((sum, b) => sum + (Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0), 0);
      
      revenueByMonth.push({ month: monthName, revenue: monthRevenue });
    }

    // Revenue by stylist
    const stylistStats = new Map<string, { revenue: number; bookings: number }>();
    completedInPeriod.forEach(b => {
      const stylistName = b.stylist_id ? stylistsMap.get(b.stylist_id) || 'Non assigné' : 'Non assigné';
      const current = stylistStats.get(stylistName) || { revenue: 0, bookings: 0 };
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      stylistStats.set(stylistName, {
        revenue: current.revenue + paid,
        bookings: current.bookings + 1
      });
    });
    const revenueByStylist = Array.from(stylistStats.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      bookings: data.bookings
    }));

    // Revenue by service
    const serviceStats = new Map<string, { revenue: number; count: number }>();
    completedInPeriod.forEach(b => {
      const current = serviceStats.get(b.service) || { revenue: 0, count: 0 };
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      serviceStats.set(b.service, {
        revenue: current.revenue + paid,
        count: current.count + 1
      });
    });
    const revenueByService = Array.from(serviceStats.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      count: data.count
    })).sort((a, b) => b.revenue - a.revenue);

    // Revenue by payment method
    const paymentStats = new Map<string, number>();
    completedInPeriod.forEach(b => {
      const method = b.payment_method || 'cash';
      const current = paymentStats.get(method) || 0;
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      paymentStats.set(method, current + paid);
    });
    const revenueByPaymentMethod = Array.from(paymentStats.entries()).map(([method, amount]) => ({
      method: method === 'cash' ? 'Espèces' : method === 'card' ? 'Carte' : method,
      amount
    }));

    // Bookings by status
    const statusCounts = new Map<string, number>();
    bookings.forEach(b => {
      const current = statusCounts.get(b.status) || 0;
      statusCounts.set(b.status, current + 1);
    });
    const statusLabels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    const bookingsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status: statusLabels[status] || status,
      count
    }));

    // Top clients
    const clientStats = new Map<string, { totalSpent: number; visits: number }>();
    allCompleted.forEach(b => {
      const current = clientStats.get(b.name) || { totalSpent: 0, visits: 0 };
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      clientStats.set(b.name, {
        totalSpent: current.totalSpent + paid,
        visits: current.visits + 1
      });
    });
    const topClients = Array.from(clientStats.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Invited clients (parrainage)
    const inviteStats = new Map<string, { count: number; revenue: number }>();
    allCompleted.filter(b => b.invited_by).forEach(b => {
      const inviter = b.invited_by!;
      const current = inviteStats.get(inviter) || { count: 0, revenue: 0 };
      const paid = Number(b.paid_amount) || servicesPriceMap.get(b.service) || 0;
      inviteStats.set(inviter, {
        count: current.count + 1,
        revenue: current.revenue + paid
      });
    });
    const invitedClients = Array.from(inviteStats.entries())
      .map(([invitedBy, data]) => ({ invitedBy, ...data }))
      .sort((a, b) => b.count - a.count);

    setAnalytics({
      totalRevenue,
      totalBookings: bookings.length,
      completedBookings: completedInPeriod.length,
      averageTicket,
      revenueByMonth,
      revenueByStylist,
      revenueByService,
      revenueByPaymentMethod,
      bookingsByStatus,
      topClients,
      invitedClients
    });
    
    setLoading(false);
  };

  if (loading || !analytics) {
    return <div className="flex justify-center p-8">Chargement des analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['month', 'quarter', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              period === p
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-foreground hover:bg-secondary'
            }`}
          >
            {p === 'month' ? 'Ce mois' : p === 'quarter' ? 'Ce trimestre' : 'Cette année'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString('fr-DZ')} DZD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients servis</p>
                <p className="text-2xl font-bold">{analytics.completedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Panier moyen</p>
                <p className="text-2xl font-bold">{Math.round(analytics.averageTicket).toLocaleString('fr-DZ')} DZD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total réservations</p>
                <p className="text-2xl font-bold">{analytics.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="stylists">Coiffeuses</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="invites">Parrainages</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution du CA</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString('fr-DZ')} DZD`, 'CA']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Par méthode de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.revenueByPaymentMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {analytics.revenueByPaymentMethod.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString('fr-DZ')} DZD`, 'Montant']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stylists Tab */}
        <TabsContent value="stylists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Performance par coiffeuse
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.revenueByStylist.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueByStylist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `${value.toLocaleString('fr-DZ')} DZD` : value,
                        name === 'revenue' ? 'CA' : 'Clients'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="CA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="bookings" name="Clients" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune donnée disponible. Assignez des coiffeuses aux réservations.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stylist Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {analytics.revenueByStylist.map((stylist, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{stylist.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{stylist.name}</p>
                      <p className="text-sm text-muted-foreground">{stylist.bookings} clients</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{stylist.revenue.toLocaleString('fr-DZ')} DZD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenus par service</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenueByService} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `${value.toLocaleString('fr-DZ')} DZD` : value,
                      name === 'revenue' ? 'CA' : 'Nombre'
                    ]}
                  />
                  <Bar dataKey="revenue" name="CA" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top 10 Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topClients.map((client, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-sm text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.visits} visites</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{client.totalSpent.toLocaleString('fr-DZ')} DZD</p>
                    </div>
                  </div>
                ))}
                {analytics.topClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Aucun client terminé</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Parrainages (Marie invitée par...)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.invitedClients.length > 0 ? (
                <div className="space-y-3">
                  {analytics.invitedClients.map((invite, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{invite.invitedBy}</p>
                        <p className="text-sm text-muted-foreground">{invite.count} parrainages</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{invite.revenue.toLocaleString('fr-DZ')} DZD</p>
                        <p className="text-xs text-muted-foreground">CA généré</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun parrainage enregistré. Ajoutez "Invité par" lors de la finalisation.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribution des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.bookingsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.bookingsByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}