import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, XCircle, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les témoignages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const approveTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: true })
        .eq("id", id);

      if (error) throw error;

      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );

      toast({
        title: "Approuvé",
        description: "Le témoignage est maintenant visible publiquement",
      });
    } catch (error) {
      console.error("Error approving testimonial:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le témoignage",
        variant: "destructive",
      });
    }
  };

  const rejectTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: false })
        .eq("id", id);

      if (error) throw error;

      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: false } : t))
      );

      toast({
        title: "Rejeté",
        description: "Le témoignage n'est plus visible",
      });
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le témoignage",
        variant: "destructive",
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTestimonials((prev) => prev.filter((t) => t.id !== id));

      toast({
        title: "Supprimé",
        description: "Le témoignage a été supprimé",
      });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le témoignage",
        variant: "destructive",
      });
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "pending") return !t.is_approved;
    if (filter === "approved") return t.is_approved;
    return true;
  });

  const pendingCount = testimonials.filter((t) => !t.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Témoignages
          </h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} témoignage(s) en attente de validation`
              : "Tous les témoignages sont validés"}
          </p>
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {status === "all"
                ? "Tous"
                : status === "pending"
                ? "En attente"
                : "Approuvés"}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials list */}
      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun témoignage {filter === "pending" ? "en attente" : filter === "approved" ? "approuvé" : ""}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Status badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        testimonial.is_approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {testimonial.is_approved ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {testimonial.is_approved ? "Approuvé" : "En attente"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(testimonial.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "text-accent fill-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-4">"{testimonial.content}"</p>

                  {/* Author */}
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    {testimonial.role && (
                      <span className="text-muted-foreground">
                        {" "}
                        • {testimonial.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!testimonial.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => approveTestimonial(testimonial.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  {testimonial.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      onClick={() => rejectTestimonial(testimonial.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Masquer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => deleteTestimonial(testimonial.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
