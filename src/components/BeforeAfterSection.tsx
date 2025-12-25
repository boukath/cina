import { motion } from "framer-motion";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { useLanguage } from "@/contexts/LanguageContext";

interface Transformation {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
}

const transformations: Transformation[] = [
  {
    id: 1,
    beforeImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=800&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=800&fit=crop",
    title: "Transformation Mariée",
    description: "Chignon élégant pour le grand jour",
  },
  {
    id: 2,
    beforeImage: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=800&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=800&fit=crop",
    title: "Coiffure de Soirée",
    description: "Ondulations glamour pour une occasion spéciale",
  },
  {
    id: 3,
    beforeImage: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=800&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?w=600&h=800&fit=crop",
    title: "Tresses Artistiques",
    description: "Coiffure tressée pour un événement festif",
  },
];

export const BeforeAfterSection = () => {
  const { t } = useLanguage();

  return (
    <section id="transformations" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Transformations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les métamorphoses capillaires réalisées par Hassina. 
            Glissez pour voir l'avant et l'après de chaque transformation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transformations.map((transformation, index) => (
            <motion.div
              key={transformation.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <BeforeAfterSlider
                beforeImage={transformation.beforeImage}
                afterImage={transformation.afterImage}
              />
              <div className="text-center">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {transformation.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {transformation.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
