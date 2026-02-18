// ============================================
// AUTHENTICATION HELPER
// Production-level JWT token management
// ============================================

/**
 * Authentication Helper for SkillForge Frontend
 * Manages JWT tokens, localStorage, and authentication state
 */
const AuthHelper = {
    /**
     * Get JWT token from localStorage
     * @returns {string|null} JWT token or null if not found
     */
    getToken() {
        try {
            let token = localStorage.getItem('authToken') || localStorage.getItem('token');
            
            // If no token found and we're on localhost (development), auto-generate one
            if ((!token || token === 'undefined' || token === 'null') && this.isDevelopmentMode()) {
                console.log('🔧 Development mode: Auto-generating test token...');
                token = this.generateDevToken();
                this.setToken(token);
                console.log('✅ Development token generated and saved');
            }
            
            if (!token || token === 'undefined' || token === 'null') {
                console.warn('⚠️ No valid authentication token found');
                return null;
            }
            
            // Validate token format (basic check)
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('⚠️ Invalid JWT token format');
                return null;
            }
            
            return token;
        } catch (error) {
            console.error('❌ Error retrieving auth token:', error);
            return null;
        }
    },

    /**
     * Check if running in development mode (localhost)
     * @returns {boolean} True if on localhost
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('local');
    },

    /**
     * Generate a test JWT token for development
     * @returns {string} Test JWT token
     */
    generateDevToken() {
        // Create a simple test token (valid for 7 days from now)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId: '507f1f77bcf86cd799439011',
            email: 'test@skillforge.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        }));
        // Mock signature (backend will validate properly)
        const signature = btoa('dev-test-signature-' + Date.now());
        return `${header}.${payload}.${signature}`;
    },

    /**
     * Set JWT token in localStorage
     * @param {string} token - JWT token to store
     */
    setToken(token) {
        try {
            if (!token) {
                console.warn('⚠️ Attempted to set empty token');
                return false;
            }
            localStorage.setItem('authToken', token);
            console.log('✅ Token saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving auth token:', error);
            return false;
        }
    },

    /**
     * Remove JWT token from localStorage
     */
    removeToken() {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            console.log('✅ Token removed successfully');
        } catch (error) {
            console.error('❌ Error removing auth token:', error);
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if valid token exists
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (decode JWT payload)
        try {
            const payload = this.decodeToken(token);
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            
            if (now >= expirationTime) {
                console.warn('⚠️ Token has expired');
                this.removeToken();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error checking authentication:', error);
            return false;
        }
    },

    /**
     * Decode JWT token payload (without verification)
     * @param {string} token - JWT token
     * @returns {object} Decoded payload
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Error decoding token:', error);
            return null;
        }
    },

    /**
     * Get user info from token
     * @returns {object|null} User info or null
     */
    getUserInfo() {
        const token = this.getToken();
        if (!token) return null;
        
        const payload = this.decodeToken(token);
        return payload ? {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            institutionId: payload.institutionId,
            expiresAt: new Date(payload.exp * 1000)
        } : null;
    },

    /**
     * Build authenticated fetch headers
     * @param {object} additionalHeaders - Additional headers to include
     * @returns {object} Headers object for fetch
     */
    getAuthHeaders(additionalHeaders = {}) {
        const token = this.getToken();
        const headers = { ...additionalHeaders };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },

    /**
     * Build authenticated fetch headers for JSON requests
     * @param {object} additionalHeaders - Additional headers to include
     * @returns {object} Headers object with Content-Type and Authorization
     */
    getAuthHeadersJSON(additionalHeaders = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...additionalHeaders
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },

    /**
     * Handle authentication errors
     * @param {Response} response - Fetch response object
     * @returns {boolean} True if auth error was handled
     */
    async handleAuthError(response) {
        if (response.status === 401) {
            console.warn('⚠️ Authentication failed - redirecting to login');
            this.removeToken();
            
            // Show user-friendly message
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.error || 'Session expired. Please log in again.';
            
            // You can trigger a modal or redirect here
            if (typeof showFeedback === 'function') {
                showFeedback(message, 'error');
            } else {
                alert(message);
            }
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            
            return true;
        }
        return false;
    },

    /**
     * Make authenticated fetch request (wrapper)
     * @param {string} url - API endpoint URL
     * @param {object} options - Fetch options
     * @returns {Promise<Response>} Fetch response
     */
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No authentication token available');
        }

        // Add Authorization header to existing headers
        const headers = options.headers || {};
        headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle auth errors automatically
        if (response.status === 401) {
            await this.handleAuthError(response);
            throw new Error('Authentication failed');
        }

        return response;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHelper;
}
