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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const buffer = req.file!.buffer;

  /*
  const standardized = await standardizeImage(buffer);
  const cleaned = await removeBackground(standardized);
  const url = await uploadToStorage(cleaned, user.id);
  */
  // TODO: replace buffer with cleaned once AI pipeline is ready
  const url = await uploadToStorage(buffer, user.id);
  console.log(url)

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

  const { imageUrl, category, subcategory } = req.body;
  if (!imageUrl || !category) {
    return res.status(400).json({ error: 'imageUrl and category are required' });
  }

  const { error: insertError } = await supabase.from('items').insert({
    user_id: user.id,
    image_url: imageUrl,
    category: subcategory ? subcategory : category,
  });

  if (insertError) {
    return res.status(500).json({ success: false, error: insertError.message });
  }

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