// =============================================================================
// main.jsx — the very first file the browser runs. It mounts the React app
// into <div id="root"> in index.html and wraps it with app-wide helpers.
// =============================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Tailwind styles
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from "react-hot-toast"
import AuthProvider from './auth/AuthProvider.jsx'
import { LanguageProvider } from './i18n/AppLanguage.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode: extra checks during development only (no effect in production)
  <StrictMode>
    {/* BrowserRouter: lets the app show different pages for different URLs */}
    <BrowserRouter>
      {/* LanguageProvider: the display language (English, French, Arabic) */}
      <LanguageProvider>
      {/* AuthProvider: makes "who is logged in" available everywhere */}
      <AuthProvider>
        <App />
        {/* Toaster: where pop-up notifications (toast.success(...)) appear */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '9999px',
              padding: '10px 18px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#ffffff',
              background: '#14323A',
              boxShadow: '0 22px 48px -20px rgb(20 50 58 / 0.55)',
            },
            success: { iconTheme: { primary: '#A8DCCF', secondary: '#14323A' } },
            error: { iconTheme: { primary: '#F28B8F', secondary: '#14323A' } },
          }}
        />
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
