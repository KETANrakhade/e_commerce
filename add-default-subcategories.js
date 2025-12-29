const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Subcategory Schema
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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
subcategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

async function addDefaultSubcategories() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Find existing categories
    const categories = await Category.find({ isActive: true });
    console.log(`📊 Found ${categories.length} active categories`);
    
    if (categories.length === 0) {
      console.log('❌ No categories found! Please run add-default-categories.js first');
      return;
    }
    
    // Find Men and Women categories
    const menCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('men') || 
      cat.name.toLowerCase().includes('male')
    );
    
    const womenCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('women') || 
      cat.name.toLowerCase().includes('female')
    );
    
    console.log('📋 Categories found:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
    
    // Default subcategories for Men
    const menSubcategories = [
      { name: 'T-Shirts', description: 'Casual and formal t-shirts for men', sortOrder: 1 },
      { name: 'Shirts', description: 'Formal and casual shirts for men', sortOrder: 2 },
      { name: 'Jeans', description: 'Denim jeans and pants for men', sortOrder: 3 },
      { name: 'Jackets', description: 'Jackets and outerwear for men', sortOrder: 4 },
      { name: 'Accessories', description: 'Men\'s accessories like belts, watches, etc.', sortOrder: 5 }
    ];
    
    // Default subcategories for Women
    const womenSubcategories = [
      { name: 'Dresses', description: 'Casual and formal dresses for women', sortOrder: 1 },
      { name: 'Tops', description: 'Blouses, shirts and tops for women', sortOrder: 2 },
      { name: 'Jeans', description: 'Denim jeans and pants for women', sortOrder: 3 },
      { name: 'Jackets', description: 'Jackets and outerwear for women', sortOrder: 4 },
      { name: 'Accessories', description: 'Women\'s accessories like bags, jewelry, etc.', sortOrder: 5 }
    ];
    
    console.log('\n🔄 Creating subcategories...');
    
    // Create Men's subcategories
    if (menCategory) {
      console.log(`\n👔 Creating subcategories for "${menCategory.name}":`);
      
      for (const subData of menSubcategories) {
        try {
          // Check if subcategory already exists
          const existing = await Subcategory.findOne({ 
            name: subData.name, 
            category: menCategory._id 
          });
          
          if (existing) {
            console.log(`  ⚠️  "${subData.name}" already exists`);
            
            // Update if inactive
            if (!existing.isActive) {
              existing.isActive = true;
              await existing.save();
              console.log(`  ✅ Activated "${subData.name}"`);
            }
          } else {
            // Create new subcategory
            const subcategory = new Subcategory({
              ...subData,
              category: menCategory._id
            });
            await subcategory.save();
            console.log(`  ✅ Created "${subData.name}" (ID: ${subcategory._id})`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating "${subData.name}":`, error.message);
        }
      }
    } else {
      console.log('⚠️  Men\'s category not found - skipping men\'s subcategories');
    }
    
    // Create Women's subcategories
    if (womenCategory) {
      console.log(`\n👗 Creating subcategories for "${womenCategory.name}":`);
      
      for (const subData of womenSubcategories) {
        try {
          // Check if subcategory already exists
          const existing = await Subcategory.findOne({ 
            name: subData.name, 
            category: womenCategory._id 
          });
          
          if (existing) {
            console.log(`  ⚠️  "${subData.name}" already exists`);
            
            // Update if inactive
            if (!existing.isActive) {
              existing.isActive = true;
              await existing.save();
              console.log(`  ✅ Activated "${subData.name}"`);
            }
          } else {
            // Create new subcategory
            const subcategory = new Subcategory({
              ...subData,
              category: womenCategory._id
            });
            await subcategory.save();
            console.log(`  ✅ Created "${subData.name}" (ID: ${subcategory._id})`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating "${subData.name}":`, error.message);
        }
      }
    } else {
      console.log('⚠️  Women\'s category not found - skipping women\'s subcategories');
    }
    
    // Show final subcategories
    console.log('\n📋 Final subcategories in database:');
    const finalSubcategories = await Subcategory.find({ isActive: true })
      .populate('category', 'name')
      .sort({ category: 1, sortOrder: 1, name: 1 });
    
    finalSubcategories.forEach(sub => {
      console.log(`  - ${sub.category.name} > ${sub.name} (ID: ${sub._id}, Slug: ${sub.slug})`);
    });
    
    console.log('\n✅ Default subcategories setup complete!');
    console.log('\n🎉 You can now select subcategories in the admin panel!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addDefaultSubcategories();