# PYRAMID - Premium Fashion E-Commerce Platform

A modern, full-stack e-commerce platform built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## 🚀 Features

- **Modern UI/UX**: Responsive design with smooth animations and modern styling
- **Product Management**: Browse products by categories (Men, Women, Footwear, etc.)
- **Shopping Cart**: Add/remove items, quantity management, persistent storage
- **Wishlist**: Save favorite items for later
- **User Authentication**: Login/signup functionality
- **Admin Panel**: Product management, user management, order tracking
- **Payment Integration**: Stripe payment processing
- **Real-time Updates**: Dynamic product loading and cart updates
- **Mobile Responsive**: Optimized for all device sizes

## 🛠 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 for responsive design
- Font Awesome icons
- Custom animations and transitions

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Stripe for payments
- CORS enabled

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Python 3 (for serving frontend)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd e-commerce
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies (if needed)
```bash
cd ..
npm install express  # For alternative serving method
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/pyramid-ecommerce
JWT_SECRET=pyramid_super_secret_jwt_key_2024_make_it_very_long_and_secure
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 4. Database Setup

Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Seed the Database
```bash
cd backend
npm run seed
```

This will create sample products and admin users:
- Admin: admin@pyramid.com / admin123
- User: user@test.com / user123

### 6. Start the Servers

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5001

#### Start Frontend Server
```bash
# From project root
python3 serve.py
```
Frontend will run on http://localhost:8080

## 🌐 Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5001
- **Admin Panel**: Navigate to admin panel from the frontend

## 📁 Project Structure

```
e-commerce/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── .env             # Environment variables
│   ├── server.js        # Main server file
│   └── seedData.js      # Database seeding
├── css/                 # Stylesheets
├── img/                 # Images and assets
├── admin-panel/         # Admin interface
├── index.html           # Main homepage
├── cart.html            # Shopping cart page
├── login.html           # Authentication page
├── product.html         # Product details
├── script.js            # Main JavaScript file
├── serve.py             # Frontend server
└── README.md            # This file
```

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Admin
- `GET /api/admin/products` - Get all products (Admin)
- `POST /api/admin/products/bulk-action` - Bulk actions

## 🎨 Customization

### Colors and Branding
Edit the CSS variables in `index.html` or `css/style.css`:
```css
:root {
    --primary-color: #65AAC3;
    --secondary-color: #5F9FB6;
    --accent-color: #2c3e50;
    /* ... more variables */
}
```

### Adding New Products
1. Use the admin panel to add products
2. Or use the API endpoints
3. Or modify `backend/seedData.js` for bulk additions

## 🚀 Deployment

### Frontend Deployment
- Deploy to Netlify, Vercel, or any static hosting
- Update API URLs in `script.js`

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting
- Update environment variables
- Use MongoDB Atlas for database

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: If port 5001 is in use, change it in `backend/.env`
2. **MongoDB Connection**: Ensure MongoDB is running and accessible
3. **CORS Issues**: Backend has CORS enabled for all origins in development
4. **Missing Dependencies**: Run `npm install` in both root and backend directories

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Bootstrap for responsive design
- Font Awesome for icons
- MongoDB for database
- Express.js for backend framework
- All contributors and testers

---

**Happy Shopping! 🛍️**

For support or questions, please open an issue in the repository.