const http = require('http');

// Test the admin products API directly
const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/admin/products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // You'll need to replace this with a valid admin token
    'Authorization': 'Bearer your-admin-token-here'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n=== API Response ===');
      console.log('Success:', jsonData.success);
      
      if (jsonData.success && jsonData.data) {
        console.log('Products count:', jsonData.data.products?.length || 0);
        console.log('Categories count:', jsonData.data.categories?.length || 0);
        
        if (jsonData.data.categories) {
          console.log('\nCategories:');
          jsonData.data.categories.forEach(cat => {
            console.log(`- ID: ${cat._id} | Name: ${cat.name}`);
          });
        }
        
        if (jsonData.data.products && jsonData.data.products.length > 0) {
          console.log('\nFirst product:');
          const firstProduct = jsonData.data.products[0];
          console.log(`- Name: ${firstProduct.name}`);
          console.log(`- Category: ${JSON.stringify(firstProduct.category)}`);
        }
      } else {
        console.log('Error:', jsonData.error || 'Unknown error');
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.end();