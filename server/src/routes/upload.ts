import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { standardizeImage } from '../services/gemini';
import { removeBackground } from '../services/removebg';
import { uploadToStorage } from '../services/storage';
import multer from 'multer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});
const router = Router();

// POST /api/prepare-image
// uploads + AI processes image, returns url for user preview — does NOT insert to DB
router.post('/prepare-image', upload.single('image'), async (req: Request, res: Response) => {
  console.log("prepare-image called");
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  console.log("User authenticated:", user.id);
  const buffer = req.file!.buffer;
  const base64 = `data:${req.file!.mimetype};base64,${buffer.toString('base64')}`;
  console.log("Calling Gemini API for image standardization...");
  const standardized = await standardizeImage(base64);
  //NOTE: Uncomment lines below to activate base64
  // console.log("Image standardized, calling remove.bg for background removal...");
  // const backgroundRemoved = await removeBackground(standardized);
  // const base64Data = backgroundRemoved.replace(/^data:image\/\w+;base64,/, '');
  // const cleanedBuffer = Buffer.from(base64Data, 'base64');
  //NOTE: Comment line below out when using removebg
  const cleanedBuffer = Buffer.from(standardized, 'base64'); // remove when removebg active
  const url = await uploadToStorage(cleanedBuffer, user.id);
  console.log("Image processed and uploaded, URL:", url);

  return res.status(200).json({ success: true, imageUrl: url });
});

// POST /api/confirm-image
// user acks preview — inserts into items table, no file upload
// use subcategory for category
router.post('/confirm-image', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const { imageUrl, category, subcategory, name } = req.body;

  if (!imageUrl || !category) {
    return res.status(400).json({ error: 'imageUrl and category are required' });
  }
  console.log("Inserting item into database for user:", user.id);
  const { error: insertError } = await supabase.from('items').insert({
    user_id: user.id,
    image_url: imageUrl,
    category: category,
    subcategory: subcategory || null,
    item_name: name || null,
  });
  console.log("Database insert attempted, reuslt:", insertError ? insertError.message : "success");

  if (insertError) {
    return res.status(500).json({ success: false, error: insertError.message });
  }
  console.log("sucess")

  return res.status(200).json({ success: true });
});

// POST /api/upload-image, raw upload to supabase storage only
router.post('/upload-image', upload.single('image'), async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const buffer = req.file!.buffer;
  const url = await uploadToStorage(buffer, user.id);

  return res.status(200).json({ success: true, imageUrl: url });
});

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message.includes('Only')) {
    return res.status(400).json({ error: err.message });
  }
  console.log('Unexpected error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

export default router;