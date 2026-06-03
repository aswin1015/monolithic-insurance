import { authAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export function renderAuth(container, initialTab = 'login') {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-logo">
          <div class="auth-logo-icon">🛡️</div>
          <h2>Mono Insurance</h2>
          <p>Your trusted insurance partner</p>
        </div>
        <div class="auth-card card-glass">
          <div class="tabs auth-tabs">
            <button class="tab-btn ${initialTab === 'login' ? 'active' : ''}" id="tab-login">🔑 Login</button>
            <button class="tab-btn ${initialTab === 'register' ? 'active' : ''}" id="tab-register">✨ Register</button>
          </div>

          <!-- LOGIN FORM -->
          <form id="login-form" class="${initialTab === 'register' ? 'hidden' : ''}">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="login-submit">
              🔑 Sign In
            </button>
            <div class="auth-footer">
              Don't have an account? 
              <a href="#" id="go-register">Create one free</a>
            </div>
          </form>

          <!-- REGISTER FORM -->
          <form id="register-form" class="${initialTab === 'login' ? 'hidden' : ''}">
            <div class="grid grid-2" style="gap:16px">
              <div class="form-group mb-0">
                <label class="form-label" for="reg-name">Full Name</label>
                <input type="text" id="reg-name" class="form-control" placeholder="John Doe" required />
              </div>
              <div class="form-group mb-0">
                <label class="form-label" for="reg-phone">Phone (Optional)</label>
                <input type="tel" id="reg-phone" class="form-control" placeholder="+91 9XXXXXXXXX" />
              </div>
            </div>
            <div class="form-group mt-2">
              <label class="form-label" for="reg-email">Email Address</label>
              <input type="email" id="reg-email" class="form-control" placeholder="you@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-dob">Date of Birth (Optional)</label>
              <input type="date" id="reg-dob" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <input type="password" id="reg-password" class="form-control" placeholder="Min. 6 characters" required minlength="6" />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-confirm">Confirm Password</label>
              <input type="password" id="reg-confirm" class="form-control" placeholder="Repeat password" required />
            </div>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="register-submit">
              ✨ Create Account
            </button>
            <div class="auth-footer">
              Already have an account? 
              <a href="#" id="go-login">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  const showLogin = () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  };

  const showRegister = () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  };

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);
  document.getElementById('go-login')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  document.getElementById('go-register')?.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });

  // Login submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    btn.textContent = '⏳ Signing in...';

    try {
      const res = await authAPI.login({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      showToast('Welcome back! 🎉', 'success');

      const dest = res.data.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(dest);
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '🔑 Sign In';
    }
  });

  // Register submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-submit');

    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (password !== confirm) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Creating account...';

    try {
      const res = await authAPI.register({
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password,
        phone: document.getElementById('reg-phone').value,
        dateOfBirth: document.getElementById('reg-dob').value || undefined,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      showToast('Account created successfully! 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed. Try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '✨ Create Account';
    }
  });
}
