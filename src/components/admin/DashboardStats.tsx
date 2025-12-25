import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, XCircle, Euro, Users } from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayBookings: number;
  thisWeekBookings: number;
  thisMonthRevenue: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    thisMonthRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Get all bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*');

    if (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      return;
    }

    // Get services for revenue calculation
    const { data: services } = await supabase
      .from('services')
      .select('name, price');

    const servicesPriceMap = new Map(services?.map(s => [s.name, Number(s.price)]) || []);

    const all = bookings || [];
    
    // Calculate stats
    const pending = all.filter(b => b.status === 'pending').length;
    const confirmed = all.filter(b => b.status === 'confirmed').length;
    const completed = all.filter(b => b.status === 'completed').length;
    const cancelled = all.filter(b => b.status === 'cancelled').length;
    const todayBookings = all.filter(b => b.event_date === today).length;
    const thisWeekBookings = all.filter(b => b.event_date >= weekAgo).length;
    
    // Calculate this month's revenue from completed bookings
    const thisMonthRevenue = all
      .filter(b => b.status === 'completed' && b.event_date >= monthStart)
      .reduce((sum, b) => sum + (servicesPriceMap.get(b.service) || 0), 0);

    setStats({
      total: all.length,
      pending,
      confirmed,
      completed,
      cancelled,
      todayBookings,
      thisWeekBookings,
      thisMonthRevenue
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des statistiques...</div>;
  }

  const statCards = [
    {
      title: "Aujourd'hui",
      value: stats.todayBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Cette semaine',
      value: stats.thisWeekBookings,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Confirmées',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Terminées',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Annulées',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'CA ce mois',
      value: `${stats.thisMonthRevenue.toFixed(0)} €`,
      icon: Euro,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total réservations',
      value: stats.total,
      icon: Calendar,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
