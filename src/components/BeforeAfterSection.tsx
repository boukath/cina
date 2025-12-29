import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const BeforeAfterSection = () => {
  const { t } = useLanguage();

  const { data: transformations, isLoading } = useQuery({
    queryKey: ['gallery-transformations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .not('before_image_url', 'is', null)
        .not('after_image_url', 'is', null)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="transformations" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!transformations || transformations.length === 0) {
    return null;
  }

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
            Découvrez les métamorphoses capillaires réalisées par Cina. 
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
                beforeImage={transformation.before_image_url!}
                afterImage={transformation.after_image_url!}
              />
              <div className="text-center">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {transformation.title || 'Transformation'}
                </h3>
                {transformation.description && (
                  <p className="text-muted-foreground text-sm">
                    {transformation.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
