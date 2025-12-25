import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Simple password protection (in production, use proper authentication)
const ADMIN_PASSWORD = "cina2024";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_date: string;
  service: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  confirmed: { label: "Confirmé", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800", icon: XCircle },
  completed: { label: "Terminé", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: "Connecté", description: "Bienvenue Hassina !" });
    } else {
      toast({ 
        title: "Erreur", 
        description: "Mot de passe incorrect", 
        variant: "destructive" 
      });
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings((data || []) as Booking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
      
      toast({ title: "Statut mis à jour", description: `Réservation ${statusConfig[status].label.toLowerCase()}` });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();

      // Subscribe to realtime updates
      const channel = supabase
        .channel("bookings-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookings" },
          () => {
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Espace Admin
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                Cina Hairstyle - Gestion des réservations
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Se connecter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Retour au site
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Cina Hairstyle
            </h1>
            <p className="text-sm text-muted-foreground">Espace Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={fetchBookings} disabled={isLoading}>
              {isLoading ? "Chargement..." : "Actualiser"}
            </Button>
            <Button variant="ghost" onClick={() => setIsAuthenticated(false)}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="font-display text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
            <p className="text-yellow-700 text-sm">En attente</p>
            <p className="font-display text-3xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <p className="text-green-700 text-sm">Confirmés</p>
            <p className="font-display text-3xl font-bold text-green-800">{stats.confirmed}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-blue-700 text-sm">Terminés</p>
            <p className="font-display text-3xl font-bold text-blue-800">{stats.completed}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "pending", "confirmed", "cancelled", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {status === "all" ? "Tous" : statusConfig[status].label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune réservation {filter !== "all" ? statusConfig[filter].label.toLowerCase() : ""}
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status].icon;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[booking.status].label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{booking.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${booking.phone}`} className="hover:text-primary">
                              {booking.phone}
                            </a>
                          </div>
                          {booking.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <a href={`mailto:${booking.email}`} className="hover:text-primary">
                                {booking.email}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(booking.event_date).toLocaleDateString("fr-FR", { 
                              weekday: "long", 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{booking.service}</span>
                          </div>
                        </div>
                      </div>

                      {booking.message && (
                        <p className="mt-3 text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                          {booking.message}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Annuler
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Terminer
                        </Button>
                      )}
                      <a
                        href={`https://wa.me/213${booking.phone.replace(/\D/g, "").slice(-9)}?text=Bonjour ${booking.name}, concernant votre réservation du ${new Date(booking.event_date).toLocaleDateString("fr-FR")}...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
