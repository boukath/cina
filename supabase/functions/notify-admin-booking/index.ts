import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceDetail {
  serviceId: string;
  serviceName: string;
  personName: string;
  price: number;
  duration: number;
}

interface BookingNotification {
  name: string;
  phone: string;
  email?: string;
  service: string;
  event_date: string;
  event_time: string;
  message?: string;
  totalPrice?: number;
  totalDuration?: number;
  servicesDetails?: ServiceDetail[];
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

    // Format services details if available
    let servicesSection = `💇 *Service:* ${booking.service}`;
    if (booking.servicesDetails && booking.servicesDetails.length > 0) {
      servicesSection = `💇 *Services:*\n${booking.servicesDetails.map(s => 
        `   • ${s.personName}: ${s.serviceName} (${Number(s.price).toLocaleString('fr-DZ')} DZD)`
      ).join('\n')}`;
    }

    // Format the WhatsApp message
    const message = `🔔 *Nouvelle Réservation!*

👤 *Client:* ${booking.name}
📞 *Téléphone:* ${booking.phone}
${booking.email ? `📧 *Email:* ${booking.email}` : ""}
${servicesSection}
📅 *Date:* ${booking.event_date}
⏰ *Heure:* ${booking.event_time}
${booking.totalPrice ? `💰 *Total:* ${Number(booking.totalPrice).toLocaleString('fr-DZ')} DZD` : ""}
${booking.totalDuration ? `⏱ *Durée estimée:* ${booking.totalDuration} min` : ""}
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
