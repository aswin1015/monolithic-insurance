import { claimsAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderSidebar } from '../components/sidebar.js';

export async function renderDashboard(container) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  container.innerHTML = `
    <div class="dashboard-layout">
      <div id="sidebar-mount"></div>
      <main class="main-content">
        <div class="welcome-banner fade-in-up">
          <div>
            <div class="welcome-title">Welcome back, ${user.name?.split(' ')[0] || 'User'}! 👋</div>
            <div class="welcome-sub">Here's an overview of your insurance claims and activity.</div>
          </div>
          <button class="btn btn-primary" id="new-claim-btn">📤 File New Claim</button>
        </div>

        <!-- Stats -->
        <div class="grid grid-4 mb-3" id="stats-grid">
          ${[1,2,3,4].map(() => `
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(59,130,246,0.1)">
                <div class="spinner"></div>
              </div>
              <div><div class="stat-label" style="height:12px;background:var(--border);border-radius:4px;width:80px;margin-bottom:8px"></div>
              <div style="height:24px;background:var(--border);border-radius:4px;width:60px"></div></div>
            </div>
          `).join('')}
        </div>

        <!-- Recent Claims -->
        <div class="card-glass" style="padding:24px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h2 style="font-size:1.1rem">Recent Claims</h2>
            <button class="btn btn-outline btn-sm" id="view-all-claims">View All →</button>
          </div>
          <div id="recent-claims-list">
            <div class="loading-spinner"><div class="spinner"></div><span>Loading claims...</span></div>
          </div>
        </div>
      </main>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-mount'), 'dashboard');

  document.getElementById('new-claim-btn')?.addEventListener('click', () => navigate('/claims/new'));
  document.getElementById('view-all-claims')?.addEventListener('click', () => navigate('/claims'));

  try {
    const res = await claimsAPI.getMy();
    const claims = res.data.claims || [];

    // Compute stats
    const stats = {
      total: claims.length,
      pending: claims.filter(c => c.status === 'pending').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
    };

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card fade-in-up">
        <div class="stat-icon" style="background:rgba(59,130,246,0.1)">📋</div>
        <div>
          <div class="stat-label">Total Claims</div>
          <div class="stat-value">${stats.total}</div>
        </div>
      </div>
      <div class="stat-card fade-in-up" style="animation-delay:0.1s">
        <div class="stat-icon" style="background:rgba(251,191,36,0.1)">⏳</div>
        <div>
          <div class="stat-label">Pending</div>
          <div class="stat-value" style="color:var(--amber-400)">${stats.pending}</div>
        </div>
      </div>
      <div class="stat-card fade-in-up" style="animation-delay:0.2s">
        <div class="stat-icon" style="background:rgba(52,211,153,0.1)">✅</div>
        <div>
          <div class="stat-label">Approved</div>
          <div class="stat-value" style="color:var(--emerald-400)">${stats.approved}</div>
        </div>
      </div>
      <div class="stat-card fade-in-up" style="animation-delay:0.3s">
        <div class="stat-icon" style="background:rgba(251,113,133,0.1)">❌</div>
        <div>
          <div class="stat-label">Rejected</div>
          <div class="stat-value" style="color:var(--rose-400)">${stats.rejected}</div>
        </div>
      </div>
    `;

    // Recent claims table
    const recentClaimsList = document.getElementById('recent-claims-list');
    if (claims.length === 0) {
      recentClaimsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>No claims yet</h3>
          <p>File your first claim to see it here.</p>
          <button class="btn btn-primary mt-2" id="empty-claim-btn">📤 File a Claim</button>
        </div>
      `;
      document.getElementById('empty-claim-btn')?.addEventListener('click', () => navigate('/claims/new'));
    } else {
      recentClaimsList.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${claims.slice(0, 5).map(c => `
                <tr>
                  <td><strong>${c.policy?.name || 'N/A'}</strong></td>
                  <td><span class="badge badge-${c.policyType}">${typeIcon(c.policyType)} ${capitalize(c.policyType)}</span></td>
                  <td><span style="color:var(--emerald-400);font-weight:600">₹${c.claimAmount.toLocaleString()}</span></td>
                  <td><span class="badge badge-${c.status}">${statusIcon(c.status)} ${formatStatus(c.status)}</span></td>
                  <td style="color:var(--text-muted)">${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    showToast('Failed to load dashboard data.', 'error');
  }
}

function typeIcon(type) { return { car: '🚗', health: '🏥', life: '💜' }[type] || ''; }
function statusIcon(s) { return { pending: '⏳', under_review: '🔍', approved: '✅', rejected: '❌' }[s] || ''; }
function formatStatus(s) { return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
