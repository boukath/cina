import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Coiffure de mariage élégante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-primary font-medium mb-4 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              Coiffeuse Événementielle - Birkhadem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            Sublimez Votre
            <br />
            <span className="text-gradient-rose">Jour Spécial</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg"
          >
            Coiffures élégantes et personnalisées pour mariages, invitées et 
            occasions spéciales. Faites de chaque moment un souvenir inoubliable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#reservation">
                <Calendar className="w-5 h-5 mr-2" />
                Prendre Rendez-vous
              </a>
            </Button>
            <Button variant="elegant" size="xl" asChild>
              <a href="#galerie">Voir Mes Réalisations</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-8 mt-12 pt-8 border-t border-border/50"
          >
            <div>
              <p className="font-display text-3xl font-bold text-foreground">100+</p>
              <p className="text-muted-foreground text-sm">Clientes Satisfaites</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-foreground">4+</p>
              <p className="text-muted-foreground text-sm">Années d'Expérience</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-foreground">5★</p>
              <p className="text-muted-foreground text-sm">Note Moyenne</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-2.5 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
