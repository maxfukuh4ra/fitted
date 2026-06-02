const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';

export const API = {
  processImage: `${BASE_URL}/api/process-image`,
  uploadImage: `${BASE_URL}/api/upload-image`,
} as const;