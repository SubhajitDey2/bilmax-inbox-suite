-- Helper: is the user a super admin (in any org)?
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- ============================================================
-- PHASE 1 (cont): Super admin RLS policies on existing tables
-- ============================================================
CREATE POLICY "Super admins full access on organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on memberships"
  ON public.memberships FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on customers"
  ON public.customers FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on conversations"
  ON public.conversations FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on messages"
  ON public.messages FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on customer_services"
  ON public.customer_services FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on channel_connections"
  ON public.channel_connections FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on campaigns"
  ON public.campaigns FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on campaign_templates"
  ON public.campaign_templates FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins full access on campaign_recipients"
  ON public.campaign_recipients FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================================
-- PHASE 2: WhatsApp accounts (per-org credentials)
-- ============================================================
CREATE TYPE public.whatsapp_connection_type AS ENUM ('cloud_api', 'coexistence');
CREATE TYPE public.whatsapp_connection_status AS ENUM ('disconnected', 'pending', 'connected', 'error');

CREATE TABLE public.whatsapp_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_type public.whatsapp_connection_type NOT NULL DEFAULT 'cloud_api',
  display_name text NOT NULL DEFAULT 'WhatsApp',
  phone_number_id text,
  whatsapp_business_account_id text,
  meta_app_id text,
  -- Stored encrypted at app layer (mocked for now). Never expose to non-admins.
  access_token_encrypted text,
  app_secret_encrypted text,
  webhook_verify_token text,
  webhook_url text,
  status public.whatsapp_connection_status NOT NULL DEFAULT 'disconnected',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, connection_type)
);

CREATE INDEX idx_whatsapp_accounts_org ON public.whatsapp_accounts(org_id);

ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;

-- Members can see status / display name (but app code must hide secrets)
CREATE POLICY "Org members can view whatsapp accounts"
  ON public.whatsapp_accounts FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins+ can manage whatsapp accounts"
  ON public.whatsapp_accounts FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()));

CREATE TRIGGER set_updated_at_whatsapp_accounts
  BEFORE UPDATE ON public.whatsapp_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- PHASE 4: WhatsApp templates with Meta approval lifecycle
-- ============================================================
CREATE TYPE public.template_category AS ENUM ('marketing', 'utility', 'authentication');
CREATE TYPE public.template_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

CREATE TABLE public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category public.template_category NOT NULL DEFAULT 'utility',
  language text NOT NULL DEFAULT 'en',
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.template_status NOT NULL DEFAULT 'draft',
  meta_template_id text,
  rejection_reason text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name, language)
);

CREATE INDEX idx_whatsapp_templates_org ON public.whatsapp_templates(org_id);
CREATE INDEX idx_whatsapp_templates_status ON public.whatsapp_templates(status);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view templates"
  ON public.whatsapp_templates FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins+ can manage templates"
  ON public.whatsapp_templates FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()));

CREATE TRIGGER set_updated_at_whatsapp_templates
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- PHASE 4: Update campaign_status enum + add template link
-- ============================================================
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'approved';

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS whatsapp_template_id uuid REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL;

-- ============================================================
-- PHASE 4: Campaign queue (BullMQ replacement using DB)
-- ============================================================
CREATE TYPE public.queue_status AS ENUM ('pending', 'processing', 'sent', 'failed');

CREATE TABLE public.campaign_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status public.queue_status NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_queue_status ON public.campaign_queue(status, scheduled_for);
CREATE INDEX idx_campaign_queue_campaign ON public.campaign_queue(campaign_id);

ALTER TABLE public.campaign_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view queue"
  ON public.campaign_queue FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins+ can manage queue"
  ON public.campaign_queue FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin') OR public.is_super_admin(auth.uid()));

CREATE TRIGGER set_updated_at_campaign_queue
  BEFORE UPDATE ON public.campaign_queue
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();