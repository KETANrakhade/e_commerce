const mongoose = require('mongoose');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Brand = require('./models/brandModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/db');

const sampleProducts = [
  {
    name: "Premium Cotton T-Shirt",
    description: "Comfortable and stylish cotton t-shirt perfect for casual wear",
    price: 1299,
    images: [{
      url: "img/men/1ae781d7afbcb047a990cbe64771b96c07cb9823.avif",
      publicId: "men/1ae781d7afbcb047a990cbe64771b96c07cb9823",
      alt: "Premium Cotton T-Shirt",
      isPrimary: true
    }],
    imageUrls: ["img/men/1ae781d7afbcb047a990cbe64771b96c07cb9823.avif"],
    category: "Men",
    stock: 50,
    isActive: true,
    featured: true
  },
  {
    name: "Elegant Summer Dress",
    description: "Beautiful summer dress with floral patterns",
    price: 2499,
    images: [{
      url: "img/women/untitled folder/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif",
      publicId: "women/342baa60b5956f7ebaac03cf60849a43f29c9d9d",
      alt: "Elegant Summer Dress",
      isPrimary: true
    }],
    imageUrls: ["img/women/untitled folder/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif"],
    category: "Women",
    stock: 30,
    isActive: true,
    featured: true
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket for all seasons",
    price: 3999,
    images: [{
      url: "img/men/b88fd74ccbc9dd08a231f81f621dc83cae42a3c1.avif",
      publicId: "men/b88fd74ccbc9dd08a231f81f621dc83cae42a3c1",
      alt: "Classic Denim Jacket",
      isPrimary: true
    }],
    imageUrls: ["img/men/b88fd74ccbc9dd08a231f81f621dc83cae42a3c1.avif"],
    category: "Men",
    stock: 25,
    isActive: true,
    featured: false
  },
  {
    name: "Casual Sneakers",
    description: "Comfortable sneakers for everyday wear",
    price: 4999,
    images: [{
      url: "img/men/72821c8b4fd1d7a595c2877073ccf04df5ea97e9.avif",
      publicId: "men/72821c8b4fd1d7a595c2877073ccf04df5ea97e9",
      alt: "Casual Sneakers",
      isPrimary: true
    }],
    imageUrls: ["img/men/72821c8b4fd1d7a595c2877073ccf04df5ea97e9.avif"],
    category: "Footwear",
    stock: 40,
    isActive: true,
    featured: false
  },
  {
    name: "Designer Handbag",
    description: "Stylish handbag perfect for any occasion",
    price: 5999,
    images: [{
      url: "img/untitled folder/05641225bff4a06f1e606be7dedaddd7b0f4c8c0.avif",
      publicId: "05641225bff4a06f1e606be7dedaddd7b0f4c8c0",
      alt: "Designer Handbag",
      isPrimary: true
    }],
    imageUrls: ["img/untitled folder/05641225bff4a06f1e606be7dedaddd7b0f4c8c0.avif"],
    category: "Women",
    stock: 20,
    isActive: true,
    featured: true
  },
  {
    name: "Formal Shirt",
    description: "Professional formal shirt for office wear",
    price: 1899,
    images: [{
      url: "img/men/4442fbac4e3080ec20b2f14e353fea267249b0dd.avif",
      publicId: "men/4442fbac4e3080ec20b2f14e353fea267249b0dd",
      alt: "Formal Shirt",
      isPrimary: true
    }],
    imageUrls: ["img/men/4442fbac4e3080ec20b2f14e353fea267249b0dd.avif"],
    category: "Men",
    stock: 35,
    isActive: true,
    featured: false
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
    await Category.deleteMany({});
    await Brand.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create categories first
    const menCategory = await Category.create({
      name: 'Men',
      slug: 'men',
      description: 'Men\'s clothing and accessories',
      isActive: true
    });
    
    const womenCategory = await Category.create({
      name: 'Women',
      slug: 'women',
      description: 'Women\'s clothing and accessories',
      isActive: true
    });
    
    const footwearCategory = await Category.create({
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes and footwear for all',
      isActive: true
    });
    
    console.log('Categories created');
    
    // Update sample products with category ObjectIds
    const productsWithCategories = sampleProducts.map(product => {
      let categoryId;
      if (product.category === 'Men') categoryId = menCategory._id;
      else if (product.category === 'Women') categoryId = womenCategory._id;
      else if (product.category === 'Footwear') categoryId = footwearCategory._id;
      
      return {
        ...product,
        category: categoryId,
        categoryName: product.category // Keep for backward compatibility
      };
    });
    
    // Seed products
    const createdProducts = await Product.insertMany(productsWithCategories);
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