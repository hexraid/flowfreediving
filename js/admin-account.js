// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Admin Account Management Logic
// ═══════════════════════════════════════════════

import { 
  onAdminAuthStateChanged, 
  getCurrentAdminProfile, 
  updateAdminProfile, 
  changeAdminPassword,
  logoutAdmin 
} from './firebase-service.js';

let currentUser = null;

// Auth Guard & Info Initializer
onAdminAuthStateChanged(async (user) => {
  const hasSession = sessionStorage.getItem('flow_admin_auth') === 'true';

  if (!user || !hasSession) {
    sessionStorage.removeItem('flow_admin_auth');
    window.location.replace('admin-login.html');
    return;
  }

  currentUser = user;
  sessionStorage.setItem('flow_admin_auth', 'true');
  document.body.style.opacity = '1';

  try {
    await loadAdminProfileInfo();
  } catch (err) {
    console.warn('[Admin Account] Error loading profile:', err);
  }

  bindAccountEvents();
});

// Profile Loading Function
async function loadAdminProfileInfo() {
  if (!currentUser) return;

  const profile = await getCurrentAdminProfile(currentUser);
  
  const idInput = document.getElementById('accIdInput');
  const nameInput = document.getElementById('accNameInput');
  const emailInput = document.getElementById('accEmailInput');
  const roleBadge = document.getElementById('accRoleBadgeText');
  const displayEmail = document.getElementById('displayEmailText');

  const avatarEl = document.getElementById('adminUserAvatar');
  const nameEl = document.getElementById('adminUserName');
  const roleInfoEl = document.getElementById('adminUserRoleInfo');

  const adminName = profile && profile.name ? profile.name : '관리자';
  const adminId = profile && profile.adminId ? profile.adminId : (currentUser.email ? currentUser.email.split('@')[0] : 'admin');
  const adminEmail = profile && profile.email ? profile.email : (currentUser.email || '');
  const adminRole = profile && profile.role ? profile.role : '관리자';

  if (idInput) idInput.value = adminId;
  if (nameInput) nameInput.value = adminName;
  if (emailInput) emailInput.value = adminEmail;
  if (roleBadge) roleBadge.textContent = adminRole;
  if (displayEmail) displayEmail.textContent = adminEmail;

  // Sidebar profile info update
  if (avatarEl) avatarEl.textContent = adminName.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = adminName;
  if (roleInfoEl) roleInfoEl.textContent = `@${adminId} · ${adminRole}`;
}

// Event Bindings
function bindAccountEvents() {
  const profileForm = document.getElementById('accProfileForm');
  const saveBtn = document.getElementById('saveProfileBtn');
  const profileMsg = document.getElementById('profileMsg');

  const changePwForm = document.getElementById('changePwForm');
  const changePwBtn = document.getElementById('changePwBtn');
  const changePwMsg = document.getElementById('changePwMsg');

  const sendPwResetBtn = document.getElementById('accSendPwResetBtn');
  const pwMsg = document.getElementById('pwMsg');

  const mainLogoutBtn = document.getElementById('accMainLogoutBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const popoverLogoutBtn = document.getElementById('popoverLogoutBtn');

  const sidebarUserEl = document.getElementById('adminSidebarUser');
  const popoverMenu = document.getElementById('userPopoverMenu');

  // 1. 프로필 정보 수정 폼 제출
  if (profileForm && !profileForm.dataset.bound) {
    profileForm.dataset.bound = 'true';
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      profileMsg.style.display = 'none';
      profileMsg.className = 'acc-msg';

      const nameVal = document.getElementById('accNameInput').value.trim();
      const emailVal = document.getElementById('accEmailInput').value.trim();

      if (!nameVal || !emailVal) {
        profileMsg.textContent = '이름과 이메일을 모두 입력해주세요.';
        profileMsg.className = 'acc-msg acc-msg--error';
        profileMsg.style.display = 'block';
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = '저장 중...';

      try {
        await updateAdminProfile(currentUser, { name: nameVal, email: emailVal });
        await loadAdminProfileInfo();

        profileMsg.textContent = '관리자 정보가 저장되었습니다.';
        profileMsg.className = 'acc-msg acc-msg--success';
        profileMsg.style.display = 'block';
      } catch (err) {
        console.error('[Admin Profile Save Error Details]', err);
        let msg = '관리자 정보 저장 중 오류가 발생했습니다.';

        if (err.code === 'custom/invalid-name') {
          msg = '관리자 이름을 입력해주세요.';
        } else if (err.code === 'custom/invalid-email') {
          msg = '등록 이메일을 입력해주세요.';
        } else if (err.code === 'auth/requires-recent-login' || (err.message && err.message.includes('다시 로그인'))) {
          msg = '이메일 변경을 위해 보안상 로그아웃 후 다시 로그인해주세요.';
        } else if (err.code === 'auth/invalid-email' || (err.message && err.message.includes('형식이 올바르지 않습니다'))) {
          msg = '이메일 형식이 올바르지 않습니다.';
        } else if (err.code === 'auth/email-already-in-use') {
          msg = '이미 사용 중인 이메일입니다.';
        } else if (err.message) {
          msg = err.message;
        }

        profileMsg.textContent = msg;
        profileMsg.className = 'acc-msg acc-msg--error';
        profileMsg.style.display = 'block';
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '저장하기';
      }
    });
  }

  // 2. 비밀번호 직접 변경 폼 제출
  if (changePwForm && !changePwForm.dataset.bound) {
    changePwForm.dataset.bound = 'true';
    changePwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      changePwMsg.style.display = 'none';
      changePwMsg.className = 'acc-msg';

      const currentPwInput = document.getElementById('currentPwInput');
      const newPwInput = document.getElementById('newPwInput');
      const confirmPwInput = document.getElementById('confirmPwInput');

      const currentPw = currentPwInput.value;
      const newPw = newPwInput.value;
      const confirmPw = confirmPwInput.value;

      if (!currentPw) {
        changePwMsg.textContent = '기존 비밀번호가 올바르지 않습니다.';
        changePwMsg.className = 'acc-msg acc-msg--error';
        changePwMsg.style.display = 'block';
        return;
      }

      if (!newPw || !confirmPw) {
        changePwMsg.textContent = '변경할 비밀번호를 입력해주세요.';
        changePwMsg.className = 'acc-msg acc-msg--error';
        changePwMsg.style.display = 'block';
        return;
      }

      if (newPw !== confirmPw) {
        changePwMsg.textContent = '새 비밀번호가 일치하지 않습니다.';
        changePwMsg.className = 'acc-msg acc-msg--error';
        changePwMsg.style.display = 'block';
        return;
      }

      if (newPw.length < 6) {
        changePwMsg.textContent = '새 비밀번호는 6자리 이상이어야 합니다.';
        changePwMsg.className = 'acc-msg acc-msg--error';
        changePwMsg.style.display = 'block';
        return;
      }

      changePwBtn.disabled = true;
      changePwBtn.textContent = '변경 중...';

      try {
        await changeAdminPassword(currentUser, currentPw, newPw);

        changePwMsg.textContent = '비밀번호가 변경되었습니다.';
        changePwMsg.className = 'acc-msg acc-msg--success';
        changePwMsg.style.display = 'block';

        // 변경 성공 후 3개 입력 필드 비우기
        currentPwInput.value = '';
        newPwInput.value = '';
        confirmPwInput.value = '';
      } catch (err) {
        console.warn('[Change Password Error]', err);
        let msg = '비밀번호 변경 중 오류가 발생했습니다.';
        if (
          err.code === 'auth/wrong-password' || 
          err.code === 'auth/invalid-credential' ||
          (err.message && err.message.includes('기존 비밀번호가 올바르지 않습니다'))
        ) {
          msg = '기존 비밀번호가 올바르지 않습니다.';
        } else if (err.code === 'auth/weak-password' || (err.message && err.message.includes('6자리 이상'))) {
          msg = '새 비밀번호는 6자리 이상이어야 합니다.';
        }
        changePwMsg.textContent = msg;
        changePwMsg.className = 'acc-msg acc-msg--error';
        changePwMsg.style.display = 'block';
      } finally {
        changePwBtn.disabled = false;
        changePwBtn.textContent = '비밀번호 변경';
      }
    });
  }



  // 4. 로그아웃 핸들러
  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await logoutAdmin();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    window.location.replace('admin-login.html');
  };

  if (mainLogoutBtn && !mainLogoutBtn.dataset.bound) {
    mainLogoutBtn.dataset.bound = 'true';
    mainLogoutBtn.addEventListener('click', handleLogout);
  }
  if (logoutBtn && !logoutBtn.dataset.bound) {
    logoutBtn.dataset.bound = 'true';
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (popoverLogoutBtn && !popoverLogoutBtn.dataset.bound) {
    popoverLogoutBtn.dataset.bound = 'true';
    popoverLogoutBtn.addEventListener('click', handleLogout);
  }

  // 5. 사이드바 프로필 팝업 메뉴 토글
  if (sidebarUserEl && !sidebarUserEl.dataset.bound) {
    sidebarUserEl.dataset.bound = 'true';
    sidebarUserEl.addEventListener('click', (e) => {
      if (e.target.closest('#logoutBtn')) return;
      if (popoverMenu) {
        popoverMenu.style.display = popoverMenu.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (popoverMenu && sidebarUserEl && !sidebarUserEl.contains(e.target)) {
        popoverMenu.style.display = 'none';
      }
    });
  }
}

