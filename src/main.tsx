import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/synthwave-theme.css'; // Import synthwave theme
import { BrowserRouter } from 'react-router-dom';
import { FirebaseConnectionProvider } from './contexts/FirebaseConnectionContext';
import { AuthProvider } from './contexts/AuthContext';
import { MessageNotificationProvider } from './contexts/MessageNotificationContext';
import { ToastProvider } from '@/components/ToastProvider';
import { initializeCapacitor } from '@/lib/capacitor';

// Initialize Capacitor features
initializeCapacitor().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FirebaseConnectionProvider>
        <AuthProvider>
          <MessageNotificationProvider>
            <App />
            <ToastProvider />
          </MessageNotificationProvider>
        </AuthProvider>
      </FirebaseConnectionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);