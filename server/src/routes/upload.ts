import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { standardizeImage } from '../services/gemini';
import { removeBackground } from '../services/removebg';
import { uploadToStorage } from '../services/storage';
import multer from 'multer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// POST /api/process-image, upload pipeline for photos
router.post('/process-image', upload.single('image'), async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  
  const userId = user.id;
  const category = req.body.category;
  const buffer = req.file!.buffer;

  /*
  const standardized = await standardizeImage(imageBase64);
  const cleaned = await removeBackground(standardized);
  */
  //TODO: replace imageBase64 with cleaned once done
  const url = await uploadToStorage(buffer, userId); //upload image to s3 bucket

  //insert into user items table
  const { error: insertError } = await supabase.from('items').insert({
    user_id: userId,
    image_url: url,
    category,
  });

  if (insertError) {
    return res.status(500).json({ success: false, error: insertError.message,});
  }

  return res.status(200).json({ success: true, imageUrl: url,});
 
});

export default router;