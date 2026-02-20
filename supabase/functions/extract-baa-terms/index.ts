// Supabase Edge Function: extract-baa-terms
// Extracts structured BAA compliance data from uploaded documents using Claude API

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BAA_SYSTEM_PROMPT = `You are a legal document analysis assistant specializing in HIPAA Business Associate Agreements (BAAs). Your task is to extract structured compliance data from BAA documents.

Analyze the provided document text and extract the following information. Return ONLY a valid JSON object with no additional text or markdown formatting.

Required JSON structure:
{
  "agreement_name": "string",
  "agreement_type": "covered-entity | business-associate | subcontractor",
  "counterparty": "string",
  "effective_date": "YYYY-MM-DD or null",
  "expiration_date": "YYYY-MM-DD or null",
  "compliance_terms": {
    "breach_notification_hours": "number (default 72)",
    "audit_rights": "boolean",
    "subcontractor_approval": "boolean",
    "data_retention_years": "number (default 6)",
    "termination_notice_days": "number (default 30)"
  },
  "parties": {
    "covered_entity": "string",
    "business_associate": "string"
  },
  "key_provisions": ["string"],
  "confidence_score": "number 0-100"
}

Return ONLY the JSON object, no explanations or markdown.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { document_text, document_id, agreement_id } = await req.json();

    if (!document_text) {
      return new Response(
        JSON.stringify({ error: 'document_text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Claude API for extraction
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: BAA_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract the BAA compliance terms from the following document:\n\n${document_text}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      throw new Error(`Claude API error: ${anthropicResponse.status} ${errorText}`);
    }

    const claudeResult = await anthropicResponse.json();
    const extractedText = claudeResult.content[0].text;

    // Parse the JSON response from Claude
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = extractedText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Failed to parse extraction response as JSON');
      }
    }

    // Store extraction results if IDs provided
    if (document_id && agreement_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      await supabase.from('extraction_results').insert({
        document_id,
        agreement_id,
        extracted_data: extractedData,
        confidence_score: extractedData.confidence_score || 0,
        extraction_method: 'claude-ai',
      });
    }

    return new Response(JSON.stringify({ data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
