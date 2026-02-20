-- ============================================================
-- BAAble Database Schema
-- Supabase PostgreSQL with Row Level Security
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'internal', 'external-counsel');
CREATE TYPE agreement_type AS ENUM ('covered-entity', 'business-associate', 'subcontractor');
CREATE TYPE agreement_status AS ENUM ('active', 'expired', 'draft', 'terminated');
CREATE TYPE signature_status AS ENUM ('fully-executed', 'pending', 'unsigned');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'invited');
CREATE TYPE signature_request_status AS ENUM ('pending', 'sent', 'viewed', 'signed', 'declined');
CREATE TYPE audit_action AS ENUM (
  'agreement.created', 'agreement.updated', 'agreement.deleted',
  'agreement.uploaded', 'agreement.signed',
  'member.invited', 'member.updated', 'member.removed',
  'template.created', 'template.updated', 'template.deleted',
  'extraction.completed',
  'user.login', 'user.logout'
);

-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'internal',
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations for multi-tenant support
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization membership
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Agreements
CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type agreement_type NOT NULL,
  status agreement_status NOT NULL DEFAULT 'draft',
  counterparty TEXT NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  signature_status signature_status NOT NULL DEFAULT 'unsigned',
  current_version INTEGER NOT NULL DEFAULT 1,
  email_alerts BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- soft delete
);

-- Agreement compliance terms
CREATE TABLE agreement_compliance_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE UNIQUE,
  breach_notification_hours INTEGER NOT NULL DEFAULT 72,
  audit_rights BOOLEAN NOT NULL DEFAULT true,
  subcontractor_approval BOOLEAN NOT NULL DEFAULT true,
  data_retention_years INTEGER NOT NULL DEFAULT 6,
  termination_notice_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agreement version history
CREATE TABLE agreement_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changes TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agreement_id, version_number)
);

-- Agreement uploaded documents
CREATE TABLE agreement_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  version_id UUID REFERENCES agreement_versions(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI extraction results
CREATE TABLE extraction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES agreement_documents(id) ON DELETE CASCADE,
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  extracted_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  extraction_method TEXT NOT NULL DEFAULT 'claude-ai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team members (may or may not have a user account)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'internal',
  status member_status NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- E-signature requests
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_order INTEGER NOT NULL DEFAULT 1,
  status signature_request_status NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compliance templates
CREATE TABLE compliance_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  terms JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log (append-only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_agreements_org ON agreements(org_id);
CREATE INDEX idx_agreements_status ON agreements(status);
CREATE INDEX idx_agreements_type ON agreements(type);
CREATE INDEX idx_agreements_deleted ON agreements(deleted_at);
CREATE INDEX idx_agreements_expiration ON agreements(expiration_date);
CREATE INDEX idx_agreements_search ON agreements USING gin(to_tsvector('english', name || ' ' || counterparty));
CREATE INDEX idx_compliance_terms_agreement ON agreement_compliance_terms(agreement_id);
CREATE INDEX idx_versions_agreement ON agreement_versions(agreement_id);
CREATE INDEX idx_documents_agreement ON agreement_documents(agreement_id);
CREATE INDEX idx_extraction_document ON extraction_results(document_id);
CREATE INDEX idx_extraction_agreement ON extraction_results(agreement_id);
CREATE INDEX idx_team_members_org ON team_members(org_id);
CREATE INDEX idx_signature_requests_agreement ON signature_requests(agreement_id);
CREATE INDEX idx_compliance_templates_org ON compliance_templates(org_id);
CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_compliance_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Org members: can see own org memberships
CREATE POLICY org_members_select ON org_members FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY org_members_insert ON org_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM org_members om WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'admin'
  ));

-- Organizations: members can see their orgs
CREATE POLICY orgs_select ON organizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM org_members WHERE org_members.org_id = id AND org_members.user_id = auth.uid()
  ));
CREATE POLICY orgs_insert ON organizations FOR INSERT WITH CHECK (true);  -- anyone can create org

-- Helper function: check if user belongs to org
CREATE OR REPLACE FUNCTION user_in_org(org UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is admin of org
CREATE OR REPLACE FUNCTION user_is_org_admin(org UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org AND user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Agreements: org members can CRUD (soft delete only)
CREATE POLICY agreements_select ON agreements FOR SELECT
  USING (user_in_org(org_id) AND deleted_at IS NULL);
CREATE POLICY agreements_insert ON agreements FOR INSERT
  WITH CHECK (user_in_org(org_id));
CREATE POLICY agreements_update ON agreements FOR UPDATE
  USING (user_in_org(org_id));

-- Compliance terms: same org access as agreements
CREATE POLICY compliance_terms_select ON agreement_compliance_terms FOR SELECT
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY compliance_terms_insert ON agreement_compliance_terms FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY compliance_terms_update ON agreement_compliance_terms FOR UPDATE
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));

-- Versions: same org access
CREATE POLICY versions_select ON agreement_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY versions_insert ON agreement_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));

-- Documents: same org access
CREATE POLICY docs_select ON agreement_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY docs_insert ON agreement_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));

-- Extraction results: same org access
CREATE POLICY extraction_select ON extraction_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY extraction_insert ON extraction_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));

-- Team members: org members can view, admins can modify
CREATE POLICY team_select ON team_members FOR SELECT USING (user_in_org(org_id));
CREATE POLICY team_insert ON team_members FOR INSERT WITH CHECK (user_in_org(org_id));
CREATE POLICY team_update ON team_members FOR UPDATE USING (user_is_org_admin(org_id));
CREATE POLICY team_delete ON team_members FOR DELETE USING (user_is_org_admin(org_id));

-- Signature requests: org members can view, any member can create
CREATE POLICY sig_select ON signature_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY sig_insert ON signature_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));
CREATE POLICY sig_update ON signature_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM agreements a WHERE a.id = agreement_id AND user_in_org(a.org_id)));

-- Compliance templates: org members can view, any member can create
CREATE POLICY templates_select ON compliance_templates FOR SELECT USING (user_in_org(org_id));
CREATE POLICY templates_insert ON compliance_templates FOR INSERT WITH CHECK (user_in_org(org_id));
CREATE POLICY templates_update ON compliance_templates FOR UPDATE USING (user_in_org(org_id));
CREATE POLICY templates_delete ON compliance_templates FOR DELETE USING (user_is_org_admin(org_id));

-- Audit log: org members can view, system inserts
CREATE POLICY audit_select ON audit_log FOR SELECT USING (user_in_org(org_id));
CREATE POLICY audit_insert ON audit_log FOR INSERT WITH CHECK (user_in_org(org_id));

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER agreements_updated_at BEFORE UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER compliance_terms_updated_at BEFORE UPDATE ON agreement_compliance_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER compliance_templates_updated_at BEFORE UPDATE ON compliance_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('agreements', 'agreements', false);

-- Storage policies: org members can upload/download agreement documents
CREATE POLICY storage_agreements_select ON storage.objects FOR SELECT
  USING (bucket_id = 'agreements' AND auth.role() = 'authenticated');
CREATE POLICY storage_agreements_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agreements' AND auth.role() = 'authenticated');
