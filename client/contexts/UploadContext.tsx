import React, { createContext, useContext, useState } from 'react';
import { Category } from '@/constants/categories';

type UploadState = {
  category: Category | null;
  subcategory: string | null;
  imageUri: string | null;  // local URI from camera/gallery
  imageUrl: string | null;  // bucket URL from /prepare-image
};

type UploadContextType = UploadState & {
  setCategory: (category: Category, subcategory: string) => void;
  setImageUri: (uri: string) => void;
  setImageUrl: (url: string) => void;
  reset: () => void;
};

const defaultState: UploadState = {
  category: null,
  subcategory: null,
  imageUri: null,
  imageUrl: null,
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UploadState>(defaultState);

  const setCategory = (category: Category, subcategory: string) => {
    setState(s => ({ ...s, category, subcategory }));
  };

  const setImageUri = (uri: string) => {
    setState(s => ({ ...s, imageUri: uri }));
  };

  const setImageUrl = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }));
  };

  const reset = () => setState(defaultState);

  return (
    <UploadContext.Provider value={{ ...state, setCategory, setImageUri, setImageUrl, reset }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}