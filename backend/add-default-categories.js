const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

async function addDefaultCategories() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Check existing categories
    const existingCategories = await Category.find();
    console.log(`📊 Found ${existingCategories.length} existing categories`);
    
    if (existingCategories.length > 0) {
      console.log('📋 Existing categories:');
      existingCategories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat._id}, Active: ${cat.isActive})`);
      });
    }
    
    // Default categories to create
    const defaultCategories = [
      {
        name: 'Male',
        description: 'Men\'s fashion and clothing',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Female', 
        description: 'Women\'s fashion and clothing',
        isActive: true,
        sortOrder: 2
      }
    ];
    
    console.log('\n🔄 Creating default categories...');
    
    for (const catData of defaultCategories) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({ name: catData.name });
        
        if (existing) {
          console.log(`⚠️  Category "${catData.name}" already exists (ID: ${existing._id})`);
          
          // Update if inactive
          if (!existing.isActive) {
            existing.isActive = true;
            await existing.save();
            console.log(`✅ Activated existing category "${catData.name}"`);
          }
        } else {
          // Create new category
          const category = new Category(catData);
          await category.save();
          console.log(`✅ Created category "${catData.name}" (ID: ${category._id})`);
        }
      } catch (error) {
        console.error(`❌ Error creating category "${catData.name}":`, error.message);
      }
    }
    
    // Show final categories
    console.log('\n📋 Final categories in database:');
    const finalCategories = await Category.find().sort({ sortOrder: 1, name: 1 });
    finalCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id}, Slug: ${cat.slug}, Active: ${cat.isActive})`);
    });
    
    console.log('\n✅ Default categories setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addDefaultCategories();