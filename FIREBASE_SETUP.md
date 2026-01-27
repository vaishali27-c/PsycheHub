# Firebase Setup Guide

This document provides step-by-step instructions to set up Firebase for your project. We'll be configuring both Firebase Authentication and Firestore Database.

## Current Configuration

The project is already configured with the following Firebase project:

- **Project ID**: doctors-cc7b6
- **Web App Configuration**: Available in `src/config/firebase.js`
- **Service Account**: Available in `backend/config/firebase-config.js`

If you want to use this existing configuration, you can skip to step 7 for testing.

If you want to set up your own Firebase project, follow these steps:

## 1. Create a Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics if desired
4. Click "Create project"

## 2. Set Up Firebase Authentication

1. In your Firebase project, go to the sidebar and select "Authentication"
2. Click "Get started"
3. Under "Sign-in method", enable:
   - Email/Password
   - Google
4. For Google authentication, configure the OAuth consent screen if prompted

## 3. Set Up Firestore Database

1. In the Firebase console, select "Firestore Database" from the sidebar
2. Click "Create database"
3. Choose either "Start in production mode" or "Start in test mode" (recommended for development)
   - Note: Test mode allows read/write access to anyone, suitable for development but not production
4. Select a database location closest to your users and click "Enable"

## 4. Create Service Account for Backend

1. In the Firebase console, go to Project settings > Service accounts
2. Click "Generate new private key"
3. Save the JSON file securely - this contains sensitive credentials
4. Open `backend/config/firebase-config.js` and replace the `serviceAccount` object with the contents of your downloaded JSON file

## 5. Configure Web App for Frontend

1. In Firebase console, go to Project settings > General
2. In the "Your apps" section, click the web icon (</>) to create a new web app
3. Register your app with a nickname (e.g., "PsycheHub Web")
4. Copy the generated Firebase configuration object
5. Open `src/config/firebase.js` and replace the `firebaseConfig` object with your configuration

## 6. Enable Firebase Security Rules

For Firestore, configure security rules to protect your data:

1. In Firebase console, go to Firestore Database > Rules
2. Set up appropriate rules. For development, you can use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This rule allows authenticated users to read and write any document.

## 7. Test Your Configuration

After completing the setup:

1. Restart your backend server:
   ```
   cd frontend/backend
   npm run start
   ```

2. Restart your frontend application:
   ```
   cd frontend
   npm run dev
   ```

3. Try to sign up a new user or log in with Google
4. Check the console for any errors

## Security Best Practices

1. Never commit your Firebase service account key to source control
2. Use environment variables for sensitive configuration in production
3. Implement proper security rules before deploying to production
4. Regularly review Firebase Authentication and Database usage

## Troubleshooting

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify your Firebase configuration details match those in your Firebase console
3. Ensure you've enabled the required authentication methods
4. Check the Firebase documentation for specific error messages
5. For CORS issues, verify your API endpoint configurations 