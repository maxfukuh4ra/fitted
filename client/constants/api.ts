const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';

export const API = {
  processImage: `${BASE_URL}/api/prepare-image`,
  uploadImage: `${BASE_URL}/api/confirm-image`,
} as const;