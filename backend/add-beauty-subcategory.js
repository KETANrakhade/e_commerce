const mongoose = require('mongoose');
require('dotenv').config();

const Subcategory = require('./models/subcategoryModel');
const Category = require('./models/categoryModel');

async function addBeautySubcategory() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find the Women category
        const womenCategory = await Category.findOne({ name: 'Women' });
        
        if (!womenCategory) {
            console.error('❌ Women category not found!');
            console.log('Available categories:');
            const categories = await Category.find();
            categories.forEach(cat => console.log(`  - ${cat.name} (${cat._id})`));
            process.exit(1);
        }

        console.log(`✅ Found Women category: ${womenCategory._id}`);

        // Check if Beauty subcategory already exists
        const existingBeauty = await Subcategory.findOne({ 
            name: 'Beauty',
            category: womenCategory._id 
        });

        if (existingBeauty) {
            console.log('⚠️  Beauty subcategory already exists!');
            console.log(`   ID: ${existingBeauty._id}`);
            console.log(`   Name: ${existingBeauty.name}`);
            console.log(`   Slug: ${existingBeauty.slug}`);
            process.exit(0);
        }

        // Create Beauty subcategory
        const beautySubcategory = new Subcategory({
            name: 'Beauty',
            slug: 'beauty',
            category: womenCategory._id,
            description: 'Beauty products including makeup, skincare, and cosmetics',
            isActive: true
        });

        await beautySubcategory.save();

        console.log('✅ Beauty subcategory created successfully!');
        console.log(`   ID: ${beautySubcategory._id}`);
        console.log(`   Name: ${beautySubcategory.name}`);
        console.log(`   Slug: ${beautySubcategory.slug}`);
        console.log(`   Category: Women (${womenCategory._id})`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addBeautySubcategory();
