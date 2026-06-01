import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { standardizeImage } from '../services/gemini';
import { removeBackground } from '../services/removebg';
import { uploadToStorage } from '../services/storage';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const router = Router();

// POST /api/process-image, upload pipeline for photos
router.post('/process-image', async (req, res) => {
  //verify user is authenticated
  const token = req.headers.authorization?.split(' ')[1];
  console.log('token received:', token); // add this
  if (!token) return res.status(401).json({ error: 'no token' });
  
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  console.log('user:', user, 'error:', error); // add this
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  
  const userId = user.id; 
  const { imageBase64, category } = req.body; 

  /*
  const standardized = await standardizeImage(imageBase64);
  const cleaned = await removeBackground(standardized);
  */
  //TODO: replace imageBase64 with cleaned once done
  const url = await uploadToStorage(imageBase64, userId); //upload image to s3 bucket

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