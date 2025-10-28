#!/bin/bash

echo "🚀 Preparing PYRAMID E-Commerce for Vercel Deployment"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - PYRAMID E-Commerce"
fi

echo "📝 Deployment files created:"
echo "✅ vercel.json (frontend config)"
echo "✅ backend/vercel.json (backend config)"
echo "✅ api-config.js (API configuration)"
echo "✅ VERCEL_DEPLOYMENT.md (deployment guide)"

echo ""
echo "🔧 Next Steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy to Vercel' && git push"
echo "2. Go to vercel.com and import your repository"
echo "3. Deploy backend first (set root directory to 'backend')"
echo "4. Deploy frontend (set root directory to '/')"
echo "5. Update api-config.js with your backend URL"
echo ""
echo "📖 Read VERCEL_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Your project is ready for Vercel deployment!"