import { supabase } from "@/integrations/supabase/client";

interface NotifyAdminParams {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send a push notification to the admin
 * Retrieves the admin's FCM token from settings and sends the notification
 */
export const sendAdminPushNotification = async ({
  title,
  body,
  data,
}: NotifyAdminParams): Promise<boolean> => {
  try {
    // Get admin FCM token from settings
    const { data: settingData, error: settingError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "admin_fcm_token")
      .maybeSingle();

    if (settingError) {
      console.error("Error fetching admin FCM token:", settingError);
      return false;
    }

    const adminToken = settingData?.value;

    if (!adminToken) {
      console.log("No admin FCM token configured, skipping push notification");
      return false;
    }

    console.log("Sending push notification to admin...");

    // Call the edge function to send push notification
    const { data: response, error } = await supabase.functions.invoke(
      "send-push-notification",
      {
        body: {
          token: adminToken,
          title,
          body,
          data: data || {},
        },
      }
    );

    if (error) {
      console.error("Error sending push notification:", error);
      return false;
    }

    console.log("Push notification sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Failed to send admin push notification:", error);
    return false;
  }
};

/**
 * Send a booking notification to the admin
 */
export const notifyAdminNewBooking = async ({
  clientName,
  service,
  date,
  time,
  totalPrice,
}: {
  clientName: string;
  service: string;
  date: string;
  time: string;
  totalPrice?: number;
}): Promise<boolean> => {
  const priceText = totalPrice ? ` - ${totalPrice.toLocaleString("fr-DZ")} DZD` : "";
  
  return sendAdminPushNotification({
    title: "🎉 Nouvelle Réservation!",
    body: `${clientName} - ${service} le ${date} à ${time}${priceText}`,
    data: {
      type: "new_booking",
      clientName,
      service,
      date,
      time,
    },
  });
};
