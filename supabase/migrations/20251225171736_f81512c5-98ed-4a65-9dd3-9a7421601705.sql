-- Create time slots table for managing availability
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slot_date, slot_time)
);

-- Enable RLS
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
CREATE POLICY "Anyone can view time slots"
ON public.time_slots
FOR SELECT
USING (true);

-- Anyone can update slots when booking (mark as unavailable)
CREATE POLICY "Anyone can update time slots"
ON public.time_slots
FOR UPDATE
USING (true);

-- Anyone can insert new slots
CREATE POLICY "Anyone can insert time slots"
ON public.time_slots
FOR INSERT
WITH CHECK (true);

-- Add time column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS event_time TIME;