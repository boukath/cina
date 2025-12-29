import { motion } from "framer-motion";
import { Crown, Heart, Star, Gem } from "lucide-react";

const services = [
  {
    icon: Crown,
    title: "Coiffure Mariée",
    description: "Un look parfait pour votre grand jour. Chignons, tresses, boucles romantiques.",
    price: "Sur consultation",
    features: ["Coiffure personnalisée", "Retouches le jour J", "Accessoires conseillés"],
  },
  {
    icon: Heart,
    title: "Coiffure Invitée",
    description: "Brillez en tant qu'invitée avec une coiffure élégante et raffinée.",
    price: "Sur consultation",
    features: ["Style personnalisé", "Finitions durables", "Conseils beauté"],
  },
  {
    icon: Star,
    title: "Occasions Spéciales",
    description: "Fiançailles, henné, galas, soirées... Brillez lors de vos événements.",
    price: "Sur consultation",
    features: ["Consultation style", "Coiffure sur-mesure", "Tenue longue durée"],
  },
  {
    icon: Gem,
    title: "Pack Groupe",
    description: "Mariée + accompagnatrices. La formule idéale pour un mariage parfait.",
    price: "Sur consultation",
    features: ["Prix groupe avantageux", "Déplacement inclus", "Coordination totale"],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-secondary/30">
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
            Mes Prestations
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Services & Tarifs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des prestations haut de gamme adaptées à chaque occasion. 
            Je me déplace à domicile ou sur le lieu de votre événement.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300 border border-border/50"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {service.description}
              </p>

              {/* Price */}
              <p className="font-display text-2xl font-bold text-primary mb-4">
                {service.price}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Besoin d'un service personnalisé ?
          </p>
          <a
            href="#contact"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Contactez-moi pour un devis gratuit →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
