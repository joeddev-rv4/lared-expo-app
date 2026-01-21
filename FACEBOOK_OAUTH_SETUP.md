# Facebook OAuth Setup Instructions

## Firebase Console Configuration

### 1. Enable Facebook Authentication in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Facebook** provider
5. Toggle **Enable** switch
6. You'll need **App ID** and **App Secret** from Facebook (see next section)

## Facebook Developer Configuration

### 2. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Consumer** as app type
4. Fill in app details:
   - **App Name**: "La Red Inmobiliaria" (or your app name)
   - **App Contact Email**: Your email
5. Click **Create App**

### 3. Add Facebook Login Product
1. In your Facebook App dashboard
2. Click **Add Product**
3. Find **Facebook Login** and click **Set Up**
4. Select **Web** platform
5. Enter your website URL (for development: `http://localhost:8081`)

### 4. Configure Facebook Login Settings
1. Go to **Facebook Login** > **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler
   ```
   Replace `YOUR_PROJECT_ID` with your Firebase project ID
3. For localhost testing, also add:
   ```
   http://localhost:8081/__/auth/handler
   ```
4. Save changes

### 5. Get App Credentials
1. Go to **Settings** > **Basic**
2. Copy **App ID**
3. Click **Show** on **App Secret** and copy it
4. **IMPORTANT**: Keep App Secret confidential!

### 6. Complete Firebase Configuration
1. Return to Firebase Console > Authentication > Facebook
2. Paste **App ID** from Facebook
3. Paste **App Secret** from Facebook
4. Copy the **OAuth redirect URI** from Firebase
5. Make sure it matches what you entered in Facebook Login settings
6. Click **Save**

## App Configuration (Optional for Mobile)

For React Native mobile apps, you would need additional configuration:
- Facebook SDK for React Native
- Configure `app.json` with Facebook App ID
- Add Facebook SDK to iOS/Android native projects

**Note**: Current implementation is web-only. Mobile requires additional setup.

## Testing

### Web Testing
1. Make sure Facebook app is in **Development Mode**
2. Add test users in Facebook App > **Roles** > **Test Users**
3. Or use your own Facebook account (must be app admin/developer)
4. Test login on `http://localhost:8081`

### Before Going Live
1. Complete **App Review** in Facebook App dashboard
2. Submit for **facebook_login** permission review
3. Set app to **Live Mode**
4. Configure production domains in Facebook Login settings

## Common Issues

### "App Not Set Up"
- App is in Development Mode
- User is not a test user or app admin
- **Solution**: Add user as test user or make app Live

### "Invalid OAuth Redirect URI"
- Redirect URI in Facebook doesn't match Firebase
- **Solution**: Copy exact URI from Firebase to Facebook settings

### "This app is not available"
- App is in Development Mode with restricted access
- **Solution**: Add testers or complete App Review

## Security Notes

1. **Never commit App Secret** to version control
2. Keep App Secret in Firebase Console only
3. Rotate App Secret if compromised
4. Use environment variables for sensitive data
5. Enable **App Secret Proof** for extra security

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Firebase Facebook Auth Guide](https://firebase.google.com/docs/auth/web/facebook-login)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review)
