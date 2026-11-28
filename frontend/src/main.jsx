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

createRoot(document.getElementById('root')).render(
  // StrictMode: extra checks during development only (no effect in production)
  <StrictMode>
    {/* BrowserRouter: lets the app show different pages for different URLs */}
    <BrowserRouter>
      {/* AuthProvider: makes "who is logged in" available everywhere */}
      <AuthProvider>
        <App />
        {/* Toaster: where pop-up notifications (toast.success(...)) appear */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '14px',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#0F172A',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgb(15 23 42 / 0.05), 0 12px 32px rgb(15 23 42 / 0.09)',
            },
            success: { iconTheme: { primary: '#067647', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#B42318', secondary: '#ffffff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
