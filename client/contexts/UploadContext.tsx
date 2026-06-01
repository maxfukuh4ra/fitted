import React, { createContext, useContext, useState } from 'react';
import { Category } from '@/constants/categories';

type UploadState = {
  category: Category | null;
  subcategory: string | null;
  imageUri: string | null;
};

type UploadContextType = UploadState & {
  setCategory: (category: Category, subcategory: string) => void;
  setImage: (uri: string) => void;
  reset: () => void;
};

const defaultState: UploadState = {
  category: null,
  subcategory: null,
  imageUri: null,
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UploadState>(defaultState);

  const setCategory = (category: Category, subcategory: string) => {
    setState(s => ({ ...s, category, subcategory }));
  };

  const setImage = (uri: string) => {
    setState(s => ({ ...s, imageUri: uri }));
  };

  const reset = () => setState(defaultState);

  return (
    <UploadContext.Provider value={{ ...state, setCategory, setImage, reset }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}