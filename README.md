# 🏪 Pyramid E-Commerce Platform

A modern, full-stack e-commerce platform built with HTML, CSS, JavaScript, Node.js, and MongoDB.

## ✨ Features

- 🛍️ **Product Catalog**: Browse men's and women's fashion collections
- 🛒 **Shopping Cart**: Add/remove items with dynamic pricing
- 💝 **Wishlist**: Save favorite products for later
- 👤 **User Authentication**: Secure login and registration
- 👑 **Admin Panel**: Product and order management
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Clean, professional interface

## 🚀 Live Demo

- **Customer Site**: [View Demo](http://localhost:3000)
- **Admin Panel**: [Admin Dashboard](http://localhost:8000)

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Font Awesome Icons
- Responsive Design

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- RESTful APIs

### Admin Panel
- PHP
- Modern Dashboard UI
- Product Management
- Order Tracking

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- PHP (for admin panel)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/KETANrakhade/e_commerce.git
   cd e_commerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start the servers**
   ```bash
   # Start all servers
   ./start-all-servers.sh
   
   # Or start individually:
   # Backend API (Port 5001)
   cd backend && npm start
   
   # Admin Panel (Port 8000)
   cd pyramid-admin && php -S localhost:8000
   
   # Frontend (Port 3000)
   python3 -m http.server 3000
   ```

## 🎯 Usage

### Customer Features
- Browse products by category (Men/Women)
- Add items to cart and wishlist
- Secure checkout process
- User account management

### Admin Features
- Product CRUD operations
- Order management
- User management
- Sales analytics

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Cart & Wishlist
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart items
- `POST /api/wishlist/add` - Add to wishlist
- `GET /api/wishlist` - Get wishlist items

## 🎨 Screenshots

### Homepage
![Homepage](img/screenshots/homepage.png)

### Product Catalog
![Products](img/screenshots/products.png)

### Shopping Cart
![Cart](img/screenshots/cart.png)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ketan Rakhade**
- GitHub: [@KETANrakhade](https://github.com/KETANrakhade)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Bootstrap for the responsive framework
- Font Awesome for icons
- MongoDB for the database
- All contributors who helped improve this project

## 🔮 Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced search and filters
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Social media integration

---

⭐ **Star this repository if you found it helpful!**