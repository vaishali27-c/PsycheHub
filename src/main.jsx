import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppContextProvider from './context/AppContext.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// You need to create a proper OAuth client ID from Google Cloud Console
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Navigate to APIs & Services > Credentials
// 4. Click "Create Credentials" and select "OAuth client ID"
// 5. Set the application type to "Web application"
// 6. Add your development URL (http://localhost:5173) to Authorized JavaScript origins
// 7. Add http://localhost:5173 to Authorized redirect URIs
// 8. Copy the generated Client ID here
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Log OAuth client ID status for debugging
if (!GOOGLE_CLIENT_ID) {
  console.error("Google OAuth Client ID is missing in .env file");
} else {
  console.log("Google OAuth Client ID is configured: ", GOOGLE_CLIENT_ID.substring(0, 5) + '...');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID} 
      onScriptLoadError={() => console.error("Google OAuth script failed to load")}
      onScriptLoadSuccess={() => console.log("Google OAuth script loaded successfully")}
    >
      <BrowserRouter>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
