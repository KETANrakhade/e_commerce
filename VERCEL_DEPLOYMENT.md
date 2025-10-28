# Vercel Deployment Guide for PYRAMID E-Commerce

## Prerequisites
1. GitHub account
2. Vercel account (free)
3. MongoDB Atlas account (free)

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `backend`
5. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary secret
6. Deploy

### 3. Deploy Frontend to Vercel

1. Create a new project in Vercel
2. Import the same GitHub repository
3. **Important**: Set the root directory to `/` (root)
4. Before deploying, update `api-config.js`:
   - Replace `https://your-backend-app.vercel.app/api` with your actual backend URL
5. Deploy

### 4. Update API Configuration

After backend deployment:
1. Copy your backend Vercel URL (e.g., `https://pyramid-backend-xyz.vercel.app`)
2. Update `api-config.js`:
   ```javascript
   production: {
     baseURL: 'https://your-actual-backend-url.vercel.app/api'
   }
   ```
3. Commit and push changes

### 5. Configure MongoDB Atlas

1. Go to MongoDB Atlas
2. Create a new cluster (free tier)
3. Create a database user
4. Whitelist Vercel IPs (or use 0.0.0.0/0 for all IPs)
5. Get connection string and add to Vercel environment variables

## Alternative: Single Vercel Deployment

If you prefer to deploy everything together:

1. Move all backend files to an `api` folder
2. Update `vercel.json` in root:
```json
{
  "version": 2,
  "builds": [
    { "src": "api/server.js", "use": "@vercel/node" },
    { "src": "*.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

## Environment Variables Needed

### Backend Environment Variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `STRIPE_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Post-Deployment Checklist

- [ ] Backend API responding at `/api/products`
- [ ] Frontend loading correctly
- [ ] Database connection working
- [ ] Authentication working
- [ ] CORS configured properly
- [ ] All environment variables set

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS configuration in backend
2. **Database connection**: Check MongoDB Atlas whitelist
3. **API not found**: Verify Vercel routing configuration
4. **Environment variables**: Double-check all variables are set

### Useful Commands:
```bash
# Test API locally
curl https://your-backend.vercel.app/api/products

# Check logs
vercel logs your-deployment-url
```

## Success! 🎉

Your PYRAMID e-commerce platform should now be live on Vercel!

- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.vercel.app/api`