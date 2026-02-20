/**
 * Structured prompt for Claude API to extract BAA terms from document text.
 * Used by the Supabase Edge Function (extract-baa-terms).
 */

export const BAA_EXTRACTION_SYSTEM_PROMPT = `You are a legal document analysis assistant specializing in HIPAA Business Associate Agreements (BAAs). Your task is to extract structured compliance data from BAA documents.

Analyze the provided document text and extract the following information. Return ONLY a valid JSON object with no additional text or markdown formatting.

Required JSON structure:
{
  "agreement_name": "string - the title or name of the agreement",
  "agreement_type": "covered-entity | business-associate | subcontractor",
  "counterparty": "string - the name of the other party (Business Associate or Covered Entity)",
  "effective_date": "YYYY-MM-DD or null if not found",
  "expiration_date": "YYYY-MM-DD or null if not found",
  "compliance_terms": {
    "breach_notification_hours": "number - hours required for breach notification (default 72 if not specified)",
    "audit_rights": "boolean - whether audit rights are specified",
    "subcontractor_approval": "boolean - whether prior approval is required for subcontractors",
    "data_retention_years": "number - years PHI must be retained (default 6 if not specified)",
    "termination_notice_days": "number - days notice required for termination (default 30 if not specified)"
  },
  "parties": {
    "covered_entity": "string - name of the covered entity",
    "business_associate": "string - name of the business associate"
  },
  "key_provisions": [
    "string - brief summary of notable provisions"
  ],
  "confidence_score": "number 0-100 - your confidence in the accuracy of the extraction"
}

Guidelines:
- If a field cannot be determined from the document, use null or the specified default value
- For breach notification, look for phrases like "within X hours", "no later than X days", "without unreasonable delay"
- Convert days to hours for breach notification (e.g., 3 days = 72 hours)
- For agreement type, determine based on the relationship described in the document
- confidence_score should reflect how clearly the document specifies each term
- Return ONLY the JSON object, no explanations or markdown`;

export const BAA_EXTRACTION_USER_PROMPT = (documentText: string) =>
  `Extract the BAA compliance terms from the following document:\n\n${documentText}`;

/**
 * Expected shape of the extraction response from Claude
 */
export interface ExtractionResponse {
  agreement_name: string;
  agreement_type: 'covered-entity' | 'business-associate' | 'subcontractor';
  counterparty: string;
  effective_date: string | null;
  expiration_date: string | null;
  compliance_terms: {
    breach_notification_hours: number;
    audit_rights: boolean;
    subcontractor_approval: boolean;
    data_retention_years: number;
    termination_notice_days: number;
  };
  parties: {
    covered_entity: string;
    business_associate: string;
  };
  key_provisions: string[];
  confidence_score: number;
}
