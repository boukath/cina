import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Phone, Save, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SettingsManager = () => {
  const [adminPhone, setAdminPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "admin_whatsapp_number")
      .maybeSingle();

    if (!error && data) {
      setAdminPhone(data.value || "");
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from("settings")
      .update({ value: adminPhone, updated_at: new Date().toISOString() })
      .eq("key", "admin_whatsapp_number");

    if (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Paramètres sauvegardés",
        description: "Le numéro WhatsApp a été mis à jour.",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Chargement des paramètres...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres des Notifications
          </CardTitle>
          <CardDescription>
            Configurez les alertes WhatsApp pour les nouvelles réservations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Comment fonctionnent les alertes WhatsApp ?</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Quand une nouvelle réservation arrive, le système prépare un message WhatsApp 
                avec tous les détails de la réservation.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Pour des messages automatiques (sans action manuelle), 
                il faudrait intégrer l'API WhatsApp Business (service payant comme Twilio). 
                Actuellement, le système prépare le message et vous pouvez l'envoyer manuellement.
              </p>
            </AlertDescription>
          </Alert>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Numéro WhatsApp Admin
            </label>
            <Input
              type="tel"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="Ex: +213 555 123 456"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Entrez le numéro avec l'indicatif pays (ex: +213 pour Algérie)
            </p>
          </div>

          <Button onClick={saveSettings} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </CardContent>
      </Card>

      {/* Future Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Options Avancées (Bientôt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>WhatsApp Business API</strong> - Messages automatiques (nécessite Twilio)</p>
            <p>• <strong>Notifications Email</strong> - Alertes par email (nécessite Resend)</p>
            <p>• <strong>Notifications Push</strong> - Alertes dans le navigateur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
