// Enhanced Logo display fix for sidebar toggle
(function() {
    'use strict';
    
    let isInitialized = false;
    
    function initLogoFix() {
        if (isInitialized) return;
        isInitialized = true;
        
        console.log('🔧 Initializing logo fix...');
        
        const verticalMenuBtn = document.getElementById('vertical-menu-btn');
        const logoLg = document.querySelectorAll('.logo-lg');
        const logoSm = document.querySelectorAll('.logo-sm');
        const navbarBrandBox = document.querySelector('.navbar-brand-box');
        
        console.log('📊 Found elements:', {
            verticalMenuBtn: !!verticalMenuBtn,
            logoLg: logoLg.length,
            logoSm: logoSm.length,
            navbarBrandBox: !!navbarBrandBox
        });
        
        // If vertical menu button doesn't exist, we don't need the toggle functionality
        if (!verticalMenuBtn) {
            console.log('ℹ️ Vertical menu button not found - sidebar toggle disabled');
            // Just ensure logos are visible
            logoLg.forEach(logo => {
                logo.style.display = 'block';
            });
            logoSm.forEach(logo => {
                logo.style.display = 'none';
            });
            return;
        }
        
        // Function to update logo display based on sidebar state
        function updateLogoDisplay() {
            const isCollapsed = document.body.classList.contains('vertical-collpsed');
            const windowWidth = window.innerWidth;
            
            console.log('🔄 Updating logo display:', { isCollapsed, windowWidth });
            
            // Update logo-lg elements
            logoLg.forEach(function(element) {
                if (isCollapsed && windowWidth >= 992) {
                    element.style.display = 'none !important';
                    element.style.visibility = 'hidden';
                } else {
                    element.style.display = 'flex !important';
                    element.style.visibility = 'visible';
                    element.style.alignItems = 'center';
                }
            });
            
            // Update logo-sm elements
            logoSm.forEach(function(element) {
                if (isCollapsed && windowWidth >= 992) {
                    element.style.display = 'block !important';
                    element.style.visibility = 'visible';
                } else {
                    element.style.display = 'none !important';
                    element.style.visibility = 'hidden';
                }
            });
            
            // Update navbar brand box
            if (navbarBrandBox) {
                if (isCollapsed && windowWidth >= 992) {
                    navbarBrandBox.style.width = '70px';
                    navbarBrandBox.style.display = 'flex';
                    navbarBrandBox.style.alignItems = 'center';
                    navbarBrandBox.style.justifyContent = 'center';
                } else {
                    navbarBrandBox.style.width = '250px';
                    navbarBrandBox.style.display = 'block';
                    navbarBrandBox.style.textAlign = 'center';
                }
            }
            
            console.log('✅ Logo display updated');
        }
        
        // Enhanced click handler with multiple attempts
        if (verticalMenuBtn) {
            verticalMenuBtn.addEventListener('click', function(e) {
                console.log('🖱️ Vertical menu button clicked');
                
                // Multiple update attempts to ensure it works
                setTimeout(updateLogoDisplay, 50);   // Immediate
                setTimeout(updateLogoDisplay, 150);  // After animation starts
                setTimeout(updateLogoDisplay, 300);  // After animation completes
                setTimeout(updateLogoDisplay, 500);  // Final check
            });
            
            console.log('✅ Click handler attached to vertical menu button');
        } else {
            console.warn('⚠️ Vertical menu button not found');
        }
        
        // Initialize on load
        updateLogoDisplay();
        
        // Handle window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                console.log('📱 Window resized, updating logo display');
                updateLogoDisplay();
            }, 150);
        });
        
        // Enhanced MutationObserver to catch all changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let shouldUpdate = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target === document.body || target.classList.contains('navbar-brand-box')) {
                            shouldUpdate = true;
                        }
                    }
                });
                
                if (shouldUpdate) {
                    console.log('🔍 DOM mutation detected, updating logo display');
                    setTimeout(updateLogoDisplay, 50);
                }
            });
            
            // Observe body class changes
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
            
            // Also observe the navbar brand box
            if (navbarBrandBox) {
                observer.observe(navbarBrandBox, {
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
            
            console.log('✅ MutationObserver initialized');
        }
        
        // Periodic check to ensure logo state is correct (fallback)
        setInterval(function() {
            const currentCollapsed = document.body.classList.contains('vertical-collpsed');
            const logoLgVisible = logoLg.length > 0 && logoLg[0].style.display !== 'none';
            const logoSmVisible = logoSm.length > 0 && logoSm[0].style.display !== 'none';
            
            // Check if state is inconsistent
            if ((currentCollapsed && logoLgVisible && window.innerWidth >= 992) || 
                (!currentCollapsed && logoSmVisible)) {
                console.log('🔧 Inconsistent logo state detected, fixing...');
                updateLogoDisplay();
            }
        }, 2000);
        
        console.log('✅ Logo fix initialization complete');
    }
    
    // Multiple initialization attempts to ensure it works
    function tryInitialize() {
        // Initialize regardless of whether vertical menu button exists
        initLogoFix();
        
        if (!document.getElementById('vertical-menu-btn')) {
            console.log('⏳ Waiting for elements to load...');
            setTimeout(tryInitialize, 100);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialize);
    } else {
        tryInitialize();
    }
    
    // Also try after window load (fallback)
    window.addEventListener('load', function() {
        setTimeout(tryInitialize, 100);
    });
    
    // Expose function globally for debugging
    window.updateLogoDisplay = function() {
        if (isInitialized) {
            const logoLg = document.querySelectorAll('.logo-lg');
            const logoSm = document.querySelectorAll('.logo-sm');
            const isCollapsed = document.body.classList.contains('vertical-collpsed');
            
            logoLg.forEach(function(element) {
                element.style.display = isCollapsed ? 'none !important' : 'flex !important';
            });
            
            logoSm.forEach(function(element) {
                element.style.display = isCollapsed ? 'block !important' : 'none !important';
            });
            
            console.log('🔧 Manual logo display update completed');
        }
    };
    
})();