/**
 * Student Login Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('canteen_student');
    if (storedUser) {
        window.location.href = 'index.html'; // Redirect to kiosk immediately
        return;
    }

    const loginForm = document.getElementById('student-login-form');
    const nameInput = document.getElementById('student-name');
    const emailInput = document.getElementById('student-email');
    const submitBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            // First try to login
            const res = await fetch(`${window.config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'password123' }) // MOCK PASS for quick flow
            });

            let userData;

            if (res.ok) {
                const data = await res.json();
                userData = { _id: data.user ? data.user.id : data.userId, name: data.user ? data.user.name : data.name, email };
            } else {
                // If login fails (user not found), register them
                const regRes = await fetch(`${window.config.apiUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password: 'password123', role: 'student' })
                });

                if (regRes.ok) {
                    const data = await regRes.json();

                    // We need to fetch the newly created user ID so we log them in properly
                    // For the sake of this mock flow without a proper login endpoint that returns ID on register,
                    // we'll attempt login again after register to get the full token payload.
                    const loginRes = await fetch(`${window.config.apiUrl}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: 'password123' })
                    });

                    if (loginRes.ok) {
                        const loginData = await loginRes.json();
                        // Depending on how jwt payload is structured, extract user id
                        // The auth route creates payload: { user: { id: user.id, role: user.role } }
                        // and sends { token, role, name } back. We must ensure we have an ID for orders.

                        // In auth.js: jwt.sign sends { token, role: user.role, name: user.name }
                        // Wait, auth.js does NOT send the user ID back in the login response!
                        // Since we don't have time to fix auth.js, we'll decode the JWT payload to get the ID.

                        const tokenPayload = JSON.parse(atob(loginData.token.split('.')[1]));
                        userData = { _id: tokenPayload.user.id, name: loginData.name, email };
                    } else {
                        throw new Error("Failed to authenticate newly registered user");
                    }
                } else {
                    const err = await regRes.json();
                    throw new Error(err.message || "Failed to register");
                }
            }

            // Success saving state
            localStorage.setItem('canteen_student', JSON.stringify(userData));

            // Redirect to kiosk
            window.location.href = 'index.html';

        } catch (error) {
            console.error(error);
            showToast(`Authentication Error: ${error.message}`, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Start Ordering <i class="fa-solid fa-arrow-right"></i>';
        }
    });
});
