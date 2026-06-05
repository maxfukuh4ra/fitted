import { createClient } from '@supabase/supabase-js';

// service key — can bypass RLS, only used server-side
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

//Uploads base64 image to supabase storage and returns public url
export async function uploadToStorage(buffer: Buffer, userId: string): Promise<string> {
  const path = `${userId}/${Date.now()}.png`;

  await supabase.storage
    .from('clothing-images')
    .upload(path, buffer, { contentType: 'image/png' });

  const { data } = supabase.storage
    .from('clothing-images')
    .getPublicUrl(path);

  return data.publicUrl;
}