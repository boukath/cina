import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "fr" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Header
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.gallery": "Galerie",
    "nav.about": "À Propos",
    "nav.testimonials": "Témoignages",
    "nav.faq": "FAQ",
    "nav.booking": "Réservation",
    "nav.contact": "Contact",
    
    // Hero
    "hero.badge": "Coiffeuse Événementielle - Birkhadem",
    "hero.title1": "Sublimez Votre",
    "hero.title2": "Jour Spécial",
    "hero.description": "Coiffures élégantes et personnalisées pour mariages, invitées et occasions spéciales. Faites de chaque moment un souvenir inoubliable.",
    "hero.cta": "Prendre Rendez-vous",
    "hero.gallery": "Voir Mes Réalisations",
    "hero.clients": "Clientes Satisfaites",
    "hero.experience": "Années d'Expérience",
    "hero.rating": "Note Moyenne",
    
    // Services
    "services.subtitle": "Mes Prestations",
    "services.title": "Services & Tarifs",
    "services.description": "Des prestations haut de gamme adaptées à chaque occasion. Je me déplace à domicile ou sur le lieu de votre événement.",
    "services.bride": "Coiffure Mariée",
    "services.guest": "Coiffure Invitée",
    "services.special": "Occasions Spéciales",
    "services.group": "Pack Groupe",
    "services.price": "Sur consultation",
    "services.cta": "Contactez-moi pour un devis gratuit →",
    
    // Gallery
    "gallery.subtitle": "Portfolio",
    "gallery.title": "Mes Réalisations",
    "gallery.description": "Découvrez quelques-unes de mes créations. Chaque coiffure est unique et réalisée avec passion et expertise.",
    "gallery.all": "Tout",
    "gallery.bride": "Mariée",
    "gallery.guest": "Invitée",
    "gallery.henna": "Henné",
    "gallery.special": "Spécial",
    
    // About
    "about.subtitle": "À Propos",
    "about.title": "Bonjour, je suis",
    "about.name": "Hassina",
    "about.description1": "Passionnée par la beauté et l'art de la coiffure depuis plus de 4 ans, je me suis spécialisée dans les coiffures de mariage, invitées et occasions spéciales. Mon objectif est de sublimer chaque femme pour son jour spécial.",
    "about.description2": "Chaque cliente est unique, et je m'engage à créer une coiffure qui reflète sa personnalité et s'harmonise parfaitement avec son style et le thème de son événement.",
    "about.expertise": "Expertise",
    "about.expertise.desc": "Plus de 4 ans d'expérience dans la coiffure événementielle",
    "about.passion": "Passion",
    "about.passion.desc": "Chaque coiffure est créée avec amour et attention aux détails",
    "about.mobility": "Mobilité",
    "about.mobility.desc": "Je me déplace à domicile ou sur le lieu de votre événement",
    "about.availability": "Disponibilité",
    "about.availability.desc": "Flexible et disponible selon vos besoins et horaires",
    
    // Testimonials
    "testimonials.subtitle": "Témoignages",
    "testimonials.title": "Ce Que Disent Mes Clientes",
    "testimonials.description": "La satisfaction de mes clientes est ma plus grande récompense.",
    
    // FAQ
    "faq.subtitle": "FAQ",
    "faq.title": "Questions Fréquentes",
    "faq.description": "Retrouvez les réponses aux questions les plus posées par mes clientes.",
    "faq.contact": "Vous avez une autre question ?",
    "faq.contact.cta": "Contactez-moi directement →",
    
    // Booking
    "booking.subtitle": "Réservation",
    "booking.title": "Prenez",
    "booking.title2": "Rendez-vous",
    "booking.description": "Remplissez le formulaire ci-dessous et je vous contacterai dans les plus brefs délais pour confirmer votre rendez-vous et discuter de vos envies.",
    "booking.availability": "Disponibilité",
    "booking.availability.desc": "Du lundi au dimanche, sur rendez-vous",
    "booking.trial": "Essai Coiffure",
    "booking.trial.desc": "Essai inclus pour les coiffures de mariée",
    "booking.direct": "Contact Direct",
    "booking.direct.desc": "Réponse sous 24h garantie",
    "booking.name": "Nom Complet",
    "booking.phone": "Téléphone",
    "booking.email": "Email",
    "booking.date": "Date de l'Événement",
    "booking.service": "Service",
    "booking.message": "Message (optionnel)",
    "booking.submit": "Envoyer ma demande",
    "booking.required": "* Champs obligatoires. Je vous recontacte sous 24h.",
    "booking.success.title": "Merci pour votre demande !",
    "booking.success.message": "J'ai bien reçu votre demande de rendez-vous. Je vous contacterai très rapidement pour confirmer les détails.",
    "booking.new": "Nouvelle demande",
    
    // Contact
    "contact.subtitle": "Contact",
    "contact.title": "Restons en Contact",
    "contact.description": "N'hésitez pas à me contacter pour toute question ou pour discuter de votre projet coiffure.",
    "contact.phone": "Téléphone",
    "contact.email": "Email",
    "contact.location": "Zone d'Intervention",
    "contact.location.value": "Birkhadem, Alger & environs",
    
    // Footer
    "footer.rights": "Tous droits réservés.",
    "footer.made": "Fait avec",
    "footer.for": "pour Hassina",
  },
  ar: {
    // Header
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.gallery": "المعرض",
    "nav.about": "حولنا",
    "nav.testimonials": "آراء العملاء",
    "nav.faq": "الأسئلة الشائعة",
    "nav.booking": "الحجز",
    "nav.contact": "اتصل بنا",
    
    // Hero
    "hero.badge": "مصففة شعر للمناسبات - بئر خادم",
    "hero.title1": "أضيفي لمسة جمال",
    "hero.title2": "ليومك المميز",
    "hero.description": "تسريحات أنيقة ومخصصة للأعراس والمدعوات والمناسبات الخاصة. اجعلي كل لحظة ذكرى لا تُنسى.",
    "hero.cta": "احجزي موعدك",
    "hero.gallery": "شاهدي أعمالي",
    "hero.clients": "عميلة راضية",
    "hero.experience": "سنوات خبرة",
    "hero.rating": "التقييم",
    
    // Services
    "services.subtitle": "خدماتي",
    "services.title": "الخدمات والأسعار",
    "services.description": "خدمات راقية تناسب كل مناسبة. أتنقل إلى منزلك أو مكان حفلتك.",
    "services.bride": "تسريحة العروس",
    "services.guest": "تسريحة المدعوات",
    "services.special": "المناسبات الخاصة",
    "services.group": "باقة المجموعة",
    "services.price": "حسب الاستشارة",
    "services.cta": "تواصلي معي للحصول على سعر مجاني ←",
    
    // Gallery
    "gallery.subtitle": "معرض الأعمال",
    "gallery.title": "أعمالي",
    "gallery.description": "اكتشفي بعض إبداعاتي. كل تسريحة فريدة ومصنوعة بشغف وخبرة.",
    "gallery.all": "الكل",
    "gallery.bride": "عروس",
    "gallery.guest": "مدعوة",
    "gallery.henna": "حنة",
    "gallery.special": "خاص",
    
    // About
    "about.subtitle": "حولنا",
    "about.title": "مرحباً، أنا",
    "about.name": "حسينة",
    "about.description1": "شغوفة بالجمال وفن تصفيف الشعر منذ أكثر من 4 سنوات، تخصصت في تسريحات الأعراس والمدعوات والمناسبات الخاصة. هدفي هو إبراز جمال كل امرأة في يومها المميز.",
    "about.description2": "كل عميلة فريدة، وأحرص على إنشاء تسريحة تعكس شخصيتها وتتناغم تماماً مع أسلوبها وموضوع مناسبتها.",
    "about.expertise": "الخبرة",
    "about.expertise.desc": "أكثر من 4 سنوات خبرة في تصفيف الشعر للمناسبات",
    "about.passion": "الشغف",
    "about.passion.desc": "كل تسريحة مصنوعة بحب واهتمام بالتفاصيل",
    "about.mobility": "التنقل",
    "about.mobility.desc": "أتنقل إلى منزلك أو مكان مناسبتك",
    "about.availability": "التوفر",
    "about.availability.desc": "مرنة ومتاحة حسب احتياجاتك ومواعيدك",
    
    // Testimonials
    "testimonials.subtitle": "آراء العملاء",
    "testimonials.title": "ماذا تقول عميلاتي",
    "testimonials.description": "رضا عميلاتي هو أكبر مكافأة لي.",
    
    // FAQ
    "faq.subtitle": "الأسئلة الشائعة",
    "faq.title": "الأسئلة المتكررة",
    "faq.description": "اعثري على إجابات لأكثر الأسئلة شيوعاً من عميلاتي.",
    "faq.contact": "لديك سؤال آخر؟",
    "faq.contact.cta": "تواصلي معي مباشرة ←",
    
    // Booking
    "booking.subtitle": "الحجز",
    "booking.title": "احجزي",
    "booking.title2": "موعدك",
    "booking.description": "املئي النموذج أدناه وسأتواصل معك في أقرب وقت لتأكيد موعدك ومناقشة رغباتك.",
    "booking.availability": "التوفر",
    "booking.availability.desc": "من الاثنين إلى الأحد، بموعد مسبق",
    "booking.trial": "تجربة التسريحة",
    "booking.trial.desc": "تجربة مجانية لتسريحات العروس",
    "booking.direct": "تواصل مباشر",
    "booking.direct.desc": "رد خلال 24 ساعة مضمون",
    "booking.name": "الاسم الكامل",
    "booking.phone": "الهاتف",
    "booking.email": "البريد الإلكتروني",
    "booking.date": "تاريخ المناسبة",
    "booking.service": "الخدمة",
    "booking.message": "رسالة (اختياري)",
    "booking.submit": "إرسال طلبي",
    "booking.required": "* حقول إلزامية. سأتواصل معك خلال 24 ساعة.",
    "booking.success.title": "شكراً على طلبك!",
    "booking.success.message": "استلمت طلب موعدك. سأتواصل معك قريباً لتأكيد التفاصيل.",
    "booking.new": "طلب جديد",
    
    // Contact
    "contact.subtitle": "اتصل بنا",
    "contact.title": "لنبقى على تواصل",
    "contact.description": "لا تترددي في التواصل معي لأي سؤال أو لمناقشة مشروع تسريحتك.",
    "contact.phone": "الهاتف",
    "contact.email": "البريد الإلكتروني",
    "contact.location": "منطقة العمل",
    "contact.location.value": "بئر خادم، الجزائر والمناطق المجاورة",
    
    // Footer
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.made": "صنع بـ",
    "footer.for": "لحسينة",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "fr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
