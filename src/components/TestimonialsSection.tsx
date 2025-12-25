import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amina B.",
    role: "Mariée",
    content: "Hassina a réalisé exactement la coiffure de mes rêves pour mon mariage. Elle est à l'écoute et très professionnelle. Je recommande à 100% !",
    rating: 5,
    date: "Juin 2024",
  },
  {
    name: "Fatima Z.",
    role: "Invitée",
    content: "Une vraie artiste ! Ma coiffure a tenu toute la soirée et j'ai reçu beaucoup de compliments. Merci Hassina !",
    rating: 5,
    date: "Mai 2024",
  },
  {
    name: "Sarah M.",
    role: "Mariée",
    content: "Professionnelle, ponctuelle et talentueuse. Elle a su me mettre à l'aise et le résultat était magnifique.",
    rating: 5,
    date: "Avril 2024",
  },
  {
    name: "Leila K.",
    role: "Fiançailles",
    content: "Excellente prestation pour mes fiançailles. Hassina prend le temps de comprendre ce qu'on veut. Très satisfaite !",
    rating: 5,
    date: "Mars 2024",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="temoignages" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Témoignages
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Ce Que Disent Mes Clientes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La satisfaction de mes clientes est ma plus grande récompense.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="border-t border-border/50 pt-4">
                <p className="font-display font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role} • {testimonial.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-soft border border-border/50">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-foreground font-semibold">5.0</span>
            <span className="text-muted-foreground text-sm">
              Note moyenne sur {testimonials.length} avis
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
