// Fix for tab switching issue
console.log('🔧 Tab switching fix loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, setting up tab switching fix');
    
    // Add a small delay to ensure everything is loaded
    setTimeout(function() {
        setupTabSwitching();
    }, 100);
});

function setupTabSwitching() {
    console.log('🔄 Setting up tab switching...');
    
    // Get elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    
    if (!tabButtons.length || !loginSection || !signupSection) {
        console.log('❌ Tab elements not found');
        return;
    }
    
    console.log('✅ Tab elements found:', {
        buttons: tabButtons.length,
        loginSection: !!loginSection,
        signupSection: !!signupSection
    });
    
    // Enhanced showLogin function
    window.showLogin = function() {
        console.log('👤 Switching to Sign In');
        
        // Update tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabButtons[0].classList.add('active');
        
        // Switch forms with proper display handling
        signupSection.classList.remove('active');
        signupSection.style.display = 'none';
        
        loginSection.classList.add('active');
        loginSection.style.display = 'block';
        
        // Clear status
        const status = document.getElementById('status');
        if (status) status.innerHTML = '';
        
        console.log('✅ Switched to Sign In');
    };
    
    // Enhanced showSignup function
    window.showSignup = function() {
        console.log('📝 Switching to Sign Up');
        
        // Update tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabButtons[1].classList.add('active');
        
        // Switch forms with proper display handling
        loginSection.classList.remove('active');
        loginSection.style.display = 'none';
        
        signupSection.classList.add('active');
        signupSection.style.display = 'block';
        
        // Clear status
        const status = document.getElementById('status');
        if (status) status.innerHTML = '';
        
        console.log('✅ Switched to Sign Up');
    };
    
    // Add click event listeners as backup
    tabButtons[0].addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖱️ Sign In tab clicked');
        window.showLogin();
    });
    
    tabButtons[1].addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖱️ Sign Up tab clicked');
        window.showSignup();
    });
    
    // Ensure initial state is correct
    window.showLogin();
    
    console.log('✅ Tab switching setup complete');
}

// Force refresh function if needed
window.forceTabRefresh = function() {
    console.log('🔄 Force refreshing tabs...');
    setupTabSwitching();
};