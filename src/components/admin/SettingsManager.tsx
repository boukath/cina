import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Phone, Save, AlertCircle, Info, Bell, BellRing, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { initializeFirebase, requestNotificationPermission } from "@/lib/firebase";

const SettingsManager = () => {
  const [adminPhone, setAdminPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isEnablingPush, setIsEnablingPush] = useState(false);

  useEffect(() => {
    fetchSettings();
    initializeFirebase().catch(console.error);
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    // Fetch all settings at once
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .in("key", ["admin_whatsapp_number", "admin_fcm_token"]);

    if (!error && data) {
      const phoneData = data.find(s => s.key === "admin_whatsapp_number");
      const fcmData = data.find(s => s.key === "admin_fcm_token");
      
      setAdminPhone(phoneData?.value || "");
      setPushEnabled(!!fcmData?.value);
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

  const enablePushNotifications = async () => {
    setIsEnablingPush(true);
    
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        // Save token to settings
        const { data: existing } = await supabase
          .from("settings")
          .select("id")
          .eq("key", "admin_fcm_token")
          .maybeSingle();

        if (existing) {
          await supabase
            .from("settings")
            .update({ value: token, updated_at: new Date().toISOString() })
            .eq("key", "admin_fcm_token");
        } else {
          await supabase
            .from("settings")
            .insert({ key: "admin_fcm_token", value: token });
        }
        
        setPushEnabled(true);
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications push pour les nouvelles réservations.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'activer les notifications. Vérifiez les permissions de votre navigateur.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error enabling push:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications push.",
        variant: "destructive",
      });
    } finally {
      setIsEnablingPush(false);
    }
  };

  const disablePushNotifications = async () => {
    setIsEnablingPush(true);
    
    try {
      await supabase
        .from("settings")
        .update({ value: null, updated_at: new Date().toISOString() })
        .eq("key", "admin_fcm_token");
      
      setPushEnabled(false);
      toast({
        title: "Notifications désactivées",
        description: "Vous ne recevrez plus de notifications push.",
      });
    } catch (error) {
      console.error("Error disabling push:", error);
    } finally {
      setIsEnablingPush(false);
    }
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
      {/* Push Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Recevez des notifications instantanées sur votre appareil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={pushEnabled ? "border-primary/50 bg-primary/5" : ""}>
            <BellRing className="h-4 w-4" />
            <AlertTitle>
              {pushEnabled ? "Notifications activées" : "Notifications désactivées"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {pushEnabled 
                ? "Vous recevrez une notification push chaque fois qu'une nouvelle réservation est créée."
                : "Activez les notifications push pour être alerté instantanément des nouvelles réservations."
              }
            </AlertDescription>
          </Alert>

          <Button 
            onClick={pushEnabled ? disablePushNotifications : enablePushNotifications}
            disabled={isEnablingPush}
            variant={pushEnabled ? "outline" : "default"}
          >
            {isEnablingPush ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : pushEnabled ? (
              <Bell className="w-4 h-4 mr-2" />
            ) : (
              <BellRing className="w-4 h-4 mr-2" />
            )}
            {isEnablingPush 
              ? "En cours..." 
              : pushEnabled 
              ? "Désactiver les notifications" 
              : "Activer les notifications push"
            }
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres WhatsApp
          </CardTitle>
          <CardDescription>
            Configurez les alertes WhatsApp pour les nouvelles réservations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              </p>
            </AlertDescription>
          </Alert>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
