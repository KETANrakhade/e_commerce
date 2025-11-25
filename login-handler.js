// Login Handler Script
// Add this to login.html

document.addEventListener('DOMContentLoaded', function() {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Login Function
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Signing in...';
    
    try {
        const response = await API.login(email, password);
        
        // Save user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Success message
        if (typeof showToast === 'function') {
            showToast('Login successful! Welcome ' + response.data.name, 'success', 2000);
        }
        
        // Redirect based on role
        if (response.data.role === 'admin') {
            window.location.href = 'http://localhost:8000';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Login failed: ' + error.message, 'error');
        } else {
            console.error('Login failed:', error.message);
        }
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Sign In';
    }
}

// Signup Function
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Creating account...';
    
    try {
        const response = await API.register(name, email, password);
        
        // Save user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Success message
        if (typeof showToast === 'function') {
            showToast('Account created successfully! Welcome ' + response.data.name, 'success', 2000);
        }
        
        // Redirect to home
        window.location.href = 'index.html';
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Signup failed: ' + error.message, 'error');
        } else {
            console.error('Signup failed:', error.message);
        }
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Create Account';
    }
}

// Toggle between login and signup
function showSignup() {
    document.getElementById('login').classList.remove('show', 'active');
    document.getElementById('signup').classList.add('show', 'active');
}

function showLogin() {
    document.getElementById('signup').classList.remove('show', 'active');
    document.getElementById('login').classList.add('show', 'active');
}

// Password toggle
function togglePassword(element) {
    const input = element.previousElementSibling.previousElementSibling;
    const icon = element.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

console.log('✅ Login handler loaded');
