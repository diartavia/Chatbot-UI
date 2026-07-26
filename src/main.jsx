import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

async function bootstrap() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );

  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    try {
      const { worker } = await import('./mocks/browser');
      worker.start({ onUnhandledRequest: 'bypass' }).catch((error) => {
        console.warn('MSW mock worker could not start:', error);
      });
    } catch (error) {
      console.warn('MSW mock worker could not start:', error);
    }
  }
}

bootstrap();