import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment se passe la prise de rendez-vous ?",
    answer: "Vous pouvez me contacter via le formulaire sur ce site, par téléphone ou WhatsApp. Je vous réponds sous 24h pour confirmer votre rendez-vous et discuter de vos envies.",
  },
  {
    question: "Proposez-vous un essai coiffure avant le jour J ?",
    answer: "Oui, pour les mariées, un essai coiffure est inclus dans la prestation. Cela nous permet de définir ensemble le style parfait pour votre grand jour.",
  },
  {
    question: "Vous déplacez-vous à domicile ?",
    answer: "Absolument ! Je me déplace à domicile sur Birkhadem, Alger et les environs. Des frais de déplacement peuvent s'appliquer selon la distance.",
  },
  {
    question: "Quand dois-je réserver pour mon mariage ?",
    answer: "Je recommande de réserver au moins 1 à 2 mois à l'avance pour les mariages, surtout en haute saison (mai à septembre). Cela nous laisse le temps de faire l'essai coiffure.",
  },
  {
    question: "Faites-vous les coiffures pour les invitées aussi ?",
    answer: "Oui ! Je propose des forfaits groupe pour la mariée et ses accompagnatrices (mère, sœurs, amies). Contactez-moi pour un devis personnalisé.",
  },
  {
    question: "Quels types d'accessoires puis-je utiliser ?",
    answer: "Je travaille avec tous types d'accessoires : voiles, diadèmes, peignes, fleurs naturelles ou artificielles, perles, etc. Je peux vous conseiller selon votre style.",
  },
  {
    question: "Comment sont fixés les tarifs ?",
    answer: "Les tarifs dépendent du type de coiffure, de la complexité et du nombre de personnes. Contactez-moi pour recevoir un devis personnalisé gratuit.",
  },
  {
    question: "Que dois-je préparer avant le rendez-vous ?",
    answer: "Venez avec les cheveux propres et démêlés. Si vous avez des photos d'inspiration, n'hésitez pas à les partager. Apportez aussi vos accessoires si vous en avez.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-background">
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
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus posées par mes clientes.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border/50 px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Vous avez une autre question ?
          </p>
          <a
            href="#contact"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Contactez-moi directement →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
