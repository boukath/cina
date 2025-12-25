import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Listen for the install prompt
  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    });

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
    });
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border/50">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Installer Cina Hairstyle
          </h1>
          <p className="text-muted-foreground mb-8">
            Installez l'application sur votre téléphone pour un accès rapide et une meilleure expérience.
          </p>

          {isInstalled ? (
            <div className="text-green-600 font-medium">
              ✓ Application installée avec succès !
            </div>
          ) : deferredPrompt ? (
            <Button variant="hero" size="lg" className="w-full" onClick={handleInstall}>
              <Download className="w-5 h-5 mr-2" />
              Installer l'application
            </Button>
          ) : (
            <div className="space-y-6">
              {isIOS && (
                <div className="text-left bg-secondary/50 rounded-xl p-4">
                  <p className="font-semibold text-foreground mb-3">Sur iPhone/iPad :</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      <span>Appuyez sur le bouton <Share className="inline w-4 h-4" /> Partager en bas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      <span>Faites défiler et appuyez sur "Sur l'écran d'accueil"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      <span>Appuyez sur "Ajouter"</span>
                    </li>
                  </ol>
                </div>
              )}

              {isAndroid && (
                <div className="text-left bg-secondary/50 rounded-xl p-4">
                  <p className="font-semibold text-foreground mb-3">Sur Android :</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                      <span>Appuyez sur le menu ⋮ de votre navigateur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                      <span>Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                      <span>Confirmez l'installation</span>
                    </li>
                  </ol>
                </div>
              )}

              {!isIOS && !isAndroid && (
                <p className="text-muted-foreground text-sm">
                  Ouvrez cette page sur votre téléphone pour voir les instructions d'installation.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/50">
            <a href="/" className="text-primary hover:underline text-sm">
              ← Retour au site
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-muted-foreground">Accès rapide</p>
          </div>
          <div>
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-muted-foreground">Mode hors ligne</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-muted-foreground">Notifications</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstallPage;
