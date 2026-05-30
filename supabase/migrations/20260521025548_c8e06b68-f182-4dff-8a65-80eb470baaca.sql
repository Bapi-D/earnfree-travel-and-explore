
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');
CREATE TYPE public.enquiry_status AS ENUM ('pending', 'solved', 'bypassed', 'admin_review');
CREATE TYPE public.package_category AS ENUM ('Domestic', 'International', 'Group', 'Honeymoon', 'Adventure');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ STAFF PROFILES ============
CREATE TABLE public.staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_number SMALLINT NOT NULL CHECK (staff_number BETWEEN 1 AND 3),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_number)
);
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- ============ PACKAGES ============
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  category public.package_category NOT NULL DEFAULT 'Domestic',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ENQUIRIES ============
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  destination TEXT NOT NULL,
  travel_date DATE,
  travelers INT,
  message TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  status public.enquiry_status NOT NULL DEFAULT 'pending',
  assigned_staff_number SMALLINT NOT NULL DEFAULT 1 CHECK (assigned_staff_number BETWEEN 1 AND 3),
  bypass_count SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_enquiries_status ON public.enquiries(status);
CREATE INDEX idx_enquiries_assigned ON public.enquiries(assigned_staff_number);
CREATE INDEX idx_enquiries_user ON public.enquiries(user_id);
CREATE TRIGGER trg_enquiries_updated BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ENQUIRY HISTORY ============
CREATE TABLE public.enquiry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enquiry_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_history_enquiry ON public.enquiry_history(enquiry_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ BYPASS / SOLVE FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.bypass_enquiry(_enquiry_id UUID)
RETURNS public.enquiries LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _enq public.enquiries;
  _current SMALLINT;
BEGIN
  SELECT * INTO _enq FROM public.enquiries WHERE id = _enquiry_id FOR UPDATE;
  IF _enq IS NULL THEN RAISE EXCEPTION 'Enquiry not found'; END IF;
  _current := _enq.assigned_staff_number;
  IF _current >= 3 THEN
    UPDATE public.enquiries
      SET status = 'admin_review', bypass_count = bypass_count + 1
      WHERE id = _enquiry_id RETURNING * INTO _enq;
  ELSE
    UPDATE public.enquiries
      SET assigned_staff_number = _current + 1,
          status = 'pending',
          bypass_count = bypass_count + 1
      WHERE id = _enquiry_id RETURNING * INTO _enq;
  END IF;
  INSERT INTO public.enquiry_history (enquiry_id, actor_id, action, notes)
    VALUES (_enquiry_id, auth.uid(), 'bypass',
      'From Staff ' || _current || ' → ' ||
      CASE WHEN _current >= 3 THEN 'Admin Review' ELSE 'Staff ' || (_current + 1) END);
  RETURN _enq;
END; $$;

CREATE OR REPLACE FUNCTION public.solve_enquiry(_enquiry_id UUID)
RETURNS public.enquiries LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _enq public.enquiries;
BEGIN
  UPDATE public.enquiries SET status = 'solved'
    WHERE id = _enquiry_id RETURNING * INTO _enq;
  INSERT INTO public.enquiry_history (enquiry_id, actor_id, action, notes)
    VALUES (_enquiry_id, auth.uid(), 'solve', NULL);
  RETURN _enq;
END; $$;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_roles (read self + admin)
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- staff_profiles
CREATE POLICY "Staff view self, admin view all" ON public.staff_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage staff" ON public.staff_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- packages (public read, admin & staff manage)
CREATE POLICY "Anyone view packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admin and staff insert packages" ON public.packages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin and staff update packages" ON public.packages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin and staff delete packages" ON public.packages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- enquiries
CREATE POLICY "Users insert own enquiry" ON public.enquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own enquiries" ON public.enquiries FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR (
      public.has_role(auth.uid(), 'staff')
      AND assigned_staff_number = (
        SELECT staff_number FROM public.staff_profiles
        WHERE user_id = auth.uid() AND active = true
      )
    )
  );
CREATE POLICY "Staff & admin update enquiries" ON public.enquiries FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (
      public.has_role(auth.uid(), 'staff')
      AND assigned_staff_number = (
        SELECT staff_number FROM public.staff_profiles
        WHERE user_id = auth.uid() AND active = true
      )
    )
  );
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- enquiry_history
CREATE POLICY "Authorized view history" ON public.enquiry_history FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
    OR EXISTS (SELECT 1 FROM public.enquiries e WHERE e.id = enquiry_id AND e.user_id = auth.uid())
  );

-- ============ REALTIME ============
ALTER TABLE public.packages REPLICA IDENTITY FULL;
ALTER TABLE public.enquiries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('package-images', 'package-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read package images" ON storage.objects FOR SELECT
  USING (bucket_id = 'package-images');
CREATE POLICY "Admin and staff upload package images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'package-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
CREATE POLICY "Admin and staff update package images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'package-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
CREATE POLICY "Admin and staff delete package images" ON storage.objects FOR DELETE
  USING (bucket_id = 'package-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
