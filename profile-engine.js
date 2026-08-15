/**
 * ============================================================================
 * TITANX ROBOTICS - UNIVERSAL USER PROFILE ENGINE (profile-engine.js)
 * High-tech Cybernetic "Your Profile" HUD Modal with Real-time Firebase Sync,
 * Avatar Rendering, Security Clearance Badges, and Account Controls.
 * ============================================================================
 */
(function () {
  'use strict';

  // Inject Profile Modal Styles if not already injected
  if (!document.getElementById('titanx-profile-styles')) {
    var style = document.createElement('style');
    style.id = 'titanx-profile-styles';
    style.textContent = [
      '/* 👤 Your Profile Cyber HUD Modal */',
      '.profile-modal-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(2, 4, 10, 0.85);',
      '  backdrop-filter: blur(14px);',
      '  -webkit-backdrop-filter: blur(14px);',
      '  z-index: 9999999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 20px;',
      '  opacity: 0;',
      '  visibility: hidden;',
      '  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;',
      '}',
      '.profile-modal-overlay.active {',
      '  opacity: 1;',
      '  visibility: visible;',
      '}',
      '.profile-card-hud {',
      '  width: 100%;',
      '  max-width: 480px;',
      '  background: rgba(8, 15, 30, 0.92);',
      '  border: 1px solid var(--border-cyan, rgba(0, 240, 255, 0.35));',
      '  border-radius: 20px;',
      '  padding: 32px 26px;',
      '  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);',
      '  position: relative;',
      '  transform: scale(0.92) translateY(20px);',
      '  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);',
      '}',
      '.profile-modal-overlay.active .profile-card-hud {',
      '  transform: scale(1) translateY(0);',
      '}',
      '.profile-close-btn {',
      '  position: absolute;',
      '  top: 16px;',
      '  right: 18px;',
      '  background: rgba(255, 255, 255, 0.08);',
      '  border: 1px solid rgba(255, 255, 255, 0.15);',
      '  color: #fff;',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  cursor: pointer;',
      '  font-size: 16px;',
      '  transition: all 0.2s ease;',
      '}',
      '.profile-close-btn:hover {',
      '  background: rgba(239, 68, 68, 0.25);',
      '  border-color: #ef4444;',
      '  color: #f87171;',
      '  transform: rotate(90deg);',
      '}',
      '.profile-avatar-wrap {',
      '  position: relative;',
      '  width: 90px;',
      '  height: 90px;',
      '  margin: 0 auto 18px;',
      '}',
      '.profile-avatar-img {',
      '  width: 100%;',
      '  height: 100%;',
      '  border-radius: 50%;',
      '  object-fit: cover;',
      '  border: 2px solid var(--neon-cyan, #00f0ff);',
      '  box-shadow: 0 0 24px rgba(0, 240, 255, 0.4);',
      '}',
      '.profile-status-dot {',
      '  position: absolute;',
      '  bottom: 4px;',
      '  right: 4px;',
      '  width: 14px;',
      '  height: 14px;',
      '  background: #10b981;',
      '  border: 2px solid #02050f;',
      '  border-radius: 50%;',
      '  box-shadow: 0 0 10px #10b981;',
      '}',
      '.profile-user-name {',
      '  font-family: var(--font-display, Orbitron);',
      '  font-size: 1.4rem;',
      '  font-weight: 700;',
      '  color: #fff;',
      '  text-align: center;',
      '  margin-bottom: 4px;',
      '}',
      '.profile-user-email {',
      '  font-family: var(--font-heading, Rajdhani);',
      '  font-size: 0.95rem;',
      '  color: var(--neon-cyan, #00f0ff);',
      '  text-align: center;',
      '  margin-bottom: 18px;',
      '}',
      '.profile-stats-grid {',
      '  display: grid;',
      '  grid-template-columns: repeat(2, 1fr);',
      '  gap: 10px;',
      '  margin-bottom: 22px;',
      '}',
      '.profile-stat-box {',
      '  background: rgba(255, 255, 255, 0.04);',
      '  border: 1px solid rgba(0, 240, 255, 0.15);',
      '  border-radius: 10px;',
      '  padding: 10px;',
      '  text-align: center;',
      '}',
      '.profile-stat-label {',
      '  font-family: var(--font-heading, Rajdhani);',
      '  font-size: 0.75rem;',
      '  text-transform: uppercase;',
      '  color: #94a3b8;',
      '  letter-spacing: 1px;',
      '}',
      '.profile-stat-val {',
      '  font-family: var(--font-display, Orbitron);',
      '  font-size: 0.95rem;',
      '  font-weight: 700;',
      '  color: #fff;',
      '  margin-top: 2px;',
      '}',
      '.profile-actions-row {',
      '  display: flex;',
      '  gap: 12px;',
      '}',
      '.profile-btn {',
      '  flex: 1;',
      '  padding: 12px 14px;',
      '  border-radius: 10px;',
      '  font-family: var(--font-heading, Rajdhani);',
      '  font-size: 0.95rem;',
      '  font-weight: 700;',
      '  letter-spacing: 0.5px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 8px;',
      '  cursor: pointer;',
      '  transition: all 0.25s ease;',
      '}',
      '.profile-btn-primary {',
      '  background: linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(168, 85, 247, 0.25));',
      '  border: 1px solid var(--neon-cyan, #00f0ff);',
      '  color: #fff;',
      '  box-shadow: 0 0 16px rgba(0, 240, 255, 0.25);',
      '}',
      '.profile-btn-primary:hover {',
      '  background: var(--neon-cyan, #00f0ff);',
      '  color: #02050f;',
      '  box-shadow: 0 0 25px rgba(0, 240, 255, 0.6);',
      '  transform: translateY(-2px);',
      '}',
      '.profile-btn-danger {',
      '  background: rgba(239, 68, 68, 0.12);',
      '  border: 1px solid rgba(239, 68, 68, 0.35);',
      '  color: #f87171;',
      '}',
      '.profile-btn-danger:hover {',
      '  background: rgba(239, 68, 68, 0.25);',
      '  border-color: #ef4444;',
      '  transform: translateY(-2px);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Create Profile Modal DOM element
  var modalEl = document.getElementById('titanxProfileModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'titanxProfileModal';
    modalEl.className = 'profile-modal-overlay';
    modalEl.innerHTML = [
      '<div class="profile-card-hud" onclick="event.stopPropagation()">',
      '  <button class="profile-close-btn" id="profileCloseBtn" aria-label="Close Profile">&times;</button>',
      '  <div class="profile-avatar-wrap">',
      '    <img src="photo1.jpeg" alt="User Avatar" class="profile-avatar-img" id="hudUserPhoto">',
      '    <div class="profile-status-dot" id="hudStatusDot"></div>',
      '  </div>',
      '  <h2 class="profile-user-name" id="hudUserName">Guest Cadet</h2>',
      '  <p class="profile-user-email" id="hudUserEmail">SESSION // LOCAL EXPLORER</p>',
      '  <div class="profile-stats-grid">',
      '    <div class="profile-stat-box">',
      '      <div class="profile-stat-label">Security Tier</div>',
      '      <div class="profile-stat-val" id="hudSecTier" style="color:var(--neon-cyan, #00f0ff)">ALPHA // LEVEL 1</div>',
      '    </div>',
      '    <div class="profile-stat-box">',
      '      <div class="profile-stat-label">Portal Access</div>',
      '      <div class="profile-stat-val" id="hudAccessStatus" style="color:#10b981">GRANTED</div>',
      '    </div>',
      '    <div class="profile-stat-box">',
      '      <div class="profile-stat-label">Core Protocol</div>',
      '      <div class="profile-stat-val">TITANX-MESH</div>',
      '    </div>',
      '    <div class="profile-stat-box">',
      '      <div class="profile-stat-label">Neural Audio</div>',
      '      <div class="profile-stat-val" style="color:#fbbf24">SYNCHRONIZED</div>',
      '    </div>',
      '  </div>',
      '  <div class="profile-actions-row">',
      '    <a href="register.html" class="profile-btn profile-btn-primary" id="hudActionBtn">&#128640; Join TitanX Core</a>',
      '    <button class="profile-btn profile-btn-danger" id="hudAuthBtn" onclick="window.TitanXProfile.handleAuthAction()">&#128274; Sign In</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    modalEl.addEventListener('click', function () {
      window.TitanXProfile.close();
    });

    document.body.appendChild(modalEl);

    document.getElementById('profileCloseBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      window.TitanXProfile.close();
    });
  }

  // Current active user state
  var currentUser = null;

  function updateHUD(user) {
    currentUser = user;
    var nameEl   = document.getElementById('hudUserName');
    var emailEl  = document.getElementById('hudUserEmail');
    var photoEl  = document.getElementById('hudUserPhoto');
    var tierEl   = document.getElementById('hudSecTier');
    var authBtn  = document.getElementById('hudAuthBtn');

    if (user) {
      if (nameEl) nameEl.textContent = user.displayName || 'TitanX Engineer';
      if (emailEl) emailEl.textContent = user.email || 'AUTHENTICATED // SECURE';
      if (photoEl) photoEl.src = user.photoURL || 'photo1.jpeg';
      if (tierEl) tierEl.textContent = 'CORE // VERIFIED';
      if (authBtn) {
        authBtn.innerHTML = '&#128682; Logout';
        authBtn.className = 'profile-btn profile-btn-danger';
      }
    } else {
      if (nameEl) nameEl.textContent = 'Guest Explorer';
      if (emailEl) emailEl.textContent = 'LOCAL PORTAL // GUEST ACCESS';
      if (photoEl) photoEl.src = 'photo1.jpeg';
      if (tierEl) tierEl.textContent = 'GUEST // CADET';
      if (authBtn) {
        authBtn.innerHTML = '&#128274; Sign In';
        authBtn.className = 'profile-btn profile-btn-primary';
      }
    }
  }

  function openModal(e) {
    if (e) e.preventDefault();
    if (modalEl) modalEl.classList.add('active');
  }

  function closeModal() {
    if (modalEl) modalEl.classList.remove('active');
  }

  // Escape key closes modal
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Global API
  window.TitanXProfile = {
    open: openModal,
    close: closeModal,
    setUser: updateHUD,
    handleAuthAction: function () {
      if (currentUser) {
        if (window.handleLogout) {
          window.handleLogout();
        } else {
          window.location.href = 'index.html';
        }
        closeModal();
      } else {
        window.location.href = 'index.html';
      }
    }
  };

  window.openProfileModal = openModal;
  window.closeProfileModal = closeModal;

})();
