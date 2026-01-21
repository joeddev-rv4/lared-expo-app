# Google OAuth Setup Instructions

## Firebase Project Configuration

1. **Open Firebase Console**: Go to https://console.firebase.google.com/
2. **Select your project**: Choose the "lared-expo-app" project
3. **Go to Authentication**: Click on "Authentication" in the left sidebar
4. **Sign-in methods**: Click on "Sign-in method" tab
5. **Enable Google**: 
   - Click on "Google" provider
   - Toggle "Enable" switch
   - Add your email as a test user if needed
   - Save the configuration

## Get OAuth Client IDs

1. **Project Settings**: Click on the gear icon > Project settings
2. **General Tab**: Scroll down to "Your apps" section
3. **Web App**: If you don't have a web app, click "Add app" and create one
4. **Copy Web Client ID**: Copy the "Web client ID" from the Firebase SDK snippet

## Environment Variables

Add this to your `.env` file:

```bash
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```

Replace `YOUR_WEB_CLIENT_ID_HERE` with the actual Web Client ID from Firebase.

## Testing

1. **Web**: The Google login should work immediately with popup authentication
2. **Mobile**: 
   - For Expo Go: The Google Sign-In package works with Expo Go
   - For production: You'll need to configure native builds with proper SHA-1 fingerprints

## Important Notes

- The Web Client ID is used for both web and mobile authentication with Firebase
- Make sure to add authorized domains in Firebase console if deploying to production
- For production mobile apps, you'll need to add SHA-1/SHA-256 certificates to Firebase

## Troubleshooting

If you get errors:
1. Verify the Web Client ID is correctly set in environment variables
2. Check that Google provider is enabled in Firebase Authentication
3. Ensure the Firebase project configuration is correct
4. For web: Check browser console for detailed error messages