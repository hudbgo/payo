-- ============================================================
-- PAYÓMETRO — Esquema completo de Supabase
-- Ejecuta este SQL en el Editor SQL de tu proyecto Supabase
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos de perfil público
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLA: payometers
-- Grupos de competición
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payometers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  created_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code  TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLA: memberships
-- Relación usuario-payómetro con rol
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payometer_id   UUID NOT NULL REFERENCES public.payometers(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role           TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (payometer_id, user_id)
);

-- ============================================================
-- TABLA: score_events
-- Registro de puntos asignados
-- ============================================================
CREATE TABLE IF NOT EXISTS public.score_events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payometer_id   UUID NOT NULL REFERENCES public.payometers(id) ON DELETE CASCADE,
  given_by       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  received_by    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points         INTEGER NOT NULL CHECK (points > 0),
  reason         TEXT NOT NULL,
  event_date     DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- No puede darse puntos a sí mismo
  CONSTRAINT no_self_scoring CHECK (given_by != received_by)
);

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_id       ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_payometer_id  ON public.memberships(payometer_id);
CREATE INDEX IF NOT EXISTS idx_score_events_payometer_id ON public.score_events(payometer_id);
CREATE INDEX IF NOT EXISTS idx_score_events_received_by  ON public.score_events(received_by);
CREATE INDEX IF NOT EXISTS idx_score_events_given_by     ON public.score_events(given_by);
CREATE INDEX IF NOT EXISTS idx_score_events_event_date   ON public.score_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_payometers_invite_code    ON public.payometers(invite_code);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tr_payometers_updated_at
  BEFORE UPDATE ON public.payometers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/8.x/notionists/svg?seed=' || COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER tr_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payometers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- PROFILES: cualquier usuario autenticado puede ver perfiles
-- Solo el propio usuario puede editar el suyo
-- -------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------
-- PAYOMETERS: solo miembros pueden ver el payómetro
-- Solo el creador puede editar/borrar
-- -------------------------------------------------------
CREATE POLICY "payometers_select_members"
  ON public.payometers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.payometer_id = id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "payometers_insert_authenticated"
  ON public.payometers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "payometers_update_creator"
  ON public.payometers FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "payometers_delete_creator"
  ON public.payometers FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Política especial: cualquier usuario autenticado puede ver un payómetro
-- si conoce el invite_code (para la página de join)
CREATE POLICY "payometers_select_by_invite_code"
  ON public.payometers FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);

-- -------------------------------------------------------
-- MEMBERSHIPS: miembros del mismo payómetro pueden ver membresías
-- -------------------------------------------------------
CREATE POLICY "memberships_select_same_payometer"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.memberships m2
      WHERE m2.payometer_id = payometer_id AND m2.user_id = auth.uid()
    )
  );

CREATE POLICY "memberships_insert_self"
  ON public.memberships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memberships_delete_self_or_admin"
  ON public.memberships FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.memberships admin_m
      WHERE admin_m.payometer_id = payometer_id
        AND admin_m.user_id = auth.uid()
        AND admin_m.role = 'admin'
    )
  );

-- -------------------------------------------------------
-- SCORE_EVENTS: solo miembros del payómetro pueden ver/crear
-- -------------------------------------------------------
CREATE POLICY "score_events_select_members"
  ON public.score_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.payometer_id = payometer_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "score_events_insert_members"
  ON public.score_events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = given_by
    AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.payometer_id = payometer_id AND m.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.memberships m2
      WHERE m2.payometer_id = payometer_id AND m2.user_id = received_by
    )
  );

CREATE POLICY "score_events_delete_own_or_admin"
  ON public.score_events FOR DELETE
  TO authenticated
  USING (
    auth.uid() = given_by
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.payometer_id = payometer_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );

-- ============================================================
-- REALTIME: habilitar publicaciones para tiempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.score_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payometers;

-- ============================================================
-- DATOS DE EJEMPLO (opcional, descomenta para probar)
-- ============================================================
-- INSERT INTO public.profiles (id, username, email, avatar_url) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'juanpayo', 'juan@example.com', 'https://api.dicebear.com/8.x/notionists/svg?seed=juanpayo'),
--   ('00000000-0000-0000-0000-000000000002', 'mariapaya', 'maria@example.com', 'https://api.dicebear.com/8.x/notionists/svg?seed=mariapaya');
