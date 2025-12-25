import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Contact
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Restons en Contact
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            N'hésitez pas à me contacter pour toute question ou pour 
            discuter de votre projet coiffure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Phone */}
          <motion.a
            href="tel:+213XXXXXXXXX"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="group bg-card rounded-2xl p-8 text-center shadow-soft hover:shadow-elegant transition-all duration-300 border border-border/50"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Phone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Téléphone
            </h3>
            <p className="text-muted-foreground">0XX XX XX XX XX</p>
          </motion.a>

          {/* Email */}
          <motion.a
            href="mailto:contact@cinahairstyle.com"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="group bg-card rounded-2xl p-8 text-center shadow-soft hover:shadow-elegant transition-all duration-300 border border-border/50"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Email
            </h3>
            <p className="text-muted-foreground">contact@cinahairstyle.com</p>
          </motion.a>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group bg-card rounded-2xl p-8 text-center shadow-soft border border-border/50"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Zone d'Intervention
            </h3>
            <p className="text-muted-foreground">Birkhadem, Alger & environs</p>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-4 mt-12"
        >
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
