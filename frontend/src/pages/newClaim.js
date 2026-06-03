import { policiesAPI, claimsAPI } from '../api/api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';
import { renderSidebar } from '../components/sidebar.js';

export async function renderNewClaim(container, params = {}) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div id="sidebar-mount"></div>
      <main class="main-content">
        <div class="page-header">
          <h1>📤 File a New Claim</h1>
          <p>Submit your insurance claim by uploading your supporting PDF documents.</p>
        </div>
        <div style="max-width:680px">
          <div class="card-glass" style="padding:32px">
            <!-- Step 1: Select Type -->
            <div id="step-1">
              <h3 style="margin-bottom:6px;font-size:1rem">Step 1 of 3: Choose Insurance Type</h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:20px">Select the type of insurance you want to file a claim for.</p>
              <div class="grid grid-3" style="gap:14px">
                <div class="type-select-card ${params.type === 'car' ? 'selected' : ''}" data-type="car" id="sel-car"
                  style="background:var(--bg-card);border:2px solid ${params.type === 'car' ? 'var(--blue-400)' : 'var(--border)'};border-radius:var(--radius-lg);padding:20px;text-align:center;cursor:pointer;transition:all 0.2s">
                  <div style="font-size:2rem;margin-bottom:8px">🚗</div>
                  <div style="font-weight:600">Car Insurance</div>
                </div>
                <div class="type-select-card ${params.type === 'health' ? 'selected' : ''}" data-type="health" id="sel-health"
                  style="background:var(--bg-card);border:2px solid ${params.type === 'health' ? 'var(--blue-400)' : 'var(--border)'};border-radius:var(--radius-lg);padding:20px;text-align:center;cursor:pointer;transition:all 0.2s">
                  <div style="font-size:2rem;margin-bottom:8px">🏥</div>
                  <div style="font-weight:600">Health Insurance</div>
                </div>
                <div class="type-select-card ${params.type === 'life' ? 'selected' : ''}" data-type="life" id="sel-life"
                  style="background:var(--bg-card);border:2px solid ${params.type === 'life' ? 'var(--blue-400)' : 'var(--border)'};border-radius:var(--radius-lg);padding:20px;text-align:center;cursor:pointer;transition:all 0.2s">
                  <div style="font-size:2rem;margin-bottom:8px">💜</div>
                  <div style="font-weight:600">Life Insurance</div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Step 2: Select Policy -->
            <div id="step-2">
              <h3 style="margin-bottom:6px;font-size:1rem">Step 2 of 3: Select Policy</h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:16px">Choose the specific policy you want to file a claim against.</p>
              <div id="policy-select-container">
                <p style="color:var(--text-muted);font-size:0.875rem">← Select an insurance type first</p>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Step 3: Claim Details + Upload -->
            <div id="step-3">
              <h3 style="margin-bottom:6px;font-size:1rem">Step 3 of 3: Claim Details & Document Upload</h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:20px">Provide claim details and upload your supporting PDF document.</p>
              
              <form id="claim-form">
                <div class="form-group">
                  <label class="form-label" for="claim-amount">Claim Amount (₹)</label>
                  <input type="number" id="claim-amount" class="form-control" placeholder="e.g. 50000" min="1" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="claim-reason">Reason for Claim</label>
                  <textarea id="claim-reason" class="form-control" rows="4" 
                    placeholder="Describe the incident or reason for your claim in detail..." required></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Supporting Document (PDF only)</label>
                  <div class="upload-zone" id="upload-zone">
                    <input type="file" id="pdf-input" accept=".pdf,application/pdf" />
                    <div class="upload-icon">📄</div>
                    <p><strong>Click to upload</strong> or drag and drop your PDF</p>
                    <p class="upload-hint">Maximum file size: 10MB • PDF files only</p>
                  </div>
                  <div id="file-preview" class="hidden" style="margin-top:10px;padding:12px 16px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:var(--radius-md);display:flex;align-items:center;gap:10px">
                    <span>📄</span>
                    <span id="file-name" style="font-size:0.875rem;color:var(--emerald-400)"></span>
                    <button type="button" id="remove-file" style="margin-left:auto;background:none;border:none;color:var(--rose-400);cursor:pointer;font-size:1rem">✕</button>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full" id="submit-claim-btn" disabled>
                  📤 Submit Claim
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  renderSidebar(document.getElementById('sidebar-mount'), 'newClaim');

  let selectedType = params.type || null;
  let selectedPolicyId = params.policyId || null;

  const updateTypeCards = (type) => {
    document.querySelectorAll('.type-select-card').forEach(el => {
      el.style.borderColor = el.dataset.type === type ? 'var(--blue-400)' : 'var(--border)';
      el.style.background = el.dataset.type === type ? 'rgba(59,130,246,0.08)' : 'var(--bg-card)';
    });
  };

  const loadPolicies = async (type) => {
    const container = document.getElementById('policy-select-container');
    container.innerHTML = `<div class="loading-spinner" style="padding:20px"><div class="spinner"></div></div>`;

    try {
      const res = await policiesAPI.getByType(type);
      const policies = res.data.policies || [];

      container.innerHTML = `
        <select id="policy-select" class="form-control">
          <option value="">-- Select a policy --</option>
          ${policies.map(p => `<option value="${p._id}" data-coverage="${p.coverage}">${p.name} (Coverage: ₹${p.coverage.toLocaleString()})</option>`).join('')}
        </select>
      `;

      const policySelect = document.getElementById('policy-select');
      if (params.policyId) {
        policySelect.value = params.policyId;
        selectedPolicyId = params.policyId;
        checkFormReady();
      }

      policySelect.addEventListener('change', () => {
        selectedPolicyId = policySelect.value;
        checkFormReady();
      });
    } catch {
      container.innerHTML = `<p style="color:var(--rose-400)">Failed to load policies.</p>`;
    }
  };

  const checkFormReady = () => {
    const btn = document.getElementById('submit-claim-btn');
    const policySelected = selectedPolicyId && selectedPolicyId !== '';
    btn.disabled = !(selectedType && policySelected);
  };

  // Type selection
  document.querySelectorAll('.type-select-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedType = card.dataset.type;
      selectedPolicyId = null;
      updateTypeCards(selectedType);
      loadPolicies(selectedType);
      checkFormReady();
    });
  });

  if (selectedType) {
    updateTypeCards(selectedType);
    await loadPolicies(selectedType);
    checkFormReady();
  }

  // File upload
  const uploadZone = document.getElementById('upload-zone');
  const pdfInput = document.getElementById('pdf-input');
  const filePreview = document.getElementById('file-preview');
  const fileNameEl = document.getElementById('file-name');
  let selectedFile = null;

  uploadZone.addEventListener('click', () => pdfInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  pdfInput.addEventListener('change', () => handleFile(pdfInput.files[0]));

  document.getElementById('remove-file')?.addEventListener('click', () => {
    selectedFile = null;
    pdfInput.value = '';
    filePreview.classList.add('hidden');
    uploadZone.classList.remove('hidden');
  });

  function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed!', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB!', 'error');
      return;
    }
    selectedFile = file;
    fileNameEl.textContent = file.name;
    filePreview.classList.remove('hidden');
    uploadZone.classList.add('hidden');
    showToast(`PDF selected: ${file.name}`, 'success');
  }

  // Form submit
  document.getElementById('claim-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedType || !selectedPolicyId) {
      showToast('Please select an insurance type and policy.', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Please upload a PDF document.', 'error');
      return;
    }

    const btn = document.getElementById('submit-claim-btn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Submitting...';

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('policyId', selectedPolicyId);
    formData.append('claimAmount', document.getElementById('claim-amount').value);
    formData.append('reason', document.getElementById('claim-reason').value);

    try {
      await claimsAPI.submit(formData);
      showToast('Claim submitted successfully! 🎉', 'success');
      navigate('/claims');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit claim.', 'error');
      btn.disabled = false;
      btn.innerHTML = '📤 Submit Claim';
    }
  });
}
