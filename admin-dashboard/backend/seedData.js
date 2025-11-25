const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/db');

const sampleProducts = [
  {
    name: "Premium Cotton T-Shirt",
    description: "Comfortable and stylish cotton t-shirt perfect for casual wear",
    price: 1299,
    images: ["img/men/1ae781d7afbcb047a990cbe64771b96c07cb9823.avif"],
    category: "Men",
    stock: 50
  },
  {
    name: "Elegant Summer Dress",
    description: "Beautiful summer dress with floral patterns",
    price: 2499,
    images: ["img/women/untitled folder/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif"],
    category: "Women",
    stock: 30
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket for all seasons",
    price: 3999,
    images: ["img/men/b88fd74ccbc9dd08a231f81f621dc83cae42a3c1.avif"],
    category: "Men",
    stock: 25
  },
  {
    name: "Casual Sneakers",
    description: "Comfortable sneakers for everyday wear",
    price: 4999,
    images: ["img/men/72821c8b4fd1d7a595c2877073ccf04df5ea97e9.avif"],
    category: "Footwear",
    stock: 40
  },
  {
    name: "Designer Handbag",
    description: "Stylish handbag perfect for any occasion",
    price: 5999,
    images: ["img/untitled folder/05641225bff4a06f1e606be7dedaddd7b0f4c8c0.avif"],
    category: "Women",
    stock: 20
  },
  {
    name: "Formal Shirt",
    description: "Professional formal shirt for office wear",
    price: 1899,
    images: ["img/men/4442fbac4e3080ec20b2f14e353fea267249b0dd.avif"],
    category: "Men",
    stock: 35
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@pyramid.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "Test User",
    email: "user@test.com",
    password: "user123",
    role: "user"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Seed products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} products seeded`);
    
    // Seed users with hashed passwords
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      await User.create({
        ...userData,
        password: hashedPassword
      });
    }
    
    console.log(`${sampleUsers.length} users seeded`);
    console.log('Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();