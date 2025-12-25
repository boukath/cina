import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium"
      aria-label="Changer de langue"
    >
      <Globe className="w-4 h-4" />
      <span>{language === "fr" ? "العربية" : "Français"}</span>
    </button>
  );
};

export default LanguageSwitcher;
