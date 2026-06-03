import { renderLanding } from './pages/landing.js';
import { renderAuth } from './pages/auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderPolicies } from './pages/policies.js';
import { renderNewClaim } from './pages/newClaim.js';
import { renderMyClaims } from './pages/myClaims.js';
import { renderAdmin } from './pages/admin.js';
import { renderNavbar } from './components/navbar.js';
import { showToast } from './components/toast.js';

const app = document.getElementById('app');

const isLoggedIn = () => !!localStorage.getItem('token');
const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  } catch { return false; }
};

function parseHashParams() {
  const hash = window.location.hash.replace('#', '');
  const [path, queryStr] = hash.split('?');
  const params = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }
  return { path: path || '/', params };
}

export function navigate(to) {
  window.location.hash = to;
}

async function router() {
  const { path, params } = parseHashParams();
  app.innerHTML = '';

  // Auth guards
  const privateRoutes = ['/dashboard', '/claims', '/claims/new', '/admin'];
  const adminRoutes = ['/admin'];

  if (privateRoutes.some(r => path.startsWith(r.split('?')[0])) && !isLoggedIn()) {
    showToast('Please login to continue.', 'info');
    navigate('/login');
    return;
  }

  if (adminRoutes.includes(path) && !isAdmin()) {
    showToast('Admin access only.', 'error');
    navigate('/dashboard');
    return;
  }

  // Render navbar
  renderNavbar();

  // Route matching
  switch (path) {
    case '/':
    case '':
      renderLanding(app);
      break;
    case '/login':
      renderAuth(app, 'login');
      break;
    case '/register':
      renderAuth(app, 'register');
      break;
    case '/dashboard':
      await renderDashboard(app);
      break;
    case '/policies':
      await renderPolicies(app, params);
      break;
    case '/claims/new':
      await renderNewClaim(app, params);
      break;
    case '/claims':
      await renderMyClaims(app);
      break;
    case '/admin':
      await renderAdmin(app);
      break;
    default:
      app.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;gap:16px">
          <div style="font-size:4rem">🔍</div>
          <h1 style="font-size:2rem">404 – Page Not Found</h1>
          <p style="color:var(--text-muted)">The page you're looking for doesn't exist.</p>
          <button class="btn btn-primary" id="go-home">🏠 Go Home</button>
        </div>
      `;
      document.getElementById('go-home')?.addEventListener('click', () => navigate('/'));
  }
}

// Listen for hash changes
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Initial route
router();
