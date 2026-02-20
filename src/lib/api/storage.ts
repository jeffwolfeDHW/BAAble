import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const BUCKET = 'agreements';

// ──────────────────────────────────────────────
// Upload a document to Supabase Storage
// ──────────────────────────────────────────────
export async function uploadDocument(
  file: File,
  orgId: string,
  agreementId: string
): Promise<{ path: string; url: string }> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const fileExt = file.name.split('.').pop();
  const fileName = `${orgId}/${agreementId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return { path: fileName, url: publicUrl };
}

// ──────────────────────────────────────────────
// Get a signed download URL for a document
// ──────────────────────────────────────────────
export async function getDocumentUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// ──────────────────────────────────────────────
// Delete a document from storage
// ──────────────────────────────────────────────
export async function deleteDocument(path: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
