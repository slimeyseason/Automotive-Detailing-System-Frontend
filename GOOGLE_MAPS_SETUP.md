# Google Maps API Setup Instructions

## Overview
The ADS booking system now uses Google Maps API to allow customers to pin their exact service location interactively.

## Required API Key

### 1. Get a Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. **ENABLE BILLING** (Required - even for free tier):
   - Click "Billing" in the left menu
   - Link a billing account (credit card required)
   - Don't worry - Google provides $200 free credit monthly
   - You won't be charged unless you exceed free tier limits
   
4. Enable the following APIs:
   - **Maps JavaScript API** (for map display)
   - **Geocoding API** (for address lookups)
   - **Places API** (optional, for autocomplete)

5. Create credentials (API Key)
6. Restrict the API key to your domain for security

### 2. Add API Key to Your Project
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Features
- **Interactive Map**: Click anywhere on the map to pin location
- **Draggable Marker**: Drag the marker to adjust the location
- **Reverse Geocoding**: Automatically gets the address from coordinates
- **Manual Edit**: Users can edit the address text if needed
- **Coordinates Display**: Shows lat/lng for reference

## Backend Data Structure
The booking location is now stored with:
```javascript
location: {
  address: "123 Moi Avenue, Nairobi, Kenya",
  latitude: -1.286389,
  longitude: 36.817223
}
```

## API Key Security
⚠️ **Important**: 
- Never commit your actual API key to version control
- Use environment variables (`.env` file)
- Restrict your API key in Google Cloud Console
- Set up billing alerts to monitor usage

## Fallback
If the Google Maps API fails to load:
- An error message is displayed
- Users can still manually type their address
- Coordinates will be null but address is preserved

## Troubleshooting

### Error: "BillingNotEnabledMapError"
**Solution**: You must enable billing in Google Cloud Console:
1. Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing)
2. Click "Link a billing account" or "Create billing account"
3. Add your payment information (credit card required)
4. Enable billing for your project
5. Wait 2-5 minutes for changes to propagate
6. Refresh your app

**Note**: Billing is required even for free tier usage, but you get $200 free credit monthly.

### Error: "InvalidKeyMapError"
**Solution**: 
- Check that your API key is correctly copied in `.env`
- Verify the key has no extra spaces
- Ensure you've enabled Maps JavaScript API in Google Cloud

### Error: "RefererNotAllowedMapError"
**Solution**: 
- Add `http://localhost:5173/*` to API key restrictions in Google Cloud Console
- For production, add your domain: `https://yourdomain.com/*`

## Cost Considerations
- Google Maps provides **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads (free tier covers ~28K loads/month)
- Geocoding API: $5 per 1,000 requests (free tier covers ~40K requests/month)
- Monitor your usage in Google Cloud Console
- Set up billing alerts to avoid surprises
- Most small to medium apps stay within free tier
