import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotification {
  name: string;
  phone: string;
  email?: string;
  service: string;
  event_date: string;
  event_time: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingNotification = await req.json();
    const adminPhone = Deno.env.get("ADMIN_WHATSAPP_NUMBER");

    if (!adminPhone) {
      console.error("ADMIN_WHATSAPP_NUMBER not configured");
      return new Response(
        JSON.stringify({ error: "Admin phone not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format the WhatsApp message
    const message = `🔔 *Nouvelle Réservation!*

👤 *Client:* ${booking.name}
📞 *Téléphone:* ${booking.phone}
${booking.email ? `📧 *Email:* ${booking.email}` : ""}
💇 *Service:* ${booking.service}
📅 *Date:* ${booking.event_date}
⏰ *Heure:* ${booking.event_time}
${booking.message ? `💬 *Message:* ${booking.message}` : ""}

Connectez-vous au panneau admin pour gérer cette réservation.`;

    // Create WhatsApp URL (wa.me format)
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    console.log("Booking notification prepared for admin:", {
      clientName: booking.name,
      service: booking.service,
      date: booking.event_date,
      time: booking.event_time,
    });

    // Return the WhatsApp URL so the frontend can trigger it if needed
    // In a production app, you might integrate with WhatsApp Business API
    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappUrl,
        message: "Notification prepared" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-admin-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
