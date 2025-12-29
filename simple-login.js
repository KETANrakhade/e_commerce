// Simple Login Handler - Guaranteed to Work
// Add this script LAST in login.html

console.log('🔵 Simple login handler loaded');

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', function() {
    console.log('🔵 DOM ready, setting up login');
    
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('❌ Login form not found!');
        return;
    }
    
    console.log('✅ Login form found');
    
    // Remove any existing listeners and add new one
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔵 Login form submitted!');
        
        // Get form values using specific IDs
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            console.error('❌ Email or password input not found');
            console.error('Email input:', emailInput);
            console.error('Password input:', passwordInput);
            if (typeof showToast === 'function') {
                showToast('Form error. Please refresh the page.', 'error');
            } else {
                console.error('Form error. Please refresh the page.');
            }
            return;
        }
        
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        
        console.log('📧 Email:', email);
        console.log('🔐 Password:', password ? '***' : 'empty');
        
        if (!email || !password) {
            if (typeof showToast === 'function') {
                showToast('Please enter both email and password', 'warning');
            } else {
                console.warn('Please enter both email and password');
            }
            return;
        }
        
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        }
        
        try {
            console.log('🌐 Calling backend API...');
            console.log('📤 Request data:', { email, password: password ? `${password.length} chars` : 'empty' });
            
            const requestBody = JSON.stringify({ email, password });
            console.log('📤 Request body:', requestBody);
            
            const response = await fetch('http://localhost:5001/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestBody
            });
            
            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (data.success && data.data && data.data.token) {
                console.log('✅ Login successful!');
                
                // Save to localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                
                console.log('💾 Token saved:', data.data.token.substring(0, 20) + '...');
                console.log('👤 User saved:', data.data.name, '| Role:', data.data.role);
                
                // Show success message
                if (typeof showToast === 'function') {
                    showToast('Login successful! Welcome ' + data.data.name, 'success', 2000);
                }
                
                // Redirect based on role
                if (data.data.role === 'admin') {
                    console.log('🔑 Admin detected, redirecting to admin panel');
                    localStorage.setItem('adminToken', data.data.token);
                    localStorage.setItem('adminUser', JSON.stringify(data.data));
                    window.location.href = 'http://localhost:8000';
                } else {
                    console.log('👤 Regular user, redirecting to homepage');
                    window.location.href = 'index.html';
                }
            } else {
                console.error('❌ Login failed:', data);
                const errorMsg = data.error || data.msg || 'Invalid credentials';
                if (typeof showToast === 'function') {
                    showToast('Login failed: ' + errorMsg, 'error');
                } else {
                    console.error('Login failed:', errorMsg);
                }
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            const errorMsg = 'Login failed: ' + error.message + '. Make sure backend is running on http://localhost:5001';
            if (typeof showToast === 'function') {
                showToast(errorMsg, 'error');
            } else {
                console.error(errorMsg);
            }
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
        
        return false;
    };
    
    console.log('✅ Login handler attached');
});
