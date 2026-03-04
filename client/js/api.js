/**
 * Centralized API service for SHS Canteen Kiosk
 */

const api = {
    // Determine the base URL dynamically based on environment or config
    getBaseUrl() {
        if (window.config && window.config.apiUrl) {
            return window.config.apiUrl;
        }
        // Fallback or local dev
        return 'http://localhost:5000/api';
    },

    /**
     * @param {string} endpoint - API Endpoint starting with '/' (e.g. '/products')
     * @param {object} options - Fetch options object
     * @param {boolean} isAdminReq - Whether to attach admin token vs student token
     */
    async request(endpoint, options = {}, isAdminReq = false) {
        const url = `${this.getBaseUrl()}${endpoint}`;

        // Prepare headers
        const headers = new Headers(options.headers || {});
        // Automatically set Content-Type to JSON if not specified and body exists
        if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
            headers.set('Content-Type', 'application/json');
        }

        // Attach Authorization token dynamically
        const tokenKey = isAdminReq ? 'admin_token' : 'student_token'; // we will implement student_token soon
        const token = localStorage.getItem(tokenKey) || localStorage.getItem('admin_token'); // Fallback to admin if requested but not specified explicitly

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const fetchOptions = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, fetchOptions);

            // Handle Unauthorized requests globally
            if (response.status === 401 || response.status === 403) {
                console.warn('Unauthorized request - redirecting to login');
                // Clean up tokens depending on where we are
                if (window.location.pathname.includes('admin')) {
                    localStorage.removeItem('admin_token');
                    window.location.href = 'admin-login.html';
                } else {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('canteen_student');
                    window.location.href = 'login.html';
                }
                return null; // Stop execution
            }

            // Check for general errors
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: await response.text() };
                }
                const error = new Error(errorData.message || 'API Request Failed');
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            // If DELETE or no content, don't parse JSON
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }
};

window.api = api;
