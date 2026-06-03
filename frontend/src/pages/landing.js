import { navigate } from '../router.js';

export function renderLanding(container) {
  container.innerHTML = `
    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="hero-text fade-in-up">
          <div class="hero-badge">
            <span>🛡️</span> Trusted by 50,000+ Customers
          </div>
          <h1 class="hero-title">
            Insurance That
            <span class="gradient-text">Protects</span>
            What Matters Most
          </h1>
          <p class="hero-subtitle">
            Get comprehensive coverage for your car, health, and life. 
            File claims effortlessly by uploading PDF documents — we handle the rest.
          </p>
          <div class="hero-buttons">
            <button class="btn btn-primary btn-lg" id="hero-get-started">
              🚀 Get Started Free
            </button>
            <button class="btn btn-outline btn-lg" id="hero-view-policies">
              📋 View Policies
            </button>
          </div>
          <div class="hero-stats">
            <div>
              <div class="hero-stat-value">₹500Cr+</div>
              <div class="hero-stat-label">Claims Settled</div>
            </div>
            <div style="width:1px;background:var(--border)"></div>
            <div>
              <div class="hero-stat-value">99.2%</div>
              <div class="hero-stat-label">Claim Approval</div>
            </div>
            <div style="width:1px;background:var(--border)"></div>
            <div>
              <div class="hero-stat-value">24/7</div>
              <div class="hero-stat-label">Digital Support</div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-cards-stack">
            <div class="hero-insurance-card">
              <div class="hero-card-icon" style="background:rgba(59,130,246,0.15)">🚗</div>
              <div>
                <div class="hero-card-title">Car Insurance</div>
                <div class="hero-card-sub">From ₹4,999/year • 3 plans</div>
              </div>
              <span class="badge badge-car" style="margin-left:auto">Active</span>
            </div>
            <div class="hero-insurance-card">
              <div class="hero-card-icon" style="background:rgba(52,211,153,0.15)">🏥</div>
              <div>
                <div class="hero-card-title">Health Insurance</div>
                <div class="hero-card-sub">From ₹5,999/year • 3 plans</div>
              </div>
              <span class="badge badge-health" style="margin-left:auto">Active</span>
            </div>
            <div class="hero-insurance-card">
              <div class="hero-card-icon" style="background:rgba(167,139,250,0.15)">💜</div>
              <div>
                <div class="hero-card-title">Life Insurance</div>
                <div class="hero-card-sub">From ₹7,999/year • 3 plans</div>
              </div>
              <span class="badge badge-life" style="margin-left:auto">Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- INSURANCE TYPES SECTION -->
    <section class="insurance-types-section">
      <div class="container">
        <div class="text-center mb-4">
          <div class="section-tag">Our Coverage</div>
          <h2 class="section-title">Three Types of Protection</h2>
          <p class="section-subtitle" style="margin:0 auto">
            Comprehensive insurance solutions tailored to every stage of your life.
          </p>
        </div>
        <div class="grid grid-3 mt-3">
          <div class="type-card" id="type-car">
            <span class="type-icon">🚗</span>
            <h3>Car Insurance</h3>
            <p>Protect your vehicle against accidents, theft, natural disasters, and third-party liabilities with our flexible car coverage plans.</p>
            <div class="type-card-footer">
              <span>From ₹4,999/yr</span>
              <span>Coverage up to ₹15L</span>
            </div>
          </div>
          <div class="type-card" id="type-health">
            <span class="type-icon">🏥</span>
            <h3>Health Insurance</h3>
            <p>Secure your medical future with plans covering hospitalization, critical illness, maternity, and preventive healthcare benefits.</p>
            <div class="type-card-footer">
              <span>From ₹5,999/yr</span>
              <span>Coverage up to ₹50L</span>
            </div>
          </div>
          <div class="type-card" id="type-life">
            <span class="type-icon">💜</span>
            <h3>Life Insurance</h3>
            <p>Ensure your family's financial security with term plans, endowment policies, and market-linked investment options.</p>
            <div class="type-card-footer">
              <span>From ₹7,999/yr</span>
              <span>Coverage up to ₹3Cr</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="features-section">
      <div class="container">
        <div class="grid grid-2" style="align-items:center;gap:60px">
          <div>
            <div class="section-tag">Why Choose Us</div>
            <h2 class="section-title">Claims Made Simple</h2>
            <p class="section-subtitle mb-3">
              Our digital-first approach makes filing insurance claims as simple as uploading a PDF document.
            </p>
            <div style="display:flex;flex-direction:column;gap:20px">
              <div class="feature-card">
                <div class="feature-icon">📄</div>
                <div>
                  <h3>PDF Document Upload</h3>
                  <p>Simply upload your supporting documents as PDF files. No physical paperwork required.</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <div>
                  <h3>Fast Processing</h3>
                  <p>Claims are reviewed within 48-72 hours. Track status in real-time from your dashboard.</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <div>
                  <h3>Secure & Encrypted</h3>
                  <p>Your documents and personal data are protected with enterprise-grade security and encryption.</p>
                </div>
              </div>
              <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div>
                  <h3>Real-Time Tracking</h3>
                  <p>Monitor every stage of your claim — from submission to approval — in your personal dashboard.</p>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="card" style="border-color:rgba(59,130,246,0.2)">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span style="font-size:1.5rem">📤</span>
                <strong>Submit a Claim</strong>
                <span class="badge badge-pending" style="margin-left:auto">Step 1</span>
              </div>
              <p style="font-size:0.875rem;color:var(--text-secondary)">Select your policy, enter claim details, and upload PDF documents</p>
            </div>
            <div class="card" style="border-color:rgba(167,139,250,0.2)">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span style="font-size:1.5rem">🔍</span>
                <strong>Under Review</strong>
                <span class="badge badge-under_review" style="margin-left:auto">Step 2</span>
              </div>
              <p style="font-size:0.875rem;color:var(--text-secondary)">Our team reviews your documents and verifies the claim details</p>
            </div>
            <div class="card" style="border-color:rgba(52,211,153,0.2)">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                <span style="font-size:1.5rem">✅</span>
                <strong>Approved & Paid</strong>
                <span class="badge badge-approved" style="margin-left:auto">Step 3</span>
              </div>
              <p style="font-size:0.875rem;color:var(--text-secondary)">Approved claims are processed and payment is initiated immediately</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-inner">
          <h2 class="cta-title">Ready to Get Protected?</h2>
          <p class="cta-subtitle">Join thousands of customers who trust Mono Insurance for their financial security.</p>
          <button class="btn btn-primary btn-lg" id="cta-register">
            🛡️ Create Free Account
          </button>
        </div>
      </div>
    </section>
  `;

  // Bind events
  document.getElementById('hero-get-started')?.addEventListener('click', () => navigate('/register'));
  document.getElementById('hero-view-policies')?.addEventListener('click', () => navigate('/policies'));
  document.getElementById('cta-register')?.addEventListener('click', () => navigate('/register'));

  document.getElementById('type-car')?.addEventListener('click', () => navigate('/policies?type=car'));
  document.getElementById('type-health')?.addEventListener('click', () => navigate('/policies?type=health'));
  document.getElementById('type-life')?.addEventListener('click', () => navigate('/policies?type=life'));
}
