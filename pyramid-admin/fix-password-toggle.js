// Fix for password toggle button
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Password toggle fix loaded');
    
    // Wait a bit for the page to fully load
    setTimeout(function() {
        const passwordInput = document.querySelector('input[name="password"]');
        const passwordToggle = document.getElementById('password-addon');
        
        if (!passwordInput || !passwordToggle) {
            console.log('❌ Password elements not found');
            return;
        }
        
        console.log('✅ Password elements found, setting up toggle');
        
        // Remove any existing event listeners
        passwordToggle.replaceWith(passwordToggle.cloneNode(true));
        const newPasswordToggle = document.getElementById('password-addon');
        
        // Add the click event listener
        newPasswordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👁️ Password toggle clicked');
            
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                if (icon) {
                    icon.classList.remove('mdi-eye-outline');
                    icon.classList.add('mdi-eye-off-outline');
                }
                this.setAttribute('title', 'Hide password');
                console.log('👁️ Password shown');
            } else {
                passwordInput.type = 'password';
                if (icon) {
                    icon.classList.remove('mdi-eye-off-outline');
                    icon.classList.add('mdi-eye-outline');
                }
                this.setAttribute('title', 'Show password');
                console.log('🙈 Password hidden');
            }
        });
        
        // Set initial tooltip
        newPasswordToggle.setAttribute('title', 'Show password');
        
        // Add some styling to make it more obvious it's clickable
        newPasswordToggle.style.cursor = 'pointer';
        
        console.log('✅ Password toggle fixed and ready');
        
    }, 500);
});