// Script to add a test product with discount via admin API
const API_BASE_URL = 'http://localhost:5001/api';

async function addDiscountTestProduct() {
    console.log('🧪 Adding test product with discount...');
    
    try {
        // First, get categories to use a valid category ID
        console.log('📋 Fetching categories...');
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categoriesData = await categoriesResponse.json();
        
        let categoryId = null;
        if (categoriesData.success && categoriesData.data && categoriesData.data.categories && categoriesData.data.categories.length > 0) {
            // Find men's category or use first available
            const categories = categoriesData.data.categories;
            const menCategory = categories.find(cat => 
                cat.name.toLowerCase().includes('men') || 
                cat.slug.toLowerCase().includes('men')
            );
            categoryId = menCategory ? menCategory._id : categories[0]._id;
            console.log('✅ Using category:', menCategory ? menCategory.name : categories[0].name);
        } else {
            throw new Error('No categories found. Please create categories first.');
        }
        
        // Create test product with discount
        const productData = {
            name: "Discount Test Shirt - Men's Premium Cotton",
            description: "A premium cotton shirt with 40% discount for testing the discount system functionality.",
            price: 2500,
            category: categoryId,
            stock: 15,
            imageUrls: [
                "https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=Discount+Test+Shirt",
                "https://via.placeholder.com/400x500/5F9FB6/FFFFFF?text=Back+View"
            ],
            tags: ["men", "shirt", "cotton", "premium", "discount-test"],
            featured: true,
            discount: {
                isOnSale: true,
                percentage: 40,
                saleLabel: "MEGA SALE",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            }
        };
        
        console.log('📦 Creating product with discount data:', {
            name: productData.name,
            price: productData.price,
            discount: productData.discount
        });
        
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const product = result.data;
            console.log('✅ Product created successfully!');
            console.log('📋 Product Details:');
            console.log('   ID:', product._id);
            console.log('   Name:', product.name);
            console.log('   Original Price: ₹' + product.price.toLocaleString());
            console.log('   Discount:', product.discount.percentage + '%');
            console.log('   Sale Price: ₹' + (product.discount.salePrice || 0).toLocaleString());
            console.log('   Savings: ₹' + (product.price - (product.discount.salePrice || 0)).toLocaleString());
            console.log('   Sale Label:', product.discount.saleLabel);
            
            console.log('\n🎯 Testing URLs:');
            console.log('   Individual Product: product.html?id=' + product._id);
            console.log('   Men\'s Products: men-product.html');
            console.log('   Discount Page: discount.html');
            
            console.log('\n✅ Test product added successfully! Check the pages above to see the discount display.');
            
            return product;
        } else {
            throw new Error(result.error || 'Failed to create product');
        }
        
    } catch (error) {
        console.error('❌ Error adding test product:', error);
        throw error;
    }
}

// Run if in Node.js environment
if (typeof window === 'undefined') {
    addDiscountTestProduct()
        .then(() => {
            console.log('🎉 Script completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
} else {
    // Make available in browser
    window.addDiscountTestProduct = addDiscountTestProduct;
    console.log('🌐 Function available as window.addDiscountTestProduct()');
}