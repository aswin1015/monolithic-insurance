import { navigate } from '../router.js';

export function renderSidebar(container, activePage) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const links = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard', page: 'dashboard' },
    { icon: '🏛️', label: 'Browse Policies', route: '/policies', page: 'policies' },
    { icon: '📤', label: 'File a Claim', route: '/claims/new', page: 'newClaim' },
    { icon: '📋', label: 'My Claims', route: '/claims', page: 'myClaims' },
  ];

  const adminLinks = isAdmin ? [
    { icon: '⚙️', label: 'Admin Panel', route: '/admin', page: 'admin' },
    { icon: '👥', label: 'All Claims', route: '/admin', page: 'adminClaims' },
  ] : [];

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-nav">
        <div class="sidebar-section-label">Navigation</div>
        ${links.map(l => `
          <button class="sidebar-link ${activePage === l.page ? 'active' : ''}" data-route="${l.route}">
            <span>${l.icon}</span> ${l.label}
          </button>
        `).join('')}
        
        ${isAdmin ? `
          <div class="sidebar-divider"></div>
          <div class="sidebar-section-label">Administration</div>
          ${adminLinks.map(l => `
            <button class="sidebar-link ${activePage === l.page ? 'active' : ''}" data-route="${l.route}">
              <span>${l.icon}</span> ${l.label}
            </button>
          `).join('')}
        ` : ''}
        
        <div class="sidebar-divider"></div>
        <button class="sidebar-link" id="sidebar-logout">
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  `;

  container.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.route));
  });

  document.getElementById('sidebar-logout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  });
}
