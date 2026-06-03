import { claimsAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderSidebar } from '../components/sidebar.js';

export async function renderMyClaims(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div id="sidebar-mount"></div>
      <main class="main-content">
        <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h1>📋 My Claims</h1>
            <p>Track all your submitted insurance claims and their status.</p>
          </div>
          <button class="btn btn-primary" id="new-claim-btn">📤 File New Claim</button>
        </div>

        <!-- Filter bar -->
        <div class="filter-bar">
          <select id="filter-type" class="form-control" style="max-width:180px">
            <option value="">All Types</option>
            <option value="car">🚗 Car</option>
            <option value="health">🏥 Health</option>
            <option value="life">💜 Life</option>
          </select>
          <select id="filter-status" class="form-control" style="max-width:200px">
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="under_review">🔍 Under Review</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        <div class="card-glass" style="padding:24px">
          <div id="claims-list">
            <div class="loading-spinner"><div class="spinner"></div><span>Loading claims...</span></div>
          </div>
        </div>
      </main>
    </div>

    <!-- Claim Detail Modal -->
    <div class="modal-overlay hidden" id="claim-modal">
      <div class="modal">
        <div class="modal-header">
          <h2>Claim Details</h2>
          <button class="modal-close" id="close-modal">✕</button>
        </div>
        <div id="modal-content"></div>
      </div>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-mount'), 'myClaims');
  document.getElementById('new-claim-btn')?.addEventListener('click', () => navigate('/claims/new'));

  let allClaims = [];

  const renderClaimsList = (claims) => {
    const list = document.getElementById('claims-list');
    if (!claims.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>No claims found</h3>
          <p>You haven't filed any claims yet, or none match your filters.</p>
          <button class="btn btn-primary mt-2" id="empty-new-btn">📤 File a Claim</button>
        </div>
      `;
      document.getElementById('empty-new-btn')?.addEventListener('click', () => navigate('/claims/new'));
      return;
    }

    list.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Policy</th>
              <th>Type</th>
              <th>Claim Amount</th>
              <th>Status</th>
              <th>OCR</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${claims.map(c => `
              <tr>
                <td>
                  <strong>${c.policy?.name || 'N/A'}</strong>
                  <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">${truncate(c.reason, 40)}</div>
                </td>
                <td><span class="badge badge-${c.policyType}">${typeIcon(c.policyType)} ${capitalize(c.policyType)}</span></td>
                <td><span style="color:var(--emerald-400);font-weight:600">₹${c.claimAmount.toLocaleString()}</span></td>
                <td><span class="badge badge-${c.status}">${statusIcon(c.status)} ${formatStatus(c.status)}</span></td>
                <td>${ocrBadge(c.ocrStatus)}</td>
                <td style="color:var(--text-muted);font-size:0.85rem">${new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                <td>
                  <button class="btn btn-ghost btn-sm view-claim" data-id="${c._id}">View →</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    list.querySelectorAll('.view-claim').forEach(btn => {
      btn.addEventListener('click', () => openClaimModal(btn.dataset.id));
    });
  };

  const openClaimModal = (claimId) => {
    const claim = allClaims.find(c => c._id === claimId);
    if (!claim) return;

    const modal = document.getElementById('claim-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
      <div class="claim-detail-row">
        <span class="claim-detail-label">Policy Name</span>
        <span class="claim-detail-value">${claim.policy?.name || 'N/A'}</span>
      </div>
      <div class="claim-detail-row">
        <span class="claim-detail-label">Insurance Type</span>
        <span class="claim-detail-value"><span class="badge badge-${claim.policyType}">${typeIcon(claim.policyType)} ${capitalize(claim.policyType)}</span></span>
      </div>
      <div class="claim-detail-row">
        <span class="claim-detail-label">Claim Amount</span>
        <span class="claim-detail-value" style="color:var(--emerald-400)">₹${claim.claimAmount.toLocaleString()}</span>
      </div>
      <div class="claim-detail-row">
        <span class="claim-detail-label">Status</span>
        <span class="claim-detail-value"><span class="badge badge-${claim.status}">${statusIcon(claim.status)} ${formatStatus(claim.status)}</span></span>
      </div>
      <div class="claim-detail-row">
        <span class="claim-detail-label">Submitted On</span>
        <span class="claim-detail-value">${new Date(claim.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
      </div>
      ${claim.reviewedAt ? `
        <div class="claim-detail-row">
          <span class="claim-detail-label">Reviewed On</span>
          <span class="claim-detail-value">${new Date(claim.reviewedAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
        </div>
      ` : ''}
      <div style="margin-top:12px">
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px">Claim Reason</div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;font-size:0.875rem;color:var(--text-secondary)">${claim.reason}</div>
      </div>
      ${claim.adminNotes ? `
        <div style="margin-top:12px">
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px">Admin Notes</div>
          <div style="background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.2);border-radius:var(--radius-md);padding:12px;font-size:0.875rem;color:var(--amber-400)">${claim.adminNotes}</div>
        </div>
      ` : ''}
      <div class="claim-detail-row" style="margin-top:8px">
        <span class="claim-detail-label">📄 OCR Status</span>
        <span class="claim-detail-value">${ocrBadge(claim.ocrStatus)}</span>
      </div>
      ${claim.ocrText ? `
        <div style="margin-top:12px">
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px">📝 Extracted Document Text (OCR)</div>
          <div style="background:rgba(99,179,237,0.04);border:1px solid var(--border-accent);border-radius:var(--radius-md);padding:14px;font-size:0.8rem;color:var(--text-secondary);max-height:200px;overflow-y:auto;white-space:pre-wrap;font-family:monospace;line-height:1.6">${claim.ocrText.slice(0, 2000)}${claim.ocrText.length > 2000 ? '\n\n[...truncated for display...]' : ''}</div>
        </div>
      ` : claim.ocrStatus === 'pending' ? `
        <div style="margin-top:12px;padding:12px;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.15);border-radius:var(--radius-md);font-size:0.85rem;color:var(--amber-400);display:flex;align-items:center;gap:8px">
          <span>⏳</span> OCR processing is in progress. The extracted text will appear here once the Azure Function completes.
        </div>
      ` : claim.ocrStatus === 'failed' ? `
        <div style="margin-top:12px;padding:12px;background:rgba(251,113,133,0.05);border:1px solid rgba(251,113,133,0.15);border-radius:var(--radius-md);font-size:0.85rem;color:var(--rose-400);display:flex;align-items:center;gap:8px">
          <span>❌</span> OCR processing failed for this document. The PDF may be scanned or image-based.
        </div>
      ` : ''}
      <a href="${claim.pdfPath}" target="_blank" rel="noopener noreferrer" class="pdf-link">
        📄 View Uploaded PDF on Azure Storage
      </a>
    `;

    modal.classList.remove('hidden');
  };

  document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('claim-modal').classList.add('hidden');
  });

  document.getElementById('claim-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'claim-modal') {
      document.getElementById('claim-modal').classList.add('hidden');
    }
  });

  // Filters
  const applyFilters = () => {
    const type = document.getElementById('filter-type').value;
    const status = document.getElementById('filter-status').value;
    let filtered = [...allClaims];
    if (type) filtered = filtered.filter(c => c.policyType === type);
    if (status) filtered = filtered.filter(c => c.status === status);
    renderClaimsList(filtered);
  };

  document.getElementById('filter-type').addEventListener('change', applyFilters);
  document.getElementById('filter-status').addEventListener('change', applyFilters);

  try {
    const res = await claimsAPI.getMy();
    allClaims = res.data.claims || [];
    renderClaimsList(allClaims);
  } catch {
    showToast('Failed to load claims.', 'error');
  }
}

function typeIcon(type) { return { car: '🚗', health: '🏥', life: '💜' }[type] || ''; }
function statusIcon(s) { return { pending: '⏳', under_review: '🔍', approved: '✅', rejected: '❌' }[s] || ''; }
function ocrBadge(s) {
  const map = {
    pending:   '<span class="badge" style="background:rgba(251,191,36,0.1);color:var(--amber-400);border:1px solid rgba(251,191,36,0.2)">⏳ Pending</span>',
    completed: '<span class="badge" style="background:rgba(52,211,153,0.1);color:var(--emerald-400);border:1px solid rgba(52,211,153,0.2)">✅ Done</span>',
    failed:    '<span class="badge" style="background:rgba(251,113,133,0.1);color:var(--rose-400);border:1px solid rgba(251,113,133,0.2)">❌ Failed</span>',
  };
  return map[s] || '<span class="badge" style="background:var(--bg-card);color:var(--text-muted)">— N/A</span>';
}
function formatStatus(s) { return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function truncate(str, n) { return str?.length > n ? str.slice(0, n) + '...' : str || ''; }
