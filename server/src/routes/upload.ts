import { Router } from 'express';
import { standardizeImage } from '../services/gemini';
import { removeBackground } from '../services/removebg';
import { uploadToStorage } from '../services/storage';

const router = Router();

// POST /api/process-image
// called by frontend after user confirms photo
router.post('/process-image', async (req, res) => {
  const { imageBase64, userId, category } = req.body;

  /*
  const standardized = await standardizeImage(imageBase64);
  const cleaned = await removeBackground(standardized);
  const url = await uploadToStorage(cleaned, userId);

  //TODO: save url and insert into row 

  res.json({ imageUrl: url });
  */
  res.json({ test: "test"}) //success or fialure
 
});

export default router;