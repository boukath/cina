import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="font-display text-2xl font-semibold">
            Cina <span className="text-primary">Hairstyle</span>
          </div>

          {/* Copyright */}
          <p className="text-background/70 text-sm text-center">
            © {currentYear} Cina Hairstyle. Tous droits réservés.
          </p>

          {/* Made with love */}
          <p className="flex items-center gap-1 text-sm text-background/70">
            Fait avec <Heart className="w-4 h-4 text-primary fill-primary" /> pour Cina
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
