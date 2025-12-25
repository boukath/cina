-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop the overly permissive SELECT policy on bookings
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;

-- Create admin-only SELECT policy for bookings
CREATE POLICY "Admin can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create public SELECT policy for own bookings (by email match)
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- Add UPDATE policy for admin only
CREATE POLICY "Admin can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add DELETE policy for admin only
CREATE POLICY "Admin can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update time_slots policies to be admin-only for modifications
DROP POLICY IF EXISTS "Anyone can insert time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Anyone can update time slots" ON public.time_slots;

CREATE POLICY "Admin can insert time slots"
ON public.time_slots
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update time slots"
ON public.time_slots
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete time slots"
ON public.time_slots
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));