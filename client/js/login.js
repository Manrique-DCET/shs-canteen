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
            let userData;

            try {
                // First try to login using wrapper (will throw if fails)
                const data = await api.request(`/auth/login`, {
                    method: 'POST',
                    body: JSON.stringify({ email, password: 'password123' })
                });

                // The wrapper handled json parsing and basic ok check
                const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));

                // IMPORTANT: we need to ALSO save the token since we're refactoring to JWT for students!
                userData = { _id: tokenPayload.user.id, name: data.name, email };
                localStorage.setItem('student_token', data.token);

            } catch (loginError) {
                // If login fails (user not found/bad password), assume we need to register
                // Actually, a bad password shouldn't auto-register, but this was the existing flow
                console.log("Login failed, attempting register:", loginError.message);

                const regData = await api.request(`/auth/register`, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password: 'password123', role: 'student' })
                });

                // Extracted from register json response
                const tokenPayload = JSON.parse(atob(regData.token.split('.')[1]));
                userData = { _id: tokenPayload.user.id, name: regData.name, email };
                localStorage.setItem('student_token', regData.token);
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
