-- ============================================================
-- PHASE 1: Super Admin role
-- ============================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
