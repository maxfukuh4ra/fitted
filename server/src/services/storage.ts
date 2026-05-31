import { createClient } from '@supabase/supabase-js';

// service key — can bypass RLS, only used server-side
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadToStorage(base64: string, userId: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const path = `${userId}/${Date.now()}.png`;

  await supabase.storage
    .from('clothing-images')
    .upload(path, buffer, { contentType: 'image/png' });

  const { data } = supabase.storage
    .from('clothing-images')
    .getPublicUrl(path);

  return data.publicUrl;
}