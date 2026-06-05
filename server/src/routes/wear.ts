import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const router = Router();

// POST /api/record-wear — bypasses RLS using service role (same idea as confirm-image)
router.post('/record-wear', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const { wornOn, itemIds } = req.body as {
    wornOn?: string;
    itemIds?: string[];
  };

  if (!wornOn || !/^\d{4}-\d{2}-\d{2}$/.test(wornOn)) {
    return res.status(400).json({ error: 'wornOn must be YYYY-MM-DD' });
  }
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'itemIds required' });
  }

  const { data: owned, error: checkError } = await supabase
    .from('items')
    .select('id')
    .eq('user_id', user.id)
    .in('id', itemIds);

  if (checkError) {
    return res.status(500).json({ error: checkError.message });
  }
  if ((owned ?? []).length !== itemIds.length) {
    return res.status(400).json({ error: 'invalid items' });
  }

  const { data: outfit, error: outfitError } = await supabase
    .from('outfits')
    .insert({ user_id: user.id })
    .select('id')
    .single();

  if (outfitError) {
    return res.status(500).json({ error: outfitError.message });
  }

  const { error: linkError } = await supabase.from('outfit_items').insert(
    itemIds.map((item_id: string) => ({
      outfit_id: outfit.id,
      item_id,
    })),
  );

  if (linkError) {
    return res.status(500).json({ error: linkError.message });
  }

  const { data: log, error: logError } = await supabase
    .from('wear_log')
    .insert({
      user_id: user.id,
      outfit_id: outfit.id,
      worn_on: wornOn,
    })
    .select('id')
    .single();

  if (logError) {
    return res.status(500).json({ error: logError.message });
  }

  return res.status(200).json({
    success: true,
    outfitId: outfit.id,
    wearLogId: log.id,
  });
});

export default router;
