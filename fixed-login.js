// Fixed Login Handler - Simple and Working
console.log('🔵 Fixed login handler loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔵 DOM ready, setting up fixed login');
    
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Login form found');
        
        let isSubmitting = false;
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isSubmitting) {
                console.log('⚠️ Form already submitting, ignoring...');
                return;
            }
            
            isSubmitting = true;
            console.log('🔵 Login form submitted');
            
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            
            if (!emailInput || !passwordInput) {
                console.error('❌ Input fields not found');
                alert('Form error. Please refresh the page.');
                return;
            }
            
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            
            console.log('📧 Email:', email);
            console.log('🔐 Password length:', password.length);
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Logging in...';
                
                try {
                    console.log('🌐 Sending login request...');
                    
                    const response = await fetch('http://localhost:5001/api/users/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json();
                    console.log('📦 Response:', data);
                    
                    if (data.success && data.data && data.data.token) {
                        console.log('✅ Login successful!');
                        
                        try {
                            // Save to localStorage
                            localStorage.setItem('token', data.data.token);
                            localStorage.setItem('user', JSON.stringify(data.data));
                            
                            console.log('💾 Token saved successfully');
                            console.log('🔍 Saved token exists:', !!localStorage.getItem('token'));
                            console.log('🔍 Saved user exists:', !!localStorage.getItem('user'));
                            
                            // Force immediate redirect
                            console.log('🔄 Starting redirect...');
                            
                            if (data.data.role === 'admin') {
                                console.log('🔑 Admin user detected');
                                console.log('🔄 Redirecting to admin panel...');
                                window.location.replace('http://localhost:8000');
                            } else {
                                console.log('👤 Regular user detected');
                                console.log('🔄 Redirecting to homepage...');
                                window.location.replace('index.html');
                            }
                        } catch (redirectError) {
                            console.error('❌ Redirect error:', redirectError);
                            alert('Login successful but redirect failed. Please go to homepage manually.');
                        }
                    } else {
                        console.error('❌ Login failed:', data);
                        alert('Login failed: ' + (data.error || 'Invalid credentials'));
                    }
                } catch (error) {
                    console.error('❌ Network error:', error);
                    alert('Login failed: ' + error.message);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    isSubmitting = false;
                }
            }
        });
    } else {
        console.error('❌ Login form not found');
    }
    
    // Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('✅ Signup form found');
        
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔵 Signup form submitted');
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            console.log('📝 Registration data:', { name, email, passwordLength: password.length });
            
            // Validate
            if (!name || !email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating account...';
                
                try {
                    console.log('🌐 Sending registration request...');
                    
                    const response = await fetch('http://localhost:5001/api/users/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, password })
                    });
                    
                    const data = await response.json();
                    console.log('📦 Response:', data);
                    
                    if (data.success && data.data && data.data.token) {
                        console.log('✅ Registration successful!');
                        
                        // Save to localStorage
                        localStorage.setItem('token', data.data.token);
                        localStorage.setItem('user', JSON.stringify(data.data));
                        
                        console.log('💾 Token saved, redirecting to homepage...');
                        
                        // Redirect immediately
                        window.location.replace('index.html');
                    } else {
                        console.error('❌ Registration failed:', data);
                        alert('Registration failed: ' + (data.error || 'Please try again'));
                    }
                } catch (error) {
                    console.error('❌ Network error:', error);
                    alert('Registration failed: ' + error.message);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    } else {
        console.error('❌ Signup form not found');
    }
});

console.log('✅ Fixed login handler setup complete');