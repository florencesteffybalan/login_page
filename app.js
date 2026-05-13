document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    //  ELEMENT REFERENCES
    // =============================================
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const forgotView = document.getElementById('forgotView');

    // Navigation links
    const goToSignup = document.getElementById('goToSignup');
    const goToLogin = document.getElementById('goToLogin');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLogin = document.getElementById('backToLogin');

    // Login form
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultBox = document.getElementById('resultBox');
    const hashedResult = document.getElementById('hashedResult');
    const pwdLength = document.getElementById('pwdLength');

    // Sign-up form
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupPasswordInput = document.getElementById('signupPassword');
    const signupConfirmPasswordInput = document.getElementById('signupConfirmPassword');
    const passwordStrengthEl = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');

    // Forgot password form
    const forgotForm = document.getElementById('forgotForm');
    const forgotBtn = document.getElementById('forgotBtn');
    const forgotSuccess = document.getElementById('forgotSuccess');
    const sentEmailDisplay = document.getElementById('sentEmailDisplay');

    // Password toggles
    const togglePassword = document.getElementById('togglePassword');
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    // =============================================
    //  API HELPER
    // =============================================
    const API_BASE = '';  // Same origin

    async function apiRequest(endpoint, data) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return { ok: response.ok, status: response.status, data: result };
    }

    // =============================================
    //  VIEW SWITCHING
    // =============================================
    function switchView(targetView) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active-view');
        });
        targetView.classList.add('active-view');
        // Re-trigger animation
        targetView.style.animation = 'none';
        targetView.offsetHeight; // force reflow
        targetView.style.animation = '';
    }

    goToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(signupView);
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(loginView);
    });

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotSuccess.classList.add('hidden');
        forgotForm.classList.remove('hidden');
        switchView(forgotView);
    });

    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(loginView);
    });

    // =============================================
    //  TOGGLE PASSWORD VISIBILITY
    // =============================================
    function setupPasswordToggle(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const wrapper = toggleBtn.closest('.password-wrapper');
            const input = wrapper.querySelector('input');
            const eyeOpen = toggleBtn.querySelector('.eye-open');
            const eyeClosed = toggleBtn.querySelector('.eye-closed');

            if (input.type === 'password') {
                input.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                input.type = 'password';
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
        });
    }

    setupPasswordToggle(togglePassword);
    setupPasswordToggle(toggleSignupPassword);
    setupPasswordToggle(toggleConfirmPassword);

    // =============================================
    //  PASSWORD STRENGTH METER
    // =============================================
    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }

    signupPasswordInput.addEventListener('input', () => {
        const password = signupPasswordInput.value;
        const bars = passwordStrengthEl.querySelectorAll('.bar');

        if (password.length === 0) {
            passwordStrengthEl.classList.remove('visible');
            bars.forEach(b => b.className = 'bar');
            strengthText.textContent = '';
            strengthText.className = 'strength-text';
            return;
        }

        passwordStrengthEl.classList.add('visible');
        const score = checkPasswordStrength(password);
        const levels = ['weak', 'fair', 'good', 'strong'];
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];

        bars.forEach((bar, i) => {
            bar.className = 'bar';
            if (i < score) {
                bar.classList.add(levels[score - 1]);
            }
        });

        strengthText.textContent = labels[score - 1] || '';
        strengthText.className = 'strength-text ' + (levels[score - 1] || '');
    });

    // =============================================
    //  TOAST NOTIFICATION
    // =============================================
    function showToast(message, type = 'info') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // =============================================
    //  SHA-256 HASH FUNCTION
    // =============================================
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convert buffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // =============================================
    //  LOGIN FORM HANDLER
    // =============================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Loading State
        submitBtn.classList.add('loading');
        resultBox.classList.add('hidden');
        
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        
        try {
            // Hash the password securely
            const hashedPassword = await hashPassword(password);
            
            // Send to backend API
            const response = await apiRequest('/api/login', {
                username: username,
                passwordHash: hashedPassword
            });

            if (response.ok) {
                showToast(`✓ Welcome back, ${response.data.user.name}!`, 'success');
                console.log('[LOGIN] Authenticated user:', response.data.user);
                
                // Save user session to localStorage
                localStorage.setItem('userSession', JSON.stringify(response.data.user));
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast(`✗ ${response.data.error}`, 'error');
                console.log('[LOGIN] Failed:', response.data.error);
            }
            
        } catch (error) {
            console.error("Login failed:", error);
            showToast('✗ Connection error. Is the server running?', 'error');
        } finally {
            // Reset UI state
            submitBtn.classList.remove('loading');
        }
    });

    // =============================================
    //  SIGN-UP FORM HANDLER
    // =============================================
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = signupPasswordInput.value;
        const confirmPassword = signupConfirmPasswordInput.value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showToast('✗ Passwords do not match!', 'error');
            signupConfirmPasswordInput.focus();
            return;
        }

        // Validate strength
        if (checkPasswordStrength(password) < 2) {
            showToast('✗ Password is too weak. Add uppercase, numbers, or symbols.', 'error');
            signupPasswordInput.focus();
            return;
        }

        signupBtn.classList.add('loading');

        try {
            const hashedPassword = await hashPassword(password);

            // Send to backend API
            const response = await apiRequest('/api/register', {
                name: name,
                email: email,
                passwordHash: hashedPassword
            });

            if (response.ok) {
                showToast('✓ Account created successfully! Please sign in.', 'success');
                console.log('[REGISTER] New user created:', response.data);

                // Switch back to login after short delay
                setTimeout(() => {
                    switchView(loginView);
                    document.getElementById('username').value = email;
                    document.getElementById('password').value = '';
                    signupForm.reset();
                }, 1500);
            } else {
                showToast(`✗ ${response.data.error}`, 'error');
                console.log('[REGISTER] Failed:', response.data.error);
            }

        } catch (error) {
            console.error("Registration failed:", error);
            showToast('✗ Connection error. Is the server running?', 'error');
        } finally {
            signupBtn.classList.remove('loading');
        }
    });

    // =============================================
    //  FORGOT PASSWORD HANDLER
    // =============================================
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotEmail').value.trim();

        forgotBtn.classList.add('loading');

        try {
            // Send to backend API
            const response = await apiRequest('/api/forgot-password', {
                email: email
            });

            if (response.ok) {
                // Hide form and show success message
                forgotForm.classList.add('hidden');
                sentEmailDisplay.textContent = email;
                forgotSuccess.classList.remove('hidden');

                showToast('✓ Reset link sent!', 'success');
                console.log('[RESET] Request sent for:', email);
            } else {
                showToast(`✗ ${response.data.error}`, 'error');
            }

        } catch (error) {
            console.error("Forgot password failed:", error);
            showToast('✗ Connection error. Is the server running?', 'error');
        } finally {
            forgotBtn.classList.remove('loading');
        }
    });
});

// =============================================
//  GOOGLE SIGN-IN (Placeholder)
// =============================================
function handleGoogleSignIn() {
    // In a real app, you would integrate the Google Identity Services library here.
    // See: https://developers.google.com/identity/gsi/web

    const toast = document.createElement('div');
    toast.className = 'toast info';
    toast.innerHTML = 'ℹ Google Sign-In requires backend integration.<br>See console for details.';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);

    console.log("--- Google Sign-In ---");
    console.log("To integrate Google Sign-In:");
    console.log("1. Create a project at https://console.cloud.google.com");
    console.log("2. Enable Google Sign-In API");
    console.log("3. Add the Google Identity Services script to your HTML");
    console.log("4. Initialize with your Client ID");
}
