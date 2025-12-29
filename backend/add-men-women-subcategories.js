const mongoose = require('mongoose');
require('dotenv').config();

// Import the actual models
const Category = require('./models/categoryModel');
const Subcategory = require('./models/subcategoryModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pyramid-ecommerce');

async function addMenWomenSubcategories() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Find all categories
    const categories = await Category.find({ isActive: true });
    console.log(`📊 Found ${categories.length} active categories`);
    
    console.log('📋 All categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id}, Slug: ${cat.slug})`);
    });
    
    // Find Men and Women categories (exact match)
    const menCategory = categories.find(cat => 
      cat.name.toLowerCase() === 'men'
    );
    
    const womenCategory = categories.find(cat => 
      cat.name.toLowerCase() === 'women'
    );
    
    console.log('\n🎯 Target categories:');
    if (menCategory) {
      console.log(`  ✅ Men category found: "${menCategory.name}" (ID: ${menCategory._id})`);
    } else {
      console.log('  ❌ Men category not found');
    }
    
    if (womenCategory) {
      console.log(`  ✅ Women category found: "${womenCategory.name}" (ID: ${womenCategory._id})`);
    } else {
      console.log('  ❌ Women category not found');
    }
    
    // Default subcategories for Men
    const menSubcategories = [
      { 
        name: 'T-Shirts', 
        slug: 't-shirts',
        description: 'Casual and formal t-shirts for men', 
        sortOrder: 1 
      },
      { 
        name: 'Shirts', 
        slug: 'shirts',
        description: 'Formal and casual shirts for men', 
        sortOrder: 2 
      },
      { 
        name: 'Jeans', 
        slug: 'jeans',
        description: 'Denim jeans and pants for men', 
        sortOrder: 3 
      },
      { 
        name: 'Jackets', 
        slug: 'jackets',
        description: 'Jackets and outerwear for men', 
        sortOrder: 4 
      },
      { 
        name: 'Accessories', 
        slug: 'accessories',
        description: 'Men\'s accessories like belts, watches, etc.', 
        sortOrder: 5 
      }
    ];
    
    // Default subcategories for Women
    const womenSubcategories = [
      { 
        name: 'Dresses', 
        slug: 'dresses',
        description: 'Casual and formal dresses for women', 
        sortOrder: 1 
      },
      { 
        name: 'Tops', 
        slug: 'tops',
        description: 'Blouses, shirts and tops for women', 
        sortOrder: 2 
      },
      { 
        name: 'Jeans', 
        slug: 'jeans-women',
        description: 'Denim jeans and pants for women', 
        sortOrder: 3 
      },
      { 
        name: 'Jackets', 
        slug: 'jackets-women',
        description: 'Jackets and outerwear for women', 
        sortOrder: 4 
      },
      { 
        name: 'Accessories', 
        slug: 'accessories-women',
        description: 'Women\'s accessories like bags, jewelry, etc.', 
        sortOrder: 5 
      }
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
            console.log(`  ✅ Created "${subData.name}" (ID: ${subcategory._id}, Slug: ${subcategory.slug})`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating "${subData.name}":`, error.message);
        }
      }
    } else {
      console.log('⚠️  Men category not found - skipping men\'s subcategories');
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
            console.log(`  ✅ Created "${subData.name}" (ID: ${subcategory._id}, Slug: ${subcategory.slug})`);
          }
        } catch (error) {
          console.error(`  ❌ Error creating "${subData.name}":`, error.message);
        }
      }
    } else {
      console.log('⚠️  Women category not found - skipping women\'s subcategories');
    }
    
    // Show final subcategories
    console.log('\n📋 Final subcategories in database:');
    const finalSubcategories = await Subcategory.find({ isActive: true })
      .populate('category', 'name')
      .sort({ category: 1, sortOrder: 1, name: 1 });
    
    // Group by category
    const subcategoriesByCategory = {};
    finalSubcategories.forEach(sub => {
      const categoryName = sub.category.name;
      if (!subcategoriesByCategory[categoryName]) {
        subcategoriesByCategory[categoryName] = [];
      }
      subcategoriesByCategory[categoryName].push(sub);
    });
    
    Object.keys(subcategoriesByCategory).forEach(categoryName => {
      console.log(`\n  📂 ${categoryName}:`);
      subcategoriesByCategory[categoryName].forEach(sub => {
        console.log(`    - ${sub.name} (ID: ${sub._id}, Slug: ${sub.slug})`);
      });
    });
    
    console.log('\n✅ Subcategories setup complete!');
    console.log('\n🎉 Now when you select "Men" or "Women" in the admin panel, you\'ll see subcategories!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addMenWomenSubcategories();