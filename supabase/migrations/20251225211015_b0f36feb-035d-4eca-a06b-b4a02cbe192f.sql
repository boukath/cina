-- Drop the overly permissive policy that exposes all bookings to everyone
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;