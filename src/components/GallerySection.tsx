import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

type Category = "all" | "mariee" | "invitee" | "henne" | "special";

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

const galleryImages: GalleryImage[] = [
  { src: gallery1, alt: "Chignon élégant mariée", category: "mariee" },
  { src: gallery2, alt: "Coiffure naturelle invitée", category: "invitee" },
  { src: gallery3, alt: "Coiffure henné avec fleurs", category: "henne" },
  { src: gallery4, alt: "Coiffure romantique spéciale", category: "special" },
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "mariee", label: "Mariée" },
  { value: "invitee", label: "Invitée" },
  { value: "henne", label: "Henné" },
  { value: "special", label: "Spécial" },
];

const GallerySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = selectedCategory === "all"
    ? galleryImages
    : galleryImages.filter((img) => img.category === selectedCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? filteredImages.length - 1 : lightboxIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === filteredImages.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <section id="galerie" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Portfolio
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Mes Réalisations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez quelques-unes de mes créations. Chaque coiffure est unique 
            et réalisée avec passion et expertise.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.src}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className="relative group overflow-hidden rounded-2xl aspect-square shadow-soft cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium">{image.alt}</p>
                </div>
                
                {/* Zoom Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* More CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Plus de réalisations disponibles sur demande
          </p>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={filteredImages[lightboxIndex].src}
              alt={filteredImages[lightboxIndex].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="font-display font-semibold">{filteredImages[lightboxIndex].alt}</p>
              <p className="text-sm text-white/60 mt-1">
                {lightboxIndex + 1} / {filteredImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
