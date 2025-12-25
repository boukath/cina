-- Create services table for price management
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

-- Admin can view all services
CREATE POLICY "Admin can view all services"
ON public.services
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert services
CREATE POLICY "Admin can insert services"
ON public.services
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update services
CREATE POLICY "Admin can update services"
ON public.services
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete services
CREATE POLICY "Admin can delete services"
ON public.services
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_updated_at();

-- Insert default services with prices
INSERT INTO public.services (name, description, price, duration_minutes, display_order) VALUES
('Coiffure Mariée', 'Coiffure complète pour le jour du mariage', 150.00, 120, 1),
('Maquillage Mariée', 'Maquillage professionnel pour le mariage', 100.00, 90, 2),
('Pack Mariée Complet', 'Coiffure + Maquillage pour la mariée', 220.00, 180, 3),
('Coiffure Invitée', 'Coiffure élégante pour les invitées', 60.00, 60, 4),
('Maquillage Invitée', 'Maquillage professionnel pour les invitées', 50.00, 45, 5),
('Chignon', 'Chignon élégant', 45.00, 45, 6),
('Brushing', 'Brushing et mise en forme', 30.00, 30, 7),
('Essai Coiffure', 'Essai avant le jour J', 40.00, 60, 8),
('Essai Maquillage', 'Essai maquillage avant le jour J', 35.00, 45, 9);