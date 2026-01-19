// Quick test to verify PDF export endpoint
const fetch = require('node-fetch');

async function testPDFExport() {
    try {
        console.log('Testing PDF export endpoint...');
        
        // First, login to get token
        const loginResponse = await fetch('http://localhost:5001/api/admin/login', {
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
            console.error('Login failed:', loginData.error);
            return;
        }
        
        const token = loginData.token;
        console.log('✓ Login successful');
        
        // Test PDF export
        const exportResponse = await fetch('http://localhost:5001/api/admin/orders/export?format=pdf', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        
        if (exportResponse.ok) {
            const contentType = exportResponse.headers.get('content-type');
            console.log('✓ Export successful');
            console.log('Content-Type:', contentType);
            console.log('Status:', exportResponse.status);
            
            if (contentType && contentType.includes('application/pdf')) {
                console.log('✓ PDF format confirmed');
            } else {
                console.log('✗ Wrong content type:', contentType);
            }
        } else {
            console.error('✗ Export failed:', exportResponse.status, exportResponse.statusText);
            const text = await exportResponse.text();
            console.error('Response:', text.substring(0, 200));
        }
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

testPDFExport();
