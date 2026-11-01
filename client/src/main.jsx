
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import App from './app/App.jsx';

// Global styles
import './styles/global.css';
import './styles/layout-premium.css';
import './styles/components/ui.css';

// Page styles
import './styles/pages/enterprise-pages.css';
import './styles/pages/projects-premium.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element #root was not found in index.html.'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
