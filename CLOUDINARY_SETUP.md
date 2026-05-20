# Cloudinary Integration Setup Guide

## Step 1: Sign Up for Cloudinary (Free Tier)

1. Go to https://cloudinary.com/users/register/free
2. Create a free account (no credit card required)
3. After signup, you'll be in your dashboard

## Step 2: Get Your Cloudinary Credentials

1. In your Cloudinary dashboard, find your **Cloud Name** (top of the page)
2. Click the gear icon (Settings) in the top right
3. Go to **API Keys** tab
4. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Configure Backend Environment

1. Open `backend/.env` file (or create it from `.env.example`)
2. Add your Cloudinary credentials:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## Step 4: Install Dependencies

Run in the backend folder:

```bash
npm install cloudinary
```

## Step 5: Start Your Servers

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

## How It Works

- **Max file size**: 500 KB per image (to stay within 25 credits/month)
- **Max images**: 5 per ticket
- **Storage**: Cloudinary free tier (unlimited storage, 25 monthly credits)
- **Delivery**: CDN with automatic optimization & compression

## Free Tier Limits

- **25 monthly credits** = roughly:
  - ~250-500 small image uploads (< 1MB each)
  - ~50-100 medium images (500KB - 1MB)
- Images are automatically compressed and optimized

## Cloudinary Features Enabled

✅ Auto-optimization (quality: auto)  
✅ Auto-format (WebP, etc.)  
✅ Progressive JPEG  
✅ Automatic resizing  
✅ CDN delivery  
✅ Folder organization (/ict-support-desk/tickets/)

## Testing

1. Log in to the app
2. Submit a ticket with a screenshot
3. File should be:
   - Validated for size (< 500 KB)
   - Uploaded to Cloudinary
   - Stored as URL in database
   - Displayed when viewing ticket

## Troubleshooting

**Images not uploading?**

- Check Cloudinary credentials in `.env`
- Verify image is < 500 KB
- Check browser console for errors

**Images showing broken?**

- Ensure Cloudinary credentials are correct
- Check that images were stored in Cloudinary dashboard

**Running out of credits?**

- Reduce image size limit (currently 500 KB)
- Or upgrade Cloudinary plan ($89/month for 225 credits)
