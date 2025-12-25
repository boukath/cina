import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DateTimePicker from "./DateTimePicker";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
}

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price, duration_minutes')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setServices(data);
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, []);

  const selectedService = services.find(s => s.name === formData.service);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phone || !selectedDate || !selectedTime || !formData.service) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner un créneau.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("bookings").insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        event_date: format(selectedDate, "yyyy-MM-dd"),
        event_time: selectedTime + ":00",
        service: formData.service,
        message: formData.message || null,
      });

      if (error) {
        console.error("Error submitting booking:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitted(true);
      toast({
        title: "Demande envoyée !",
        description: "Je vous contacterai très rapidement pour confirmer votre rendez-vous.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="reservation" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center bg-card rounded-3xl p-12 shadow-elegant"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Merci pour votre demande !
            </h3>
            <p className="text-muted-foreground mb-6">
              J'ai bien reçu votre demande de rendez-vous. Je vous contacterai 
              très rapidement pour confirmer les détails.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  service: "",
                  message: "",
                });
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              Nouvelle demande
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="reservation" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Réservation
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              Prenez{" "}
              <span className="text-gradient-rose">Rendez-vous</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Remplissez le formulaire ci-dessous et je vous contacterai dans les 
              plus brefs délais pour confirmer votre rendez-vous et discuter de 
              vos envies.
            </p>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Disponibilité</h4>
                  <p className="text-sm text-muted-foreground">
                    Du lundi au dimanche, sur rendez-vous
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Essai Coiffure</h4>
                  <p className="text-sm text-muted-foreground">
                    Essai inclus pour les coiffures de mariée
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Contact Direct</h4>
                  <p className="text-sm text-muted-foreground">
                    Réponse sous 24h garantie
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl p-8 shadow-elegant border border-border/50"
            >
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4" />
                    Nom Complet *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Phone className="w-4 h-4" />
                      Téléphone *
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0XX XX XX XX XX"
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Service *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    disabled={loadingServices}
                  >
                    <option value="">
                      {loadingServices ? "Chargement..." : "Choisir un service..."}
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} - {Number(service.price).toLocaleString('fr-DZ')} DZD
                      </option>
                    ))}
                  </select>
                  
                  {/* Price Display */}
                  {selectedService && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 rounded-xl bg-primary/10 border border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{selectedService.name}</p>
                          {selectedService.description && (
                            <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                          )}
                          {selectedService.duration_minutes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Durée estimée: {selectedService.duration_minutes} min
                            </p>
                          )}
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {Number(selectedService.price).toLocaleString('fr-DZ')} DZD
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Calendar & Time Picker */}
                <div className="bg-secondary/30 rounded-xl p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    Date et Heure souhaitées *
                  </label>
                  <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateSelect={setSelectedDate}
                    onTimeSelect={setSelectedTime}
                  />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Votre demande sera confirmée par l'administrateur
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Message (optionnel)
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre projet, vos envies..."
                    className="min-h-[120px] rounded-xl resize-none"
                  />
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Champs obligatoires. Je vous recontacte sous 24h.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
