import { navigate } from '../router.js';

export function renderNavbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const publicLinks = isLoggedIn
    ? `
      <button class="nav-link" data-route="/policies">🏛️ Policies</button>
      <button class="nav-link" data-route="/dashboard">📊 Dashboard</button>
      <button class="nav-link" data-route="/claims/new">📤 File Claim</button>
      <button class="nav-link" data-route="/claims">📋 My Claims</button>
      ${user.role === 'admin' ? '<button class="nav-link" data-route="/admin">⚙️ Admin</button>' : ''}
    `
    : `
      <button class="nav-link" data-route="/policies">🏛️ Policies</button>
    `;

  const authSection = isLoggedIn
    ? `
      <div class="nav-user">
        <div class="nav-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="nav-username">${user.name.split(' ')[0]}</div>
        </div>
        ${user.role === 'admin' ? '<span class="nav-role">Admin</span>' : ''}
      </div>
      <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
    `
    : `
      <button class="btn btn-outline btn-sm" id="nav-login-btn">Login</button>
      <button class="btn btn-primary btn-sm" id="nav-register-btn">Get Started</button>
    `;

  navbar.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" data-route="/">
        <div class="nav-logo-icon">🛡️</div>
        <span class="nav-logo-text">Mono Insurance</span>
      </a>
      <nav class="nav-links">
        ${publicLinks}
      </nav>
      <div class="nav-actions">
        ${authSection}
      </div>
    </div>
  `;

  // Bind route navigation
  navbar.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.route));
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    });
  }

  const loginBtn = document.getElementById('nav-login-btn');
  if (loginBtn) loginBtn.addEventListener('click', () => navigate('/login'));

  const registerBtn = document.getElementById('nav-register-btn');
  if (registerBtn) registerBtn.addEventListener('click', () => navigate('/register'));

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active link highlight
  const currentHash = window.location.hash.replace('#', '') || '/';
  navbar.querySelectorAll('[data-route]').forEach((el) => {
    if (el.dataset.route === currentHash) el.classList.add('active');
  });
}
