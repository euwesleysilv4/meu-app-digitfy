import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        <App />
      </AuthProvider>
    </NextUIProvider>
  </StrictMode>
);
