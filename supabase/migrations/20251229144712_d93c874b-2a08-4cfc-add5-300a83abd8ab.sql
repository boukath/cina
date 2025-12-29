-- Create notifications table for admin alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'booking',
  is_read BOOLEAN NOT NULL DEFAULT false,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admin can view notifications"
ON public.notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admin can update notifications"
ON public.notifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete notifications
CREATE POLICY "Admin can delete notifications"
ON public.notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create trigger function to create notification on new booking
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type, booking_id)
  VALUES (
    'Nouvelle réservation',
    'Réservation de ' || NEW.name || ' pour ' || NEW.service || ' le ' || NEW.event_date,
    'booking',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
CREATE TRIGGER on_booking_created
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_booking_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;