/**
 * Main JavaScript File
 * Handles layout injection and global functionality
 */

/**
 * Initialize the page
 * Loads header and footer components
 */
async function initPage() {
    // Load header
    await loadHTML('/layouts/Header.html', 'header-placeholder');
    
    // Load footer
    await loadHTML('/layouts/Footer.html', 'footer-placeholder');
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize any page-specific functionality
    if (typeof initPageSpecific === 'function') {
        initPageSpecific();
    }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    initPage();
});

/**
 * Handle navigation link clicks
 * Add smooth scrolling and active state management
 */
document.addEventListener('click', function(e) {
    // Handle internal navigation
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

/**
 * Add active state to current page navigation link
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });
}

// Set active nav link after header is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setActiveNavLink, 100);
});








