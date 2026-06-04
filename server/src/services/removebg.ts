export async function removeBackground(base64: string): Promise<string> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new Error('Missing remove.bg API key: set REMOVE_BG_API_KEY in the environment.');
  }

  let rawBase64 = base64.trim();
  const dataUrlMatch = /^data:[^;]+;base64,(.*)$/is.exec(rawBase64);

  if (dataUrlMatch) {
    rawBase64 = dataUrlMatch[1];
  }

  rawBase64 = rawBase64.replace(/\s+/g, '');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      Accept: 'image/png',
    },
    body: JSON.stringify({
      image_file_b64: rawBase64,
      size: 'auto',
      format: 'png',
      type: 'product',
      crop: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 402) {
      throw new Error('remove.bg: Insufficient credits.');
    }

    if (response.status === 403) {
      throw new Error('remove.bg: Authentication failed.');
    }

    if (response.status === 429) {
      throw new Error('remove.bg: Rate limit exceeded.');
    }

    throw new Error(`remove.bg API error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const outputBase64 = buffer.toString('base64');

  return `data:image/png;base64,${outputBase64}`;
}
