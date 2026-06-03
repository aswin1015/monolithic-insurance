import { adminAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { renderSidebar } from '../components/sidebar.js';

export async function renderAdmin(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div id="sidebar-mount"></div>
      <main class="main-content">
        <div class="page-header">
          <h1>⚙️ Admin Panel</h1>
          <p>Manage all insurance claims, review documents, and update statuses.</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-4 mb-3" id="admin-stats">
          ${[1,2,3,4].map(() => `<div class="stat-card"><div class="spinner"></div></div>`).join('')}
        </div>

        <!-- Claims Table -->
        <div class="card-glass" style="padding:24px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
            <h2 style="font-size:1.1rem">All Claims</h2>
            <div class="filter-bar" style="margin:0">
              <select id="admin-filter-type">
                <option value="">All Types</option>
                <option value="car">🚗 Car</option>
                <option value="health">🏥 Health</option>
                <option value="life">💜 Life</option>
              </select>
              <select id="admin-filter-status">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button class="btn btn-outline btn-sm" id="apply-filters">Filter</button>
            </div>
          </div>

          <div id="admin-claims-table">
            <div class="loading-spinner"><div class="spinner"></div><span>Loading claims...</span></div>
          </div>
          <div class="pagination" id="pagination"></div>
        </div>
      </main>
    </div>

    <!-- Update Status Modal -->
    <div class="modal-overlay hidden" id="update-modal">
      <div class="modal">
        <div class="modal-header">
          <h2>Update Claim Status</h2>
          <button class="modal-close" id="close-update-modal">✕</button>
        </div>
        <div id="update-modal-content">
          <div class="form-group">
            <label class="form-label">Claim Summary</label>
            <div id="modal-claim-info" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;font-size:0.875rem;color:var(--text-secondary)"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-status">New Status</label>
            <select id="new-status" class="form-control">
              <option value="pending">⏳ Pending</option>
              <option value="under_review">🔍 Under Review</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="admin-notes">Admin Notes (Optional)</label>
            <textarea id="admin-notes" class="form-control" rows="3" placeholder="Add notes for the claimant..."></textarea>
          </div>
          <button class="btn btn-primary w-full" id="confirm-update">✅ Update Status</button>
        </div>
      </div>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-mount'), 'admin');

  let currentPage = 1;
  let totalPages = 1;
  let currentClaimId = null;

  // Load stats
  try {
    const statsRes = await adminAPI.getStats();
    const s = statsRes.data.stats;
    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(59,130,246,0.1)">👥</div>
        <div><div class="stat-label">Total Users</div><div class="stat-value">${s.totalUsers}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(251,191,36,0.1)">⏳</div>
        <div><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--amber-400)">${s.pendingClaims}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(52,211,153,0.1)">✅</div>
        <div><div class="stat-label">Approved</div><div class="stat-value" style="color:var(--emerald-400)">${s.approvedClaims}</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(251,113,133,0.1)">📋</div>
        <div><div class="stat-label">Total Claims</div><div class="stat-value">${s.totalClaims}</div></div>
      </div>
    `;
  } catch { /* stats non-critical */ }

  const loadClaims = async () => {
    const type = document.getElementById('admin-filter-type').value;
    const status = document.getElementById('admin-filter-status').value;
    const tableEl = document.getElementById('admin-claims-table');

    tableEl.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>`;

    try {
      const res = await adminAPI.getClaims({ type, status, page: currentPage, limit: 10 });
      const { claims, total, totalPages: tp } = res.data;
      totalPages = tp;

      if (!claims.length) {
        tableEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><h3>No claims found</h3></div>`;
        document.getElementById('pagination').innerHTML = '';
        return;
      }

      tableEl.innerHTML = `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Claimant</th>
                <th>Policy</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Document</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${claims.map(c => `
                <tr>
                  <td>
                    <strong>${c.user?.name || 'N/A'}</strong>
                    <div style="font-size:0.78rem;color:var(--text-muted)">${c.user?.email || ''}</div>
                  </td>
                  <td style="font-size:0.875rem">${c.policy?.name || 'N/A'}</td>
                  <td><span class="badge badge-${c.policyType}">${typeIcon(c.policyType)} ${capitalize(c.policyType)}</span></td>
                  <td><span style="color:var(--emerald-400);font-weight:600">₹${c.claimAmount.toLocaleString()}</span></td>
                  <td><span class="badge badge-${c.status}">${statusIcon(c.status)} ${formatStatus(c.status)}</span></td>
                  <td style="color:var(--text-muted);font-size:0.8rem">${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <a href="/uploads/${c.pdfPath?.split(/[\\/]/).pop()}" target="_blank" class="btn btn-ghost btn-sm" title="View PDF">
                      📄 PDF
                    </a>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm update-status-btn" 
                      data-id="${c._id}" 
                      data-current="${c.status}"
                      data-info="${c.user?.name} – ${c.policy?.name} – ₹${c.claimAmount.toLocaleString()}">
                      ✏️ Update
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Pagination
      const paginationEl = document.getElementById('pagination');
      paginationEl.innerHTML = `
        <button class="page-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>◀</button>
        ${Array.from({ length: totalPages }, (_, i) => `
          <button class="page-btn ${i + 1 === currentPage ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>
        `).join('')}
        <button class="page-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>▶</button>
        <span style="color:var(--text-muted);font-size:0.8rem;margin-left:8px">Total: ${total}</span>
      `;

      document.getElementById('prev-page')?.addEventListener('click', () => { currentPage--; loadClaims(); });
      document.getElementById('next-page')?.addEventListener('click', () => { currentPage++; loadClaims(); });
      paginationEl.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); loadClaims(); });
      });

      // Update status buttons
      tableEl.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentClaimId = btn.dataset.id;
          document.getElementById('new-status').value = btn.dataset.current;
          document.getElementById('admin-notes').value = '';
          document.getElementById('modal-claim-info').textContent = btn.dataset.info;
          document.getElementById('update-modal').classList.remove('hidden');
        });
      });

    } catch {
      showToast('Failed to load claims.', 'error');
    }
  };

  // Filters
  document.getElementById('apply-filters').addEventListener('click', () => { currentPage = 1; loadClaims(); });
  document.getElementById('admin-filter-type').addEventListener('change', () => { currentPage = 1; loadClaims(); });
  document.getElementById('admin-filter-status').addEventListener('change', () => { currentPage = 1; loadClaims(); });

  // Modal close
  document.getElementById('close-update-modal').addEventListener('click', () => {
    document.getElementById('update-modal').classList.add('hidden');
  });
  document.getElementById('update-modal').addEventListener('click', (e) => {
    if (e.target.id === 'update-modal') document.getElementById('update-modal').classList.add('hidden');
  });

  // Confirm update
  document.getElementById('confirm-update').addEventListener('click', async () => {
    if (!currentClaimId) return;
    const btn = document.getElementById('confirm-update');
    btn.disabled = true;
    btn.textContent = '⏳ Updating...';

    try {
      await adminAPI.updateClaim(currentClaimId, {
        status: document.getElementById('new-status').value,
        adminNotes: document.getElementById('admin-notes').value,
      });
      showToast('Claim status updated successfully!', 'success');
      document.getElementById('update-modal').classList.add('hidden');
      loadClaims();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '✅ Update Status';
    }
  });

  loadClaims();
}

function typeIcon(type) { return { car: '🚗', health: '🏥', life: '💜' }[type] || ''; }
function statusIcon(s) { return { pending: '⏳', under_review: '🔍', approved: '✅', rejected: '❌' }[s] || ''; }
function formatStatus(s) { return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
