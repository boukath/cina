-- Create stylists table
CREATE TABLE public.stylists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;

-- RLS policies for stylists
CREATE POLICY "Anyone can view active stylists"
ON public.stylists
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can manage stylists"
ON public.stylists
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add stylist_id and paid_amount to bookings
ALTER TABLE public.bookings 
ADD COLUMN stylist_id UUID REFERENCES public.stylists(id),
ADD COLUMN paid_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_method TEXT DEFAULT 'cash',
ADD COLUMN invited_by TEXT;

-- Insert default stylists (Cina and Marie)
INSERT INTO public.stylists (name) VALUES 
('Cina'),
('Marie');