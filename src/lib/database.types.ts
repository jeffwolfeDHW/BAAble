export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'internal' | 'external-counsel';
export type AgreementType = 'covered-entity' | 'business-associate' | 'subcontractor';
export type AgreementStatus = 'active' | 'expired' | 'draft' | 'terminated';
export type SignatureStatus = 'fully-executed' | 'pending' | 'unsigned';
export type MemberStatus = 'active' | 'inactive' | 'invited';
export type SignatureRequestStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
export type AuditAction =
  | 'agreement.created'
  | 'agreement.updated'
  | 'agreement.deleted'
  | 'agreement.uploaded'
  | 'agreement.signed'
  | 'member.invited'
  | 'member.updated'
  | 'member.removed'
  | 'template.created'
  | 'template.updated'
  | 'template.deleted'
  | 'extraction.completed'
  | 'user.login'
  | 'user.logout';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          company: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          company?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          company?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          updated_at?: string;
        };
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          role?: UserRole;
        };
      };
      agreements: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: AgreementType;
          status: AgreementStatus;
          counterparty: string;
          effective_date: string;
          expiration_date: string;
          signature_status: SignatureStatus;
          current_version: number;
          email_alerts: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type: AgreementType;
          status?: AgreementStatus;
          counterparty: string;
          effective_date: string;
          expiration_date: string;
          signature_status?: SignatureStatus;
          current_version?: number;
          email_alerts?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          type?: AgreementType;
          status?: AgreementStatus;
          counterparty?: string;
          effective_date?: string;
          expiration_date?: string;
          signature_status?: SignatureStatus;
          current_version?: number;
          email_alerts?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      agreement_compliance_terms: {
        Row: {
          id: string;
          agreement_id: string;
          breach_notification_hours: number;
          audit_rights: boolean;
          subcontractor_approval: boolean;
          data_retention_years: number;
          termination_notice_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          breach_notification_hours: number;
          audit_rights?: boolean;
          subcontractor_approval?: boolean;
          data_retention_years: number;
          termination_notice_days: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          breach_notification_hours?: number;
          audit_rights?: boolean;
          subcontractor_approval?: boolean;
          data_retention_years?: number;
          termination_notice_days?: number;
          updated_at?: string;
        };
      };
      agreement_versions: {
        Row: {
          id: string;
          agreement_id: string;
          version_number: number;
          changes: string;
          author_id: string;
          author_name: string;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          version_number: number;
          changes: string;
          author_id: string;
          author_name: string;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          changes?: string;
          file_url?: string | null;
        };
      };
      agreement_documents: {
        Row: {
          id: string;
          agreement_id: string;
          version_id: string | null;
          file_name: string;
          file_url: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          version_id?: string | null;
          file_name: string;
          file_url: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
          file_url?: string;
        };
      };
      extraction_results: {
        Row: {
          id: string;
          document_id: string;
          agreement_id: string;
          extracted_data: Json;
          confidence_score: number;
          extraction_method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          agreement_id: string;
          extracted_data: Json;
          confidence_score: number;
          extraction_method: string;
          created_at?: string;
        };
        Update: {
          extracted_data?: Json;
          confidence_score?: number;
        };
      };
      team_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          role: UserRole;
          status: MemberStatus;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          role?: UserRole;
          status?: MemberStatus;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          role?: UserRole;
          status?: MemberStatus;
          user_id?: string | null;
          updated_at?: string;
        };
      };
      signature_requests: {
        Row: {
          id: string;
          agreement_id: string;
          requested_by: string;
          signer_name: string;
          signer_email: string;
          signer_order: number;
          status: SignatureRequestStatus;
          signed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          requested_by: string;
          signer_name: string;
          signer_email: string;
          signer_order: number;
          status?: SignatureRequestStatus;
          signed_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: SignatureRequestStatus;
          signed_at?: string | null;
        };
      };
      compliance_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string;
          terms: Json;
          is_default: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string;
          terms: Json;
          is_default?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          terms?: Json;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      agreement_type: AgreementType;
      agreement_status: AgreementStatus;
      signature_status: SignatureStatus;
      member_status: MemberStatus;
      signature_request_status: SignatureRequestStatus;
      audit_action: AuditAction;
    };
  };
}

// Convenience types for row data
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrgMember = Database['public']['Tables']['org_members']['Row'];
export type AgreementRow = Database['public']['Tables']['agreements']['Row'];
export type ComplianceTermsRow = Database['public']['Tables']['agreement_compliance_terms']['Row'];
export type AgreementVersionRow = Database['public']['Tables']['agreement_versions']['Row'];
export type AgreementDocumentRow = Database['public']['Tables']['agreement_documents']['Row'];
export type ExtractionResultRow = Database['public']['Tables']['extraction_results']['Row'];
export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
export type SignatureRequestRow = Database['public']['Tables']['signature_requests']['Row'];
export type ComplianceTemplateRow = Database['public']['Tables']['compliance_templates']['Row'];
export type AuditLogRow = Database['public']['Tables']['audit_log']['Row'];

// Joined types for common queries
export interface AgreementWithTerms extends AgreementRow {
  compliance_terms: ComplianceTermsRow | null;
  versions: AgreementVersionRow[];
  documents: AgreementDocumentRow[];
  extraction: ExtractionResultRow | null;
}
