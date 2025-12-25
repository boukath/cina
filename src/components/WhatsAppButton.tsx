import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "213XXXXXXXXX"; // À remplacer par le vrai numéro
  const message = encodeURIComponent("Bonjour! Je souhaite prendre rendez-vous pour une coiffure.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </motion.a>
  );
};

export default WhatsAppButton;
