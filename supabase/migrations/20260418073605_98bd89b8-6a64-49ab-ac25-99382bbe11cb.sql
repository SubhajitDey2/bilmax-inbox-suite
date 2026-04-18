-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'agent', 'viewer');
CREATE TYPE public.channel_type AS ENUM ('whatsapp', 'instagram', 'facebook');
CREATE TYPE public.message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE public.message_sender_type AS ENUM ('customer', 'agent', 'ai', 'system');
CREATE TYPE public.message_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE public.conversation_status AS ENUM ('open', 'snoozed', 'closed');
CREATE TYPE public.chat_mode AS ENUM ('ai', 'human');
CREATE TYPE public.payment_status AS ENUM ('cash', 'upi', 'online', 'unpaid');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE public.connection_status AS ENUM ('disconnected', 'pending', 'connected', 'error');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');
CREATE TYPE public.recipient_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

-- =========================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- ORGANIZATIONS
-- =========================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- PROFILES (1-to-1 with auth.users)
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  default_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- MEMBERSHIPS (user <-> organization)
-- =========================================
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX idx_memberships_user ON public.memberships(user_id);
CREATE INDEX idx_memberships_org ON public.memberships(org_id);

-- =========================================
-- USER ROLES (separate table per security best practice)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id, role)
);
CREATE INDEX idx_user_roles_lookup ON public.user_roles(user_id, org_id);

-- =========================================
-- SECURITY DEFINER HELPERS (avoid RLS recursion)
-- =========================================
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  )
$$;

-- Returns true if user has any of the given roles (or higher) in org
CREATE OR REPLACE FUNCTION public.has_min_role(_user_id UUID, _org_id UUID, _min public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.org_id = _org_id
      AND CASE ur.role
        WHEN 'owner' THEN 4
        WHEN 'admin' THEN 3
        WHEN 'agent' THEN 2
        WHEN 'viewer' THEN 1
      END >= CASE _min
        WHEN 'owner' THEN 4
        WHEN 'admin' THEN 3
        WHEN 'agent' THEN 2
        WHEN 'viewer' THEN 1
      END
  )
$$;

-- =========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- CUSTOMERS (CRM)
-- =========================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  dob DATE,
  gender public.gender,
  last_booking_date DATE,
  last_payment_status public.payment_status,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  channel_handles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_org ON public.customers(org_id);
CREATE INDEX idx_customers_phone ON public.customers(org_id, phone);
CREATE INDEX idx_customers_tags ON public.customers USING GIN(tags);
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- CUSTOMER SERVICES (services purchased)
-- =========================================
CREATE TABLE public.customer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount NUMERIC(10,2),
  purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_services_customer ON public.customer_services(customer_id);

-- =========================================
-- CHANNEL CONNECTIONS (Meta credentials per org)
-- =========================================
CREATE TABLE public.channel_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  channel public.channel_type NOT NULL,
  display_name TEXT NOT NULL,
  external_account_id TEXT,
  webhook_secret TEXT,
  status public.connection_status NOT NULL DEFAULT 'disconnected',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, channel, external_account_id)
);
CREATE INDEX idx_channel_connections_org ON public.channel_connections(org_id);
CREATE TRIGGER set_channel_connections_updated_at BEFORE UPDATE ON public.channel_connections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- CONVERSATIONS
-- =========================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  channel public.channel_type NOT NULL,
  channel_thread_id TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.conversation_status NOT NULL DEFAULT 'open',
  chat_mode public.chat_mode NOT NULL DEFAULT 'human',
  unread_count INT NOT NULL DEFAULT 0,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_org_recent ON public.conversations(org_id, last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_conversations_status ON public.conversations(org_id, status);
CREATE UNIQUE INDEX idx_conversations_channel_thread ON public.conversations(org_id, channel, channel_thread_id) WHERE channel_thread_id IS NOT NULL;
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- MESSAGES
-- =========================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction public.message_direction NOT NULL,
  sender_type public.message_sender_type NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.message_status NOT NULL DEFAULT 'sent',
  external_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_org ON public.messages(org_id, created_at DESC);

-- =========================================
-- CAMPAIGN TEMPLATES
-- =========================================
CREATE TABLE public.campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel public.channel_type NOT NULL,
  body TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaign_templates_org ON public.campaign_templates(org_id);
CREATE TRIGGER set_campaign_templates_updated_at BEFORE UPDATE ON public.campaign_templates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- CAMPAIGNS
-- =========================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel public.channel_type NOT NULL,
  template_id UUID REFERENCES public.campaign_templates(id) ON DELETE SET NULL,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_recipients INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_org ON public.campaigns(org_id, created_at DESC);
CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================
-- CAMPAIGN RECIPIENTS
-- =========================================
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status public.recipient_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT,
  UNIQUE (campaign_id, customer_id)
);
CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id, status);

-- =========================================
-- ENABLE RLS ON ALL TABLES
-- =========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES — ORGANIZATIONS
-- =========================================
CREATE POLICY "Members can view their organizations" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update their organization" ON public.organizations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), id, 'owner'));

CREATE POLICY "Owners can delete their organization" ON public.organizations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), id, 'owner'));

-- =========================================
-- RLS POLICIES — PROFILES
-- =========================================
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Org members can view co-members profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.memberships m1
      JOIN public.memberships m2 ON m1.org_id = m2.org_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========================================
-- RLS POLICIES — MEMBERSHIPS
-- =========================================
CREATE POLICY "Users can view memberships in their orgs" ON public.memberships
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_org_member(auth.uid(), org_id)
  );

CREATE POLICY "Owners and admins can add members" ON public.memberships
  FOR INSERT TO authenticated WITH CHECK (
    public.has_min_role(auth.uid(), org_id, 'admin')
    OR (
      -- Allow self-insert when creating a new org (will be owner)
      user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND created_by = auth.uid())
    )
  );

CREATE POLICY "Owners and admins can remove members" ON public.memberships
  FOR DELETE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — USER ROLES
-- =========================================
CREATE POLICY "Users can view roles in their orgs" ON public.user_roles
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_org_member(auth.uid(), org_id)
  );

CREATE POLICY "Owners and admins can assign roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (
    public.has_min_role(auth.uid(), org_id, 'admin')
    OR (
      -- Allow self-assignment as owner when creating a new org
      user_id = auth.uid() AND role = 'owner'
      AND EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND created_by = auth.uid())
    )
  );

CREATE POLICY "Owners can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), org_id, 'owner'));

CREATE POLICY "Owners and admins can remove roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — CUSTOMERS
-- =========================================
CREATE POLICY "Org members can view customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Agents+ can create customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (public.has_min_role(auth.uid(), org_id, 'agent'));

CREATE POLICY "Agents+ can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'agent'));

CREATE POLICY "Admins+ can delete customers" ON public.customers
  FOR DELETE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — CUSTOMER SERVICES
-- =========================================
CREATE POLICY "Org members can view services" ON public.customer_services
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Agents+ can manage services" ON public.customer_services
  FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'agent'))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'agent'));

-- =========================================
-- RLS POLICIES — CHANNEL CONNECTIONS (admin-only)
-- =========================================
CREATE POLICY "Admins+ can view channel connections" ON public.channel_connections
  FOR SELECT TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'admin'));

CREATE POLICY "Admins+ can manage channel connections" ON public.channel_connections
  FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin'))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — CONVERSATIONS
-- =========================================
CREATE POLICY "Org members can view conversations" ON public.conversations
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Agents+ can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (public.has_min_role(auth.uid(), org_id, 'agent'));

CREATE POLICY "Agents+ can update conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'agent'));

CREATE POLICY "Admins+ can delete conversations" ON public.conversations
  FOR DELETE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — MESSAGES
-- =========================================
CREATE POLICY "Org members can view messages" ON public.messages
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Agents+ can create messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (public.has_min_role(auth.uid(), org_id, 'agent'));

CREATE POLICY "Agents+ can update messages" ON public.messages
  FOR UPDATE TO authenticated USING (public.has_min_role(auth.uid(), org_id, 'agent'));

-- =========================================
-- RLS POLICIES — CAMPAIGN TEMPLATES (admin-only)
-- =========================================
CREATE POLICY "Org members can view templates" ON public.campaign_templates
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins+ can manage templates" ON public.campaign_templates
  FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin'))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — CAMPAIGNS (admin-only)
-- =========================================
CREATE POLICY "Org members can view campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins+ can manage campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), org_id, 'admin'))
  WITH CHECK (public.has_min_role(auth.uid(), org_id, 'admin'));

-- =========================================
-- RLS POLICIES — CAMPAIGN RECIPIENTS
-- =========================================
CREATE POLICY "Org members can view recipients" ON public.campaign_recipients
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND public.is_org_member(auth.uid(), c.org_id)
    )
  );

CREATE POLICY "Admins+ can manage recipients" ON public.campaign_recipients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND public.has_min_role(auth.uid(), c.org_id, 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND public.has_min_role(auth.uid(), c.org_id, 'admin')
    )
  );

-- =========================================
-- REALTIME
-- =========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;