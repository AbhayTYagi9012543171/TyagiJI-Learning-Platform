import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Application Context & Core App Component
import { AuthProvider } from './context/AuthContext.jsx';
import App from './app/App.jsx';

// ============================================
// GLOBAL STYLES
// ============================================
import './styles/global.css';
import './styles/layout-premium.css';
import './styles/components/ui.css';

// ============================================
// PAGE STYLES
// ============================================
import './styles/pages/enterprise-pages.css';
import './styles/pages/projects-premium.css';
import './styles/resources-premium.css';

// ============================================
// FINAL STYLE OVERRIDES (Must remain last)
// ============================================
import './styles/premium-overrides.css';
import './styles/actual-layout-fix.css';

// ============================================
// ROOT ELEMENT VALIDATION
// ============================================
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element #root was not found in index.html. Please check your HTML entry file.'
  );
}

// ============================================
// APPLICATION RENDER
// ============================================
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