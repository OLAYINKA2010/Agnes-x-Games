// DOM Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const passwordStrength = document.getElementById('passwordStrength');

// Password strength checker
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength++;
        
        // Contains numbers
        if (/\d/.test(password)) strength++;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength++;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength++;
        
        // Contains special characters
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Update strength meter
        passwordStrength.className = 'strength-meter';
        if (password.length === 0) {
            return;
        }
        
        if (strength <= 2) {
            passwordStrength.classList.add('weak');
        } else if (strength <= 4) {
            passwordStrength.classList.add('medium');
        } else {
            passwordStrength.classList.add('strong');
        }
    });
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.remove('show');
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        // Reset errors
        hideError('emailError');
        hideError('usernameError');
        hideError('passwordError');
        hideError('confirmPasswordError');
        hideError('termsError');
        
        let isValid = true;
        
        // Validate email
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate username
        if (username.length < 3) {
            showError('usernameError', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        // Validate password
        if (!validatePassword(password)) {
            showError('passwordError', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate terms
        if (!terms) {
            showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        const btn = document.getElementById('signupBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('loadingSpinner');
        
        btn.disabled = true;
        btnText.textContent = 'Creating Account...';
        spinner.style.display = 'block';
        
        try {
            // Send registration request
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    username,
                    password
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registration successful
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                // Registration failed
                showError('emailError', data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('emailError', 'Network error. Please try again.');
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Create Account';
            spinner.style.display = 'none';
        }
    });
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('remember').checked;
        
        // Reset errors
        hideError('emailError');
        hideError('passwordError');
        
        let isValid = true;
        
        // Validate email
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (password.length === 0) {
            showError('passwordError', 'Please enter your password');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        const btn = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('loadingSpinner');
        
        btn.disabled = true;
        btnText.textContent = 'Signing In...';
        spinner.style.display = 'block';
        
        try {
            // Send login request
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    remember
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Login successful
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                // Login failed
                showError('passwordError', data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('passwordError', 'Network error. Please try again.');
        } finally {
            // Reset button state
            btn.disabled = false;
            btnText.textContent = 'Sign In';
            spinner.style.display = 'none';
        }
    });
}

// Gmail sign in/up
function signInWithGmail() {
    alert('Gmail authentication would be implemented here with OAuth2 in a production environment.');
    // In production, this would redirect to Google OAuth
    // window.location.href = '/auth/google';
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('user');
    if (user && window.location.pathname === '/') {
        window.location.href = '/dashboard';
    }
});

// Login form submission logic
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('remember').checked;
        
        hideError('emailError');
        hideError('passwordError');
        
        let isValid = true;
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        if (password.length === 0) {
            showError('passwordError', 'Please enter your password');
            isValid = false;
        }

        if (!isValid) return;

        // UI Feedback
        const btn = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('loadingSpinner');
        
        btn.disabled = true;
        btnText.textContent = 'Verifying...';
        spinner.style.display = 'inline-block';

        try {
            // Replace '/api/login' with your actual backend endpoint
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // SUCCESS: Save user data locally
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // If "Remember Me" is checked, you might store a token
                if (remember) {
                    localStorage.setItem('rememberUser', 'true');
                }

                // Redirect to game dashboard
                window.location.href = 'dashboard.html'; 
            } else {
                showError('passwordError', data.message || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('passwordError', 'Connection failed. Is the server running?');
        } finally {
            btn.disabled = false;
            btnText.textContent = 'Sign In';
            spinner.style.display = 'none';
        }
    });
}

// AUTO-LOGIN LOGIC
// Checks if a user session exists when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    
    // If user is found and we are on the login or signup page, skip to dashboard
    const isAuthPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('signup.html');

    if (savedUser && isAuthPage) {
        window.location.href = 'dashboard.html';
    }
});

// Gmail Auth Mockup
function signInWithGmail() {
    console.log("Redirecting to Google OAuth...");
    // window.location.href = '/api/auth/google';
}