import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { TransactionsProvider } from './context/TransactionsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TransactionsProvider>
        <App />
      </TransactionsProvider>
    </AuthProvider>
  </StrictMode>
);
