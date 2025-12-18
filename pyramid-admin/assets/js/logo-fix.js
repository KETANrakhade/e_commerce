// Logo display fix for sidebar toggle
(function() {
    'use strict';
    
    function initLogoFix() {
        const verticalMenuBtn = document.getElementById('vertical-menu-btn');
        const logoLg = document.querySelectorAll('.logo-lg');
        const logoSm = document.querySelectorAll('.logo-sm');
        
        // Function to update logo display based on sidebar state
        function updateLogoDisplay() {
            const isCollapsed = document.body.classList.contains('vertical-collpsed');
            const windowWidth = window.innerWidth;
            
            logoLg.forEach(function(element) {
                if (isCollapsed && windowWidth >= 992) {
                    element.style.display = 'none';
                } else if (windowWidth >= 992) {
                    element.style.display = 'flex';
                } else {
                    // On mobile, always show logo-lg
                    element.style.display = 'flex';
                }
            });
            
            logoSm.forEach(function(element) {
                if (isCollapsed && windowWidth >= 992) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        }
        
        // Handle vertical menu button click
        if (verticalMenuBtn) {
            verticalMenuBtn.addEventListener('click', function(e) {
                // Small delay to ensure the CSS classes are applied first
                setTimeout(updateLogoDisplay, 100);
            });
        }
        
        // Initialize on load
        updateLogoDisplay();
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateLogoDisplay, 150);
        });
        
        // Also listen for class changes on body (in case other scripts modify it)
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        setTimeout(updateLogoDisplay, 50);
                    }
                });
            });
            
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoFix);
    } else {
        initLogoFix();
    }
})();