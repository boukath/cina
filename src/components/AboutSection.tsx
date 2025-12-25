import { motion } from "framer-motion";
import { Award, Clock, MapPin, Heart } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Expertise",
    description: "Plus de 4 ans d'expérience dans la coiffure événementielle",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Chaque coiffure est créée avec amour et attention aux détails",
  },
  {
    icon: MapPin,
    title: "Mobilité",
    description: "Je me déplace à domicile ou sur le lieu de votre événement",
  },
  {
    icon: Clock,
    title: "Disponibilité",
    description: "Flexible et disponible selon vos besoins et horaires",
  },
];

const AboutSection = () => {
  return (
    <section id="apropos" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              À Propos
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              Bonjour, je suis{" "}
              <span className="text-gradient-rose">Hassina</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Passionnée par la beauté et l'art de la coiffure depuis plus de 4 ans, 
              je me suis spécialisée dans les coiffures de mariage, invitées et occasions spéciales. 
              Mon objectif est de sublimer chaque femme pour son jour spécial.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Chaque cliente est unique, et je m'engage à créer une coiffure qui 
              reflète sa personnalité et s'harmonise parfaitement avec son style 
              et le thème de son événement.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary shadow-elegant">
              {/* Decorative patterns */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="font-display text-8xl font-bold text-primary/10 mb-4">
                    C
                  </div>
                  <p className="font-display text-3xl font-semibold text-foreground/80">
                    Cina Hairstyle
                  </p>
                  <p className="text-muted-foreground mt-2">
                    L'art de la coiffure événementielle
                  </p>
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-10 right-10 w-20 h-20 border-2 border-primary/30 rounded-full" />
              <div className="absolute bottom-20 left-10 w-32 h-32 border border-accent/30 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
