// Google OAuth Configuration
// To get your Google Client ID:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing one
// 3. Enable Google+ API
// 4. Go to APIs & Services -> Credentials
// 5. Create OAuth 2.0 Client ID
// 6. Add your domain to authorized origins

const GOOGLE_CONFIG = {
    // Replace with your actual Google Client ID from Google Cloud Console
    // For testing, you can use a demo client ID (won't work but shows the flow)
    CLIENT_ID: '996821194010-mli66gkdqm9usg6uiimmd0kh36t66iuq.apps.googleusercontent.com',
    
    // API endpoint for our backend
    API_ENDPOINT: 'http://localhost:5001/api/auth/google'
};

// Google OAuth Helper Functions
class GoogleAuth {
    static async signInWithGoogle() {
        return new Promise((resolve, reject) => {
            // Load Google Sign-In library
            if (typeof google === 'undefined') {
                reject(new Error('Google Sign-In library not loaded'));
                return;
            }

            google.accounts.id.initialize({
                client_id: GOOGLE_CONFIG.CLIENT_ID,
                callback: async (response) => {
                    try {
                        console.log('🔵 Google Sign-In response received');
                        const result = await this.handleGoogleResponse(response.credential);
                        resolve(result);
                    } catch (error) {
                        console.error('❌ Google Sign-In error:', error);
                        reject(error);
                    }
                }
            });

            // Use renderButton instead of prompt to avoid automatic popup
            this.renderSignInButton(resolve, reject);
        });
    }

    static renderSignInButton(resolve, reject) {
        // Create a temporary button container (hidden)
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-signin-button-temp';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.left = '-9999px';
        buttonContainer.style.visibility = 'hidden';
        document.body.appendChild(buttonContainer);

        google.accounts.id.renderButton(
            buttonContainer,
            {
                theme: 'outline',
                size: 'large',
                width: '100%'
            }
        );

        // Auto-click the hidden button to trigger sign-in
        setTimeout(() => {
            const button = buttonContainer.querySelector('div[role="button"]');
            if (button) {
                button.click();
            } else {
                reject(new Error('Google Sign-In button not found'));
            }
            
            // Clean up the temporary button after a delay
            setTimeout(() => {
                if (buttonContainer.parentNode) {
                    buttonContainer.parentNode.removeChild(buttonContainer);
                }
            }, 1000);
        }, 100);
    }

    static async handleGoogleResponse(credential) {
        try {
            console.log('🔄 Sending Google token to backend...');
            
            const response = await fetch(GOOGLE_CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: credential })
            });

            const data = await response.json();
            console.log('📦 Backend response:', data);

            if (data.success && data.data && data.data.token) {
                // Save to localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                
                console.log('✅ Google Sign-In successful!');
                return data;
            } else {
                throw new Error(data.error || 'Google Sign-In failed');
            }
        } catch (error) {
            console.error('❌ Google Auth error:', error);
            throw error;
        }
    }

    static loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (typeof google !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Disable automatic Google One Tap prompt
if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
}

// Make it available globally
window.GoogleAuth = GoogleAuth;
window.GOOGLE_CONFIG = GOOGLE_CONFIG;

console.log('✅ Google Auth configuration loaded');