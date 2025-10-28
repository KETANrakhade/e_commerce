# Backend Setup Instructions

## Prerequisites
1. Node.js installed
2. MongoDB installed or MongoDB Atlas account

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Update the `.env` file with your actual values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pyramid-ecommerce
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pyramid-ecommerce

JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:5500
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Start the Backend Server
```bash
# Development mode with auto-restart
npm run dev

# OR Production mode
npm start
```

### 4. Test the API
The server will run on http://localhost:5000

Test endpoints:
- GET http://localhost:5000/api/products (Get all products)
- POST http://localhost:5000/api/users/register (Register user)
- POST http://localhost:5000/api/users/login (Login user)

## Database Seeding (Optional)
You can add sample products directly to MongoDB or create an admin panel.

## Frontend Connection
The frontend is configured to connect to http://localhost:5000
Make sure both frontend and backend are running simultaneously.