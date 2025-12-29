import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  role: z.string().trim().max(50).optional(),
  content: z.string().trim().min(10, "Votre témoignage doit contenir au moins 10 caractères").max(500),
  rating: z.number().min(1).max(5),
});

const TestimonialForm = () => {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = testimonialSchema.safeParse({ name, role, content, rating });
    if (!validation.success) {
      toast({
        title: language === "ar" ? "خطأ" : "Erreur",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("testimonials").insert({
        name: name.trim(),
        role: role.trim() || null,
        content: content.trim(),
        rating,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: language === "ar" ? "شكراً لك!" : "Merci !",
        description: language === "ar" 
          ? "تم إرسال تقييمك وسيتم نشره بعد المراجعة"
          : "Votre témoignage a été envoyé et sera publié après validation",
      });
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Erreur",
        description: language === "ar"
          ? "حدث خطأ أثناء إرسال تقييمك"
          : "Une erreur est survenue lors de l'envoi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setRole("");
    setContent("");
    setRating(5);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 border border-border/50 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          {language === "ar" ? "شكراً لتقييمك!" : "Merci pour votre témoignage !"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === "ar"
            ? "سيتم نشر تقييمك بعد المراجعة"
            : "Il sera publié après validation par notre équipe."}
        </p>
        <Button variant="outline" onClick={resetForm}>
          {language === "ar" ? "إضافة تقييم آخر" : "Ajouter un autre témoignage"}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-soft"
    >
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
        {language === "ar" ? "شاركي تجربتك" : "Partagez Votre Expérience"}
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        {language === "ar"
          ? "رأيك يهمنا! شاركي تجربتك مع الآخرين"
          : "Votre avis compte ! Partagez votre expérience avec les autres."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === "ar" ? "تقييمك" : "Votre note"} *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-accent fill-accent"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === "ar" ? "الاسم" : "Votre nom"} *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === "ar" ? "مثال: فاطمة ز." : "Ex: Fatima Z."}
            className="h-12 rounded-xl"
            required
            maxLength={100}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === "ar" ? "المناسبة" : "Occasion"} ({language === "ar" ? "اختياري" : "optionnel"})
          </label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={language === "ar" ? "مثال: عروس، مدعوة..." : "Ex: Mariée, Invitée..."}
            className="h-12 rounded-xl"
            maxLength={50}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {language === "ar" ? "تقييمك" : "Votre témoignage"} *
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              language === "ar"
                ? "شاركي تجربتك معنا..."
                : "Partagez votre expérience..."
            }
            className="min-h-[120px] rounded-xl resize-none"
            required
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {content.length}/500
          </p>
        </div>

        <Button
          type="submit"
          variant="hero"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            language === "ar" ? "جاري الإرسال..." : "Envoi en cours..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {language === "ar" ? "إرسال تقييمي" : "Envoyer mon témoignage"}
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default TestimonialForm;
