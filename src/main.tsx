import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { FirebaseConnectionProvider } from './contexts/FirebaseConnectionContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { initializeCapacitor } from '@/lib/capacitor';

// Initialize Capacitor features
initializeCapacitor().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FirebaseConnectionProvider>
        <AuthProvider>
          <App />
          <ToastProvider />
        </AuthProvider>
      </FirebaseConnectionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);