// Script to add default brands to database
const API_BASE = 'http://localhost:5001/api';

// Default brands to add
const defaultBrands = [
    {
        name: 'Nike',
        slug: 'nike',
        description: 'Athletic footwear and apparel',
        isActive: true
    },
    {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Sports and lifestyle brand',
        isActive: true
    },
    {
        name: 'Zara',
        slug: 'zara',
        description: 'Fashion retail brand',
        isActive: true
    },
    {
        name: 'H&M',
        slug: 'h-m',
        description: 'Fast fashion retailer',
        isActive: true
    },
    {
        name: 'Levi\'s',
        slug: 'levis',
        description: 'Denim and casual wear',
        isActive: true
    },
    {
        name: 'Puma',
        slug: 'puma',
        description: 'Athletic and casual footwear',
        isActive: true
    },
    {
        name: 'Gucci',
        slug: 'gucci',
        description: 'Luxury fashion brand',
        isActive: true
    },
    {
        name: 'Calvin Klein',
        slug: 'calvin-klein',
        description: 'Premium fashion brand',
        isActive: true
    }
];

async function addBrands() {
    console.log('🔐 First, login as admin...');
    
    // Login as admin
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'admin@pyramid.com',
            password: 'admin123'
        })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
        console.error('❌ Login failed:', loginData);
        return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Logged in as admin');
    
    // Add each brand
    console.log(`\n📦 Adding ${defaultBrands.length} brands...\n`);
    
    for (const brand of defaultBrands) {
        try {
            const response = await fetch(`${API_BASE}/admin/brands`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(brand)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Added: ${brand.name}`);
            } else {
                console.log(`⚠️  ${brand.name}: ${result.error || 'Already exists'}`);
            }
        } catch (error) {
            console.error(`❌ Failed to add ${brand.name}:`, error.message);
        }
    }
    
    console.log('\n🎉 Done! Brands added successfully!');
    console.log('💡 Refresh your admin panel to see the brands in the dropdown.');
}

// Run the script
addBrands().catch(error => {
    console.error('❌ Script failed:', error);
});
