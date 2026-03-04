/**
 * Admin Login Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
        window.location.href = 'admin.html'; // Redirect to dashboard immediately
        return;
    }

    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const submitBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

        try {
            const data = await api.request(`/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Extra safety check: Are they actually an admin?
            if (data.role !== 'admin') {
                throw new Error('Access denied: You are not an administrator.');
            }

            localStorage.setItem('admin_token', data.token);
            window.location.href = 'admin.html';

        } catch (error) {
            console.error('Login error', error);
            showToast(`Authentication Error: ${error.message}`, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Secure Login <i class="fa-solid fa-lock ml-2"></i>';
        }
    });
});
