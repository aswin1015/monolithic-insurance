import { policiesAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderSidebar } from '../components/sidebar.js';

export async function renderPolicies(container, params = {}) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;
  let activeType = params.type || 'car';

  const wrapperEl = isLoggedIn
    ? `<div class="dashboard-layout"><div id="sidebar-mount"></div><main class="main-content" id="policies-main"></main></div>`
    : `<div class="page" style="padding-top:90px"><div class="container" id="policies-main"></div></div>`;

  container.innerHTML = wrapperEl;

  if (isLoggedIn) {
    renderSidebar(document.getElementById('sidebar-mount'), 'policies');
  }

  const main = document.getElementById('policies-main');

  const renderContent = async (type) => {
    activeType = type;
    main.innerHTML = `
      <div class="page-header">
        <h1>Insurance Policies</h1>
        <p>Browse our comprehensive plans and choose the right coverage for you.</p>
      </div>
      <div class="tabs mb-3">
        <button class="tab-btn ${type === 'car' ? 'active' : ''}" id="tab-car">🚗 Car</button>
        <button class="tab-btn ${type === 'health' ? 'active' : ''}" id="tab-health">🏥 Health</button>
        <button class="tab-btn ${type === 'life' ? 'active' : ''}" id="tab-life">💜 Life</button>
      </div>
      <div id="policies-grid">
        <div class="loading-spinner"><div class="spinner"></div><span>Loading policies...</span></div>
      </div>
    `;

    // Tab events
    document.getElementById('tab-car').addEventListener('click', () => renderContent('car'));
    document.getElementById('tab-health').addEventListener('click', () => renderContent('health'));
    document.getElementById('tab-life').addEventListener('click', () => renderContent('life'));

    try {
      const res = await policiesAPI.getByType(type);
      const policies = res.data.policies || [];
      const grid = document.getElementById('policies-grid');

      if (!policies.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><h3>No policies found</h3></div>`;
        return;
      }

      grid.innerHTML = `<div class="grid grid-3">
        ${policies.map((p, i) => `
          <div class="policy-card fade-in-up" style="animation-delay:${i * 0.08}s">
            <div class="policy-card-header">
              <span class="policy-card-name">${typeIcon(p.type)} ${p.name}</span>
              <span class="badge badge-${p.type}">${capitalize(p.type)}</span>
            </div>
            <p class="policy-card-description">${p.description}</p>
            <div class="policy-card-coverage">Coverage Amount</div>
            <div class="policy-card-amount">₹${(p.coverage).toLocaleString()}</div>
            <div class="policy-card-premium">₹${p.premium.toLocaleString()} / ${p.duration}</div>
            ${p.features?.length ? `
              <ul class="policy-features">
                ${p.features.slice(0, 4).map(f => `<li>${f}</li>`).join('')}
              </ul>
            ` : ''}
            <div style="margin-top:auto;padding-top:16px">
              ${isLoggedIn
                ? `<button class="btn btn-primary w-full claim-btn" data-policy-id="${p._id}" data-policy-type="${p.type}" data-policy-name="${p.name}">
                    📤 File a Claim
                  </button>`
                : `<button class="btn btn-outline w-full" data-login="true">🔑 Login to Claim</button>`
              }
            </div>
          </div>
        `).join('')}
      </div>`;

      // Bind claim buttons
      grid.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate(`/claims/new?policyId=${btn.dataset.policyId}&type=${btn.dataset.policyType}`);
        });
      });

      // Bind login buttons
      grid.querySelectorAll('[data-login]').forEach(btn => {
        btn.addEventListener('click', () => navigate('/login'));
      });

    } catch (err) {
      showToast('Failed to load policies.', 'error');
    }
  };

  renderContent(activeType);
}

function typeIcon(type) { return { car: '🚗', health: '🏥', life: '💜' }[type] || '🛡️'; }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
