// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Premium Admin CMS Logic
// ═══════════════════════════════════════════════

import { DataService } from './data-service.js';
import { onAdminAuthStateChanged, logoutAdmin, getCurrentAdminProfile } from './firebase-service.js';

let isInitialized = false;

// ─── Firebase Auth Guard ───
onAdminAuthStateChanged((user) => {
  const hasSession = sessionStorage.getItem('flow_admin_auth') === 'true';

  if (!user || !hasSession) {
    sessionStorage.removeItem('flow_admin_auth');
    window.location.replace('admin-login.html');
  } else {
    sessionStorage.setItem('flow_admin_auth', 'true');

    // 관리자 프로필 정보 동적 반영
    getCurrentAdminProfile(user).then((profile) => {
      const avatarEl = document.getElementById('adminUserAvatar');
      const nameEl = document.getElementById('adminUserName');
      const roleInfoEl = document.getElementById('adminUserRoleInfo');

      const nameText = profile && profile.name ? profile.name : '관리자';
      const adminIdText = profile && profile.adminId ? profile.adminId : (user.email ? user.email.split('@')[0] : 'admin');
      const roleText = profile && profile.role ? profile.role : '관리자';

      if (avatarEl) {
        avatarEl.textContent = nameText.charAt(0).toUpperCase();
      }
      if (nameEl) {
        nameEl.textContent = nameText;
      }
      if (roleInfoEl) {
        roleInfoEl.textContent = `@${adminIdText} · ${roleText}`;
      }
    }).catch((err) => {
      console.warn('[Admin Profile] Failed to load profile details:', err);
    });

    // Bind logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = 'true';
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await logoutAdmin();
        } catch (err) {
          console.warn('Logout error:', err);
        }
        window.location.replace('admin-login.html');
      });
    }

    // Bind sidebar user profile click popover
    const sidebarUserEl = document.getElementById('adminSidebarUser');
    const popoverMenu = document.getElementById('userPopoverMenu');
    const popoverLogoutBtn = document.getElementById('popoverLogoutBtn');

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

    if (popoverLogoutBtn && !popoverLogoutBtn.dataset.bound) {
      popoverLogoutBtn.dataset.bound = 'true';
      popoverLogoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await logoutAdmin();
        } catch (err) {
          console.warn('Popover logout error:', err);
        }
        window.location.replace('admin-login.html');
      });
    }

    if (!isInitialized) {
      isInitialized = true;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    }
  }
});

// ─── State ───
let currentPanel = 'dashboard';
let adminData = {};

const defaultLogs = [
  { desc: '팝업 노출 순서 변경', time: '8월 16일 18:12', user: 'admin' },
  { desc: '팝업 \'여름 프리다이빙 할인 이벤트\' 정보 수정', time: '8월 16일 17:20', user: 'admin' },
  { desc: '팝업 \'7월 교육 마감 임박 안내\' 정보 수정', time: '8월 16일 17:20', user: 'admin' },
  { desc: '교육과정 \'원데이 클래스\' 내용 수정', time: '8월 16일 16:45', user: 'admin' },
  { desc: '후기 \'원데이 클래스 후기\' 내용 수정', time: '8월 16일 15:33', user: 'admin' }
];

// ─── Init ───
async function init() {
  try {
    // Load all data
    adminData = {
      hero: await DataService.getHero(),
      whyFlow: await DataService.getWhyFlow(),
      programs: await DataService.getPrograms(),
      instructors: await DataService.getInstructors(),
      reviews: await DataService.getReviews(),
      reviewSettings: await DataService.getReviewSettings(),
      gallery: await DataService.getGallery(),
      faq: await DataService.getFAQ(),
      footer: await DataService.getFooter(),
      links: await DataService.getLinks(),
      seo: await DataService.getSEO(),
      headerNav: await DataService.getHeaderNav(),
      courseFinder: await DataService.getCourseFinder(),
      galleryCategories: await DataService.getGalleryCategories(),
      popup: await DataService.getPopup()
    };

    // Auto-migrate single-object popup to array
    if (!Array.isArray(adminData.popup)) {
      adminData.popup = [
        {
          id: 'popup-1',
          title: '여름 프리다이빙 할인 이벤트',
          desc: '여름 시즌 한정! 레벨 1 교육 10% 할인 혜택을 놓치지 마세요.',
          image: 'images/gallery-1.jpg',
          link: 'https://flowfreediving.kr/programs/level1',
          startDate: '2026-07-01',
          endDate: '2026-08-31',
          enabled: true,
          priority: 1,
          target: 'all',
          views: 742,
          clicks: 124,
          createdAt: '2026-06-25 14:20',
          updatedAt: '2026-06-28 10:30',
          useDismiss: true,
          dismissText: '오늘 하루 보지 않기'
        },
        {
          id: 'popup-2',
          title: '7월 교육 마감 임박 안내',
          desc: '7월 레벨 1 교육이 곧 마감됩니다. 서둘러 신청해주세요!',
          image: 'images/gallery-2.jpg',
          link: 'https://flowfreediving.kr/programs/level1',
          startDate: '2026-07-01',
          endDate: '2026-07-15',
          enabled: true,
          priority: 2,
          target: 'all',
          views: 506,
          clicks: 79,
          createdAt: '2026-06-26 09:15',
          updatedAt: '2026-06-26 09:15',
          useDismiss: true,
          dismissText: '오늘 하루 보지 않기'
        },
        {
          id: 'popup-3',
          title: '원데이 체험 이벤트',
          desc: '처음이어도 괜찮아요! 원데이 체험으로 프리다이빙을 경험해보세요.',
          image: 'images/gallery-3.jpg',
          link: 'https://flowfreediving.kr/programs/oneday',
          startDate: '2026-06-20',
          endDate: '2026-12-31',
          enabled: false,
          priority: 3,
          target: 'all',
          views: 0,
          clicks: 0,
          createdAt: '2026-06-18 11:00',
          updatedAt: '2026-06-19 15:40',
          useDismiss: true,
          dismissText: '다시 보지 않기'
        },
        {
          id: 'popup-4',
          title: '수중 촬영 서비스 안내',
          desc: '교육 및 투어 중 생생한 수중 촬영 서비스를 제공합니다.',
          image: 'images/gallery-4.jpg',
          link: '',
          startDate: '2026-06-01',
          endDate: '2026-12-31',
          enabled: false,
          priority: 4,
          target: 'all',
          views: 0,
          clicks: 0,
          createdAt: '2026-05-28 16:30',
          updatedAt: '2026-05-28 16:30',
          useDismiss: false,
          dismissText: '오늘 하루 보지 않기'
        }
      ];
      await DataService.updatePopup(adminData.popup);
    }

    // '키즈 프리다이빙' -> '유스 프리다이빙' 자동 마이그레이션 (운영 명칭 표준화)
    if (adminData.programs && Array.isArray(adminData.programs)) {
      let progChanged = false;
      adminData.programs.forEach(p => {
        if (p.title === '키즈 프리다이빙') {
          p.title = '유스 프리다이빙';
          progChanged = true;
        }
      });
      if (progChanged) {
        await DataService.updatePrograms(adminData.programs);
      }
    }

    if (adminData.reviews && Array.isArray(adminData.reviews)) {
      let revChanged = false;
      adminData.reviews.forEach(r => {
        if (r.course === '키즈 프리다이빙') {
          r.course = '유스 프리다이빙';
          revChanged = true;
        }
      });
      if (revChanged) {
        await DataService.updateReviews(adminData.reviews);
      }
    }

    // Init navigation
    initNav();

    // Init Mobile Drawer
    initMobileDrawer();

    // Restore program filters from sessionStorage
    const savedSearch = sessionStorage.getItem('flow_cms_filter_search');
    const savedCat = sessionStorage.getItem('flow_cms_filter_cat');
    const savedVis = sessionStorage.getItem('flow_cms_filter_vis');
    const savedSort = sessionStorage.getItem('flow_cms_filter_sort');

    const searchInput = document.getElementById('searchProgName');
    const catFilter = document.getElementById('filterProgCategory');
    const visFilter = document.getElementById('filterProgVisible');
    const sortFilter = document.getElementById('sortProg');
    const clearBtn = document.getElementById('clearSearchBtn');
    const searchForm = document.getElementById('programsSearchForm');

    if (savedSearch !== null && searchInput) {
      searchInput.value = savedSearch;
      if (clearBtn) clearBtn.style.display = savedSearch ? 'block' : 'none';
    }
    if (savedCat !== null && catFilter) catFilter.value = savedCat;
    if (savedVis !== null && visFilter) visFilter.value = savedVis;
    if (savedSort !== null && sortFilter) sortFilter.value = savedSort;

    // Bind routing listener
    window.addEventListener('hashchange', handleRouting);
    initAdminKeyboardNav();

    // Trigger initial routing
    handleRouting();

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        confirmReset();
      });
    }

    // Backup status download trigger
    document.getElementById('backupBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      exportBackupData();
    });

    // Restore button trigger
    const restoreBtn = document.getElementById('restoreBtn');
    const restoreFileInput = document.getElementById('restoreFile');
    if (restoreBtn && restoreFileInput) {
      restoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        restoreFileInput.click();
      });
      restoreFileInput.addEventListener('change', handleRestoreFile);
    }

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.loadPrograms();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (clearBtn) {
          clearBtn.style.display = searchInput.value ? 'block' : 'none';
        }
        window.loadPrograms();
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          window.clearSearchQuery();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.clearSearchQuery();
      });
    }

    if (catFilter) catFilter.addEventListener('change', () => window.loadPrograms());
    if (visFilter) visFilter.addEventListener('change', () => window.loadPrograms());
    if (sortFilter) sortFilter.addEventListener('change', () => window.loadPrograms());

    // Apply programs order button
    const applyBtn = document.getElementById('applyProgramsOrderBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', applyProgramsOrder);
    }
  } catch (error) {
    console.error('[FLOW CMS] Initialization failed:', error);
  } finally {
    // Fade-in the body since initial layout routing is fully complete
    document.body.style.opacity = '1';
  }
}

// ─── Navigation ───
function initNav() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      window.location.hash = '#' + panel;
    });
  });
}

function renderPanel(name) {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('is-active'));
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('is-active');

  // Update title & subtitle matching design mockup
  const titles = {
    dashboard: '대시보드', hero: '메인 Hero 관리', whyflow: 'WHY FLOW 관리',
    programs: '교육과정 관리', instructors: '강사 관리', reviews: '후기 관리',
    gallery: '갤러리 관리', popup: '팝업 관리', faq: 'FAQ 관리', footer: 'Footer 관리',
    links: '연동 서비스', seo: '설정', settings: '설정'
  };
  const subtitles = {
    dashboard: '사이트 운영 현황과 연동 서비스 상태를 한눈에 확인하세요.',
    hero: '메인 페이지 최상단 히어로 배너의 문구 및 미디어를 설정합니다.',
    whyflow: 'FLOW 프리다이빙의 특별한 4가지 강점 가치 카드를 관리합니다.',
    programs: '제공 중인 교육과정을 등록하고 수정합니다.',
    instructors: '강사진 프로필 사진, 역할, 소개글 및 자격 사항을 편집합니다.',
    reviews: '수강생들이 작성한 생생한 강습 후기 목록을 관리합니다.',
    gallery: '갤러리 섹션에 표시할 생생한 수중 교육 사진들을 등록합니다.',
    popup: '홈페이지에 게재할 이벤트 팝업 창의 이미지와 상태를 관리합니다.',
    faq: '고객들이 자주 묻는 질문(FAQ)의 답변 리스트를 구축합니다.',
    footer: '회사 소개 글귀, 하단 사업자 정보 및 공식 SNS 링크 채널을 변경합니다.',
    links: '메인 페이지 예약 버튼 및 상담 채널과 연동될 타사 API 링크를 지정합니다.',
    seo: '사이트 전체 기본 설정 및 검색엔진(SEO) 메타 데이터를 통합 관리합니다.',
    settings: '사이트 전체 기본 설정 및 검색엔진(SEO) 메타 데이터를 통합 관리합니다.'
  };

  document.getElementById('panelTitle').textContent = titles[name] || '';
  document.getElementById('panelSubtitle').textContent = subtitles[name] || '';

  // 3-1. Header action buttons conditional visibility
  const analyticsBtn = document.getElementById('headerAnalyticsBtn');
  if (analyticsBtn) {
    analyticsBtn.style.display = (name === 'dashboard') ? 'inline-flex' : 'none';
  }

  // Render panel content
  switch (name) {
    case 'dashboard': loadDashboard(); break;
    case 'hero': loadHero(); break;
    case 'whyflow': loadWhyFlow(); break;
    case 'programs': loadPrograms(); break;
    case 'instructors': loadInstructors(); break;
    case 'reviews': loadReviews(); break;
    case 'gallery': loadGallery(); break;
    case 'faq': loadFaq(); break;
    case 'popup': loadPopup(); break;
    case 'footer': loadFooter(); break;
    case 'links': loadLinks(); break;
    case 'seo': loadSeo(); break;
  }
}

// ─── Toast ───
function showToast(msg = '저장되었습니다.') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 2000);
}

// ─── Mobile Drawer ───
function initMobileDrawer() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!toggleBtn || !sidebar || !overlay) return;

  function toggleDrawer() {
    toggleBtn.classList.toggle('is-active');
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible');
  }

  function closeDrawer() {
    toggleBtn.classList.remove('is-active');
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  }

  toggleBtn.addEventListener('click', toggleDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', closeDrawer);
  });
}

// ─── CMS Reset Safety Confirm ───
function confirmReset() {
  openSafetyModal({
    title: 'CMS 전체 데이터를 초기화하시겠습니까?',
    desc: '관리자에서 수정한 모든 콘텐츠가 초기 기본값으로 변경됩니다. 초기화 직전 현재 상태가 백업 파일로 자동 다운로드됩니다.',
    confirmText: '전체 데이터 초기화',
    isDanger: true,
    onConfirm: async () => {
      // 1. 자동 백업 실행 (다운로드)
      exportBackupData();

      // 2. 초기화 실행
      await DataService.resetAll();
      localStorage.removeItem('flow_admin_logs');
      showToast('CMS 전체 데이터가 초기 기본값으로 변경되었습니다.');

      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  });
}

// ─── CMS Restore Handler ───
function handleRestoreFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (evt) {
    try {
      const data = JSON.parse(evt.target.result);

      // 기본 형태 검증
      if (!data.programs || !data.faq || !data.instructors) {
        throw new Error('올바른 FLOW CMS 백업 파일 형식이 아닙니다.');
      }

      DataService.importAll(evt.target.result);
      writeAdminLog('JSON 백업본에서 전체 데이터 복원 완료');
      showToast('데이터 복원이 완료되었습니다. 페이지를 새로고침합니다.');

      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('복원 실패: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reset file input
}

// ─── Action Log Writer ───
function writeAdminLog(desc) {
  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem('flow_admin_logs') || '[]');
  } catch (e) { }

  const now = new Date();
  const timeStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  logs.unshift({
    desc: desc,
    time: timeStr,
    user: 'admin'
  });

  if (logs.length > 10) logs = logs.slice(0, 10);
  localStorage.setItem('flow_admin_logs', JSON.stringify(logs));
}

// ─── Backup Data Downloader ───
function exportBackupData() {
  const dataStr = DataService.exportAll();
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `flow_freediving_backup_${new Date().toISOString().slice(0, 10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();

  const now = new Date();
  const lastBackupTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  localStorage.setItem('flow_last_backup', lastBackupTime);
  document.getElementById('lastBackupTime').textContent = lastBackupTime;

  showToast('백업 데이터 파일이 다운로드되었습니다.');
}

// ─── Inline Delete UI Helper ───
window.confirmDelete = function (btnEl, type, idx) {
  const wrapper = btnEl.parentElement;
  if (wrapper.querySelector('.delete-confirm-group')) return;

  btnEl.style.display = 'none';

  const confirmGroup = document.createElement('div');
  confirmGroup.className = 'delete-confirm-group';
  confirmGroup.style.cssText = 'display:inline-flex;gap:6px;align-items:center;';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'admin-btn admin-btn--danger';
  confirmBtn.style.cssText = 'padding:4px 10px;font-size:11px;';
  confirmBtn.textContent = '정말 삭제?';
  confirmBtn.onclick = function () {
    executeDelete(type, idx);
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'admin-btn admin-btn--ghost';
  cancelBtn.style.cssText = 'padding:4px 10px;font-size:11px;';
  cancelBtn.textContent = '취소';
  cancelBtn.onclick = function () {
    confirmGroup.remove();
    btnEl.style.display = '';
  };

  confirmGroup.appendChild(confirmBtn);
  confirmGroup.appendChild(cancelBtn);
  wrapper.appendChild(confirmGroup);

  setTimeout(() => {
    if (confirmGroup.parentElement) {
      confirmGroup.remove();
      btnEl.style.display = '';
    }
  }, 5000);
};

async function executeDelete(type, idx) {
  let targetName = '';
  switch (type) {
    case 'program':
      targetName = adminData.programs[idx].title;
      adminData.programs.splice(idx, 1);
      await DataService.updatePrograms(adminData.programs);
      writeAdminLog(`교육과정 "${targetName}" 삭제`);
      closeEditForm('programs');
      showToast('프로그램이 삭제되었습니다.');
      loadPrograms();
      break;
    case 'instructor':
      targetName = adminData.instructors[idx].name;
      adminData.instructors.splice(idx, 1);
      await DataService.updateInstructors(adminData.instructors);
      writeAdminLog(`강사 "${targetName}" 삭제`);
      closeEditForm('instructors');
      showToast('강사 프로필이 삭제되었습니다.');
      loadInstructors();
      break;
    case 'review':
      targetName = adminData.reviews[idx].name;
      adminData.reviews.splice(idx, 1);
      await DataService.updateReviews(adminData.reviews);
      writeAdminLog(`수강후기 "${targetName}님 건" 삭제`);
      closeEditForm('reviews');
      showToast('후기가 삭제되었습니다.');
      loadReviews();
      break;
    case 'gallery':
      adminData.gallery.splice(idx, 1);
      await DataService.updateGallery(adminData.gallery);
      writeAdminLog(`갤러리 이미지 삭제`);
      closeEditForm('gallery');
      showToast('이미지가 삭제되었습니다.');
      loadGallery();
      break;
    case 'faq':
      targetName = adminData.faq[idx].question;
      adminData.faq.splice(idx, 1);
      await DataService.updateFAQ(adminData.faq);
      writeAdminLog(`FAQ "${targetName.substring(0, 10)}..." 삭제`);
      closeEditForm('faq');
      showToast('FAQ 항목이 삭제되었습니다.');
      loadFaq();
      break;
    case 'popup':
      targetName = adminData.popup[idx].title;
      adminData.popup.splice(idx, 1);
      await DataService.updatePopup(adminData.popup);
      writeAdminLog(`팝업 "${targetName}" 삭제`);
      closeEditForm('popup');
      showToast('팝업이 삭제되었습니다.');
      loadPopup();
      break;
    case 'whyflow':
      targetName = adminData.whyFlow?.items?.[idx]?.title || '';
      if (adminData.whyFlow && adminData.whyFlow.items) {
        adminData.whyFlow.items.splice(idx, 1);
        await DataService.updateWhyFlow(adminData.whyFlow);
      }
      writeAdminLog(`WHY FLOW "${targetName}" 항목 삭제`);
      closeEditForm('whyflow');
      showToast('WHY FLOW 항목이 삭제되었습니다.');
      loadWhyFlow();
      break;
  }
}

// ─── List-Edit View Switcher ───
window.showEditForm = function (panelName, index = -1) {
  let identifier = index;
  if (panelName === 'programs') {
    if (index === -1) {
      identifier = 'new';
    } else {
      identifier = adminData.programs[index]?.id || 'new';
    }
  }
  window.location.hash = `#${panelName}/edit/${identifier}`;
};

window.closeEditForm = function (panelName) {
  window.location.hash = `#${panelName}`;
};

function showEditFormForRouting(panelName, index = -1) {
  const listContainer = document.getElementById(`${panelName}ListContainer`);
  const editContainer = document.getElementById(`${panelName}EditContainer`);
  if (!listContainer || !editContainer) return;

  listContainer.classList.remove('list-view-active');
  listContainer.style.display = 'none';
  editContainer.style.display = 'block';

  const editTitle = document.getElementById(`${panelName}EditTitle`);
  if (editTitle) {
    if (panelName === 'programs') {
      const isNew = index === -1;
      const prog = isNew ? { title: '새 교육과정 추가' } : adminData.programs[index];
      editTitle.textContent = prog?.title || '새 교육과정 추가';
    } else if (panelName === 'instructors') {
      editTitle.textContent = index === -1 ? '새 강사 등록' : '강사 정보 편집';
    } else if (panelName === 'whyflow') {
      editTitle.textContent = index === -1 ? '새 항목 추가' : 'WHY FLOW 항목 편집';
    } else if (panelName === 'popup') {
      editTitle.textContent = index === -1 ? '새 팝업 등록' : '팝업 수정';
    } else {
      editTitle.textContent = index === -1 ? '새 항목 추가' : '정보 편집';
    }
  }

  // Render header buttons for programs/popup
  const editActionBarButtons = document.getElementById('editActionBarButtons');
  if (editActionBarButtons) {
    if (panelName === 'programs') {
      const isNew = index === -1;
      editActionBarButtons.innerHTML = `
        <button class="admin-btn admin-btn--ghost" onclick="previewActiveProgram(${index}); return false;" style="font-size: 12px; padding: 6px 12px; min-height: 34px; display: flex; align-items: center; gap: 4px; background: #ffffff;">👁️ 미리보기</button>
        ${!isNew ? `<button class="admin-btn admin-btn--ghost" onclick="confirmProgramClone(${index}); return false;" style="font-size: 12px; padding: 6px 12px; min-height: 34px; display: flex; align-items: center; gap: 4px; background: #ffffff;">📄 교육과정 복제</button>` : ''}
        <button class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('programs', ${index}); return false;" style="font-size: 12px; padding: 6px 18px; min-height: 34px; font-weight: 700; display: flex; align-items: center; gap: 4px;">💾 저장하기</button>
      `;
    } else if (panelName === 'popup') {
      editActionBarButtons.innerHTML = `
        <button class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('popup', ${index}); return false;" style="font-size: 11.5px; padding: 6px 16px; min-height: 34px; display: flex; align-items: center; gap: 4px;">💾 저장하기</button>
      `;
    } else {
      editActionBarButtons.innerHTML = '';
    }
  }

  renderEditForm(panelName, index);
}

function closeEditFormForRouting(panelName) {
  const listContainer = document.getElementById(`${panelName}ListContainer`);
  const editContainer = document.getElementById(`${panelName}EditContainer`);
  if (!listContainer || !editContainer) return;

  editContainer.style.display = 'none';
  listContainer.style.display = 'block';
  listContainer.classList.add('list-view-active');
}

window.openQuickAdd = function (panelName) {
  window.showEditForm(panelName, -1);
};

// Helper for dashboard log menu mapping
function getLogMenuInfo(desc) {
  if (!desc) return null;
  const d = desc.toLowerCase();
  if (d.includes('팝업')) return { label: '팝업 관리', panel: 'popup' };
  if (d.includes('교육') || d.includes('과정')) return { label: '교육과정', panel: 'programs' };
  if (d.includes('faq') || d.includes('질문')) return { label: 'FAQ', panel: 'faq' };
  if (d.includes('후기') || d.includes('수강생')) return { label: '후기', panel: 'reviews' };
  if (d.includes('강사')) return { label: '강사 관리', panel: 'instructors' };
  if (d.includes('hero') || d.includes('히어로') || d.includes('배경 영상') || d.includes('배경 이미지')) return { label: '메인 Hero', panel: 'hero' };
  if (d.includes('why flow') || d.includes('whyflow') || d.includes('강점')) return { label: 'WHY FLOW', panel: 'whyflow' };
  if (d.includes('갤러리') || d.includes('사진') || d.includes('이미지')) return { label: '갤러리 관리', panel: 'gallery' };
  if (d.includes('footer') || d.includes('푸터') || d.includes('sns')) return { label: 'Footer 관리', panel: 'footer' };
  if (d.includes('seo') || d.includes('검색엔진')) return { label: 'SEO 설정', panel: 'seo' };
  if (d.includes('연동') || d.includes('예약') || d.includes('스마트스토어') || d.includes('카카오톡')) return { label: '연동 서비스', panel: 'links' };
  return null;
}

// Helper for dashboard log icon
function getLogIcon(desc) {
  if (!desc) return '📋';
  if (desc.includes('팝업')) return '🗗';
  if (desc.includes('교육') || desc.includes('과정')) return '📖';
  if (desc.includes('강사')) return '👤';
  if (desc.includes('후기') || desc.includes('수강생')) return '⭐';
  if (desc.includes('FAQ') || desc.includes('질문')) return '❓';
  if (desc.includes('갤러리') || desc.includes('이미지')) return '📷';
  if (desc.includes('Hero') || desc.includes('영상') || desc.includes('배너')) return '🖼️';
  if (desc.includes('WHY FLOW')) return '💡';
  if (desc.includes('Footer') || desc.includes('SNS')) return '📝';
  if (desc.includes('연동')) return '🔗';
  if (desc.includes('SEO')) return '⚙️';
  if (desc.includes('백업') || desc.includes('복원')) return '☁️';
  return '📋';
}

// Navigation to popup edit/management from dashboard
window.goToPopupManagement = function (index) {
  if (index !== undefined && index >= 0) {
    window.location.hash = `#popup/edit/${index}`;
  } else {
    window.location.hash = '#popup';
  }
};

function renderDashboardLogs() {
  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem('flow_admin_logs') || '[]');
  } catch (e) { }
  if (logs.length === 0) {
    logs = defaultLogs;
    localStorage.setItem('flow_admin_logs', JSON.stringify(logs));
  }

  // Exactly top 5 logs
  const displayLogs = logs.slice(0, 5);
  const logsContainer = document.getElementById('dashboardLogs');
  if (logsContainer) {
    logsContainer.innerHTML = displayLogs.map(log => {
      const menuInfo = getLogMenuInfo(log.desc);
      const menuHtml = menuInfo
        ? `<a href="#${menuInfo.panel}" class="log-item__menu-tag" title="${menuInfo.label} 페이지로 이동">${menuInfo.label}</a>`
        : '';

      return `
        <div class="log-item">
          <div class="log-item__icon-wrap">
            <span class="log-item__icon">${getLogIcon(log.desc)}</span>
          </div>
          <div class="log-item__content">
            <span class="log-item__desc">${log.desc || ''}</span>
            <span class="log-item__time">${log.time || ''}</span>
          </div>
          ${menuHtml}
        </div>
      `;
    }).join('');
  }
}

function calculateDday(endDateStr) {
  if (!endDateStr) return { text: '', isToday: false, isUrgent: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diffMs = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return { text: '오늘 종료', isToday: true, isUrgent: true };
  }
  if (diffDays > 0) {
    return {
      text: `종료 D-${diffDays}`,
      isToday: false,
      isUrgent: diffDays <= 7
    };
  }
  return { text: '종료됨', isToday: false, isUrgent: false };
}

function formatPopupPeriod(start, end) {
  if (!start && !end) return '상시 노출';
  if (!start) return `~ ${end}`;
  if (!end) return `${start} ~`;
  return `${start} ~ ${end}`;
}

function renderDashboardPopupAlerts() {
  const container = document.getElementById('dashboardAlerts');
  const summaryEl = document.getElementById('dashboardPopupSummary');
  if (!container) return;

  const popups = (adminData.popup || []).map((p, index) => ({ ...p, originalIndex: index }));
  
  // Filter active popups based on enabled status and date range
  const activePopups = popups.filter(p => getPopupStatus(p) === 'active');

  // Update summary badge
  if (summaryEl) {
    summaryEl.textContent = `현재 노출중인 팝업 ${activePopups.length}개`;
  }

  // If no active popups
  if (activePopups.length === 0) {
    container.innerHTML = `
      <div class="dashboard-empty-box">
        <span class="dashboard-empty-icon">📭</span>
        <p class="dashboard-empty-text">현재 노출중인 팝업이 없습니다.</p>
      </div>
    `;
    return;
  }

  // Display top 3 active popups
  const displayPopups = activePopups.slice(0, 3);
  let html = displayPopups.map(p => {
    const dday = calculateDday(p.endDate);
    const badgeClass = dday.isToday ? 'is-today' : (dday.isUrgent ? 'is-urgent' : '');
    return `
      <div class="alert-box" onclick="goToPopupManagement(${p.originalIndex})" title="클릭 시 팝업 관리로 이동">
        <div class="alert-box__icon-wrap">
          <span>🗗</span>
        </div>
        <div class="alert-box__content">
          <div class="alert-box__header-row">
            <h4 class="alert-box__title">${p.title || '제목 없음'}</h4>
            <span class="alert-box__dday-badge ${badgeClass}">${dday.text}</span>
          </div>
          <div class="alert-box__meta">
            <span class="alert-box__period">${formatPopupPeriod(p.startDate, p.endDate)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (activePopups.length > 3) {
    html += `
      <div class="alert-box--more" onclick="window.location.hash='#popup'" title="전체 팝업 관리로 이동">
        <span>외 ${activePopups.length - 3}개 팝업 보기 ➔</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ─── Dashboard Panel ───
function loadDashboard() {
  // Ensure header Google Analytics button is visible on dashboard
  const analyticsBtn = document.getElementById('headerAnalyticsBtn');
  if (analyticsBtn) analyticsBtn.style.display = 'inline-flex';

  // Visitor stats: Initialize to 0 (ready for Google Analytics API integration)
  const visitorStats = {
    'statTodayVisitors': 0,
    'statWeeklyVisitors': 0,
    'statTotalVisitors': 0,
    'statPageviews': 0
  };

  for (const [id, val] of Object.entries(visitorStats)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = val.toLocaleString();
    }
  }

  // Load and render logs safely (Top 5)
  renderDashboardLogs();

  // Load and render real active popups in alerts section
  renderDashboardPopupAlerts();

  // Load and render services link status safely (Top 3 as in design sheet)
  const links = adminData.links || {};
  const services = [
    { name: '네이버 예약', key: 'naverBooking', icon: 'N', iconBg: '#03C75A', iconColor: '#FFFFFF' },
    { name: '카카오톡 상담', key: 'kakao', icon: '💬', iconBg: '#FEE500', iconColor: '#3C1E1E' },
    { name: '스마트스토어', key: 'smartStore', icon: '🛍️', iconBg: '#E8F5E9', iconColor: '#2E7D32' }
  ];

  const linksContainer = document.getElementById('dashboardLinks');
  if (linksContainer) {
    linksContainer.innerHTML = services.map(s => {
      const url = links[s.key];
      const isConnected = url && url.trim().length > 0;
      return `
        <div class="service-pill-card" onclick="document.querySelector('[data-panel=links]').click()" title="${s.name} 관리하기">
          <div class="service-pill-card__left">
            <span class="service-pill-card__icon" style="background:${s.iconBg};color:${s.iconColor};font-weight:700;">${s.icon}</span>
            <span class="service-pill-card__name">${s.name}</span>
          </div>
          <div class="service-pill-card__right">
            <span class="service-pill-card__status ${isConnected ? '' : 'is-disconnected'}">${isConnected ? '연결됨' : '미연결'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Set last backup date safely
  const lastBackup = localStorage.getItem('flow_last_backup') || '2026-07-31 23:50';
  const lastBackupEl = document.getElementById('lastBackupTime');
  if (lastBackupEl) {
    lastBackupEl.textContent = lastBackup;
  }
}

// ─── Hero Panel ───
function loadHero() {
  const d = adminData.hero || {};

  const title1 = d.title || '';
  const title2 = d.titleLine2 || '';
  const sub = d.subtitle || '';

  const title1El = document.getElementById('heroTitle');
  const title2El = document.getElementById('heroTitleLine2');
  const subEl = document.getElementById('heroSubtitle');

  if (title1El) title1El.value = title1;
  if (title2El) title2El.value = title2;
  if (subEl) subEl.value = sub;

  const c1 = document.getElementById('heroTitleCount');
  const c2 = document.getElementById('heroTitleLine2Count');
  const cSub = document.getElementById('heroSubtitleCount');
  if (c1) c1.textContent = title1.length;
  if (c2) c2.textContent = title2.length;
  if (cSub) cSub.textContent = sub.length;

  const videoUrl = d.videoUrl || '';
  const bgImage = d.bgImage || '';

  const videoInput = document.getElementById('heroVideoUrl');
  if (videoInput) videoInput.value = videoUrl;
  updateHeroVideoPreview(videoUrl);

  const imgInput = document.getElementById('heroBgImage');
  if (imgInput) imgInput.value = bgImage;
  updateHeroImagePreview(bgImage);
}

window.updateHeroVideoPreview = function (videoUrl) {
  const videoEl = document.getElementById('heroVideoPreviewEl');
  const sourceEl = document.getElementById('heroVideoSource');
  const placeholderEl = document.getElementById('heroVideoPlaceholder');
  const uploadBtn = document.querySelector('.hero-video-btn-upload');
  const changeBtn = document.querySelector('.hero-video-btn-change');
  const deleteBtn = document.querySelector('.hero-video-btn-delete');

  const hasVideo = Boolean(videoUrl && videoUrl.trim());

  if (videoEl && sourceEl) {
    if (hasVideo) {
      sourceEl.src = videoUrl;
      videoEl.load();
      videoEl.style.display = 'block';
    } else {
      sourceEl.src = '';
      videoEl.pause();
      videoEl.style.display = 'none';
    }
  }

  if (placeholderEl) {
    placeholderEl.style.display = hasVideo ? 'none' : 'flex';
  }

  if (uploadBtn) uploadBtn.style.display = hasVideo ? 'none' : 'inline-flex';
  if (changeBtn) changeBtn.style.display = hasVideo ? 'inline-flex' : 'none';
  if (deleteBtn) deleteBtn.style.display = hasVideo ? 'inline-flex' : 'none';
};

window.updateHeroImagePreview = function (imageUrl) {
  const imgEl = document.getElementById('heroImagePreviewEl');
  const placeholderEl = document.getElementById('heroImagePlaceholder');
  const uploadBtn = document.querySelector('.hero-image-btn-upload');
  const changeBtn = document.querySelector('.hero-image-btn-change');
  const deleteBtn = document.querySelector('.hero-image-btn-delete');

  const hasImage = Boolean(imageUrl && imageUrl.trim());

  if (imgEl) {
    if (hasImage) {
      imgEl.src = imageUrl;
      imgEl.style.display = 'block';
    } else {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
  }

  if (placeholderEl) {
    placeholderEl.style.display = hasImage ? 'none' : 'flex';
  }

  if (uploadBtn) uploadBtn.style.display = hasImage ? 'none' : 'inline-flex';
  if (changeBtn) changeBtn.style.display = hasImage ? 'inline-flex' : 'none';
  if (deleteBtn) deleteBtn.style.display = hasImage ? 'inline-flex' : 'none';
};

window.uploadHeroVideoFile = async function (fileInput) {
  if (!fileInput || !fileInput.files.length) return;
  const file = fileInput.files[0];
  showToast("영상 파일 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const urlInput = document.getElementById('heroVideoUrl');
      if (urlInput) urlInput.value = res.secure_url;
      updateHeroVideoPreview(res.secure_url);
      showToast("영상 업로드 완료!");
    }
  } catch (err) {
    console.error("Video Upload error:", err);
    showToast("영상 업로드 실패: " + err.message);
  }
  fileInput.value = '';
};

window.uploadHeroImageFile = async function (fileInput) {
  if (!fileInput || !fileInput.files.length) return;
  const file = fileInput.files[0];
  showToast("이미지 파일 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const imgInput = document.getElementById('heroBgImage');
      if (imgInput) imgInput.value = res.secure_url;
      updateHeroImagePreview(res.secure_url);
      showToast("이미지 업로드 완료!");
    }
  } catch (err) {
    console.error("Image Upload error:", err);
    showToast("이미지 업로드 실패: " + err.message);
  }
  fileInput.value = '';
};

window.clearHeroVideo = function () {
  const urlInput = document.getElementById('heroVideoUrl');
  if (urlInput) urlInput.value = '';
  updateHeroVideoPreview('');
  showToast('배경 영상이 삭제되었습니다.');
};

window.clearHeroImage = function () {
  const imgInput = document.getElementById('heroBgImage');
  if (imgInput) imgInput.value = '';
  updateHeroImagePreview('');
  showToast('배경 이미지가 삭제되었습니다.');
};

window.saveHero = async function () {
  const videoVal = document.getElementById('heroVideoUrl')?.value.trim() || '';
  const bgImgVal = document.getElementById('heroBgImage')?.value.trim() || '';
  const titleVal = document.getElementById('heroTitle')?.value.trim() || '';
  const title2Val = document.getElementById('heroTitleLine2')?.value.trim() || '';
  const subtitleVal = document.getElementById('heroSubtitle')?.value.trim() || '';

  adminData.hero = {
    ...adminData.hero,
    videoUrl: videoVal,
    bgImage: bgImgVal,
    title: titleVal,
    titleLine2: title2Val,
    subtitle: subtitleVal
  };
  await DataService.updateHero(adminData.hero);
  writeAdminLog('메인 Hero 배너 문구/미디어 변경');
  showToast('메인 Hero 설정이 저장되었습니다.');
};

// ─── WHY FLOW Panel ───
let tempWhyFlowOrder = null;

function loadWhyFlow() {
  const container = document.getElementById('whyflowList');
  const countEl = document.getElementById('whyflowCount');

  if (!adminData.whyFlow) {
    adminData.whyFlow = { items: [] };
  }
  if (!Array.isArray(adminData.whyFlow.items)) {
    adminData.whyFlow.items = [];
  }

  // 1. 상단 문구 (제목 / 설명) 입력값 채우기
  const titleEl = document.getElementById('whyFlowTitle');
  const subEl = document.getElementById('whyFlowSubtitle');
  if (titleEl) titleEl.value = adminData.whyFlow.title || 'WHY FLOW';
  if (subEl) subEl.value = adminData.whyFlow.subtitle || 'FLOW와 함께하는 네 가지 약속';

  const items = adminData.whyFlow.items;
  const totalCount = items.length;

  if (countEl) {
    countEl.textContent = totalCount;
  }

  if (!container) return;

  let html = `
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 60px; min-width: 60px; text-align: center;">순서</th>
            <th style="width: 200px; min-width: 160px;">제목</th>
            <th>설명</th>
            <th style="width: 80px; min-width: 80px; text-align: center;">노출</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (totalCount === 0) {
    html += `
      <tr>
        <td colspan="4" style="text-align:center; color:var(--admin-text-secondary); padding:40px 0;">
          등록된 WHY FLOW 항목이 없습니다.
        </td>
      </tr>
    `;
  } else {
    items.forEach((item, i) => {
      const isVisible = item.visible !== false;
      html += `
        <tr class="draggable-row clickable-row" draggable="true" data-index="${i}" onclick="showEditForm('whyflow', ${i})">
          <td style="width: 60px; min-width: 60px; text-align: center; padding-left: 8px; padding-right: 8px;" class="drag-handle" onclick="event.stopPropagation()">
            <span style="font-size: 16px; color: #94A3B8; cursor: grab;" title="드래그하여 순서 변경">⠿</span>
          </td>
          <td data-label="제목" style="vertical-align: middle;">
            <div style="font-weight: 700; color: var(--admin-text-primary); font-size: 13.5px;">${item.title || '(제목 없음)'}</div>
          </td>
          <td data-label="설명" style="vertical-align: middle;">
            <div style="max-width: 480px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; color: var(--admin-text-secondary); line-height: 1.4;">
              ${item.desc || '-'}
            </div>
          </td>
          <td data-label="노출" style="text-align: center; vertical-align: middle;" onclick="event.stopPropagation()">
            <label class="toggle" style="margin: 0;">
              <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="toggleWhyFlowVisible(${i}, this.checked, event)">
              <span class="toggle__slider"></span>
            </label>
          </td>
        </tr>
      `;
    });
  }

  html += `</tbody></table></div>`;
  container.innerHTML = html;

  initWhyFlowDragAndDrop();
}

function initWhyFlowDragAndDrop() {
  const tbody = document.querySelector('#whyflowList tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.draggable-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      rows.forEach(r => r.classList.remove('drag-over'));
      checkWhyFlowOrderChanged();
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      row.classList.add('drag-over');
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });
  });

  tbody.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingRow = tbody.querySelector('.dragging');
    if (!draggingRow) return;

    const afterElement = getDragAfterElement(tbody, e.clientY);
    if (afterElement == null) {
      tbody.appendChild(draggingRow);
    } else {
      tbody.insertBefore(draggingRow, afterElement);
    }
  });
}

function checkWhyFlowOrderChanged() {
  const tbody = document.querySelector('#whyflowList tbody');
  if (!tbody) return;

  const currentRows = [...tbody.querySelectorAll('.draggable-row')];
  const newOrderIndices = currentRows.map(row => parseInt(row.getAttribute('data-index')));

  let changed = false;
  for (let i = 0; i < newOrderIndices.length; i++) {
    if (newOrderIndices[i] !== i) {
      changed = true;
      break;
    }
  }

  const applyContainer = document.getElementById('whyflowOrderApplyContainer');
  if (changed && applyContainer) {
    applyContainer.style.display = 'flex';
    tempWhyFlowOrder = newOrderIndices.map(idx => adminData.whyFlow.items[idx]);
  } else if (applyContainer) {
    applyContainer.style.display = 'none';
    tempWhyFlowOrder = null;
  }
}

window.applyWhyFlowOrder = async function () {
  if (!tempWhyFlowOrder) return;

  adminData.whyFlow.items = [...tempWhyFlowOrder];
  await DataService.updateWhyFlow(adminData.whyFlow);
  tempWhyFlowOrder = null;

  const applyContainer = document.getElementById('whyflowOrderApplyContainer');
  if (applyContainer) applyContainer.style.display = 'none';

  writeAdminLog('WHY FLOW 노출 순서 재정렬 및 적용');
  showToast('WHY FLOW 순서가 변경되었습니다.');
  loadWhyFlow();
};

window.toggleWhyFlowVisible = async function (idx, isVisible, e) {
  if (e) e.stopPropagation();
  if (!adminData.whyFlow || !adminData.whyFlow.items[idx]) return;
  adminData.whyFlow.items[idx].visible = isVisible;
  await DataService.updateWhyFlow(adminData.whyFlow);
  writeAdminLog(`WHY FLOW "${adminData.whyFlow.items[idx].title}" 노출 ${isVisible ? 'ON' : 'OFF'} 설정`);
  showToast(isVisible ? '홈페이지에 노출됩니다.' : '홈페이지에서 숨김 처리되었습니다.');
  loadWhyFlow();
};

window.saveWhyFlowHeader = async function () {
  if (!adminData.whyFlow) {
    adminData.whyFlow = { items: [] };
  }
  const titleVal = document.getElementById('whyFlowTitle')?.value.trim() || 'WHY FLOW';
  const subtitleVal = document.getElementById('whyFlowSubtitle')?.value.trim() || '';

  adminData.whyFlow.title = titleVal;
  adminData.whyFlow.subtitle = subtitleVal;

  await DataService.updateWhyFlow(adminData.whyFlow);
  writeAdminLog('WHY FLOW 상단 문구(제목/설명) 수정');
  showToast('상단 문구가 저장되었습니다.');
};

// ─── Programs Panel ───
// Global state for program ordering and filters
let tempProgramsOrder = null;

function getCategoryName(cat) {
  if (cat === 'freediving') return '프리다이빙';
  if (cat === 'eggyeong' || cat === '수영') return '수영';
  return '기타';
}

function getCategoryBadgeClass(cat) {
  const name = getCategoryName(cat);
  if (name === '프리다이빙') return 'badge--freediving';
  if (name === '수영') return 'badge--swim';
  return 'badge--etc';
}

window.clearSearchQuery = function () {
  const sInput = document.getElementById('searchProgName');
  const cBtn = document.getElementById('clearSearchBtn');
  if (sInput) {
    sInput.value = '';
    sInput.focus();
  }
  if (cBtn) {
    cBtn.style.display = 'none';
  }
  window.loadPrograms();
};

window.resetAllSearchFilters = function () {
  const searchInput = document.getElementById('searchProgName');
  const catFilter = document.getElementById('filterProgCategory');
  const visFilter = document.getElementById('filterProgVisible');
  const sortFilter = document.getElementById('sortProg');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (searchInput) searchInput.value = '';
  if (catFilter) catFilter.value = 'all';
  if (visFilter) visFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'order';
  if (clearBtn) clearBtn.style.display = 'none';

  loadPrograms();
  if (searchInput) searchInput.focus();
};

window.loadPrograms = function () {
  const container = document.getElementById('programsList');
  if (!container) return;

  try {
    // 1. Get filter inputs and sync clear button state
    const searchInput = document.getElementById('searchProgName');
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn && searchInput) {
      clearBtn.style.display = searchInput.value ? 'block' : 'none';
    }

    const searchVal = searchInput?.value.toLowerCase().trim() || '';
    const catVal = document.getElementById('filterProgCategory')?.value || 'all';
    const visVal = document.getElementById('filterProgVisible')?.value || 'all';
    const sortVal = document.getElementById('sortProg')?.value || 'order';

    // Store filters in sessionStorage
    sessionStorage.setItem('flow_cms_filter_search', searchVal);
    sessionStorage.setItem('flow_cms_filter_cat', catVal);
    sessionStorage.setItem('flow_cms_filter_vis', visVal);
    sessionStorage.setItem('flow_cms_filter_sort', sortVal);

    console.log('[FLOW CMS] Filtering parameters:', { searchVal, catVal, visVal, sortVal });

    // 2. Map and filter programs
    let items = adminData.programs.map((p, i) => ({ ...p, originalIndex: i }));

    // Search Filter
    if (searchVal) {
      items = items.filter(p => {
        const pTitle = (p.title || '').toLowerCase();
        const pSub = (p.subtitle || '').toLowerCase();
        const pDesc = (p.desc || '').toLowerCase();
        const pPrice = (p.price || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const catName = getCategoryName(p.category || '').toLowerCase();

        const titleMatch = pTitle.includes(searchVal);
        const subtitleMatch = pSub.includes(searchVal);
        const descMatch = pDesc.includes(searchVal);
        const categoryMatch = pCat.includes(searchVal) || catName.includes(searchVal);
        const priceMatch = pPrice.includes(searchVal);

        const tagsMatch = (p.tags || []).some(t => (t || '').toLowerCase().includes(searchVal));
        const currMatch = (p.curriculum || []).some(c => (c || '').toLowerCase().includes(searchVal));
        const incMatch = (p.includes || []).some(i => (i || '').toLowerCase().includes(searchVal));
        const prepMatch = (p.prep || []).some(pr => (pr || '').toLowerCase().includes(searchVal));
        const precMatch = (p.precautions || []).some(prc => (prc || '').toLowerCase().includes(searchVal));

        return titleMatch || subtitleMatch || descMatch || categoryMatch || priceMatch || tagsMatch || currMatch || incMatch || prepMatch || precMatch;
      });
    }

    // Category Filter
    if (catVal !== 'all') {
      items = items.filter(p => p.category === catVal);
    }

    // Visibility Filter
    if (visVal !== 'all') {
      const isVisible = visVal === 'visible';
      items = items.filter(p => p.visible === isVisible);
    }

    // Sort
    if (sortVal === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortVal === 'price') {
      items.sort((a, b) => {
        const aPrice = parseInt((a.price || '').replace(/[^0-9]/g, '')) || 0;
        const bPrice = parseInt((b.price || '').replace(/[^0-9]/g, '')) || 0;
        return aPrice - bPrice;
      });
    }

    // 3. Render Desktop Table Markup
    let desktopHtml = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 60px; min-width: 60px; text-align: center; white-space: nowrap; padding-left: 8px; padding-right: 8px;">순서</th>
              <th style="width: 100px;">이미지</th>
              <th>과정명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>공개 여부</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Render Mobile Card List Markup
    let mobileHtml = `<div class="mobile-card-list">`;

    if (items.length === 0) {
      desktopHtml += `
        <tr>
          <td colspan="6" style="text-align:center;color:var(--admin-text-secondary);padding:40px 0;">
            검색 결과가 없습니다.
            <div style="margin-top: 12px;">
              <button class="admin-btn admin-btn--ghost" onclick="resetAllSearchFilters(); event.stopPropagation();" style="min-height:34px; padding:0 var(--space-4); font-size:12px;">검색 초기화</button>
            </div>
          </td>
        </tr>
      `;
      mobileHtml += `
        <div style="text-align:center;color:var(--admin-text-secondary);padding:40px 0;width:100%;font-size:13px;">
          검색 결과가 없습니다.
          <div style="margin-top: 12px;">
            <button class="admin-btn admin-btn--ghost" onclick="resetAllSearchFilters(); event.stopPropagation();" style="min-height:34px; padding:0 var(--space-4); font-size:12px;">검색 초기화</button>
          </div>
        </div>
      `;
    } else {
      items.forEach((prog) => {
        // Desktop row
        desktopHtml += `
        <tr class="draggable-row clickable-row" draggable="true" data-index="${prog.originalIndex}" onclick="showEditForm('programs', ${prog.originalIndex})">
          <td style="width: 60px; min-width: 60px; text-align: center; padding-left: 8px; padding-right: 8px;" class="drag-handle" onclick="event.stopPropagation()">
            <span style="font-size: 16px; color: #94A3B8; cursor: grab;">⠿</span>
          </td>
          <td data-label="이미지">
            <img src="${prog.image || 'images/program-oneday.jpg'}" class="prog-image-preview" alt="썸네일" style="width: 72px; height: 45px; object-fit: cover; border-radius: var(--radius-md);">
          </td>
          <td data-label="과정명">
            <div style="font-weight:700;color:var(--admin-text-primary); font-size: 13.5px;">${prog.title}</div>
            <div style="font-size:11px;color:var(--admin-text-secondary); margin-top: 2px;">${prog.subtitle || ''}</div>
          </td>
          <td data-label="카테고리">
            <span class="badge ${getCategoryBadgeClass(prog.category)}">${getCategoryName(prog.category)}</span>
          </td>
          <td data-label="가격" style="font-weight: 600; color: var(--admin-text-primary);">${prog.price || '별도문의'}</td>
          <td data-label="공개 여부" onclick="event.stopPropagation()">
            <label class="toggle" style="margin: 0;">
              <input type="checkbox" ${prog.visible ? 'checked' : ''} onchange="toggleProgram(${prog.originalIndex}, this.checked)">
              <span class="toggle__slider"></span>
            </label>
          </td>
        </tr>
      `;

        // Mobile card
        mobileHtml += `
        <div class="mobile-program-card" onclick="showEditForm('programs', ${prog.originalIndex})">
          <img src="${prog.image || 'images/program-oneday.jpg'}" class="mobile-program-card__thumb" alt="썸네일">
          <div class="mobile-program-card__info">
            <div class="mobile-program-card__title">${prog.title}</div>
            <div class="mobile-program-card__sub">${prog.subtitle || ''}</div>
            <div class="mobile-program-card__price">${prog.price || '별도문의'}</div>
          </div>
          <div class="mobile-program-card__right" onclick="event.stopPropagation()">
            <span class="badge ${getCategoryBadgeClass(prog.category)}" style="margin-bottom: 4px;">${getCategoryName(prog.category)}</span>
            <label class="toggle" style="margin: 0; min-height: 44px; display: flex; align-items: center;">
              <input type="checkbox" ${prog.visible ? 'checked' : ''} onchange="toggleProgram(${prog.originalIndex}, this.checked)">
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>
      `;
      });
    }

    desktopHtml += `</tbody></table></div>`;
    mobileHtml += `</div>`;

    // Combine responsive views
    container.innerHTML = desktopHtml + mobileHtml;

    // Bind Drag & Drop Events for Desktop Rows
    initProgramsDragAndDrop();
  } catch (err) {
    console.error('[FLOW CMS] loadPrograms crash:', err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px var(--space-6); background: #FFF5F5; border: 1px solid #FCA5A5; border-radius: var(--radius-lg); margin-top: var(--space-4);">
        <p style="font-size: 14.5px; font-weight: 700; color: #DC2626; margin-bottom: 12px; line-height: 1.4;">교육과정 정보를 불러오지 못했습니다. 다시 시도해주세요.</p>
        <button class="admin-btn admin-btn--primary" onclick="loadPrograms();" style="min-height: 38px; padding: 0 var(--space-5); font-size: 13px;">다시 불러오기</button>
      </div>
    `;
  }
}

// ─── Drag & Drop Ordering ───
function initProgramsDragAndDrop() {
  const tbody = document.querySelector('#programsList tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.draggable-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      // Remove dragover decorations
      rows.forEach(r => r.classList.remove('drag-over'));
      checkOrderChanged();
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      row.classList.add('drag-over');
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });
  });

  tbody.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingRow = tbody.querySelector('.dragging');
    if (!draggingRow) return;

    const afterElement = getDragAfterElement(tbody, e.clientY);
    if (afterElement == null) {
      tbody.appendChild(draggingRow);
    } else {
      tbody.insertBefore(draggingRow, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable-row:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function checkOrderChanged() {
  const tbody = document.querySelector('#programsList tbody');
  if (!tbody) return;

  const currentRows = [...tbody.querySelectorAll('.draggable-row')];
  const newOrderIndices = currentRows.map(row => parseInt(row.getAttribute('data-index')));

  // Check if order has changed from original order
  let changed = false;
  for (let i = 0; i < newOrderIndices.length; i++) {
    if (newOrderIndices[i] !== i) {
      changed = true;
      break;
    }
  }

  const applyContainer = document.getElementById('programsOrderApplyContainer');
  if (changed) {
    applyContainer.style.display = 'flex';
    // Map new items array
    tempProgramsOrder = newOrderIndices.map(idx => adminData.programs[idx]);
  } else {
    applyContainer.style.display = 'none';
    tempProgramsOrder = null;
  }
}

window.applyProgramsOrder = async function () {
  if (!tempProgramsOrder) return;

  adminData.programs = [...tempProgramsOrder];
  await DataService.updatePrograms(adminData.programs);
  tempProgramsOrder = null;

  document.getElementById('programsOrderApplyContainer').style.display = 'none';
  writeAdminLog('교육과정 노출 순서 재정렬 및 적용');
  showToast('새로운 노출 순서가 반영되었습니다.');
  loadPrograms();
};

window.toggleProgram = async function (idx, visible) {
  adminData.programs[idx].visible = visible;
  await DataService.updatePrograms(adminData.programs);
  writeAdminLog(`교육과정 "${adminData.programs[idx].title}" 상태 ${visible ? '공개' : '비공개'} 전환`);
  showToast(visible ? '공개로 변경되었습니다.' : '비공개로 변경되었습니다.');
  loadPrograms(); // Refresh view
};

// ─── Instructors Panel ───
let currentInstructorsPage = 1;
const INSTRUCTORS_PAGE_SIZE = 10;
let tempInstructorsOrder = null;

function loadInstructors() {
  const container = document.getElementById('instructorsList');
  const countEl = document.getElementById('instructorsCount');

  const instructorItems = (adminData && Array.isArray(adminData.instructors)) ? adminData.instructors : [];
  const totalCount = instructorItems.length;

  // 1. 강사 개수 자동 계산 및 상단 뱃지 표시
  if (countEl) {
    countEl.textContent = totalCount;
  }

  if (!container) return;

  // 2. 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / INSTRUCTORS_PAGE_SIZE);
  if (currentInstructorsPage > totalPages) {
    currentInstructorsPage = Math.max(1, totalPages);
  }
  if (currentInstructorsPage < 1) {
    currentInstructorsPage = 1;
  }

  const startIndex = (currentInstructorsPage - 1) * INSTRUCTORS_PAGE_SIZE;
  const endIndex = startIndex + INSTRUCTORS_PAGE_SIZE;
  const pagedInstructors = instructorItems.slice(startIndex, endIndex);

  let html = `
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 60px; min-width: 60px; text-align: center; white-space: nowrap;">순서</th>
            <th style="width: 70px; min-width: 70px; text-align: center;">사진</th>
            <th style="width: 15%; min-width: 110px;">강사명</th>
            <th style="width: 110px; min-width: 110px; text-align: center; white-space: nowrap;">공개 여부</th>
            <th style="width: 22%; min-width: 140px;">역할/소속</th>
            <th>교육 철학</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (totalCount === 0) {
    html += `<tr><td colspan="6" style="text-align:center;color:var(--admin-text-secondary);padding:var(--space-8) 0;">등록된 강사진이 없습니다.</td></tr>`;
  } else {
    pagedInstructors.forEach((inst, i) => {
      const actualIndex = startIndex + i;
      const isVisible = inst.visible !== false;
      const visText = isVisible ? '공개' : '비공개';

      // Table row (행 전체 클릭 시 상세 편집 이동)
      html += `
        <tr class="draggable-row clickable-row" draggable="true" data-index="${actualIndex}" onclick="showEditForm('instructors', ${actualIndex})">
          <td style="width: 60px; min-width: 60px; text-align: center; padding-left: 8px; padding-right: 8px;" class="drag-handle" onclick="event.stopPropagation()">
            <span style="font-size: 16px; color: #94A3B8; cursor: grab;" title="드래그하여 순서 변경">⠿</span>
          </td>
          <td data-label="사진" style="text-align: center;">
            <img src="${inst.photo || 'images/instructor-main.jpg'}" alt="${inst.name}" 
              style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid var(--admin-border); vertical-align: middle; display: inline-block;">
          </td>
          <td data-label="강사명">
            <div style="font-weight: 700; color: var(--admin-text-primary); font-size: 13.5px;">${inst.name}</div>
          </td>
          <td data-label="공개 여부" style="text-align: center;" onclick="event.stopPropagation()">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
              <label class="toggle" style="margin: 0;">
                <input type="checkbox" ${isVisible ? 'checked' : ''} onchange="toggleInstructorVisible(${actualIndex}, this.checked, event)">
                <span class="toggle__slider"></span>
              </label>
              <span style="font-weight: 600; font-size: 12.5px; color: ${isVisible ? 'var(--admin-primary)' : '#EF4444'};">${visText}</span>
            </div>
          </td>
          <td data-label="역할/소속" style="font-size: 12.5px; color: var(--admin-text-secondary);">
            ${inst.role || ''}
          </td>
          <td data-label="교육 철학" style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; color: var(--admin-text-secondary);">
            ${inst.philosophy ? `"${inst.philosophy}"` : '-'}
          </td>
        </tr>
      `;
    });
  }

  html += `</tbody></table></div>`;

  // 3. 강사 11명 이상(2페이지 이상)일 때 페이지네이션 렌더링
  if (totalPages > 1) {
    html += renderInstructorsPagination(totalPages, currentInstructorsPage);
  }

  container.innerHTML = html;

  // Bind Drag & Drop Events
  initInstructorsDragAndDrop();
}

function initInstructorsDragAndDrop() {
  const tbody = document.querySelector('#instructorsList tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.draggable-row');
  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      rows.forEach(r => r.classList.remove('drag-over'));
      checkInstructorsOrderChanged();
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      row.classList.add('drag-over');
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over');
    });
  });

  tbody.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingRow = tbody.querySelector('.dragging');
    if (!draggingRow) return;

    const afterElement = getDragAfterElement(tbody, e.clientY);
    if (afterElement == null) {
      tbody.appendChild(draggingRow);
    } else {
      tbody.insertBefore(draggingRow, afterElement);
    }
  });
}

function checkInstructorsOrderChanged() {
  const tbody = document.querySelector('#instructorsList tbody');
  if (!tbody) return;

  const currentRows = [...tbody.querySelectorAll('.draggable-row')];
  const newOrderIndices = currentRows.map(row => parseInt(row.getAttribute('data-index')));

  // Check if order has changed from original order
  let changed = false;
  for (let i = 0; i < newOrderIndices.length; i++) {
    if (newOrderIndices[i] !== (currentInstructorsPage - 1) * INSTRUCTORS_PAGE_SIZE + i) {
      changed = true;
      break;
    }
  }

  const applyContainer = document.getElementById('instructorsOrderApplyContainer');
  if (changed && applyContainer) {
    applyContainer.style.display = 'flex';
    const pageStartIndex = (currentInstructorsPage - 1) * INSTRUCTORS_PAGE_SIZE;
    const reorderedPageItems = newOrderIndices.map(idx => adminData.instructors[idx]);
    
    const newFullList = [...adminData.instructors];
    newFullList.splice(pageStartIndex, reorderedPageItems.length, ...reorderedPageItems);
    tempInstructorsOrder = newFullList;
  } else if (applyContainer) {
    applyContainer.style.display = 'none';
    tempInstructorsOrder = null;
  }
}

window.applyInstructorsOrder = async function () {
  if (!tempInstructorsOrder) return;

  adminData.instructors = [...tempInstructorsOrder];
  await DataService.updateInstructors(adminData.instructors);
  tempInstructorsOrder = null;

  const applyContainer = document.getElementById('instructorsOrderApplyContainer');
  if (applyContainer) applyContainer.style.display = 'none';

  writeAdminLog('강사 노출 순서 재정렬 및 적용');
  showToast('강사 순서가 변경되었습니다.');
  loadInstructors();
};

window.toggleInstructorVisible = async function (idx, visible, e) {
  if (e) e.stopPropagation();
  adminData.instructors[idx].visible = visible;
  await DataService.updateInstructors(adminData.instructors);
  writeAdminLog(`강사 "${adminData.instructors[idx].name}" ${visible ? '공개' : '비공개'} 설정`);
  showToast(visible ? '공개로 설정되었습니다.' : '비공개로 설정되었습니다.');
  loadInstructors();
};

window.toggleInstructorMainShow = window.toggleInstructorVisible;

function renderInstructorsPagination(totalPages, currentPage) {
  const maxVisiblePages = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisiblePages) {
    const half = Math.floor(maxVisiblePages / 2);
    startPage = currentPage - half;
    endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }
  }

  const pages = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return `
    <div class="admin-pagination-container">
      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeInstructorsPage(${currentPage - 1})" 
        ${isPrevDisabled ? 'disabled' : ''}
        aria-label="이전 페이지">
        &lt;
      </button>

      ${pages.map(pageNum => `
        <button type="button" 
          class="admin-pagination-btn ${pageNum === currentPage ? 'is-active' : ''}" 
          onclick="changeInstructorsPage(${pageNum})">
          ${pageNum}
        </button>
      `).join('')}

      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeInstructorsPage(${currentPage + 1})" 
        ${isNextDisabled ? 'disabled' : ''}
        aria-label="다음 페이지">
        &gt;
      </button>
    </div>
  `;
}

window.changeInstructorsPage = function (newPage) {
  const instructorItems = (adminData && Array.isArray(adminData.instructors)) ? adminData.instructors : [];
  const totalPages = Math.ceil(instructorItems.length / INSTRUCTORS_PAGE_SIZE);
  if (newPage < 1 || newPage > totalPages) return;
  currentInstructorsPage = newPage;
  loadInstructors();
};

// ─── Reviews Panel ───
let currentReviewsPage = 1;
const REVIEWS_PAGE_SIZE = 10;

function loadReviews() {
  const container = document.getElementById('reviewsList');
  const countEl = document.getElementById('reviewsCount');

  // 작성날짜 표시 ON/OFF 토글 상태 동기화 및 이벤트 바인딩
  const toggleEl = document.getElementById('reviewDateToggle');
  const statusEl = document.getElementById('reviewDateToggleStatus');
  if (toggleEl) {
    const showDate = (adminData && adminData.reviewSettings && adminData.reviewSettings.showDate !== undefined)
      ? Boolean(adminData.reviewSettings.showDate)
      : false;

    toggleEl.checked = showDate;
    if (statusEl) {
      statusEl.textContent = showDate ? 'ON' : 'OFF';
      statusEl.style.color = showDate ? '#2563eb' : '#6b7280';
    }

    if (!toggleEl.dataset.bound) {
      toggleEl.dataset.bound = 'true';
      toggleEl.addEventListener('change', async (e) => {
        const isChecked = e.target.checked;
        if (statusEl) {
          statusEl.textContent = isChecked ? 'ON' : 'OFF';
          statusEl.style.color = isChecked ? '#2563eb' : '#6b7280';
        }
        if (!adminData.reviewSettings) {
          adminData.reviewSettings = { showDate: false };
        }
        adminData.reviewSettings.showDate = isChecked;

        try {
          await DataService.updateReviewSettings(adminData.reviewSettings);
          showToast(isChecked ? '홈페이지 후기 작성날짜 표시가 ON으로 설정되었습니다.' : '홈페이지 후기 작성날짜 표시가 OFF로 설정되었습니다.');
        } catch (err) {
          console.error('[Admin] Review date toggle error:', err);
          showToast('설정 저장 중 오류가 발생했습니다.', 'danger');
        }
      });
    }
  }

  const reviewItems = (adminData && Array.isArray(adminData.reviews)) ? adminData.reviews : [];
  const totalCount = reviewItems.length;

  // 1. 후기 개수 자동 계산 및 상단 뱃지 표시
  if (countEl) {
    countEl.textContent = totalCount;
  }

  if (!container) return;

  // 2. 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / REVIEWS_PAGE_SIZE);
  if (currentReviewsPage > totalPages) {
    currentReviewsPage = Math.max(1, totalPages);
  }
  if (currentReviewsPage < 1) {
    currentReviewsPage = 1;
  }

  const startIndex = (currentReviewsPage - 1) * REVIEWS_PAGE_SIZE;
  const endIndex = startIndex + REVIEWS_PAGE_SIZE;
  const pagedReviews = reviewItems.slice(startIndex, endIndex);

  let html = `
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 15%;">이름</th>
            <th style="width: 20%;">수강 과정</th>
            <th>후기 내용</th>
            <th style="width: 14%;">작성 날짜</th>
            <th style="text-align:right; width: 130px;">작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (totalCount === 0) {
    html += `<tr><td colspan="5" style="text-align:center;color:var(--admin-text-secondary);padding:var(--space-8) 0;">등록된 후기가 없습니다.</td></tr>`;
  } else {
    html += pagedReviews.map((r, i) => {
      const actualIndex = startIndex + i;
      const formattedDate = (r.date || '').replace(/-/g, '.');
      return `
        <tr>
          <td data-label="이름" style="font-weight:700;">${r.name}</td>
          <td data-label="수강 과정">${r.course}</td>
          <td data-label="후기 내용" style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${r.text}</td>
          <td data-label="작성 날짜">${formattedDate}</td>
          <td data-label="작업" class="actions">
            <button class="admin-btn admin-btn--ghost" onclick="showEditForm('reviews', ${actualIndex})" style="padding:5px 12px;min-height:30px;font-size:11.5px;">수정</button>
            <button class="admin-btn admin-btn--ghost" onclick="confirmReviewDelete(${actualIndex}); return false;" style="padding:5px 12px;min-height:30px;font-size:11.5px;color:var(--admin-danger);">삭제</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  html += `</tbody></table></div>`;

  // 3. 후기가 11개 이상(2페이지 이상)일 때만 페이지네이션 렌더링
  if (totalPages > 1) {
    html += renderReviewsPagination(totalPages, currentReviewsPage);
  }

  container.innerHTML = html;
}

function renderReviewsPagination(totalPages, currentPage) {
  const maxVisiblePages = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisiblePages) {
    const half = Math.floor(maxVisiblePages / 2);
    startPage = currentPage - half;
    endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }
  }

  const pages = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return `
    <div class="admin-pagination-container">
      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeReviewsPage(${currentPage - 1})" 
        ${isPrevDisabled ? 'disabled' : ''}
        aria-label="이전 페이지">
        &lt;
      </button>

      ${pages.map(pageNum => `
        <button type="button" 
          class="admin-pagination-btn ${pageNum === currentPage ? 'is-active' : ''}" 
          onclick="changeReviewsPage(${pageNum})">
          ${pageNum}
        </button>
      `).join('')}

      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeReviewsPage(${currentPage + 1})" 
        ${isNextDisabled ? 'disabled' : ''}
        aria-label="다음 페이지">
        &gt;
      </button>
    </div>
  `;
}

window.changeReviewsPage = function (newPage) {
  const reviewItems = (adminData && Array.isArray(adminData.reviews)) ? adminData.reviews : [];
  const totalPages = Math.ceil(reviewItems.length / REVIEWS_PAGE_SIZE);
  if (newPage < 1 || newPage > totalPages) return;
  currentReviewsPage = newPage;
  loadReviews();
};

// ─── Gallery Panel Multi-Selection & Batch Actions ───
let currentGalleryFilter = 'all';
let currentGalleryViewMode = 'grid'; // Default & Permanent: Thumbnail Grid View
let currentGalleryPage = 1;
const GALLERY_PAGE_SIZE = 20;
let tempGalleryOrder = null;
const selectedGalleryIndexes = new Set();

function getGalleryCategoryName(cat) {
  if (!cat) return '기타';
  const categories = (adminData && Array.isArray(adminData.galleryCategories)) ? adminData.galleryCategories : [];
  const found = categories.find(c => c.id === cat || c.name === cat);
  if (found) return found.name;
  if (cat === 'freediving') return '프리다이빙';
  if (cat === 'course') return '강습';
  if (cat === 'swimming' || cat === 'eggyeong') return '입영';
  if (cat === 'etc') return '기타';
  return cat;
}

window.changeGalleryFilter = function (cat) {
  selectedGalleryIndexes.clear(); // 필터 변경 시 선택 상태 초기화
  currentGalleryFilter = cat;
  currentGalleryPage = 1;
  loadGallery();
};

window.changeGalleryPage = function (newPage) {
  const allGallery = (adminData && Array.isArray(adminData.gallery)) ? adminData.gallery : [];
  const filtered = allGallery.filter(item => {
    if (currentGalleryFilter === 'all') return true;
    const cat = item.category || 'freediving';
    return cat === currentGalleryFilter || DataService.normalizeCategory(cat) === currentGalleryFilter;
  });
  const totalPages = Math.ceil(filtered.length / GALLERY_PAGE_SIZE) || 1;
  if (newPage < 1 || newPage > totalPages) return;
  currentGalleryPage = newPage;
  loadGallery();
};

// 개별 미디어 선택 / 선택 해제
window.toggleGalleryItemSelection = function (index, isChecked) {
  if (isChecked) {
    selectedGalleryIndexes.add(index);
  } else {
    selectedGalleryIndexes.delete(index);
  }
  updateGalleryBatchActionBar();
  
  const cardEl = document.getElementById(`galCard_${index}`);
  if (cardEl) {
    if (isChecked) {
      cardEl.classList.add('is-selected');
    } else {
      cardEl.classList.remove('is-selected');
    }
  }
};

// 현재 필터 결과 미디어 전체 선택
window.selectAllGalleryItems = function () {
  const allGallery = (adminData && Array.isArray(adminData.gallery)) ? adminData.gallery : [];
  allGallery.forEach((item, idx) => {
    let isMatch = false;
    if (currentGalleryFilter === 'all') {
      isMatch = true;
    } else {
      const cat = item.category || 'freediving';
      isMatch = (cat === currentGalleryFilter || DataService.normalizeCategory(cat) === currentGalleryFilter);
    }
    if (isMatch) {
      selectedGalleryIndexes.add(idx);
    }
  });
  loadGallery();
};

// 모든 선택 해제
window.deselectAllGalleryItems = function () {
  selectedGalleryIndexes.clear();
  loadGallery();
};

// 카테고리 일괄 변경 드롭다운 옵션 바인딩
function populateGalleryBatchCatSelect(force = false) {
  const selectEl = document.getElementById('galleryBatchCatSelect');
  if (!selectEl) return;

  const categories = (adminData && Array.isArray(adminData.galleryCategories)) ? adminData.galleryCategories : [];
  
  // 이미 옵션이 들어있고 force가 false면 기존 선택값을 유지
  if (!force && selectEl.options.length > 1) {
    return;
  }

  const currentVal = selectEl.value;
  let html = `<option value="">카테고리 선택</option>`;
  html += categories.map(cat => {
    const id = typeof cat === 'object' ? (cat.id || cat.name) : cat;
    const name = typeof cat === 'object' ? (cat.name || cat.id) : cat;
    return `<option value="${id}">${name}</option>`;
  }).join('');

  selectEl.innerHTML = html;
  if (currentVal && selectEl.querySelector(`option[value="${currentVal}"]`)) {
    selectEl.value = currentVal;
  }
}

// 일괄 작업 바 UI 및 카테고리 옵션 갱신
function updateGalleryBatchActionBar() {
  const bar = document.getElementById('galleryBatchActionBar');
  const countBadge = document.getElementById('gallerySelectedCountBadge');

  if (!bar) return;

  const count = selectedGalleryIndexes.size;
  if (count > 0) {
    bar.style.display = 'flex';
    if (countBadge) countBadge.textContent = `${count}개 선택됨`;
  } else {
    bar.style.display = 'none';
  }

  populateGalleryBatchCatSelect();
}

// Reusable Admin Confirmation Modal Helper
// 전역 콜백 + event delegation 패턴으로 이벤트 누적/유실 방지
let _confirmOnConfirm = null;

function initConfirmModal() {
  const overlay = document.getElementById('confirmModalOverlay');
  if (!overlay || overlay.dataset.bound === 'true') return;
  overlay.dataset.bound = 'true';

  overlay.addEventListener('click', (e) => {
    const target = e.target;
    if (target.id === 'confirmModalCancel' || target.id === 'confirmModalClose') {
      overlay.classList.remove('is-active');
      _confirmOnConfirm = null;
    }
    if (target.id === 'confirmModalOk') {
      overlay.classList.remove('is-active');
      if (_confirmOnConfirm) {
        const fn = _confirmOnConfirm;
        _confirmOnConfirm = null;
        fn();
      }
    }
  });
}

window.showAdminConfirmModal = function ({ title, cancelText = '취소', confirmText = '변경하기', onConfirm }) {
  const overlay = document.getElementById('confirmModalOverlay');
  const titleEl = document.getElementById('confirmModalTitle');
  const cancelBtn = document.getElementById('confirmModalCancel');
  const okBtn = document.getElementById('confirmModalOk');

  if (!overlay || !titleEl || !okBtn) {
    console.log('[Confirm Modal] DOM not found, falling back to window.confirm');
    if (window.confirm(title)) {
      if (onConfirm) onConfirm();
    }
    return;
  }

  initConfirmModal();

  titleEl.textContent = title;
  if (cancelBtn) cancelBtn.textContent = cancelText;
  okBtn.textContent = confirmText;

  _confirmOnConfirm = onConfirm;
  overlay.classList.add('is-active');
};

// 카테고리 일괄 변경
window.batchChangeGalleryCategory = async function () {
  console.log('[Gallery Bulk] category change button clicked');
  const count = selectedGalleryIndexes.size;
  console.log('[Gallery Bulk] selected count:', count);

  if (count === 0) {
    showToast('변경할 미디어를 선택해주세요.');
    return;
  }

  const selectEl = document.getElementById('galleryBatchCatSelect');
  const targetCatId = selectEl?.value;
  console.log('[Gallery Bulk] target category id:', targetCatId);

  if (!targetCatId) {
    showToast('변경할 카테고리를 선택해주세요.');
    return;
  }

  const targetCatName = getGalleryCategoryName(targetCatId);
  const promptText = `선택한 ${count}개의 미디어를 '${targetCatName}' 카테고리로 변경할까요?`;
  console.log('[Gallery Bulk] showing confirm:', promptText);

  showAdminConfirmModal({
    title: promptText,
    cancelText: '취소',
    confirmText: '변경하기',
    onConfirm: async () => {
      try {
        const allGallery = adminData.gallery || [];
        selectedGalleryIndexes.forEach(idx => {
          if (allGallery[idx]) {
            allGallery[idx].category = targetCatId;
          }
        });

        await DataService.updateGallery(allGallery);
        writeAdminLog(`갤러리 미디어 ${count}개 카테고리 일괄 변경 (${targetCatName})`);
        showToast(`${count}개의 미디어 카테고리를 '${targetCatName}'으로 변경했습니다.`);
        selectedGalleryIndexes.clear();
        if (selectEl) selectEl.value = '';
        populateGalleryBatchCatSelect(true);
        loadGallery();
      } catch (err) {
        console.error("Batch category change error:", err);
        showToast("카테고리 변경에 실패했습니다. 다시 시도해주세요.");
      }
    }
  });
};

// 공개 / 비공개 일괄 변경
window.batchChangeGalleryVisibility = async function (visible) {
  const count = selectedGalleryIndexes.size;
  if (count === 0) {
    showToast('변경할 미디어를 선택해주세요.');
    return;
  }

  const label = visible ? '공개' : '비공개';
  const promptText = `선택한 ${count}개의 미디어를 ${label} 상태로 변경할까요?`;

  showAdminConfirmModal({
    title: promptText,
    cancelText: '취소',
    confirmText: '변경하기',
    onConfirm: async () => {
      try {
        const allGallery = adminData.gallery || [];
        selectedGalleryIndexes.forEach(idx => {
          if (allGallery[idx]) {
            allGallery[idx].visible = visible;
          }
        });

        await DataService.updateGallery(allGallery);
        writeAdminLog(`갤러리 미디어 ${count}개 공개 상태 일괄 변경 (${label})`);
        showToast(`${count}개의 미디어를 ${label} 상태로 변경했습니다.`);
        selectedGalleryIndexes.clear();
        loadGallery();
      } catch (err) {
        console.error("Batch visibility change error:", err);
        showToast("일부 미디어 변경에 실패했습니다. 다시 시도해주세요.");
      }
    }
  });
};

function updateGalleryControlUI() {
  const filterGroup = document.getElementById('galleryCategoryFilterGroup');
  if (filterGroup && adminData && Array.isArray(adminData.galleryCategories)) {
    const categories = [{ id: 'all', name: '전체' }, ...adminData.galleryCategories];
    filterGroup.innerHTML = categories.map(cat => {
      const isAct = cat.id === currentGalleryFilter;
      return `<button type="button" class="gallery-cat-filter-btn" data-cat="${cat.id}" onclick="changeGalleryFilter('${cat.id}')" style="border: none; background: ${isAct ? '#ffffff' : 'transparent'}; color: ${isAct ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)'}; font-size: 12px; font-weight: ${isAct ? '600' : '500'}; padding: 5px 12px; border-radius: 6px; cursor: pointer; box-shadow: ${isAct ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'}; transition: all 0.15s;">${cat.name}</button>`;
    }).join('');
  }
  updateGalleryBatchActionBar();
}

function loadGallery() {
  const container = document.getElementById('galleryList');
  const countEl = document.getElementById('galleryCount');

  if (!adminData.gallery) {
    adminData.gallery = [];
  }

  const allGallery = adminData.gallery;
  const totalCount = allGallery.length;
  if (countEl) {
    countEl.textContent = totalCount;
  }

  updateGalleryControlUI();

  if (!container) return;

  // 1. 카테고리 필터링 (원래 인덱스 보존)
  const filtered = allGallery.map((item, originalIndex) => ({ ...item, originalIndex })).filter(item => {
    if (currentGalleryFilter === 'all') return true;
    const cat = item.category || 'freediving';
    return cat === currentGalleryFilter || DataService.normalizeCategory(cat) === currentGalleryFilter;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / GALLERY_PAGE_SIZE) || 1;
  if (currentGalleryPage > totalPages) {
    currentGalleryPage = totalPages;
  }

  const startIndex = (currentGalleryPage - 1) * GALLERY_PAGE_SIZE;
  const pagedItems = filtered.slice(startIndex, startIndex + GALLERY_PAGE_SIZE);
  const isFilterAll = currentGalleryFilter === 'all';

  let html = '';

  // ─── 썸네일 보기 전용 (Thumbnail Grid View Only) ───
  if (totalFiltered === 0) {
    html += `
      <div style="text-align:center; color:var(--admin-text-secondary); padding:var(--space-8) 0;">
        해당 카테고리에 등록된 미디어가 없습니다.
      </div>
    `;
  } else {
    html += `
      <div class="gallery-admin-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; padding: 16px;">
    `;
    html += pagedItems.map(g => {
      const isVisible = g.visible !== false;
      const catName = getGalleryCategoryName(g.category);
      const isVideo = g.mediaType === 'video';
      const isSelected = selectedGalleryIndexes.has(g.originalIndex);

      return `
        <div id="galCard_${g.originalIndex}" class="gallery-thumbnail-card ${isSelected ? 'is-selected' : ''} ${isFilterAll ? 'draggable-gallery-card' : ''}" ${isFilterAll ? `draggable="true" data-index="${g.originalIndex}"` : ''} onclick="showEditForm('gallery', ${g.originalIndex})" style="background: #ffffff; border: 1px solid var(--admin-border); border-radius: var(--radius-md); overflow: hidden; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; position: relative;" onmouseenter="if (!this.classList.contains('is-selected')) { this.style.borderColor='var(--admin-primary)'; } this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';" onmouseleave="if (!this.classList.contains('is-selected')) { this.style.borderColor='var(--admin-border)'; } this.style.transform='none'; this.style.boxShadow='none';">
          <div style="width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #0c1a2e; position: relative;">
            
            <!-- 다중 선택 체크박스 (좌측 상단) -->
            <label class="gal-select-checkbox-wrap" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()">
              <input type="checkbox" class="gal-card-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleGalleryItemSelection(${g.originalIndex}, this.checked)">
              <span class="gal-card-custom-check"></span>
            </label>

            <img src="${g.src || (isVideo ? (g.thumbnailUrl || g.videoUrl) : 'images/gallery-1.jpg')}" alt="${g.alt || ''}" style="pointer-events: none; -webkit-user-drag: none; width: 100%; height: 100%; object-fit: cover;">
            
            <!-- 노출 상태 뱃지 (우측 상단) -->
            <span class="badge ${isVisible ? 'badge--success' : 'badge--neutral'}" style="position: absolute; top: 8px; right: 8px; font-size: 10.5px; padding: 2px 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
              ${isVisible ? '노출' : '숨김'}
            </span>

            ${isVideo ? `
              <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.75); color: #ffffff; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 3px;">
                <span>▶</span> 영상
              </div>
            ` : `
              <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.55); color: #ffffff; font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 4px;">
                사진
              </div>
            `}
          </div>
          <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; justify-content: space-between;">
            <div style="font-weight: 600; font-size: 13px; color: var(--admin-text-primary); line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 35px;" title="${g.alt || ''}">
              ${g.alt || '(설명 없음)'}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 6px; border-top: 1px solid #F1F5F9;">
              <span class="badge badge--info" style="font-size: 10.5px;">${catName}</span>
              <span class="badge ${isVideo ? 'badge--primary' : 'badge--neutral'}" style="font-size: 10.5px; ${isVideo ? 'background:#EFF6FF; color:#2563EB;' : ''}">${isVideo ? '영상' : '사진'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    html += `</div>`;
  }

  // 3. 페이지네이션 (20개 초과, 2페이지 이상일 때만 표시)
  if (totalPages > 1) {
    html += renderGalleryPagination(totalPages, currentGalleryPage);
  }

  container.innerHTML = html;

  if (isFilterAll) {
    initGalleryDragAndDrop();
  }
}

function initGalleryDragAndDrop() {
  const container = document.getElementById('galleryList');
  if (!container) return;

  const grid = container.querySelector('.gallery-admin-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.draggable-gallery-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      cards.forEach(c => c.classList.remove('drag-over'));
      checkGalleryOrderChanged();
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });
  });

    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingCard = grid.querySelector('.dragging');
      if (!draggingCard) return;
      const cardsAfter = [...grid.querySelectorAll('.draggable-gallery-card:not(.dragging)')];
      const afterCard = cardsAfter.find(c => {
        const rect = c.getBoundingClientRect();
        return (e.clientX < rect.left + rect.width / 2) && (e.clientY < rect.bottom);
      });
      if (afterCard == null) {
        grid.appendChild(draggingCard);
      } else {
        grid.insertBefore(draggingCard, afterCard);
      }
    });
}

function checkGalleryOrderChanged() {
  const container = document.getElementById('galleryList');
  if (!container) return;

  const items = container.querySelectorAll('.draggable-row, .draggable-gallery-card');
  const newOrderIndices = [...items].map(el => parseInt(el.getAttribute('data-index')));

  let changed = false;
  for (let i = 0; i < newOrderIndices.length; i++) {
    if (newOrderIndices[i] !== i) {
      changed = true;
      break;
    }
  }

  const applyContainer = document.getElementById('galleryOrderApplyContainer');
  if (applyContainer) {
    if (changed) {
      applyContainer.style.display = 'flex';
      tempGalleryOrder = newOrderIndices.map(idx => adminData.gallery[idx]);
    } else {
      applyContainer.style.display = 'none';
      tempGalleryOrder = null;
    }
  }
}

window.applyGalleryOrder = async function () {
  if (!tempGalleryOrder) return;

  adminData.gallery = [...tempGalleryOrder];
  await DataService.updateGallery(adminData.gallery);
  tempGalleryOrder = null;

  const applyContainer = document.getElementById('galleryOrderApplyContainer');
  if (applyContainer) applyContainer.style.display = 'none';

  writeAdminLog('갤러리 미디어 노출 순서 재정렬 및 적용');
  showToast('새로운 노출 순서가 반영되었습니다.');
  loadGallery();
};

function renderGalleryPagination(totalPages, currentPage) {
  const maxVisiblePages = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisiblePages) {
    const half = Math.floor(maxVisiblePages / 2);
    startPage = currentPage - half;
    endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }
  }

  const pages = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return `
    <div class="admin-pagination-container">
      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeGalleryPage(${currentPage - 1})" 
        ${isPrevDisabled ? 'disabled' : ''}
        aria-label="이전 페이지">
        &lt;
      </button>

      ${pages.map(pageNum => `
        <button type="button" 
          class="admin-pagination-btn ${pageNum === currentPage ? 'is-active' : ''}" 
          onclick="changeGalleryPage(${pageNum})">
          ${pageNum}
        </button>
      `).join('')}

      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeGalleryPage(${currentPage + 1})" 
        ${isNextDisabled ? 'disabled' : ''}
        aria-label="다음 페이지">
        &gt;
      </button>
    </div>
  `;
}

// ─── FAQ Panel ───
let currentFaqPage = 1;
const FAQ_PAGE_SIZE = 10;

function loadFaq() {
  const container = document.getElementById('faqList');
  const faqCountEl = document.getElementById('faqCount');

  const faqItems = (adminData && Array.isArray(adminData.faq)) ? adminData.faq : [];
  const totalCount = faqItems.length;

  // 1. FAQ 개수 자동 계산 및 상단 뱃지 표시
  if (faqCountEl) {
    faqCountEl.textContent = totalCount;
  }

  if (!container) return;

  // 2. 페이지네이션 계산
  const totalPages = Math.ceil(totalCount / FAQ_PAGE_SIZE);
  if (currentFaqPage > totalPages) {
    currentFaqPage = Math.max(1, totalPages);
  }
  if (currentFaqPage < 1) {
    currentFaqPage = 1;
  }

  const startIndex = (currentFaqPage - 1) * FAQ_PAGE_SIZE;
  const endIndex = startIndex + FAQ_PAGE_SIZE;
  const pagedFaq = faqItems.slice(startIndex, endIndex);

  let html = `
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 35%;">질문 (Question)</th>
            <th>답변 요약 (Answer)</th>
            <th style="text-align:right; width: 130px;">작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (totalCount === 0) {
    html += `<tr><td colspan="3" style="text-align:center;color:var(--admin-text-secondary);padding:var(--space-8) 0;">등록된 FAQ 정보가 없습니다.</td></tr>`;
  } else {
    html += pagedFaq.map((f, i) => {
      const actualIndex = startIndex + i;
      return `
        <tr>
          <td data-label="질문 (Question)" style="font-weight:700;color:var(--admin-text-primary);">${f.question}</td>
          <td data-label="답변 요약 (Answer)" style="max-width:350px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--admin-text-secondary);">${f.answer}</td>
          <td data-label="작업" class="actions">
            <button class="admin-btn admin-btn--ghost" onclick="showEditForm('faq', ${actualIndex})" style="padding:5px 12px;min-height:30px;font-size:11.5px;">수정</button>
            <button class="admin-btn admin-btn--ghost" onclick="confirmFaqDelete(${actualIndex}); return false;" style="padding:5px 12px;min-height:30px;font-size:11.5px;color:var(--admin-danger);">삭제</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  html += `</tbody></table></div>`;

  // 3. FAQ가 11개 이상(2페이지 이상)일 때만 페이지네이션 렌더링
  if (totalPages > 1) {
    html += renderFaqPagination(totalPages, currentFaqPage);
  }

  container.innerHTML = html;
}

function renderFaqPagination(totalPages, currentPage) {
  const maxVisiblePages = 5;
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxVisiblePages) {
    const half = Math.floor(maxVisiblePages / 2); // 2
    startPage = currentPage - half;
    endPage = currentPage + half;

    if (startPage < 1) {
      startPage = 1;
      endPage = maxVisiblePages;
    } else if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxVisiblePages + 1;
    }
  }

  const pages = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return `
    <div class="admin-pagination-container">
      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeFaqPage(${currentPage - 1})" 
        ${isPrevDisabled ? 'disabled' : ''}
        aria-label="이전 페이지">
        &lt;
      </button>

      ${pages.map(pageNum => `
        <button type="button" 
          class="admin-pagination-btn ${pageNum === currentPage ? 'is-active' : ''}" 
          onclick="changeFaqPage(${pageNum})">
          ${pageNum}
        </button>
      `).join('')}

      <button type="button" class="admin-pagination-btn admin-pagination-btn--nav" 
        onclick="changeFaqPage(${currentPage + 1})" 
        ${isNextDisabled ? 'disabled' : ''}
        aria-label="다음 페이지">
        &gt;
      </button>
    </div>
  `;
}

window.changeFaqPage = function (newPage) {
  const faqItems = (adminData && Array.isArray(adminData.faq)) ? adminData.faq : [];
  const totalPages = Math.ceil(faqItems.length / FAQ_PAGE_SIZE);
  if (newPage < 1 || newPage > totalPages) return;
  currentFaqPage = newPage;
  loadFaq();
};

// ─── Footer / SNS Panel ───
function loadFooter() {
  const d = adminData.footer || {};
  const elSlogan = document.getElementById('footerSlogan');
  const elRep = document.getElementById('footerRep');
  const elBizNum = document.getElementById('footerBizNum');
  const elAddress = document.getElementById('footerAddress');
  const elPhone = document.getElementById('footerPhone');
  const elEmail = document.getElementById('footerEmail');

  if (elSlogan) elSlogan.value = d.slogan || '';
  if (elRep) elRep.value = d.company?.representative || '';
  if (elBizNum) elBizNum.value = d.company?.businessNumber || '';
  if (elAddress) elAddress.value = d.company?.address || '';
  if (elPhone) elPhone.value = d.company?.phone || '';
  if (elEmail) elEmail.value = d.company?.email || '';

  const snsContainer = document.getElementById('snsList');
  if (!snsContainer) return;

  const defaultSns = [
    { id: 'instagram', name: '인스타그램', icon: 'instagram', link: 'instagram', visible: true },
    { id: 'blog', name: '블로그', icon: 'blog', link: 'blog', visible: true },
    { id: 'youtube', name: '유튜브', icon: 'youtube', link: 'youtube', visible: true },
    { id: 'kakao', name: '카카오톡', icon: 'kakao', link: 'kakao', visible: true }
  ];

  const snsList = (Array.isArray(d.sns) && d.sns.length > 0) ? d.sns : defaultSns;
  const links = adminData.links || {};

  snsContainer.innerHTML = snsList.map((s, i) => {
    const key = s.id || s.link || '';
    const currentUrl = s.url || links[key] || '';

    return `
      <tr class="footer-sns-row">
        <td style="text-align: center; vertical-align: middle; width: 70px;">
          <label class="toggle" style="margin: 0 auto; display: inline-block;">
            <input type="checkbox" ${s.visible ? 'checked' : ''} id="snsVisible${i}">
            <span class="toggle__slider"></span>
          </label>
        </td>
        <td style="vertical-align: middle; width: 180px;">
          <input type="text" class="form-input" id="snsName${i}" value="${s.name || ''}" placeholder="이름" style="font-size: 13px;">
        </td>
        <td style="vertical-align: middle;">
          <input type="text" class="form-input" id="snsUrl${i}" value="${currentUrl}" placeholder="https://" style="font-size: 13px; width: 100%; box-sizing: border-box;">
        </td>
      </tr>
    `;
  }).join('');
}

window.saveFooter = async function () {
  const d = adminData.footer || {};
  d.slogan = document.getElementById('footerSlogan')?.value || '';
  d.company = {
    ...(d.company || {}),
    representative: document.getElementById('footerRep')?.value || '',
    businessNumber: document.getElementById('footerBizNum')?.value || '',
    address: document.getElementById('footerAddress')?.value || '',
    phone: document.getElementById('footerPhone')?.value || '',
    email: document.getElementById('footerEmail')?.value || ''
  };

  const defaultSns = [
    { id: 'instagram', name: '인스타그램', icon: 'instagram', link: 'instagram', visible: true },
    { id: 'blog', name: '블로그', icon: 'blog', link: 'blog', visible: true },
    { id: 'youtube', name: '유튜브', icon: 'youtube', link: 'youtube', visible: true },
    { id: 'kakao', name: '카카오톡', icon: 'kakao', link: 'kakao', visible: true }
  ];

  const sourceSns = (Array.isArray(d.sns) && d.sns.length > 0) ? d.sns : defaultSns;
  if (!adminData.links) adminData.links = {};

  d.sns = sourceSns.map((s, i) => {
    const nameVal = document.getElementById(`snsName${i}`)?.value || s.name;
    const urlVal = document.getElementById(`snsUrl${i}`)?.value || '';
    const visibleVal = document.getElementById(`snsVisible${i}`)?.checked ?? s.visible;

    const linkKey = s.id || s.link;
    if (linkKey) {
      adminData.links[linkKey] = urlVal;
    }

    return {
      ...s,
      name: nameVal,
      url: urlVal,
      link: s.link || s.id,
      icon: s.icon || s.id,
      visible: visibleVal
    };
  });

  adminData.footer = d;

  await Promise.all([
    DataService.updateFooter(adminData.footer),
    DataService.updateLinks(adminData.links)
  ]);

  writeAdminLog('Footer 정보 및 SNS 채널 설정 수정');
  showToast('Footer 및 SNS 설정이 저장되었습니다.');
};

// ═══════ Links ═══════
function loadLinks() {
  const d = adminData.links;
  document.getElementById('linkKakao').value = d.kakao || '';
  document.getElementById('linkNaverBooking').value = d.naverBooking || '';
  document.getElementById('linkNaverPlace').value = d.naverPlace || '';
  document.getElementById('linkNaverCafe').value = d.naverCafe || '';
  document.getElementById('linkSmartStore').value = d.smartStore || '';
  document.getElementById('linkInstagram').value = d.instagram || '';
  document.getElementById('linkYoutube').value = d.youtube || '';
  document.getElementById('linkBlog').value = d.blog || '';
  document.getElementById('linkPhone').value = d.phone || '';
}

window.saveLinks = async function () {
  adminData.links = {
    kakao: document.getElementById('linkKakao').value,
    naverBooking: document.getElementById('linkNaverBooking').value,
    naverPlace: document.getElementById('linkNaverPlace').value,
    naverCafe: document.getElementById('linkNaverCafe').value,
    smartStore: document.getElementById('linkSmartStore').value,
    instagram: document.getElementById('linkInstagram').value,
    youtube: document.getElementById('linkYoutube').value,
    blog: document.getElementById('linkBlog').value,
    phone: document.getElementById('linkPhone').value
  };
  await DataService.updateLinks(adminData.links);
  writeAdminLog('연동 서비스 외부 API 주소 변경');
  showToast();
};

// ═══════ Settings (설정 — 기본 설정 & SEO 설정) ═══════
window.switchSettingsTab = function(tabName) {
  const isBasic = tabName === 'basic';
  const btnBasic = document.getElementById('tabBtnBasic');
  const btnSeo = document.getElementById('tabBtnSeo');
  const contentBasic = document.getElementById('tabContentBasic');
  const contentSeo = document.getElementById('tabContentSeo');

  if (btnBasic && btnSeo && contentBasic && contentSeo) {
    btnBasic.classList.toggle('is-active', isBasic);
    btnBasic.style.borderBottomColor = isBasic ? 'var(--admin-primary)' : 'transparent';
    btnBasic.style.color = isBasic ? 'var(--admin-primary)' : 'var(--admin-text-secondary)';
    btnBasic.style.fontWeight = isBasic ? '700' : '600';

    btnSeo.classList.toggle('is-active', !isBasic);
    btnSeo.style.borderBottomColor = !isBasic ? 'var(--admin-primary)' : 'transparent';
    btnSeo.style.color = !isBasic ? 'var(--admin-primary)' : 'var(--admin-text-secondary)';
    btnSeo.style.fontWeight = !isBasic ? '700' : '600';

    contentBasic.style.display = isBasic ? 'block' : 'none';
    contentSeo.style.display = !isBasic ? 'block' : 'none';
  }
};

// ─── 갤러리 카테고리 관리 (Simple Card Drag & Drop Layout) ───
let draggedCategoryIndex = null;
let isCategoryDragAllowed = false;

window.enableCategoryCardDrag = function(handleEl) {
  isCategoryDragAllowed = true;
  const row = handleEl.closest('.category-card-row');
  if (row) row.setAttribute('draggable', 'true');
};

window.disableCategoryCardDrag = function(handleEl) {
  isCategoryDragAllowed = false;
  const row = handleEl.closest('.category-card-row');
  if (row) row.setAttribute('draggable', 'false');
};

window.renderGalleryCategoryManager = function() {
  const container = document.getElementById('galleryCategoryManagerContainer');
  if (!container) return;

  const categories = adminData.galleryCategories || [
    { id: 'freediving', name: '프리다이빙' },
    { id: 'course', name: '강습' },
    { id: 'etc', name: '기타' }
  ];

  container.innerHTML = categories.map((cat, index) => `
    <div class="category-card-row"
      data-index="${index}"
      draggable="false"
      ondragstart="handleCategoryDragStart(event, ${index})"
      ondragover="handleCategoryDragOver(event, ${index})"
      ondragleave="handleCategoryDragLeave(event)"
      ondrop="handleCategoryDrop(event, ${index})"
      ondragend="handleCategoryDragEnd(event)"
      style="padding: 10px 14px; background: #ffffff; border: 1px solid var(--admin-border); border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
      
      <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
        <span class="drag-handle"
          onmousedown="enableCategoryCardDrag(this)"
          onmouseup="disableCategoryCardDrag(this)"
          onmouseleave="disableCategoryCardDrag(this)"
          title="드래그하여 순서 변경">⋮⋮</span>
        <input type="text" class="form-input" id="galCatName_${index}" value="${cat.name || ''}"
          onmousedown="event.stopPropagation()"
          onfocus="disableCategoryCardDrag(this)"
          placeholder="카테고리 이름" style="flex: 1; max-width: 210px; height: 36px; font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary); border: 1px solid var(--admin-border); border-radius: 5px;">
        <input type="hidden" id="galCatId_${index}" value="${cat.id || ''}">
      </div>

      <button type="button" class="admin-btn admin-btn--danger-ghost" onclick="deleteGalleryCategory(${index})" style="padding: 4px 10px; font-size: 12px; white-space: nowrap; height: 32px;">
        삭제
      </button>
    </div>
  `).join('');
};

window.handleCategoryDragStart = function(e, index) {
  if (!isCategoryDragAllowed) {
    e.preventDefault();
    return false;
  }
  draggedCategoryIndex = index;
  const row = e.currentTarget;
  if (row) {
    row.classList.add('is-dragging');
  }
  e.dataTransfer.effectAllowed = 'move';
};

window.handleCategoryDragOver = function(e, index) {
  e.preventDefault();
  if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
  e.dataTransfer.dropEffect = 'move';

  const row = e.currentTarget;
  const rect = row.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;
  const isTopHalf = offsetY < rect.height / 2;

  row.classList.remove('drop-above', 'drop-below');
  if (isTopHalf) {
    row.classList.add('drop-above');
    row.dataset.dropPos = 'above';
  } else {
    row.classList.add('drop-below');
    row.dataset.dropPos = 'below';
  }
};

window.handleCategoryDragLeave = function(e) {
  const row = e.currentTarget;
  if (row) {
    row.classList.remove('drop-above', 'drop-below');
  }
};

window.handleCategoryDrop = function(e, targetIndex) {
  e.preventDefault();
  const row = e.currentTarget;
  const dropPos = row?.dataset?.dropPos || 'below';

  document.querySelectorAll('.category-card-row').forEach(r => {
    r.classList.remove('drop-above', 'drop-below', 'is-dragging');
  });

  if (draggedCategoryIndex === null) return;

  const cats = adminData.galleryCategories || [];
  if (!cats.length) return;

  // Save current input values before reordering
  for (let i = 0; i < cats.length; i++) {
    const nameVal = document.getElementById(`galCatName_${i}`)?.value.trim();
    if (nameVal) cats[i].name = nameVal;
  }

  const [movedItem] = cats.splice(draggedCategoryIndex, 1);

  let insertIndex = targetIndex;
  if (dropPos === 'below') {
    insertIndex = targetIndex + (draggedCategoryIndex < targetIndex ? 0 : 1);
  } else {
    insertIndex = targetIndex - (draggedCategoryIndex < targetIndex ? 1 : 0);
  }
  if (insertIndex < 0) insertIndex = 0;
  if (insertIndex > cats.length) insertIndex = cats.length;

  cats.splice(insertIndex, 0, movedItem);

  draggedCategoryIndex = null;
  isCategoryDragAllowed = false;
  renderGalleryCategoryManager();
  markCategorySavePending();
};

window.handleCategoryDragEnd = function(e) {
  draggedCategoryIndex = null;
  isCategoryDragAllowed = false;
  document.querySelectorAll('.category-card-row').forEach(r => {
    r.classList.remove('drop-above', 'drop-below', 'is-dragging');
    r.setAttribute('draggable', 'false');
  });
};

window.markCategorySavePending = function() {
  const saveBtn = document.querySelector('button[onclick="saveGalleryCategories()"]');
  if (saveBtn) {
    saveBtn.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.3)';
    saveBtn.textContent = '카테고리 순서 저장하기 *';
  }
};

window.addGalleryCategory = function() {
  if (!Array.isArray(adminData.galleryCategories)) {
    adminData.galleryCategories = [];
  }
  const newId = 'cat_' + Date.now().toString(36);
  adminData.galleryCategories.push({
    id: newId,
    name: '새 카테고리'
  });
  renderGalleryCategoryManager();
  markCategorySavePending();
};

window.deleteGalleryCategory = function(index) {
  const cats = adminData.galleryCategories;
  if (!cats || index < 0 || index >= cats.length) return;

  const targetCat = cats[index];
  const targetId = targetCat.id;
  const targetName = targetCat.name;

  // Scans adminData.gallery for items using this category
  const galleryItems = adminData.gallery || [];
  const inUse = galleryItems.some(item => {
    if (!item) return false;
    const itemCat = String(item.category || '').trim().toLowerCase();
    const normalized = DataService.normalizeCategory(item.category, cats);
    return itemCat === targetId.toLowerCase() ||
           itemCat === targetName.toLowerCase() ||
           normalized === targetId;
  });

  if (inUse) {
    alert(`현재 갤러리에서 사용 중인 카테고리입니다.\n[${targetName}] 카테고리를 사용하는 미디어의 카테고리를 먼저 변경해주세요.`);
    showToast(`[${targetName}] 카테고리가 갤러리에서 사용 중이므로 삭제할 수 없습니다.`);
    return;
  }

  cats.splice(index, 1);
  renderGalleryCategoryManager();
  showToast(`[${targetName}] 카테고리가 삭제되었습니다.`);
  markCategorySavePending();
};

window.saveGalleryCategories = async function() {
  const cats = adminData.galleryCategories || [];
  const updatedCategories = [];

  for (let i = 0; i < cats.length; i++) {
    const nameVal = document.getElementById(`galCatName_${i}`)?.value.trim() || `카테고리 ${i + 1}`;
    const idVal = document.getElementById(`galCatId_${i}`)?.value.trim() || cats[i].id || `cat_${i + 1}`;
    updatedCategories.push({
      id: idVal,
      name: nameVal
    });
  }

  adminData.galleryCategories = updatedCategories;
  await DataService.updateGalleryCategories(updatedCategories);
  writeAdminLog('갤러리 카테고리 명칭 및 순서 변경');
  showToast('카테고리 순서가 저장되었습니다.');
  renderGalleryCategoryManager();
};

// ─── 나에게 맞는 과정 찾기 (Course Finder) ───
window.loadCourseFinderSettings = function() {
  const finder = adminData.courseFinder || {};
  const programs = adminData.programs || [];

  // 1. Visible toggle & label
  const visibleToggle = document.getElementById('finderVisibleToggle');
  const visibleBadge = document.getElementById('finderVisibleBadge');
  const visibleLabel = document.getElementById('finderVisibleLabel');

  function updateFinderToggleUI(isChecked) {
    if (visibleBadge) {
      visibleBadge.className = `toggle-status-badge ${isChecked ? 'status-green' : 'status-gray'}`;
    }
    if (visibleLabel) {
      visibleLabel.textContent = isChecked ? '공개' : '비공개';
    }
  }

  if (visibleToggle) {
    const isVis = finder.visible !== false;
    visibleToggle.checked = isVis;
    updateFinderToggleUI(isVis);
    visibleToggle.onchange = function() {
      updateFinderToggleUI(this.checked);
    };
  }

  // 2. Title & Subtitle
  const finderTitleInput = document.getElementById('finderTitle');
  const finderSubtitleInput = document.getElementById('finderSubtitle');
  if (finderTitleInput) finderTitleInput.value = finder.title || '나에게 맞는 과정 찾기';
  if (finderSubtitleInput) finderSubtitleInput.value = finder.subtitle || '3가지 질문에 답하면, 딱 맞는 과정을 추천해드려요.';

  const steps = finder.steps || [];

  // Q1
  if (steps[0]) {
    const q1Input = document.getElementById('editFinderQ1');
    if (q1Input) q1Input.value = steps[0].question || '프리다이빙 경험이 있으신가요?';
    const opts = steps[0].options || [];
    if (document.getElementById('editFinderQ1Opt0')) document.getElementById('editFinderQ1Opt0').value = opts[0]?.text || '처음입니다';
    if (document.getElementById('editFinderQ1Opt1')) document.getElementById('editFinderQ1Opt1').value = opts[1]?.text || '체험만 해봤어요';
    if (document.getElementById('editFinderQ1Opt2')) document.getElementById('editFinderQ1Opt2').value = opts[2]?.text || '자격증이 있어요';
  }

  // Q2
  if (steps[1]) {
    const q2Input = document.getElementById('editFinderQ2');
    if (q2Input) q2Input.value = steps[1].question || '어떤 목표를 가지고 계신가요?';
    const opts = steps[1].options || [];
    if (document.getElementById('editFinderQ2Opt0')) document.getElementById('editFinderQ2Opt0').value = opts[0]?.text || '한번 체험해보고 싶어요';
    if (document.getElementById('editFinderQ2Opt1')) document.getElementById('editFinderQ2Opt1').value = opts[1]?.text || '자격증을 취득하고 싶어요';
    if (document.getElementById('editFinderQ2Opt2')) document.getElementById('editFinderQ2Opt2').value = opts[2]?.text || '더 깊이 도전하고 싶어요';
    if (document.getElementById('editFinderQ2Opt3')) document.getElementById('editFinderQ2Opt3').value = opts[3]?.text || '강사가 되고 싶어요';
  }

  // Q3
  if (steps[2]) {
    const q3Input = document.getElementById('editFinderQ3');
    if (q3Input) q3Input.value = steps[2].question || '원하는 교육 기간은 얼마인가요?';
    const opts = steps[2].options || [];
    if (document.getElementById('editFinderQ3Opt0')) document.getElementById('editFinderQ3Opt0').value = opts[0]?.text || '반나절 (3~4시간)';
    if (document.getElementById('editFinderQ3Opt1')) document.getElementById('editFinderQ3Opt1').value = opts[1]?.text || '1~2일';
    if (document.getElementById('editFinderQ3Opt2')) document.getElementById('editFinderQ3Opt2').value = opts[2]?.text || '3일 이상';
  }

  // 3. Render Recommendation Results Program Linking Cards (3x2 Responsive Grid)
  const linkingContainer = document.getElementById('finderResultsLinkingContainer');
  if (linkingContainer) {
    const results = finder.results || [];
    const resultMeta = [
      { title: '1. 입문 / 체험형 추천', cond: '경험: 없음 | 목표: 체험' },
      { title: '2. 입문 / 자격증형 추천', cond: '경험: 없음 | 목표: 자격증' },
      { title: '3. 체험 경험자 추천', cond: '경험: 체험만 해봄' },
      { title: '4. 심화 과정 추천', cond: '경험: 자격증 | 목표: 더 깊이' },
      { title: '5. 강사 과정 추천', cond: '경험: 자격증 | 목표: 강사' },
      { title: '6. 기본 추천', cond: '기타 조합 Fallback' }
    ];

    linkingContainer.innerHTML = results.map((res, index) => {
      const meta = resultMeta[index] || { title: `결과 ${index + 1}`, cond: '' };
      const currentProgId = res.programId || '';
      const matchedProg = programs.find(p => p.id === currentProgId);
      const currentTitle = matchedProg ? matchedProg.title : (res.title || '연결 미지정');

      const optionsHtml = programs.map(p => {
        const isSelected = p.id === currentProgId;
        return `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.title} (ID: ${p.id})</option>`;
      }).join('');

      return `
        <div style="padding: 14px 16px; background: #ffffff; border: 1px solid var(--admin-border); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--admin-text-primary); margin-bottom: 4px;">${meta.title}</div>
            <div style="font-size: 11.5px; color: var(--admin-text-tertiary); margin-bottom: 8px; background: #F8FAFC; padding: 3px 8px; border-radius: 4px; display: inline-block;">${meta.cond}</div>
            <div style="font-size: 12px; color: var(--admin-text-secondary); margin-bottom: 12px;">현재 추천: <strong style="color: var(--admin-primary);">${currentTitle}</strong></div>
          </div>
          <div>
            <label class="form-label" style="font-size: 11.5px; font-weight: 600; margin-bottom: 4px;">연결 교육과정</label>
            <select class="form-select" id="finderResultProgSelect_${index}" style="height: 36px; font-size: 12.5px; font-weight: 600;">
              ${optionsHtml}
            </select>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.saveCourseFinderSettings = async function () {
  const visibleVal = document.getElementById('finderVisibleToggle')?.checked !== false;
  const titleVal = document.getElementById('finderTitle')?.value.trim() || '나에게 맞는 과정 찾기';
  const subtitleVal = document.getElementById('finderSubtitle')?.value.trim() || '3가지 질문에 답하면, 딱 맞는 과정을 추천해드려요.';

  if (!adminData.courseFinder) {
    adminData.courseFinder = await DataService.getCourseFinder();
  }

  const courseFinder = adminData.courseFinder;
  const programs = adminData.programs || [];

  // Update visible, title & subtitle
  courseFinder.visible = visibleVal;
  courseFinder.title = titleVal;
  courseFinder.subtitle = subtitleVal;

  // Update Q1
  if (!courseFinder.steps[0]) courseFinder.steps[0] = { id: 'experience', question: '', options: [] };
  courseFinder.steps[0].question = document.getElementById('editFinderQ1')?.value.trim() || '프리다이빙 경험이 있으신가요?';
  if (!courseFinder.steps[0].options) courseFinder.steps[0].options = [];
  courseFinder.steps[0].options[0] = { value: 'none', text: document.getElementById('editFinderQ1Opt0')?.value.trim() || '처음입니다' };
  courseFinder.steps[0].options[1] = { value: 'trial', text: document.getElementById('editFinderQ1Opt1')?.value.trim() || '체험만 해봤어요' };
  courseFinder.steps[0].options[2] = { value: 'certified', text: document.getElementById('editFinderQ1Opt2')?.value.trim() || '자격증이 있어요' };

  // Update Q2
  if (!courseFinder.steps[1]) courseFinder.steps[1] = { id: 'goal', question: '', options: [] };
  courseFinder.steps[1].question = document.getElementById('editFinderQ2')?.value.trim() || '어떤 목표를 가지고 계신가요?';
  if (!courseFinder.steps[1].options) courseFinder.steps[1].options = [];
  courseFinder.steps[1].options[0] = { value: 'experience', text: document.getElementById('editFinderQ2Opt0')?.value.trim() || '한번 체험해보고 싶어요' };
  courseFinder.steps[1].options[1] = { value: 'cert', text: document.getElementById('editFinderQ2Opt1')?.value.trim() || '자격증을 취득하고 싶어요' };
  courseFinder.steps[1].options[2] = { value: 'advanced', text: document.getElementById('editFinderQ2Opt2')?.value.trim() || '더 깊이 도전하고 싶어요' };
  courseFinder.steps[1].options[3] = { value: 'instructor', text: document.getElementById('editFinderQ2Opt3')?.value.trim() || '강사가 되고 싶어요' };

  // Update Q3
  if (!courseFinder.steps[2]) courseFinder.steps[2] = { id: 'duration', question: '', options: [] };
  courseFinder.steps[2].question = document.getElementById('editFinderQ3')?.value.trim() || '원하는 교육 기간은 얼마인가요?';
  if (!courseFinder.steps[2].options) courseFinder.steps[2].options = [];
  courseFinder.steps[2].options[0] = { value: 'half', text: document.getElementById('editFinderQ3Opt0')?.value.trim() || '반나절 (3~4시간)' };
  courseFinder.steps[2].options[1] = { value: '1-2days', text: document.getElementById('editFinderQ3Opt1')?.value.trim() || '1~2일' };
  courseFinder.steps[2].options[2] = { value: '3days+', text: document.getElementById('editFinderQ3Opt2')?.value.trim() || '3일 이상' };

  // Update Result program linkages
  if (Array.isArray(courseFinder.results)) {
    courseFinder.results.forEach((res, index) => {
      const selectEl = document.getElementById(`finderResultProgSelect_${index}`);
      if (selectEl) {
        const selectedProgId = selectEl.value;
        res.programId = selectedProgId;
        const matchedProg = programs.find(p => p.id === selectedProgId);
        if (matchedProg) {
          res.title = matchedProg.title;
          res.desc = matchedProg.subtitle || matchedProg.desc;
          if (matchedProg.image) res.image = matchedProg.image;
        }
      }
    });
  }

  await DataService.updateCourseFinder(courseFinder);
  writeAdminLog('과정 찾기 공개 여부, 질문, 선택지 및 추천 연결 저장');
  showToast('과정 찾기 설정이 저장되었습니다.');
  loadCourseFinderSettings();
};

// ─── SEO 설정 ───
window.updateSeoOgPreview = function() {
  const t = document.getElementById('seoTitle')?.value.trim() || 'FLOW FREEDIVING';
  const d = document.getElementById('seoDesc')?.value.trim() || '처음이어도 괜찮습니다. 프리다이빙, 일상이 되다.';
  const img = document.getElementById('seoOgImage')?.value.trim() || '';

  const titleEl = document.getElementById('seoOgPreviewTitle');
  const descEl = document.getElementById('seoOgPreviewDesc');
  const imgEl = document.getElementById('seoOgPreviewImg');
  const placeholderEl = document.getElementById('seoOgPreviewImgPlaceholder');

  const ogBoxImg = document.getElementById('seoOgBoxImg');
  const ogBoxPlaceholder = document.getElementById('seoOgBoxPlaceholder');

  // Character Counter Update
  const rawDesc = document.getElementById('seoDesc')?.value || '';
  const charCountEl = document.getElementById('seoDescCharCount');
  if (charCountEl) {
    const len = rawDesc.length;
    charCountEl.textContent = `${len} / 160`;
    charCountEl.style.color = len > 160 ? '#EF4444' : 'var(--admin-text-tertiary)';
    charCountEl.style.fontWeight = len > 160 ? '700' : '400';
  }

  if (titleEl) titleEl.textContent = t;
  if (descEl) descEl.textContent = d;

  if (imgEl && placeholderEl) {
    if (img) {
      imgEl.src = img;
      imgEl.style.display = 'block';
      placeholderEl.style.display = 'none';
    } else {
      imgEl.style.display = 'none';
      placeholderEl.style.display = 'flex';
    }
  }

  if (ogBoxImg && ogBoxPlaceholder) {
    if (img) {
      ogBoxImg.src = img;
      ogBoxImg.style.display = 'block';
      ogBoxPlaceholder.style.display = 'none';
    } else {
      ogBoxImg.style.display = 'none';
      ogBoxPlaceholder.style.display = 'flex';
    }
  }
};

window.handleSeoOgUpload = async function(fileInput) {
  if (!fileInput || !fileInput.files || !fileInput.files.length) return;
  const file = fileInput.files[0];
  showToast("대표 이미지 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const ogInput = document.getElementById('seoOgImage');
      if (ogInput) ogInput.value = res.secure_url;
      updateSeoOgPreview();
      showToast("대표 공유 이미지가 업로드되었습니다.");
    }
  } catch (err) {
    console.error("SEO OG image upload failure:", err);
    showToast("이미지 업로드에 실패했습니다.");
  }
};

window.handleSeoOgDelete = function() {
  const ogInput = document.getElementById('seoOgImage');
  if (ogInput) ogInput.value = '';
  updateSeoOgPreview();
  showToast("대표 공유 이미지가 삭제되었습니다.");
};

function loadSeo() {
  // 기본 진입 탭: 기본 설정
  switchSettingsTab('basic');

  // 1. 기본 설정 (Category Manager & Header Nav & Course Finder)
  renderGalleryCategoryManager();
  renderHeaderNavSettings();
  loadCourseFinderSettings();

  // 2. SEO 설정
  const d = adminData.seo || {};
  const titleInput = document.getElementById('seoTitle');
  const descInput = document.getElementById('seoDesc');
  const ogImageInput = document.getElementById('seoOgImage');

  if (titleInput) {
    titleInput.value = d.title || '';
    titleInput.oninput = updateSeoOgPreview;
  }
  if (descInput) {
    descInput.value = d.description || '';
    descInput.oninput = updateSeoOgPreview;
  }
  if (ogImageInput) {
    ogImageInput.value = d.ogImage || '';
  }

  updateSeoOgPreview();
}

window.renderHeaderNavSettings = function() {
  const container = document.getElementById('headerNavManagerContainer');
  if (!container) return;

  const defaults = [
    { id: 'about', label: '소개', targetLabel: 'ABOUT 섹션', target: '#about' },
    { id: 'program', label: '교육과정', targetLabel: 'PROGRAM 섹션', target: '#program' },
    { id: 'instructor', label: '강사진', targetLabel: 'INSTRUCTOR 섹션', target: '#instructor' },
    { id: 'review', label: '후기', targetLabel: 'REVIEW 섹션', target: '#review' },
    { id: 'gallery', label: '갤러리', targetLabel: 'gallery.html', target: 'gallery.html' },
    { id: 'faq', label: 'FAQ', targetLabel: 'FAQ 섹션', target: '#faq' }
  ];

  const currentNav = adminData.headerNav || defaults;
  const engToKorMap = {
    'about': '소개', 'program': '교육과정', 'instructor': '강사진',
    'review': '후기', 'gallery': '갤러리', 'faq': 'FAQ'
  };

  const navItems = defaults.map(def => {
    const item = currentNav.find(d => d.id === def.id);
    let label = (item && item.label && item.label.trim()) ? item.label.trim() : def.label;
    if (engToKorMap[def.id] && label.toLowerCase() === def.id.toLowerCase()) {
      label = engToKorMap[def.id];
    }
    return {
      ...def,
      label
    };
  });

  container.innerHTML = navItems.map((item, idx) => `
    <div style="background: #ffffff; border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 160px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--admin-text-secondary); margin-bottom: 4px;">메뉴 표시명</label>
        <input type="text" class="form-input" id="headerNavLabel_${idx}" data-nav-id="${item.id}" value="${item.label || ''}" placeholder="${item.label}" style="height: 36px; font-size: 13px; background: #ffffff; margin-bottom: 0;">
      </div>
      <div style="min-width: 150px;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: var(--admin-text-secondary); margin-bottom: 4px;">연결 대상 (고정)</label>
        <div style="height: 36px; display: flex; align-items: center; padding: 0 12px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #475569;">
          🔗 ${item.targetLabel}
        </div>
      </div>
    </div>
  `).join('');
};

window.saveHeaderNavSettings = async function() {
  const defaults = [
    { id: 'about', label: '소개', targetLabel: 'ABOUT 섹션', target: '#about' },
    { id: 'program', label: '교육과정', targetLabel: 'PROGRAM 섹션', target: '#program' },
    { id: 'instructor', label: '강사진', targetLabel: 'INSTRUCTOR 섹션', target: '#instructor' },
    { id: 'review', label: '후기', targetLabel: 'REVIEW 섹션', target: '#review' },
    { id: 'gallery', label: '갤러리', targetLabel: 'gallery.html', target: 'gallery.html' },
    { id: 'faq', label: 'FAQ', targetLabel: 'FAQ 섹션', target: '#faq' }
  ];

  const updated = defaults.map((def, idx) => {
    const input = document.getElementById(`headerNavLabel_${idx}`);
    const val = input ? input.value.trim() : '';
    return {
      ...def,
      label: val || def.label
    };
  });

  adminData.headerNav = updated;
  await DataService.updateHeaderNav(updated);
  writeAdminLog('상단 메뉴 표시명 변경');
  showToast('상단 메뉴 설정이 저장되었습니다.');
  renderHeaderNavSettings();
};

window.saveSeo = async function () {
  adminData.seo = {
    ...adminData.seo,
    title: document.getElementById('seoTitle')?.value.trim() || '',
    description: document.getElementById('seoDesc')?.value.trim() || '',
    ogImage: document.getElementById('seoOgImage')?.value.trim() || ''
  };
  await DataService.updateSEO(adminData.seo);
  writeAdminLog('검색엔진 SEO 타이틀/설명 변경');
  updateSeoOgPreview();
  showToast('SEO 설정이 저장되었습니다.');
};

window.uploadAdminFile = async function (fileInputId, textInputId) {
  const fileInput = document.getElementById(fileInputId);
  const textInput = document.getElementById(textInputId);
  if (!fileInput || !fileInput.files.length || !textInput) return;

  const file = fileInput.files[0];
  showToast("파일 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      textInput.value = res.secure_url;
      textInput.dispatchEvent(new Event('change'));
      showToast("업로드 완료!");
    }
  } catch (err) {
    console.error("Upload error:", err);
    showToast("업로드 실패: " + err.message);
  }
};

// ─── Dynamic Edit Form Renderer ───
function renderEditForm(panelName, index) {
  const formWrap = document.getElementById(`${panelName}EditForm`);
  if (!formWrap) return;

  let formHtml = '';

  if (panelName === 'programs') {
    const isNew = index === -1;
    const prog = isNew ? {
      id: '', title: '', category: 'freediving', subtitle: '', desc: '',
      image: '', tags: [], price: '', curriculum: [], includes: [], prep: [], visible: true,
      smartStoreUrl: '', seoTitle: '', seoDesc: '', precautions: []
    } : adminData.programs[index];

    // Cache active tags array globally in window
    window.activeEditTags = [...(prog.tags || [])];

    formHtml = `
      <div class="prog-edit-view">
        <!-- Hidden ID -->
        <input type="hidden" id="editProgId" value="${prog.id || ('prog-' + Date.now())}">

        <!-- 1. 기본 정보 + 대표 이미지 (2열 레이아웃) -->
        <div class="prog-edit-top-grid">
          <!-- Left: 기본 정보 -->
          <div class="admin-card">
            <h3 class="admin-card__title">기본 정보</h3>
            <div class="prog-edit-basic-rows">
              <div class="prog-edit-2col-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">교육 과정명 <span style="color: #EF4444;">*</span></label>
                  <input type="text" class="form-input" id="editProgTitle" value="${prog.title || ''}" placeholder="예: LEVEL 1">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">카테고리 <span style="color: #EF4444;">*</span></label>
                  <select class="form-select" id="editProgCategory">
                    <option value="freediving" ${prog.category === 'freediving' ? 'selected' : ''}>프리다이빙</option>
                    <option value="eggyeong" ${prog.category === 'eggyeong' ? 'selected' : ''}>수영 (입영)</option>
                    <option value="lifeguard" ${prog.category === 'lifeguard' ? 'selected' : ''}>기타</option>
                  </select>
                </div>
              </div>

              <div class="prog-edit-2col-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">소제목 (배너 카피)</label>
                  <input type="text" class="form-input" id="editProgSubtitle" value="${prog.subtitle || ''}" placeholder="예: 입문 과정">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">수강료 (노출 텍스트) <span style="color: #EF4444;">*</span></label>
                  <input type="text" class="form-input" id="editProgPrice" value="${prog.price || ''}" placeholder="예: 450,000">
                </div>
              </div>

              <div class="prog-edit-desc-row">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">핵심 강습 설명</label>
                  <textarea class="form-textarea" id="editProgDesc" rows="2" style="min-height: 48px; height: 48px; padding: 6px 8px; font-size: 12.5px; line-height: 1.4; resize: vertical;" placeholder="교육의 취지 및 개요를 간단하게 작성합니다.">${prog.desc || ''}</textarea>
                </div>
                <div class="form-group prog-edit-visible-box" style="margin-bottom: 0;">
                  <label class="form-label">공개 여부</label>
                  <div class="prog-edit-visible-toggle-wrap">
                    <label class="toggle" style="margin: 0;">
                      <input type="checkbox" id="editProgVisible" ${prog.visible !== false ? 'checked' : ''} onchange="document.getElementById('editProgVisibleText').textContent = this.checked ? '공개' : '비공개';">
                      <span class="toggle__slider"></span>
                    </label>
                    <span id="editProgVisibleText" style="font-size: 12.5px; font-weight: 600; color: #10B981;">${prog.visible !== false ? '공개' : '비공개'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: 대표 이미지 -->
          <div class="admin-card">
            <h3 class="admin-card__title">대표 이미지</h3>
            <div class="prog-edit-media-wrap">
              <div class="prog-edit-image-square">
                <img id="editProgPreviewImage" src="${prog.image || 'images/program-oneday.jpg'}" alt="대표 이미지 미리보기">
              </div>
              <input type="hidden" id="editProgImage" value="${prog.image || 'images/program-oneday.jpg'}">
              <input type="file" id="editProgFile" accept="image/*" style="display: none;" onchange="uploadProgImageFile()">
              <div class="prog-edit-image-actions">
                <button type="button" class="admin-btn admin-btn--ghost prog-img-btn" onclick="document.getElementById('editProgFile').click(); return false;">
                  <span>📤</span> 이미지 변경
                </button>
                <button type="button" class="admin-btn admin-btn--ghost prog-img-btn prog-img-btn--delete" onclick="clearProgImage(); return false;">
                  <span>🗑️</span> 이미지 삭제
                </button>
                <p class="prog-edit-image-guide">
                  권장 이미지: 1920×1080px (16:9)<br>
                  JPG, PNG 지원
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 교육 내용 (한 줄 4열 그리드) -->
        <div class="admin-card">
          <h3 class="admin-card__title">교육 내용</h3>
          <div class="prog-edit-curriculum-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">상세 커리큘럼</label>
              <textarea class="form-textarea" id="editProgCurriculum" placeholder="이론 교육\n수중 적응\n이퀄라이징">${(prog.curriculum || []).join('\n')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">포함 사항</label>
              <textarea class="form-textarea" id="editProgIncludes" placeholder="강습료\n장비 대여">${(prog.includes || []).join('\n')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">개인 준비물</label>
              <textarea class="form-textarea" id="editProgPrep" placeholder="수영복\n수모\n수건">${(prog.prep || []).join('\n')}</textarea>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">주의사항</label>
              <textarea class="form-textarea" id="editProgPrecautions" placeholder="질환 상담 필요\n당일 취소 불가">${(prog.precautions || []).join('\n')}</textarea>
            </div>
          </div>
        </div>

        <!-- 3. 판매 및 노출 설정 (통합 카드) -->
        <div class="admin-card">
          <h3 class="admin-card__title">판매 및 노출 설정</h3>
          <div class="prog-edit-sales-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">스마트스토어 개별 링크</label>
              <input type="text" class="form-input" id="editProgSmartStoreUrl" value="${prog.smartStoreUrl || ''}" placeholder="비워두면 기본 스마트스토어 링크 자동 사용">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">태그</label>
              <div class="tags-container" id="editProgTagsWrap"></div>
            </div>
          </div>
        </div>

        <!-- 4. 교육과정 삭제 단독 버튼 (우측 하단) -->
        ${!isNew ? `
        <div style="display: flex; justify-content: flex-end; margin-top: 10px; margin-bottom: 4px;">
          <button type="button" class="admin-btn admin-btn--danger" onclick="confirmProgramDelete(${index}); return false;" style="min-height: 30px; height: 30px; padding: 0 14px; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px;">
            <span>🗑️</span> 교육과정 삭제
          </button>
        </div>
        ` : ''}
      </div>
    `;

    setTimeout(() => {
      // 1. Render Tag Chips
      renderTagChips();
    }, 50);
  }
  else if (panelName === 'instructors') {
    const isNew = index === -1 || index === undefined || index === null;
    const inst = isNew ? {
      id: '', name: '', photo: '', role: '', philosophy: '', bio: '', certifications: [], career: [], visible: true
    } : (adminData.instructors[index] || {
      id: '', name: '', photo: '', role: '', philosophy: '', bio: '', certifications: [], career: [], visible: true
    });

    const isInstVisible = inst.visible !== false;
    const hasPhoto = Boolean(inst.photo && inst.photo.trim());

    formHtml = `
      <div class="admin-card custom-instructor-layout">
        <div class="instructor-grid-container">
          <div class="instructor-left-col">
            <h3 class="section-sub-title">강사 이미지</h3>
            <div class="instructor-image-preview-wrap">
              <img id="customInstPreviewImage" src="${hasPhoto ? inst.photo : ''}" alt="강사 프로필 사진" style="display: ${hasPhoto ? 'block' : 'none'}; width: 100%; height: 100%; object-fit: cover;">
              <div id="customInstPhotoPlaceholder" style="display: ${hasPhoto ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 240px; background: var(--admin-bg); border: 2px dashed var(--admin-border); border-radius: var(--radius-md); color: var(--admin-text-secondary); text-align: center; padding: 20px;">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--admin-text-tertiary); margin-bottom: 8px;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style="font-size: 13px; font-weight: 600; color: var(--admin-text-primary);">등록된 사진 없음</span>
                <span style="font-size: 11.5px; color: var(--admin-text-secondary); margin-top: 4px;">아래 버튼을 눌러 사진을 업로드하세요</span>
              </div>
            </div>
            
            <input type="text" class="form-input" id="editInstPhoto" value="${hasPhoto ? inst.photo : ''}" style="display: none;" onchange="window.handleInstPhotoChange(this.value)">
            <input type="file" id="editInstFile" accept="image/*" style="display: none;" onchange="uploadAdminFile('editInstFile', 'editInstPhoto')">
            
            <div class="instructor-image-buttons-wrap">
              <button type="button" class="admin-btn admin-btn--ghost img-btn-upload" onclick="document.getElementById('editInstFile').click();" style="display: ${hasPhoto ? 'none' : 'inline-flex'};"><span>📤</span> 이미지 업로드</button>
              <button type="button" class="admin-btn admin-btn--ghost img-btn-change" onclick="document.getElementById('editInstFile').click();" style="display: ${hasPhoto ? 'inline-flex' : 'none'};"><span>🔄</span> 이미지 변경</button>
              <button type="button" class="admin-btn admin-btn--ghost img-btn-delete" onclick="window.handleInstPhotoChange('');" style="display: ${hasPhoto ? 'inline-flex' : 'none'};"><span>🗑️</span> 이미지 삭제</button>
            </div>
            <p class="instructor-image-notice">권장: 900×1200px (3:4) &nbsp;|&nbsp; JPG, PNG &nbsp;|&nbsp; 최대 2MB</p>
          </div>
          
          <div class="instructor-right-col">
            <div class="inst-visibility-line-wrap" style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span class="form-label inst-visibility-label" style="margin-right: 4px; font-weight: 600;">공개 여부</span>
              <label class="toggle toggle-visible" style="margin: 0;">
                <input type="checkbox" id="editInstVisible" ${isInstVisible ? 'checked' : ''} onchange="
                  const statusEl = document.getElementById('editInstVisibleText');
                  statusEl.textContent = this.checked ? '공개' : '비공개';
                  statusEl.style.color = this.checked ? 'var(--admin-primary)' : '#EF4444';
                ">
                <span class="toggle__slider"></span>
              </label>
              <span class="toggle-status-text" id="editInstVisibleText" style="font-weight: 600; font-size: 13px; color: ${isInstVisible ? 'var(--admin-primary)' : '#EF4444'};">${isInstVisible ? '공개' : '비공개'}</span>
            </div>
            
            <div class="inst-info-row">
              <div class="form-group">
                <label class="form-label">강사 명 <span class="required-star" style="color:#EF4444;">*</span></label>
                <input type="text" class="form-input" id="editInstName" value="${inst.name || ''}" placeholder="예: 홍길동">
              </div>
              <div class="form-group">
                <label class="form-label">소속 / 역할 <span class="required-star" style="color:#EF4444;">*</span></label>
                <input type="text" class="form-input" id="editInstRole" value="${inst.role || ''}" placeholder="예: 대표강사 / Freediving Instructor">
              </div>
            </div>
            
            <div class="form-group full-width-group">
              <label class="form-label">교육 철학 (한 줄 요약)</label>
              <input type="text" class="form-input" id="editInstPhilosophy" value="${inst.philosophy || ''}" placeholder="예: 물과 친해지는 즐겁고 안전한 다이빙을 약속합니다." maxlength="100" oninput="document.getElementById('philCharCount').textContent = this.value.length;">
              <div class="char-counter"><span id="philCharCount">${(inst.philosophy || '').length}</span> / 100</div>
            </div>
            
            <div class="inst-bio-certs-row">
              <div class="form-group">
                <label class="form-label">상세 소개 (BIO) <span class="required-star" style="color:#EF4444;">*</span></label>
                <textarea class="form-textarea" id="editInstBio" rows="4" placeholder="강사 상세 소개글을 작성합니다." maxlength="300" oninput="document.getElementById('bioCharCount').textContent = this.value.length;">${inst.bio || ''}</textarea>
                <div class="char-counter"><span id="bioCharCount">${(inst.bio || '').length}</span> / 300</div>
              </div>
              <div class="form-group">
                <label class="form-label">취득 자격증 사항 (쉼표로 구분)</label>
                <textarea class="form-textarea" id="editInstCerts" rows="4" placeholder="예: AIDA Level 4 Instructor, EFR CPR 강사">${(inst.certifications || []).join(', ')}</textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group career-full-group">
          <label class="form-label">이력 및 경력 사항 <span class="label-sub-desc" style="font-size:11.5px; font-weight:normal; color:var(--admin-text-secondary); margin-left:4px;">(연도:경력내용 형식, 줄바꿈으로 구분)</span></label>
          <textarea class="form-textarea" id="editInstCareer" rows="4" placeholder="예:\n2018:AIDA 다이빙 강사 취득\n2020:FLOW FREEDIVING 센터 창립\n2022:수상구조사 취득" maxlength="600" oninput="document.getElementById('careerCharCount').textContent = this.value.length;">${(inst.career || []).map(c => `${c.year}:${c.text}`).join('\n')}</textarea>
          <div class="char-counter"><span id="careerCharCount">${((inst.career || []).map(c => `${c.year}:${c.text}`).join('\n')).length}</span> / 600</div>
        </div>
        
        <div class="custom-buttons-container">
          <div class="left-buttons">
            <button type="button" class="admin-btn admin-btn--ghost custom-cancel-btn" onclick="closeEditForm('instructors')">취소</button>
            <button type="button" class="admin-btn admin-btn--primary custom-save-btn" onclick="saveActiveEditForm('instructors', ${index})"><span>✓</span> 저장하기</button>
          </div>
          ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger custom-delete-btn" onclick="confirmInstructorDelete(${index}); return false;"><span>🗑️</span> 강사 프로필 삭제</button>` : ''}
        </div>
      </div>
    `;
  }
  else if (panelName === 'reviews') {
    const isNew = index === -1;
    const rev = isNew ? {
      name: '', course: '프리다이빙', text: '', stars: 5, date: new Date().toISOString().slice(0, 10)
    } : adminData.reviews[index];

    // 작성 날짜 정규화 (YYYY-MM-DD 형식)
    let dateVal = (rev.date || '').replace(/\./g, '-').trim();
    if (/^\d{4}-\d{2}$/.test(dateVal)) {
      dateVal += '-01';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      dateVal = new Date().toISOString().slice(0, 10);
    }

    // 참가 과정 동적 목록 구성 (기본: '프리다이빙' + 현재 등록된 교육과정들)
    const programTitles = [];
    if (adminData.programs && Array.isArray(adminData.programs)) {
      adminData.programs.forEach(p => {
        let title = (p.title || '').trim();
        if (title === '키즈 프리다이빙') title = '유스 프리다이빙';
        if (title && title !== '프리다이빙' && !programTitles.includes(title)) {
          programTitles.push(title);
        }
      });
    }

    const currentCourse = (rev.course || '').trim();
    const standardOptions = ['프리다이빙', ...programTitles];
    const isStandard = standardOptions.includes(currentCourse);
    const selectedOption = isStandard ? currentCourse : (isNew ? '프리다이빙' : '__custom__');
    const customValue = isStandard ? '' : currentCourse;

    formHtml = `
      <div class="admin-card">
        <!-- Row 1: 수강생명 | 참가 과정 (2열) -->
        <div class="rev-edit-2col">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">수강생명</label>
            <input type="text" class="form-input" id="editRevName" value="${rev.name || ''}" placeholder="예: 김○영">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">참가 과정</label>
            <select class="form-select" id="editRevCourseSelect" onchange="handleReviewCourseSelectChange(this)">
              <option value="프리다이빙" ${selectedOption === '프리다이빙' ? 'selected' : ''}>프리다이빙</option>
              ${programTitles.map(t => `<option value="${t}" ${selectedOption === t ? 'selected' : ''}>${t}</option>`).join('')}
              <option disabled>──────────</option>
              <option value="__custom__" ${selectedOption === '__custom__' ? 'selected' : ''}>+ 직접 입력</option>
            </select>
            <div id="editRevCourseCustomWrap" style="margin-top: 8px; display: ${selectedOption === '__custom__' ? 'block' : 'none'};">
              <input type="text" class="form-input" id="editRevCourseCustom" value="${customValue}" placeholder="참가 과정명을 직접 입력하세요">
            </div>
          </div>
        </div>

        <!-- Row 2: 후기 평점 | 작성 날짜 (2열) -->
        <div class="rev-edit-2col">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">후기 평점</label>
            <select class="form-select" id="editRevStars">
              <option value="5" ${rev.stars === 5 ? 'selected' : ''}>★★★★★ (5점)</option>
              <option value="4" ${rev.stars === 4 ? 'selected' : ''}>★★★★☆ (4점)</option>
              <option value="3" ${rev.stars === 3 ? 'selected' : ''}>★★★☆☆ (3점)</option>
              <option value="2" ${rev.stars === 2 ? 'selected' : ''}>★★☆☆☆ (2점)</option>
              <option value="1" ${rev.stars === 1 ? 'selected' : ''}>★☆☆☆☆ (1점)</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">작성 날짜</label>
            <input type="date" class="form-input" id="editRevDate" value="${dateVal}">
          </div>
        </div>

        <!-- Row 3: 후기 내용 (1열 전체) -->
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">후기 내용</label>
          <textarea class="form-textarea" id="editRevText" rows="4" placeholder="수강생 만족 소감을 상세히 기술합니다." style="min-height: 110px; max-height: 180px; line-height: 1.5;">${rev.text || ''}</textarea>
        </div>

        <!-- 버튼 영역 -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('reviews', ${index})">저장하기</button>
            <button type="button" class="admin-btn admin-btn--ghost" onclick="closeEditForm('reviews')">취소</button>
          </div>
          ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger" onclick="confirmReviewDelete(${index}); return false;">후기 삭제</button>` : ''}
        </div>
      </div>
    `;
  }
  else if (panelName === 'gallery') {
    const isNew = index === -1;
    const gal = isNew ? {
      src: '', alt: '', category: 'freediving', visible: true, mediaType: 'image'
    } : (adminData.gallery[index] || {
      src: '', alt: '', category: 'freediving', visible: true, mediaType: 'image'
    });

    const currentMediaType = gal.mediaType === 'video' ? 'video' : 'image';
    const isVideo = currentMediaType === 'video';
    const hasImage = Boolean(gal.src && gal.src.trim());
    const currentVideoSrc = gal.videoUrl || (isVideo ? gal.src : '');
    const currentThumbSrc = gal.thumbnailUrl || (isVideo ? gal.src : '');
    const hasVideo = Boolean(currentVideoSrc && currentVideoSrc.trim());

    const galEditTitle = document.getElementById('galleryEditTitle');
    if (galEditTitle) {
      galEditTitle.textContent = isNew ? '새 미디어 등록' : (isVideo ? '영상 정보 편집' : '사진 정보 편집');
    }

    formHtml = `
      <div class="admin-card" style="max-width: 820px; margin: 0 auto;">
        <!-- 0. 미디어 종류 선택 (사진 / 영상) -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">미디어 종류</label>
          <div style="display: inline-flex; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: var(--radius-sm); padding: 3px; gap: 4px;">
            <button type="button" id="mediaTypeImgBtn" onclick="setGalleryMediaType('image')" style="padding: 6px 20px; font-size: 13px; font-weight: ${!isVideo ? '600' : '500'}; background: ${!isVideo ? '#ffffff' : 'transparent'}; color: ${!isVideo ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)'}; box-shadow: ${!isVideo ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; border: none; border-radius: 4px; cursor: pointer; transition: all var(--transition-fast);">
              사진
            </button>
            <button type="button" id="mediaTypeVideoBtn" onclick="setGalleryMediaType('video')" style="padding: 6px 20px; font-size: 13px; font-weight: ${isVideo ? '600' : '500'}; background: ${isVideo ? '#ffffff' : 'transparent'}; color: ${isVideo ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)'}; box-shadow: ${isVideo ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'}; border: none; border-radius: 4px; cursor: pointer; transition: all var(--transition-fast);">
              영상
            </button>
          </div>
          <input type="hidden" id="editGalMediaType" value="${currentMediaType}">
        </div>

        <!-- 1-A. 이미지 미리보기 & 업로드 영역 -->
        <div class="form-group" id="editGalImageSection" style="display: ${!isVideo ? 'block' : 'none'}; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="form-label" style="font-size: 14px; font-weight: 600; margin-bottom: 0;">이미지 미리보기</label>
            <span style="font-size: 11.5px; color: var(--admin-text-tertiary);">권장: JPG, PNG, WebP</span>
          </div>
          
          <div style="background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; max-height: 360px; position: relative;">
            <img id="editGalPreviewImg" src="${hasImage ? gal.src : ''}" alt="${gal.alt || '갤러리 이미지'}" style="display: ${hasImage ? 'block' : 'none'}; width: 100%; max-height: 360px; object-fit: contain;">
            
            <div id="editGalPlaceholder" style="display: ${hasImage ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; color: var(--admin-text-secondary); text-align: center;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--admin-text-tertiary); margin-bottom: 12px;">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <span style="font-size: 14px; font-weight: 600; color: var(--admin-text-primary);">등록된 이미지가 없습니다</span>
              <span style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 4px;">아래 버튼을 눌러 이미지를 업로드하세요</span>
            </div>
          </div>

          <!-- 이미지 업로드/변경 버튼 & 히든 인풋 -->
          <input type="hidden" id="editGalSrc" value="${gal.src || ''}">
          <input type="file" id="editGalFileInput" accept="image/*" style="display: none;" onchange="handleGalleryImageUpload(this)">
          
          <div style="margin-top: 12px;">
            <button type="button" class="admin-btn admin-btn--ghost" id="editGalBtnUpload" onclick="document.getElementById('editGalFileInput').click();" style="display: ${hasImage ? 'none' : 'inline-flex'}; gap: 6px; font-size: 12.5px;">
              <span>📤</span> 이미지 업로드
            </button>
            <button type="button" class="admin-btn admin-btn--ghost" id="editGalBtnChange" onclick="document.getElementById('editGalFileInput').click();" style="display: ${hasImage ? 'inline-flex' : 'none'}; gap: 6px; font-size: 12.5px;">
              <span>🔄</span> 이미지 변경
            </button>
          </div>
        </div>

        <!-- 1-B. 영상 파일 미리보기 & 업로드 영역 -->
        <div class="form-group" id="editGalVideoSection" style="display: ${isVideo ? 'block' : 'none'}; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="form-label" style="font-size: 14px; font-weight: 600; margin-bottom: 0;">영상 파일 미리보기 & 업로드</label>
            <span style="font-size: 11.5px; color: var(--admin-text-tertiary);">지원: MP4 / MOV / WebM</span>
          </div>

          <div style="background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; position: relative;">
            <video id="editGalPreviewVideo" src="${hasVideo ? currentVideoSrc : ''}" poster="${currentThumbSrc}" controls playsinline style="display: ${hasVideo ? 'block' : 'none'}; width: 100%; max-height: 360px; background: #000;"></video>

            <div id="editGalVideoPlaceholder" style="display: ${hasVideo ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; color: var(--admin-text-secondary); text-align: center;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #EFF6FF; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #2563EB;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <span style="font-size: 14px; font-weight: 600; color: var(--admin-text-primary);">등록된 영상이 없습니다</span>
              <span style="font-size: 12px; color: var(--admin-text-secondary); margin-top: 4px;">아래 버튼을 눌러 영상 파일을 업로드하세요 (썸네일 자동 생성)</span>
            </div>
          </div>

          <div id="editGalVideoStatus" style="display: none; margin-top: 8px; font-size: 12px; padding: 8px 12px; background: #F8FAFC; border: 1px solid var(--admin-border); border-radius: var(--radius-sm);"></div>

          <input type="hidden" id="editGalVideoUrl" value="${currentVideoSrc}">
          <input type="hidden" id="editGalThumbnailUrl" value="${currentThumbSrc}">
          <input type="file" id="editGalVideoInput" accept="video/mp4,video/quicktime,video/webm" style="display: none;" onchange="handleGalleryVideoUpload(this)">

          <div style="margin-top: 12px;">
            <button type="button" class="admin-btn admin-btn--ghost" id="editGalBtnVideoUpload" onclick="document.getElementById('editGalVideoInput').click();" style="display: ${hasVideo ? 'none' : 'inline-flex'}; gap: 6px; font-size: 12.5px;">
              <span>📤</span> 영상 업로드
            </button>
            <button type="button" class="admin-btn admin-btn--ghost" id="editGalBtnVideoChange" onclick="document.getElementById('editGalVideoInput').click();" style="display: ${hasVideo ? 'inline-flex' : 'none'}; gap: 6px; font-size: 12.5px;">
              <span>🔄</span> 영상 변경
            </button>
          </div>
        </div>

        <!-- 2. 정보 영역 (카테고리, 노출, 설명) -->
        <div style="border-top: 1px solid var(--admin-border); padding-top: 20px; margin-bottom: 20px;">
          <div style="display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; flex-wrap: wrap;">
            <!-- 카테고리 -->
            <div class="form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
              <label class="form-label">카테고리</label>
              <select class="form-select" id="editGalCategory">
                ${(() => {
                  const categories = (adminData.galleryCategories && adminData.galleryCategories.length) ? adminData.galleryCategories : [
                    { id: 'freediving', name: '프리다이빙' },
                    { id: 'swimming', name: '수영' },
                    { id: 'etc', name: '기타' }
                  ];
                  return categories.map(cat => {
                    const isSelected = gal.category === cat.id || (cat.id === 'swimming' && gal.category === 'eggyeong');
                    return `<option value="${cat.id}" ${isSelected ? 'selected' : ''}>${cat.name}</option>`;
                  }).join('');
                })()}
              </select>
            </div>

            <!-- 홈페이지 노출 -->
            <div class="form-group" style="width: 140px; flex-shrink: 0; margin-bottom: 0;">
              <label class="form-label">홈페이지 노출</label>
              <div style="display: flex; align-items: center; height: 38px; gap: 8px;">
                <label class="toggle" style="margin: 0;">
                  <input type="checkbox" id="editGalVisible" ${gal.visible !== false ? 'checked' : ''} onchange="document.getElementById('editGalVisibleText').textContent = this.checked ? '노출 (ON)' : '숨김 (OFF)'">
                  <span class="toggle__slider"></span>
                </label>
                <span id="editGalVisibleText" style="font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary);">${gal.visible !== false ? '노출 (ON)' : '숨김 (OFF)'}</span>
              </div>
            </div>
          </div>

          <!-- 미디어 설명 (ALT 텍스트) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" id="editGalAltLabel">${isVideo ? '영상 설명' : '이미지 설명'}</label>
            <input type="text" class="form-input" id="editGalAlt" value="${gal.alt || ''}" placeholder="예: 풀장에서 프리다이빙 연습">
            <span style="font-size: 11px; color: var(--admin-text-tertiary); margin-top: 4px; display: block;">미디어 내용을 설명하는 텍스트입니다.</span>
          </div>
        </div>

        <!-- 3. 하단 버튼 영역 -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 18px; border-top: 1px solid var(--admin-border);">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="admin-btn admin-btn--ghost" onclick="closeEditForm('gallery')">취소</button>
            <button type="button" class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('gallery', ${index})">저장하기</button>
          </div>
          ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger" onclick="confirmGalleryDelete(${index}); return false;">삭제하기</button>` : ''}
        </div>
      </div>
    `;
  }
  else if (panelName === 'whyflow') {
    const isNew = index === -1;
    const item = (isNew || !adminData.whyFlow || !adminData.whyFlow.items || !adminData.whyFlow.items[index]) ? {
      title: '', desc: '', visible: true
    } : adminData.whyFlow.items[index];

    formHtml = `
      <div class="admin-card">
        <div style="display: flex; gap: 16px; margin-bottom: 12px; align-items: flex-start; flex-wrap: wrap;">
          <!-- 제목 -->
          <div class="form-group" style="flex: 1; min-width: 240px; margin-bottom: 0;">
            <label class="form-label">제목 <span class="required-star" style="color: #EF4444;">*</span></label>
            <input type="text" class="form-input" id="editWfTitle" value="${item.title || ''}" placeholder="예: 안전 최우선" maxlength="40" oninput="document.getElementById('wfTitleCharCount').textContent = this.value.length;">
            <div style="text-align: right; font-size: 10.5px; color: var(--admin-text-tertiary); margin-top: 2px;">
              <span id="wfTitleCharCount">${(item.title || '').length}</span> / 40자
            </div>
          </div>

          <!-- 노출 상태 -->
          <div class="form-group" style="width: 140px; flex-shrink: 0; margin-bottom: 0;">
            <label class="form-label">노출 상태</label>
            <div style="display: flex; align-items: center; height: 38px; gap: 8px;">
              <label class="toggle" style="margin: 0;">
                <input type="checkbox" id="editWfVisible" ${item.visible !== false ? 'checked' : ''} onchange="document.getElementById('editWfVisibleText').textContent = this.checked ? '노출 (ON)' : '숨김 (OFF)'">
                <span class="toggle__slider"></span>
              </label>
              <span id="editWfVisibleText" style="font-size: 12.5px; font-weight: 600; color: var(--admin-text-primary);">${item.visible !== false ? '노출 (ON)' : '숨김 (OFF)'}</span>
            </div>
          </div>
        </div>

        <!-- 설명 -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">설명 <span class="required-star" style="color: #EF4444;">*</span></label>
          <textarea class="form-textarea" id="editWfDesc" rows="4" placeholder="WHY FLOW 항목의 상세 설명을 입력하세요." maxlength="250" style="min-height: 100px; line-height: 1.5;" oninput="document.getElementById('wfDescCharCount').textContent = this.value.length;">${item.desc || ''}</textarea>
          <div style="text-align: right; font-size: 10.5px; color: var(--admin-text-tertiary); margin-top: 2px;">
            <span id="wfDescCharCount">${(item.desc || '').length}</span> / 250자
          </div>
        </div>

        <!-- 버튼 영역 -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--admin-border);">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="admin-btn admin-btn--ghost" onclick="closeEditForm('whyflow')">취소</button>
            <button type="button" class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('whyflow', ${index})">저장하기</button>
          </div>
          ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger" onclick="confirmWhyFlowDelete(${index}); return false;">항목 삭제</button>` : ''}
        </div>
      </div>
    `;
  }
  else if (panelName === 'faq') {
    const isNew = index === -1;
    const faqItem = isNew ? {
      question: '', answer: ''
    } : adminData.faq[index];

    formHtml = `
      <div class="admin-card">
        <div class="form-group">
          <label class="form-label">질문 (Question)</label>
          <input type="text" class="form-input" id="editFaqQ" value="${faqItem.question || ''}" placeholder="예: 프리다이빙 라이센스를 따는데 며칠이 소요되나요?">
        </div>

        <div class="form-group">
          <label class="form-label">답변 (Answer)</label>
          <textarea class="form-textarea" id="editFaqA" rows="5" placeholder="질문에 대한 상세한 해결/상담 답변을 기재합니다.">${faqItem.answer || ''}</textarea>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:24px;">
          <div>
            <button class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('faq', ${index})">저장하기</button>
            <button class="admin-btn admin-btn--ghost" onclick="closeEditForm('faq')" style="margin-left:8px;">취소</button>
          </div>
          ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger" onclick="confirmFaqDelete(${index}); return false;">FAQ 항목 삭제</button>` : ''}
        </div>
      </div>
    `;
  } else if (panelName === 'popup') {
    renderPopupEditForm(index);
    return;
  }

  formWrap.innerHTML = formHtml;
}

// ─── Active Edit Form Save Handler ───
window.saveActiveEditForm = async function (panelName, index) {
  const isNew = index === -1;

  if (panelName === 'programs') {
    let progId = document.getElementById('editProgId')?.value.trim();
    if (!progId) progId = 'prog-' + Date.now();

    const prog = isNew ? {
      id: progId,
      visible: true
    } : adminData.programs[index];

    prog.id = progId;
    prog.title = document.getElementById('editProgTitle').value.trim();
    prog.category = document.getElementById('editProgCategory').value;
    prog.subtitle = document.getElementById('editProgSubtitle').value.trim();
    prog.desc = document.getElementById('editProgDesc').value.trim();
    prog.price = document.getElementById('editProgPrice').value.trim();

    // Save from tags cache
    prog.tags = [...(window.activeEditTags || [])];

    prog.curriculum = document.getElementById('editProgCurriculum').value.split('\n').map(s => s.trim()).filter(Boolean);
    prog.includes = document.getElementById('editProgIncludes').value.split('\n').map(s => s.trim()).filter(Boolean);
    prog.prep = document.getElementById('editProgPrep').value.split('\n').map(s => s.trim()).filter(Boolean);
    prog.precautions = document.getElementById('editProgPrecautions').value.split('\n').map(s => s.trim()).filter(Boolean);

    prog.image = document.getElementById('editProgImage').value.trim();
    prog.visible = document.getElementById('editProgVisible').checked;

    prog.smartStoreUrl = document.getElementById('editProgSmartStoreUrl').value.trim();
    prog.seoTitle = document.getElementById('editProgSeoTitle') ? document.getElementById('editProgSeoTitle').value.trim() : (prog.seoTitle || '');
    prog.seoDesc = document.getElementById('editProgSeoDesc') ? document.getElementById('editProgSeoDesc').value.trim() : (prog.seoDesc || '');

    if (isNew) {
      // Check duplicate ID
      const dup = adminData.programs.some(p => p.id === prog.id);
      if (dup) {
        prog.id = 'prog-' + Date.now();
      }
      adminData.programs.push(prog);
      writeAdminLog(`신규 과정 "${prog.title}" 개설`);
    } else {
      writeAdminLog(`교육과정 "${prog.title}" 상세 내용 수정`);
    }

    await DataService.updatePrograms(adminData.programs);
    showToast();
    closeEditForm('programs');
  }
  else if (panelName === 'instructors') {
    const isNew = index === -1 || index === undefined || index === null;

    const nameVal = document.getElementById('editInstName')?.value.trim() || '';
    if (!nameVal) {
      alert('강사명을 입력해주세요.');
      return;
    }

    const roleVal = document.getElementById('editInstRole')?.value.trim() || '';
    const photoVal = document.getElementById('editInstPhoto')?.value.trim() || '';
    const philVal = document.getElementById('editInstPhilosophy')?.value.trim() || '';
    const bioVal = document.getElementById('editInstBio')?.value.trim() || '';
    const certsVal = (document.getElementById('editInstCerts')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

    const careerText = document.getElementById('editInstCareer')?.value.trim() || '';
    const careerVal = careerText.split('\n').map(line => {
      const colIdx = line.indexOf(':');
      if (colIdx !== -1) {
        return {
          year: line.substring(0, colIdx).trim(),
          text: line.substring(colIdx + 1).trim()
        };
      }
      return { year: '', text: line.trim() };
    }).filter(c => c.text);

    const visibleVal = (document.getElementById('editInstVisible') || document.getElementById('customInstMain'))?.checked !== false;

    if (isNew) {
      const newInst = {
        id: 'instructor-' + Date.now(),
        order: adminData.instructors.length,
        name: nameVal,
        role: roleVal,
        photo: photoVal,
        philosophy: philVal,
        bio: bioVal,
        certifications: certsVal,
        career: careerVal,
        visible: visibleVal
      };
      adminData.instructors.push(newInst);
      writeAdminLog(`신규 강사 "${newInst.name}" 등록`);
    } else {
      const inst = adminData.instructors[index];
      if (inst) {
        inst.name = nameVal;
        inst.role = roleVal;
        inst.photo = photoVal;
        inst.philosophy = philVal;
        inst.bio = bioVal;
        inst.certifications = certsVal;
        inst.career = careerVal;
        inst.visible = visibleVal;
        writeAdminLog(`강사 "${inst.name}" 프로필 수정`);
      }
    }

    await DataService.updateInstructors(adminData.instructors);
    showToast('강사 정보가 저장되었습니다.');
    closeEditForm('instructors');
    loadInstructors();
  }
  else if (panelName === 'whyflow') {
    const titleVal = document.getElementById('editWfTitle')?.value.trim();
    const descVal = document.getElementById('editWfDesc')?.value.trim();
    const visibleVal = document.getElementById('editWfVisible')?.checked !== false;

    if (!titleVal) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!descVal) {
      alert('설명을 입력해주세요.');
      return;
    }

    if (!adminData.whyFlow) adminData.whyFlow = { items: [] };
    if (!Array.isArray(adminData.whyFlow.items)) adminData.whyFlow.items = [];

    if (isNew) {
      const newItem = {
        id: 'whyflow-' + Date.now(),
        title: titleVal,
        desc: descVal,
        visible: visibleVal
      };
      adminData.whyFlow.items.push(newItem);
      writeAdminLog(`WHY FLOW 새 항목 "${titleVal}" 추가`);
    } else {
      const item = adminData.whyFlow.items[index];
      if (item) {
        item.title = titleVal;
        item.desc = descVal;
        item.visible = visibleVal;
        writeAdminLog(`WHY FLOW 항목 "${titleVal}" 수정`);
      }
    }

    await DataService.updateWhyFlow(adminData.whyFlow);
    showToast('WHY FLOW 항목이 저장되었습니다.');
    closeEditForm('whyflow');
  }
  else if (panelName === 'reviews') {
    const rev = isNew ? {
      stars: 5,
      date: new Date().toISOString().slice(0, 10)
    } : adminData.reviews[index];

    const nameVal = document.getElementById('editRevName')?.value.trim() || '';
    if (!nameVal) {
      alert('수강생명을 입력해주세요.');
      return;
    }

    const courseSelect = document.getElementById('editRevCourseSelect');
    let courseVal = courseSelect ? courseSelect.value : '프리다이빙';
    if (courseVal === '__custom__') {
      courseVal = document.getElementById('editRevCourseCustom')?.value.trim() || '프리다이빙';
    }

    const dateVal = document.getElementById('editRevDate')?.value || new Date().toISOString().slice(0, 10);
    const textVal = document.getElementById('editRevText')?.value.trim() || '';
    const starsVal = parseInt(document.getElementById('editRevStars')?.value || '5', 10);

    rev.name = nameVal;
    rev.course = courseVal;
    rev.date = dateVal;
    rev.text = textVal;
    rev.stars = starsVal;

    if (isNew) {
      adminData.reviews.push(rev);
      writeAdminLog(`후기 "${rev.name}님 건" 추가`);
    } else {
      writeAdminLog(`수강생 "${rev.name}" 후기 내용 수정`);
    }

    await DataService.updateReviews(adminData.reviews);
    showToast('후기가 저장되었습니다.');
    closeEditForm('reviews');
  }
  else if (panelName === 'gallery') {
    const mediaTypeVal = document.getElementById('editGalMediaType')?.value || 'image';
    const isVideo = mediaTypeVal === 'video';
    const srcVal = document.getElementById('editGalSrc')?.value.trim() || '';
    const videoUrlVal = document.getElementById('editGalVideoUrl')?.value.trim() || '';
    const thumbUrlVal = document.getElementById('editGalThumbnailUrl')?.value.trim() || '';
    const altVal = document.getElementById('editGalAlt')?.value.trim() || '';
    const categoryVal = document.getElementById('editGalCategory')?.value || 'freediving';
    const visibleVal = document.getElementById('editGalVisible')?.checked !== false;

    if (!isVideo && !srcVal) {
      alert('이미지를 업로드해주세요.');
      return;
    }

    if (isVideo && !videoUrlVal && !srcVal) {
      alert('영상 파일을 업로드해주세요.');
      return;
    }

    const finalSrc = isVideo ? (thumbUrlVal || srcVal || videoUrlVal) : srcVal;
    const finalVideoUrl = isVideo ? (videoUrlVal || srcVal) : '';
    const finalThumbUrl = isVideo ? (thumbUrlVal || srcVal) : '';

    const gal = isNew ? {
      src: finalSrc,
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbUrl,
      alt: altVal,
      category: categoryVal,
      visible: visibleVal,
      mediaType: mediaTypeVal
    } : adminData.gallery[index];

    if (!isNew && gal) {
      gal.src = finalSrc;
      gal.videoUrl = finalVideoUrl;
      gal.thumbnailUrl = finalThumbUrl;
      gal.alt = altVal;
      gal.category = categoryVal;
      gal.visible = visibleVal;
      gal.mediaType = mediaTypeVal;
    }

    if (isNew) {
      adminData.gallery.push(gal);
      writeAdminLog(`갤러리 새 ${isVideo ? '영상' : '사진'} 추가`);
    } else {
      writeAdminLog(`갤러리 ${isVideo ? '영상' : '사진'} 정보 수정`);
    }

    await DataService.updateGallery(adminData.gallery);
    showToast(`갤러리 ${isVideo ? '영상' : '이미지'}이(가) 저장되었습니다.`);
    closeEditForm('gallery');
    loadGallery();
  }
  else if (panelName === 'faq') {
    const faqItem = isNew ? {} : adminData.faq[index];

    faqItem.question = document.getElementById('editFaqQ').value.trim();
    faqItem.answer = document.getElementById('editFaqA').value.trim();

    if (isNew) {
      adminData.faq.push(faqItem);
      writeAdminLog(`FAQ "${faqItem.question.substring(0, 10)}..." 질문 등록`);
    } else {
      writeAdminLog(`FAQ "${faqItem.question.substring(0, 10)}..." 답변 수정`);
    }

    await DataService.updateFAQ(adminData.faq);
    showToast();
    closeEditForm('faq');
  }
  else if (panelName === 'popup') {
    const titleVal = document.getElementById('editPopupTitle').value.trim();
    if (!titleVal) {
      alert('팝업 제목은 필수 입력 항목입니다.');
      return;
    }
    const imgVal = document.getElementById('editPopupImage').value.trim();
    if (!imgVal) {
      alert('팝업 이미지는 필수 항목입니다.');
      return;
    }
    const startVal = document.getElementById('editPopupStartDate').value;
    const endVal = document.getElementById('editPopupEndDate').value;
    if (!startVal || !endVal) {
      alert('노출 시작일과 종료일은 필수 항목입니다.');
      return;
    }

    if (startVal > endVal) {
      alert('종료 날짜는 시작 날짜 이후로 설정해주세요.');
      return;
    }

    const activePopups = adminData.popup.filter(item => getPopupStatus(item) === 'active');
    const enabledVal = document.getElementById('editPopupEnabled').checked;

    const p = isNew ? {
      id: 'popup-' + Date.now(),
      views: 0,
      clicks: 0,
      priority: activePopups.length + 1,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    } : adminData.popup[index];

    p.title = titleVal;
    p.desc = document.getElementById('editPopupDesc').value.trim();
    p.link = document.getElementById('editPopupLink').value.trim();
    p.openInNewTab = document.getElementById('editPopupOpenInNewTab').checked;
    p.image = imgVal;
    p.startDate = startVal;
    p.endDate = endVal;
    p.enabled = enabledVal;
    p.target = 'all';

    // 신규 노출 팝업인 경우 맨 마지막 순위 부여
    if (isNew && enabledVal) {
      p.priority = activePopups.length + 1;
    }

    p.useDismiss = document.getElementById('editPopupUseDismiss').checked;
    p.dismissText = document.getElementById('editPopupDismissText').value.trim() || '오늘 하루 보지 않기';
    p.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (isNew) {
      adminData.popup.push(p);
      writeAdminLog(`신규 팝업 "${p.title}" 추가`);
    } else {
      writeAdminLog(`팝업 "${p.title}" 정보 수정`);
    }

    normalizePopupPriorities();

    await DataService.updatePopup(adminData.popup);
    showToast();
    closeEditForm('popup');
  }
};

// ─── Program Detail Sub-Handlers ───
window.renderTagChips = function () {
  const wrap = document.getElementById('editProgTagsWrap');
  if (!wrap) return;

  const tags = window.activeEditTags || [];
  let html = tags.map((tag, i) => `
    <span class="tag-chip">
      ${tag}
      <button class="tag-chip__remove" onclick="removeTagChip(${i}); return false;">×</button>
    </span>
  `).join('');

  html += `<input type="text" class="tag-add-input" id="tagAddInput" placeholder="+ 태그 추가 (엔터 또는 쉼표)">`;
  wrap.innerHTML = html;

  const input = document.getElementById('tagAddInput');
  if (input) {
    const addTag = () => {
      const val = input.value.trim().replace(/,/g, '');
      if (val && !tags.includes(val)) {
        tags.push(val);
        window.activeEditTags = tags;
        renderTagChips();
      }
      input.value = '';
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag();
      }
    });
    input.addEventListener('blur', addTag);
  }
};

window.removeTagChip = function (idx) {
  if (window.activeEditTags) {
    window.activeEditTags.splice(idx, 1);
    renderTagChips();
  }
};

window.clearProgImage = function () {
  const imgInput = document.getElementById('editProgImage');
  const preview = document.getElementById('editProgPreviewImage');
  if (imgInput) imgInput.value = 'images/program-oneday.jpg';
  if (preview) preview.src = 'images/program-oneday.jpg';
  showToast('대표 이미지가 기본값으로 설정되었습니다.');
};

window.uploadProgImageFile = async function () {
  const fileInput = document.getElementById('editProgFile');
  const imgInput = document.getElementById('editProgImage');
  const preview = document.getElementById('editProgPreviewImage');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];
  showToast('이미지 업로드 중...');
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      if (imgInput) imgInput.value = res.secure_url;
      if (preview) preview.src = res.secure_url;
      showToast('대표 이미지가 업로드되었습니다.');
    }
  } catch (err) {
    console.error('Prog image upload error:', err);
    showToast('업로드 실패: ' + err.message);
  }
};

window.confirmProgramClone = function (index) {
  const prog = adminData.programs[index];
  if (!prog) return;

  openSafetyModal({
    title: '현재 교육과정을 복제하시겠습니까?',
    desc: `‘${prog.title}’ 교육과정과 동일한 복사본 데이터를 새로 생성합니다.`,
    confirmText: '교육과정 복제',
    isDanger: false,
    onConfirm: async () => {
      const clone = JSON.parse(JSON.stringify(prog));
      clone.id = 'copy-' + Date.now();
      clone.title = clone.title + ' (복사본)';

      adminData.programs.push(clone);
      await DataService.updatePrograms(adminData.programs);
      writeAdminLog(`교육과정 "${clone.title}" 복제 및 개설`);
      showToast('교육과정이 복제되었습니다.');

      const newIndex = adminData.programs.length - 1;
      showEditForm('programs', newIndex);
    }
  });
};

window.previewActiveProgram = function (index) {
  // Open live site program detail/modal in new tab
  const prog = (index >= 0 && adminData.programs) ? adminData.programs[index] : null;
  const progId = prog?.id || (document.getElementById('editProgId')?.value.trim());
  if (progId) {
    window.open(`index.html#program-${progId}`, '_blank');
  } else {
    window.open('index.html#program', '_blank');
  }
};

window.initEditScrollspy = function () {
  const navItems = document.querySelectorAll('.edit-nav-item');
  const cards = document.querySelectorAll('.edit-content .admin-card');
  const navContainer = document.querySelector('.edit-nav');

  // Click event: Smooth Scroll
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navItems.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');
      }
    });
  });

  // IntersectionObserver: Scrollspy highlight
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -70% 0px', // check when elements hit mid-to-top viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const activeNav = document.querySelector(`.edit-nav-item[data-target="${id}"]`);
        if (activeNav) {
          navItems.forEach(i => i.classList.remove('is-active'));
          activeNav.classList.add('is-active');

          // Auto scroll mobile horizontal navigation bar to center active tab
          if (window.innerWidth <= 768 && navContainer) {
            activeNav.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      }
    });
  }, observerOptions);

  cards.forEach(card => {
    if (card.id) observer.observe(card);
  });
};

// ─── Safety Confirmation Modal Helper ───
function openSafetyModal({ title, desc, confirmText, isDanger = true, onConfirm }) {
  const overlay = document.getElementById('safetyModalOverlay');
  if (!overlay) return;

  const titleEl = document.getElementById('safetyModalTitle');
  const descEl = document.getElementById('safetyModalDesc');
  const confirmBtn = document.getElementById('safetyModalConfirm');
  const cancelBtn = document.getElementById('safetyModalCancel');
  const closeBtn = document.getElementById('safetyModalClose');

  titleEl.textContent = title;
  descEl.textContent = desc;
  confirmBtn.textContent = confirmText;

  if (isDanger) {
    confirmBtn.className = 'admin-btn admin-btn--danger';
  } else {
    confirmBtn.className = 'admin-btn admin-btn--primary';
  }

  overlay.style.display = 'flex';
  overlay.offsetHeight; // force reflow
  overlay.classList.add('is-active');

  const closeHandler = () => {
    overlay.classList.remove('is-active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 250);
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    closeBtn.onclick = null;
    overlay.onclick = null;
  };

  confirmBtn.onclick = () => {
    onConfirm();
    closeHandler();
  };

  cancelBtn.onclick = closeHandler;
  closeBtn.onclick = closeHandler;

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeHandler();
    }
  };
}

window.confirmWhyFlowDelete = function (index) {
  const item = adminData.whyFlow.items[index];
  if (!item) return;

  openSafetyModal({
    title: `‘${item.title}’ 항목을 삭제하시겠습니까?`,
    desc: '삭제한 WHY FLOW 항목은 복구할 수 없습니다.',
    confirmText: '삭제하기',
    isDanger: true,
    onConfirm: () => {
      executeDelete('whyflow', index);
    }
  });
};

window.confirmProgramDelete = function (index) {
  const prog = adminData.programs[index];
  if (!prog) return;

  openSafetyModal({
    title: `‘${prog.title}’ 교육과정을 삭제하시겠습니까?`,
    desc: '삭제하면 해당 교육과정의 제목, 설명, 가격, 이미지, 커리큘럼 및 링크 정보가 함께 삭제됩니다.',
    confirmText: '교육과정 삭제',
    isDanger: true,
    onConfirm: () => {
      executeDelete('program', index);
    }
  });
};

window.confirmFaqDelete = function (index) {
  const faqItem = adminData.faq[index];
  if (!faqItem) return;

  openSafetyModal({
    title: 'FAQ를 삭제하시겠습니까?',
    desc: '삭제한 FAQ는 복구할 수 없습니다.',
    confirmText: '삭제하기',
    isDanger: true,
    onConfirm: () => {
      executeDelete('faq', index);
    }
  });
};

window.confirmReviewDelete = function (index) {
  const rev = adminData.reviews[index];
  if (!rev) return;

  openSafetyModal({
    title: '후기를 삭제하시겠습니까?',
    desc: '삭제한 후기는 복구할 수 없습니다.',
    confirmText: '삭제하기',
    isDanger: true,
    onConfirm: () => {
      executeDelete('review', index);
    }
  });
};

window.confirmInstructorDelete = function (index) {
  const inst = adminData.instructors[index];
  if (!inst) return;

  openSafetyModal({
    title: '강사 프로필을 삭제하시겠습니까?',
    desc: `‘${inst.name}’ 강사의 프로필 정보, 사진, 이력 및 자격 사항이 모두 삭제됩니다.`,
    confirmText: '강사 삭제',
    isDanger: true,
    onConfirm: () => {
      executeDelete('instructor', index);
    }
  });
};

window.confirmGalleryDelete = function (index) {
  const gal = adminData.gallery[index];
  if (!gal) return;

  openSafetyModal({
    title: '갤러리 이미지를 삭제하시겠습니까?',
    desc: '삭제한 갤러리 이미지는 복구할 수 없습니다.',
    confirmText: '이미지 삭제',
    isDanger: true,
    onConfirm: () => {
      executeDelete('gallery', index);
    }
  });
};

window.handleGalleryImageUpload = async function (input) {
  if (!input || !input.files || !input.files.length) return;
  const file = input.files[0];
  showToast("이미지 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const srcInput = document.getElementById('editGalSrc');
      const previewImg = document.getElementById('editGalPreviewImg');
      const placeholder = document.getElementById('editGalPlaceholder');
      const btnUpload = document.getElementById('editGalBtnUpload');
      const btnChange = document.getElementById('editGalBtnChange');

      if (srcInput) srcInput.value = res.secure_url;
      if (previewImg) {
        previewImg.src = res.secure_url;
        previewImg.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
      if (btnUpload) btnUpload.style.display = 'none';
      if (btnChange) btnChange.style.display = 'inline-flex';
      showToast("이미지가 업로드되었습니다.");
    }
  } catch (err) {
    console.error("Gallery image upload error:", err);
    showToast("업로드 실패: " + err.message);
  }
};

window.setGalleryMediaType = function (type) {
  const mediaTypeInput = document.getElementById('editGalMediaType');
  const imgBtn = document.getElementById('mediaTypeImgBtn');
  const videoBtn = document.getElementById('mediaTypeVideoBtn');
  const imgSection = document.getElementById('editGalImageSection');
  const videoSection = document.getElementById('editGalVideoSection');
  const altLabel = document.getElementById('editGalAltLabel');

  if (mediaTypeInput) mediaTypeInput.value = type;

  const isVideo = type === 'video';

  if (imgBtn && videoBtn) {
    imgBtn.style.background = !isVideo ? '#ffffff' : 'transparent';
    imgBtn.style.color = !isVideo ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)';
    imgBtn.style.fontWeight = !isVideo ? '600' : '500';
    imgBtn.style.boxShadow = !isVideo ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';

    videoBtn.style.background = isVideo ? '#ffffff' : 'transparent';
    videoBtn.style.color = isVideo ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)';
    videoBtn.style.fontWeight = isVideo ? '600' : '500';
    videoBtn.style.boxShadow = isVideo ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';
  }

  if (imgSection) imgSection.style.display = !isVideo ? 'block' : 'none';
  if (videoSection) videoSection.style.display = isVideo ? 'block' : 'none';
  if (altLabel) altLabel.textContent = isVideo ? '영상 설명' : '이미지 설명';

  const galEditTitle = document.getElementById('galleryEditTitle');
  if (galEditTitle) {
    const isNew = window.location.hash.includes('/edit/new') || window.location.hash.includes('/edit/-1');
    galEditTitle.textContent = isNew ? '새 미디어 등록' : (isVideo ? '영상 정보 편집' : '사진 정보 편집');
  }
};

function captureVideoFrame(videoFileOrUrl) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      let objectUrl = '';
      if (typeof videoFileOrUrl === 'string') {
        video.src = videoFileOrUrl;
      } else if (videoFileOrUrl instanceof File || videoFileOrUrl instanceof Blob) {
        objectUrl = URL.createObjectURL(videoFileOrUrl);
        video.src = objectUrl;
      } else {
        return resolve('');
      }

      video.onloadeddata = () => {
        video.currentTime = 0.1;
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (err) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          resolve('');
        }
      };
      video.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve('');
      };
      setTimeout(() => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve('');
      }, 5000);
    } catch (e) {
      resolve('');
    }
  });
}

window.handleGalleryVideoUpload = async function (input) {
  if (!input || !input.files || !input.files.length) return;
  const file = input.files[0];

  const statusEl = document.getElementById('editGalVideoStatus');
  const videoInput = document.getElementById('editGalVideoUrl');
  const thumbInput = document.getElementById('editGalThumbnailUrl');
  const srcInput = document.getElementById('editGalSrc');
  const previewVideo = document.getElementById('editGalPreviewVideo');
  const placeholder = document.getElementById('editGalVideoPlaceholder');
  const btnUpload = document.getElementById('editGalBtnVideoUpload');
  const btnChange = document.getElementById('editGalBtnVideoChange');

  showToast("영상 업로드 중... 잠시만 기다려주세요.");
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `<span style="color: #2563EB; font-weight: 600;">⏳ 영상 업로드 및 최적화 중...</span> (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
  }

  try {
    const res = await DataService.uploadFile(file, 'video');
    if (res && res.secure_url) {
      const videoUrl = res.secure_url;

      // 썸네일 자동 생성 (Cloudinary 포스터 변환 또는 로컬 프레임 캡처)
      let posterUrl = '';
      if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/upload/')) {
        posterUrl = videoUrl.replace(/\/video\/upload\/(v\d+\/)?/, (match, version) => {
          return `/video/upload/so_0,q_auto,f_jpg/${version || ''}`;
        }).replace(/\.[^/.]+$/, '.jpg');
      } else {
        posterUrl = await captureVideoFrame(file);
      }

      if (videoInput) videoInput.value = videoUrl;
      if (thumbInput) thumbInput.value = posterUrl || '';
      if (srcInput) srcInput.value = posterUrl || videoUrl;

      if (previewVideo) {
        previewVideo.src = videoUrl;
        if (posterUrl) previewVideo.poster = posterUrl;
        previewVideo.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
      if (btnUpload) btnUpload.style.display = 'none';
      if (btnChange) btnChange.style.display = 'inline-flex';

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: #10B981; font-weight: 600;">✓ 영상 업로드 완료</span> (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
      }
      showToast("영상이 성공적으로 업로드되었습니다.");
    }
  } catch (err) {
    console.error("Gallery video upload error:", err);
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: #EF4444; font-weight: 600;">✕ 영상 업로드 실패:</span> ${err.message}`;
    }
    showToast("영상 업로드 실패: " + err.message);
  } finally {
    input.value = '';
  }
};

window.handleInstPhotoChange = function (newUrl) {
  const previewImg = document.getElementById('customInstPreviewImage');
  const placeholder = document.getElementById('customInstPhotoPlaceholder');
  const uploadBtn = document.querySelector('.img-btn-upload');
  const changeBtn = document.querySelector('.img-btn-change');
  const deleteBtn = document.querySelector('.img-btn-delete');
  const photoInput = document.getElementById('editInstPhoto');

  const hasVal = Boolean(newUrl && newUrl.trim());
  if (photoInput) photoInput.value = newUrl || '';
  if (previewImg) {
    previewImg.src = newUrl || '';
    previewImg.style.display = hasVal ? 'block' : 'none';
  }
  if (placeholder) {
    placeholder.style.display = hasVal ? 'none' : 'flex';
  }
  if (uploadBtn) uploadBtn.style.display = hasVal ? 'none' : 'inline-flex';
  if (changeBtn) changeBtn.style.display = hasVal ? 'inline-flex' : 'none';
  if (deleteBtn) deleteBtn.style.display = hasVal ? 'inline-flex' : 'none';
};

window.handleReviewCourseSelectChange = function (selectEl) {
  const customWrap = document.getElementById('editRevCourseCustomWrap');
  const customInput = document.getElementById('editRevCourseCustom');
  if (!customWrap) return;
  if (selectEl.value === '__custom__') {
    customWrap.style.display = 'block';
    if (customInput) customInput.focus();
  } else {
    customWrap.style.display = 'none';
  }
};

// ─── Start ───
document.addEventListener('DOMContentLoaded', init);

function handleRouting() {
  const hash = window.location.hash || '#dashboard';
  const path = hash.substring(1); // 'programs' or 'programs/edit/oneday'
  const parts = path.split('/');

  const mainPanel = parts[0];

  const validPanels = [
    'dashboard', 'hero', 'whyflow', 'programs', 'instructors',
    'reviews', 'gallery', 'popup', 'faq', 'footer', 'links', 'seo'
  ];

  if (!validPanels.includes(mainPanel)) {
    window.location.hash = '#dashboard';
    return;
  }

  currentPanel = mainPanel;

  // 1. Sidebar menu UI active status sync
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    if (item.dataset.panel === mainPanel) {
      item.classList.add('is-active');
    } else {
      item.classList.remove('is-active');
    }
  });

  // 2. Hide other panels, show current main panel
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('is-active'));
  const panelEl = document.getElementById(`panel-${mainPanel}`);
  if (panelEl) panelEl.classList.add('is-active');

  // 3. Render page title & description
  const titles = {
    dashboard: '대시보드', hero: '메인 Hero 관리', whyflow: 'WHY FLOW 관리',
    programs: '교육과정 관리', instructors: '강사 관리', reviews: '후기 관리',
    gallery: '갤러리 관리', popup: '팝업 관리', faq: 'FAQ 관리', footer: 'Footer 관리',
    links: '연동 서비스', seo: '설정', settings: '설정'
  };
  const subtitles = {
    dashboard: '사이트 운영 현황과 연동 서비스 상태를 한눈에 확인하세요.',
    hero: '메인 페이지 최상단 히어로 배너의 문구 및 미디어를 설정합니다.',
    whyflow: 'FLOW 프리다이빙의 특별한 4가지 강점 가치 카드를 관리합니다.',
    programs: '제공 중인 교육과정을 등록하고 수정합니다.',
    instructors: '강사진 프로필 사진, 역할, 소개글 및 자격 사항을 편집합니다.',
    reviews: '수강생들이 작성한 생생한 강습 후기 목록을 관리합니다.',
    gallery: '갤러리 섹션에 표시할 생생한 수중 교육 사진들을 등록합니다.',
    popup: '홈페이지에 게재할 이벤트 팝업 창의 이미지와 상태를 관리합니다.',
    faq: '고객들이 자주 묻는 질문(FAQ)의 답변 리스트를 구축합니다.',
    footer: '회사 소개 글귀, 하단 사업자 정보 및 공식 SNS 링크 채널을 변경합니다.',
    links: '메인 페이지 예약 버튼 및 상담 채널과 연동될 타사 API 링크를 지정합니다.',
    seo: '사이트 전체 기본 설정 및 검색엔진(SEO) 메타 데이터를 통합 관리합니다.',
    settings: '사이트 전체 기본 설정 및 검색엔진(SEO) 메타 데이터를 통합 관리합니다.'
  };

  const titleEl = document.getElementById('panelTitle');
  const subtitleEl = document.getElementById('panelSubtitle');
  if (titleEl) titleEl.textContent = titles[mainPanel] || '';
  if (subtitleEl) subtitleEl.textContent = subtitles[mainPanel] || '';

  // 3-1. Header action buttons conditional visibility
  const homeBtn = document.getElementById('headerHomeBtn');
  const analyticsBtn = document.getElementById('headerAnalyticsBtn');
  const newInstBtn = document.getElementById('headerNewInstBtn');

  if (homeBtn) {
    homeBtn.style.display = (mainPanel === 'programs' && parts[1] === 'edit') ? 'none' : 'inline-flex';
  }
  if (analyticsBtn) {
    analyticsBtn.style.display = (mainPanel === 'dashboard') ? 'inline-flex' : 'none';
  }
  if (newInstBtn) {
    newInstBtn.style.display = (mainPanel === 'instructors' && parts[1] !== 'edit') ? 'inline-flex' : 'none';
  }

  // Switch loading trigger
  switch (mainPanel) {
    case 'dashboard': loadDashboard(); break;
    case 'hero': loadHero(); break;
    case 'whyflow': loadWhyFlow(); break;
    case 'programs': window.loadPrograms(); break;
    case 'instructors': loadInstructors(); break;
    case 'reviews': loadReviews(); break;
    case 'gallery': loadGallery(); break;
    case 'faq': loadFaq(); break;
    case 'popup': loadPopup(); break;
    case 'footer': loadFooter(); break;
    case 'links': loadLinks(); break;
    case 'seo': loadSeo(); break;
  }

  // 4. Handle List vs Edit Form view
  if (parts[1] === 'edit' && parts[2] !== undefined) {
    const targetIdentifier = parts[2];
    let targetIndex = -1;

    if (mainPanel === 'programs') {
      targetIndex = adminData.programs.findIndex(p => p.id === targetIdentifier);
      if (targetIdentifier === 'new') targetIndex = -1;
    } else {
      targetIndex = parseInt(targetIdentifier, 10);
      if (isNaN(targetIndex)) targetIndex = -1;
    }

    // Hide edit panels of OTHER categories first
    document.querySelectorAll('.panel-view-container:not(.list-view-active)').forEach(c => {
      if (c.id.includes('EditContainer') && !c.id.startsWith(mainPanel)) {
        c.style.display = 'none';
      }
    });
    document.querySelectorAll('.panel-view-container.list-view-active').forEach(c => {
      if (c.id.startsWith(mainPanel)) {
        c.style.display = 'none';
      } else {
        c.style.display = 'block';
      }
    });

    showEditFormForRouting(mainPanel, targetIndex);
  } else {
    // Hide ALL edit panels and show list panels
    document.querySelectorAll('[id$="EditContainer"]').forEach(c => {
      c.style.display = 'none';
    });
    document.querySelectorAll('[id$="ListContainer"]').forEach(c => {
      c.style.display = 'block';
      c.classList.add('list-view-active');
    });

    closeEditFormForRouting(mainPanel);
  }
}

// ─── Popup Panel Implementation ───
window.selectedPopupIndex = -1;

function getPopupStatus(p) {
  if (!p.enabled) return 'inactive';
  const today = new Date().toISOString().slice(0, 10);
  if (p.startDate && today < p.startDate) return 'scheduled';
  if (p.endDate && today > p.endDate) return 'expired';
  return 'active';
}

function normalizePopupPriorities() {
  if (!adminData.popup || !adminData.popup.length) return;

  const activePopups = adminData.popup.filter(p => getPopupStatus(p) === 'active');
  activePopups.sort((a, b) => (a.priority || 1) - (b.priority || 1));

  activePopups.forEach((p, idx) => {
    p.priority = idx + 1;
  });
}

window.loadPopup = function () {
  const container = document.getElementById('popupList');
  if (!container) return;

  const searchVal = document.getElementById('searchPopupTitle')?.value.toLowerCase().trim() || '';
  const statusVal = document.getElementById('filterPopupStatus')?.value || 'all';
  const sortVal = document.getElementById('sortPopup')?.value || 'priority';

  let items = adminData.popup.map((p, i) => ({ ...p, originalIndex: i }));

  // Filters
  if (searchVal) {
    items = items.filter(p => p.title.toLowerCase().includes(searchVal) || (p.desc || '').toLowerCase().includes(searchVal));
  }
  if (statusVal !== 'all') {
    items = items.filter(p => {
      const status = getPopupStatus(p);
      if (statusVal === 'active') return status === 'active';
      if (statusVal === 'inactive') return status !== 'active';
      return true;
    });
  }

  // Sort
  if (sortVal === 'latest') {
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // priority 순 (기본): 노출중 팝업(우선순위 1, 2, 3...) 우선 배치 후 비노출 팝업
    items.sort((a, b) => {
      const aActive = getPopupStatus(a) === 'active';
      const bActive = getPopupStatus(b) === 'active';
      if (aActive && bActive) return (a.priority || 1) - (b.priority || 1);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  // Render stats (실제 데이터 기반 3종 통계)
  const total = adminData.popup.length;
  const active = adminData.popup.filter(p => getPopupStatus(p) === 'active').length;
  const inactive = total - active;

  const totalEl = document.getElementById('statPopupTotal');
  const activeEl = document.getElementById('statPopupActive');
  const inactiveEl = document.getElementById('statPopupInactive');

  if (totalEl) totalEl.innerHTML = `${total} <span class="unit">개</span>`;
  if (activeEl) activeEl.innerHTML = `${active} <span class="unit">개</span>`;
  if (inactiveEl) inactiveEl.innerHTML = `${inactive} <span class="unit">개</span>`;

  // Render Table
  let html = '';
  if (items.length === 0) {
    html = `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-secondary);padding:var(--space-8) 0;">등록된 팝업이 없습니다.</td></tr>`;
  } else {
    html = items.map(p => {
      const status = getPopupStatus(p);
      const isActive = status === 'active';
      let statusBadge = '';
      if (status === 'active') {
        statusBadge = `<span class="badge badge--success" style="font-size: 11px; padding: 2px 6px;">노출중</span>`;
      } else if (status === 'inactive') {
        statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#e2e8f0; color:#475569;">비노출</span>`;
      } else if (status === 'scheduled') {
        statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#dbeafe; color:#1e40af;">예약노출</span>`;
      } else if (status === 'expired') {
        statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#fee2e2; color:#991b1b;">기간만료</span>`;
      }

      const priorityBadge = isActive 
        ? `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:12px; padding:3px 8px; border-radius:12px;">${p.priority}순위</span>`
        : `<span style="color:var(--admin-text-tertiary); font-size:12px;">-</span>`;

      return `
        <tr class="clickable-row popup-drag-row" draggable="true" data-id="${p.id}" data-index="${p.originalIndex}" data-status="${status}" onclick="selectPopupPreviewByIndex(${p.originalIndex})">
          <td class="drag-handle-cell" data-label="이동" onclick="event.stopPropagation()" title="드래그하여 순서 변경">
            ⠿
          </td>
          <td data-label="미리보기">
            <div style="width: 50px; height: 50px; border-radius: var(--radius-sm); overflow: hidden; background: #e2e8f0; border: 1px solid var(--admin-border);">
              <img src="${p.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='images/gallery-1.jpg'">
            </div>
          </td>
          <td data-label="팝업 제목" style="max-width: 200px;">
            <div style="font-weight: 700; color: var(--admin-text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.title}</div>
            <div style="font-size: 11.5px; color: var(--admin-text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; margin-top: 3px;">${p.desc || '설명 없음'}</div>
          </td>
          <td data-label="노출 기간" style="font-size: 12px; white-space: nowrap;">
            ${p.startDate}<br>~ ${p.endDate}
          </td>
          <td data-label="상태" onclick="event.stopPropagation()">
            <div style="display:flex; align-items:center; gap:8px;">
              <label class="toggle">
                <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="togglePopupStatus(${p.originalIndex})">
                <span class="toggle__slider"></span>
              </label>
              ${statusBadge}
            </div>
          </td>
          <td data-label="우선순위" class="popup-priority-cell" style="text-align: center;">
            ${priorityBadge}
          </td>
          <td data-label="작업" class="actions" onclick="event.stopPropagation()">
            <button class="admin-btn admin-btn--ghost" onclick="showEditForm('popup', ${p.originalIndex})" style="padding:4px 10px;min-height:30px;font-size:11.5px;">수정</button>
            <button class="admin-btn admin-btn--ghost" onclick="confirmPopupDelete(${p.originalIndex})" style="padding:4px 10px;min-height:30px;font-size:11.5px;color:var(--admin-danger);">삭제</button>
          </td>
        </tr>
      `;
    }).join('');
  }
  container.innerHTML = html;

  // Selected Preview setup
  if (items.length > 0) {
    if (window.selectedPopupIndex === -1 || !adminData.popup[window.selectedPopupIndex]) {
      window.selectedPopupIndex = items[0].originalIndex;
    }
    setTimeout(() => {
      selectPopupPreviewByIndex(window.selectedPopupIndex);
    }, 50);
  } else {
    renderPopupPreview(-1);
  }

  // Init drag and drop
  initPopupDragAndDrop();
};

function updatePopupPriorityBadgesInDOM() {
  const tbody = document.getElementById('popupList');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr.popup-drag-row'));
  let activeRank = 1;

  rows.forEach(row => {
    const isRowActive = row.dataset.status === 'active';
    const priCell = row.querySelector('.popup-priority-cell');
    if (priCell) {
      if (isRowActive) {
        priCell.innerHTML = `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:12px; padding:3px 8px; border-radius:12px;">${activeRank}순위</span>`;
        activeRank++;
      } else {
        priCell.innerHTML = `<span style="color:var(--admin-text-tertiary); font-size:12px;">-</span>`;
      }
    }
  });
}

function initPopupDragAndDrop() {
  const tbody = document.getElementById('popupList');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr.popup-drag-row');
  let draggedRow = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      draggedRow = row;
      row.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.index);
    });

    row.addEventListener('dragend', () => {
      if (draggedRow) {
        draggedRow.classList.remove('is-dragging');
      }
      rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
      draggedRow = null;
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedRow || draggedRow === row) return;
      e.dataTransfer.dropEffect = 'move';

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        row.classList.add('drag-over-top');
        row.classList.remove('drag-over-bottom');
      } else {
        row.classList.add('drag-over-bottom');
        row.classList.remove('drag-over-top');
      }
    });

    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over-top', 'drag-over-bottom');
      if (!draggedRow || draggedRow === row) return;

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        tbody.insertBefore(draggedRow, row);
      } else {
        tbody.insertBefore(draggedRow, row.nextSibling);
      }

      updatePopupPriorityBadgesInDOM();

      const saveOrderBtn = document.getElementById('savePopupOrderBtn');
      if (saveOrderBtn) {
        saveOrderBtn.style.display = 'inline-flex';
      }
    });

    // Touch support for Mobile
    const handle = row.querySelector('.drag-handle-cell');
    if (handle) {
      handle.addEventListener('touchstart', () => {
        draggedRow = row;
        row.classList.add('is-dragging');
      }, { passive: true });

      handle.addEventListener('touchmove', (e) => {
        if (!draggedRow) return;
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetRow = targetElement?.closest('tr.popup-drag-row');

        rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        if (targetRow && targetRow !== draggedRow) {
          const rect = targetRow.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (touch.clientY < midY) {
            targetRow.classList.add('drag-over-top');
          } else {
            targetRow.classList.add('drag-over-bottom');
          }
        }
      }, { passive: true });

      handle.addEventListener('touchend', (e) => {
        if (!draggedRow) return;
        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetRow = targetElement?.closest('tr.popup-drag-row');

        if (targetRow && targetRow !== draggedRow) {
          const rect = targetRow.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (touch.clientY < midY) {
            tbody.insertBefore(draggedRow, targetRow);
          } else {
            tbody.insertBefore(draggedRow, targetRow.nextSibling);
          }
          updatePopupPriorityBadgesInDOM();
          const saveOrderBtn = document.getElementById('savePopupOrderBtn');
          if (saveOrderBtn) {
            saveOrderBtn.style.display = 'inline-flex';
          }
        }

        draggedRow.classList.remove('is-dragging');
        rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        draggedRow = null;
      });
    }
  });
}

window.savePopupOrder = async function () {
  const tbody = document.getElementById('popupList');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr.popup-drag-row'));
  let activeRank = 1;

  // 1. 드래그된 행 순서대로 id를 찾아 adminData.popup의 priority 및 updatedAt을 할당
  rows.forEach(row => {
    const popupId = row.dataset.id;
    const p = adminData.popup.find(item => String(item.id) === String(popupId));
    if (p && getPopupStatus(p) === 'active') {
      p.priority = activeRank;
      p.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      activeRank++;
    }
  });

  // 2. adminData.popup 배열 자체를 priority 순서로 재정렬
  adminData.popup.sort((a, b) => {
    const aActive = getPopupStatus(a) === 'active';
    const bActive = getPopupStatus(b) === 'active';
    if (aActive && bActive) return (a.priority || 1) - (b.priority || 1);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 3. LocalStorage에 영구 저장
  try {
    await DataService.updatePopup(adminData.popup);
    writeAdminLog('팝업 노출 순서 변경');
    showToast('팝업 노출 순서가 저장되었습니다.');
  } catch (err) {
    console.error('팝업 순서 저장 실패:', err);
    alert('팝업 순서 저장에 실패했습니다.');
    return;
  }

  // 4. 순서 적용하기 버튼 숨김
  const saveOrderBtn = document.getElementById('savePopupOrderBtn');
  if (saveOrderBtn) {
    saveOrderBtn.style.display = 'none';
  }

  // 5. 다시 렌더링
  loadPopup();
};

window.togglePopupStatus = async function (index) {
  const p = adminData.popup[index];
  if (!p) return;
  p.enabled = !p.enabled;
  p.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');

  if (p.enabled) {
    const otherActiveCount = adminData.popup.filter(item => item !== p && getPopupStatus(item) === 'active').length;
    p.priority = otherActiveCount + 1;
  }
  normalizePopupPriorities();

  await DataService.updatePopup(adminData.popup);
  writeAdminLog(`팝업 "${p.title}" 노출 여부 변경 (${p.enabled ? '노출' : '비노출'})`);
  showToast('상태가 업데이트되었습니다.');
  loadPopup();
};

window.confirmPopupDelete = function (index) {
  const p = adminData.popup[index];
  if (!p) return;

  openSafetyModal({
    title: '팝업을 삭제하시겠습니까?',
    desc: `‘${p.title}’ 팝업이 삭제됩니다. 삭제한 팝업은 복구할 수 없습니다.`,
    confirmText: '삭제하기',
    isDanger: true,
    onConfirm: async () => {
      const targetTitle = p.title;
      adminData.popup.splice(index, 1);
      normalizePopupPriorities();
      await DataService.updatePopup(adminData.popup);
      writeAdminLog(`팝업 "${targetTitle}" 삭제`);
      showToast('팝업이 삭제되었습니다.');
      if (window.selectedPopupIndex === index) {
        window.selectedPopupIndex = -1;
      }
      loadPopup();
    }
  });
};

window.selectPopupPreviewByIndex = function (originalIndex) {
  window.selectedPopupIndex = originalIndex;
  renderPopupPreview(originalIndex);
  
  document.querySelectorAll('#popupList tr').forEach(tr => {
    if (parseInt(tr.dataset.index, 10) === originalIndex) {
      tr.style.background = 'var(--admin-accent-light)';
    } else {
      tr.style.background = '';
    }
  });
};

function renderPopupPreview(index) {
  const wrapper = document.getElementById('previewMockupWrapper');
  if (!wrapper) return;

  const dTitle = document.getElementById('detailPopupTitle');
  const dPeriod = document.getElementById('detailPopupPeriod');
  const dStatus = document.getElementById('detailPopupStatus');
  const dPriority = document.getElementById('detailPopupPriority');
  const dCreated = document.getElementById('detailPopupCreated');
  const dUpdated = document.getElementById('detailPopupUpdated');

  if (index === -1 || !adminData.popup[index]) {
    wrapper.innerHTML = `<div style="color:var(--admin-text-secondary);font-size:13px;text-align:center;">선택된 팝업이 없거나 검색 결과가 없습니다.</div>`;
    if (dTitle) dTitle.textContent = '-';
    if (dPeriod) dPeriod.textContent = '-';
    if (dStatus) dStatus.textContent = '-';
    if (dPriority) dPriority.textContent = '-';
    if (dCreated) dCreated.textContent = '-';
    if (dUpdated) dUpdated.textContent = '-';
    return;
  }

  const p = adminData.popup[index];

  const searchVal = document.getElementById('searchPopupTitle')?.value.toLowerCase().trim() || '';
  const statusVal = document.getElementById('filterPopupStatus')?.value || 'all';
  let filteredList = adminData.popup.map((item, idx) => ({ ...item, originalIndex: idx }));
  
  if (searchVal) {
    filteredList = filteredList.filter(item => item.title.toLowerCase().includes(searchVal) || (item.desc || '').toLowerCase().includes(searchVal));
  }
  if (statusVal !== 'all') {
    filteredList = filteredList.filter(item => {
      const status = getPopupStatus(item);
      return statusVal === 'active' ? status === 'active' : status !== 'active';
    });
  }

  const listIdx = filteredList.findIndex(item => item.originalIndex === index);
  const prevIdx = listIdx === -1 ? 0 : (listIdx - 1 + filteredList.length) % filteredList.length;
  const nextIdx = listIdx === -1 ? 0 : (listIdx + 1) % filteredList.length;

  const prevOriginalIndex = filteredList[prevIdx]?.originalIndex ?? index;
  const nextOriginalIndex = filteredList[nextIdx]?.originalIndex ?? index;

  let arrowHtml = '';
  if (filteredList.length > 1) {
    arrowHtml = `
      <div class="popup-mockup__arrows">
        <button class="popup-mockup__arrow-btn" onclick="event.stopPropagation(); selectPopupPreviewByIndex(${prevOriginalIndex})">◀</button>
        <span style="color:white; font-size:10px; line-height:22px;">${listIdx + 1}/${filteredList.length}</span>
        <button class="popup-mockup__arrow-btn" onclick="event.stopPropagation(); selectPopupPreviewByIndex(${nextOriginalIndex})">▶</button>
      </div>
    `;
  }

  wrapper.innerHTML = `
    <div class="popup-mockup">
      <div class="popup-mockup__img-container">
        <img class="popup-mockup__img" src="${p.image || 'images/gallery-1.jpg'}" onerror="this.src='images/gallery-1.jpg'">
        <button class="popup-mockup__close" onclick="event.stopPropagation(); showToast('미리보기에서는 닫을 수 없습니다.')">×</button>
        <div class="popup-mockup__overlay">
          <h4 class="popup-mockup__title">${p.title}</h4>
          <p class="popup-mockup__desc">${p.desc || '상세내용 없음'}</p>
          ${p.link ? `<a class="popup-mockup__link-btn" href="${p.link}" ${p.openInNewTab ? 'target="_blank"' : 'target="_self"'} onclick="event.stopPropagation()">자세히 보기</a>` : ''}
        </div>
        ${arrowHtml}
      </div>
      <div class="popup-mockup__footer">
        ${p.useDismiss ? `
          <label>
            <input type="checkbox" onclick="event.stopPropagation(); showToast('24시간 동안 보이지 않도록 설정됩니다.')">
            <span>${p.dismissText}</span>
          </label>
        ` : '<span>&nbsp;</span>'}
      </div>
    </div>
  `;

  const status = getPopupStatus(p);
  let statusBadge = '';
  if (status === 'active') {
    statusBadge = `<span class="badge badge--success" style="font-size: 11px; padding: 2px 6px;">노출중</span>`;
  } else if (status === 'inactive') {
    statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#e2e8f0; color:#475569;">비노출</span>`;
  } else if (status === 'scheduled') {
    statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#dbeafe; color:#1e40af;">예약노출</span>`;
  } else if (status === 'expired') {
    statusBadge = `<span class="badge" style="font-size: 11px; padding: 2px 6px; background:#fee2e2; color:#991b1b;">기간만료</span>`;
  }

  if (dTitle) dTitle.textContent = p.title;
  if (dPeriod) dPeriod.textContent = `${p.startDate} ~ ${p.endDate}`;
  if (dStatus) dStatus.innerHTML = statusBadge;
  if (dPriority) dPriority.textContent = getPopupStatus(p) === 'active' ? `${p.priority}순위` : '-';
  if (dCreated) dCreated.textContent = p.createdAt || '-';
  if (dUpdated) dUpdated.textContent = p.updatedAt || '-';
}

function renderPopupEditForm(index) {
  const formWrap = document.getElementById('popupEditForm');
  if (!formWrap) return;

  const isNew = index === -1;
  const activeCount = adminData.popup ? adminData.popup.filter(item => getPopupStatus(item) === 'active').length : 0;
  const p = isNew ? {
    id: 'popup-' + Date.now(),
    title: '', desc: '', link: '', image: '', openInNewTab: false,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    enabled: true, priority: activeCount + 1, target: 'all',
    useDismiss: true, dismissText: '오늘 하루 보지 않기'
  } : adminData.popup[index];

  formWrap.innerHTML = `
    <div class="popup-edit-grid">
      <!-- 왼쪽: 기본 설정 카드 -->
      <div class="admin-card" id="card-popup-info" style="padding: 16px 20px 14px 20px; margin-bottom: 0;">
        <h3 class="admin-card__title" style="margin-bottom: 12px; border-bottom: 1px solid var(--admin-border); padding-bottom: 6px; font-size: 16px;">기본 설정</h3>
        
        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span>팝업 제목 <span style="color:#EF4444;">*</span></span>
            <span style="font-size: 11px; font-weight: normal; color: var(--admin-text-tertiary);"><span id="titleCharCount">${(p.title || '').length}</span> / 40</span>
          </label>
          <input type="text" class="form-input" id="editPopupTitle" value="${p.title || ''}" placeholder="예: 여름 프리다이빙 할인 이벤트" maxlength="40" style="margin-bottom: 0; min-height: 36px;" oninput="document.getElementById('titleCharCount').textContent = this.value.length;">
        </div>
        
        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span>팝업 내용 설명 (선택)</span>
            <span style="font-size: 11px; font-weight: normal; color: var(--admin-text-tertiary);"><span id="descCharCount">${(p.desc || '').length}</span> / 80</span>
          </label>
          <textarea class="form-textarea" id="editPopupDesc" rows="2" placeholder="팝업 본문에 들어갈 상세 내용을 입력하세요." maxlength="80" style="min-height: 52px; margin-bottom: 0; resize: vertical;" oninput="document.getElementById('descCharCount').textContent = this.value.length;">${p.desc || ''}</textarea>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="margin-bottom: 4px;">팝업 이미지 <span style="color:#EF4444;">*</span></label>
          <input type="hidden" id="editPopupImage" value="${p.image || ''}">
          
          <div class="image-upload-zone" id="popupImageDropZone" style="padding: 6px; border-radius: var(--radius-md);">
            <div id="popupImagePreviewWrap" style="${p.image ? 'display: block;' : 'display: none;'} position: relative; width: 100%; height: 190px; border-radius: var(--radius-md); overflow: hidden; background: #f8fafc; border: 1px solid var(--admin-border);">
              <img id="popupImagePreview" src="${p.image || ''}" style="width: 100%; height: 100%; object-fit: contain;">
              <div style="position: absolute; bottom: 8px; right: 8px; display: flex; gap: 6px; z-index: 10;">
                <button type="button" class="admin-btn admin-btn--ghost" onclick="event.stopPropagation(); document.getElementById('editPopupFileInput').click()" style="background: #ffffff; border: 1px solid var(--admin-border); box-shadow: var(--admin-shadow-sm); font-size: 12px; padding: 4px 10px; min-height: 28px;">이미지 변경</button>
                <button type="button" class="admin-btn admin-btn--danger" onclick="event.stopPropagation(); window.deletePopupImage()" style="box-shadow: var(--admin-shadow-sm); font-size: 12px; padding: 4px 10px; min-height: 28px;">이미지 삭제</button>
              </div>
            </div>
            <div id="popupImagePlaceholder" style="${p.image ? 'display: none;' : 'display: block;'} padding: 36px 16px; text-align: center; color: var(--admin-text-secondary); border: 1.5px dashed var(--admin-border); border-radius: var(--radius-md); background: var(--admin-bg);">
              <div style="font-size: 28px; margin-bottom: 6px;">📁</div>
              <div style="font-size: 13px; font-weight: 600; color: var(--admin-text-primary);">이미지를 드래그하거나 클릭하여 업로드</div>
              <div style="font-size: 11px; margin-top: 3px; color: var(--admin-text-tertiary);">PNG, JPG, GIF, WEBP (최대 5MB)</div>
            </div>
            <input type="file" id="editPopupFileInput" accept="image/*" style="display: none;">
          </div>
        </div>
      </div>

      <!-- 오른쪽: 노출 및 제어 설정 카드 -->
      <div class="admin-card" id="card-popup-setting" style="padding: 16px 20px 14px 20px; margin-bottom: 0;">
        <h3 class="admin-card__title" style="margin-bottom: 12px; border-bottom: 1px solid var(--admin-border); padding-bottom: 6px; font-size: 16px;">노출 및 제어 설정</h3>
        
        <!-- 1. 시작 날짜 / 종료 날짜 -->
        <div class="form-row" style="margin-bottom: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="margin-bottom: 4px;">시작 날짜 <span style="color:#EF4444;">*</span></label>
            <input type="date" class="form-input" id="editPopupStartDate" value="${p.startDate || ''}" style="margin-bottom: 0; min-height: 36px;">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="margin-bottom: 4px;">종료 날짜 <span style="color:#EF4444;">*</span></label>
            <input type="date" class="form-input" id="editPopupEndDate" value="${p.endDate || ''}" style="margin-bottom: 0; min-height: 36px;">
          </div>
        </div>

        <!-- 2. 노출 여부 & 3. 노출 순서 안내(읽기 전용) -->
        <div class="form-row" style="margin-bottom: 10px; align-items: center;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="display: block; margin-bottom: 4px;">노출 여부</label>
            <div style="display: flex; align-items: center; gap: 8px; min-height: 36px;">
              <label class="toggle" style="margin: 0;">
                <input type="checkbox" id="editPopupEnabled" ${p.enabled ? 'checked' : ''} onchange="document.getElementById('editPopupEnabledText').textContent = this.checked ? '노출' : '비노출'">
                <span class="toggle__slider"></span>
              </label>
              <span id="editPopupEnabledText" style="font-size: 13.5px; font-weight: 600; color: var(--admin-text-primary);">${p.enabled ? '노출' : '비노출'}</span>
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="margin-bottom: 4px;">현재 노출 순서</label>
            <div style="min-height: 36px; display: flex; align-items: center; gap: 8px;">
              ${p.enabled ? `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-size:12.5px; padding:4px 10px; border-radius:12px;">${p.priority || 1}순위</span>` : `<span style="font-size:12.5px; color:var(--admin-text-tertiary);">비노출 (순위 없음)</span>`}
              <span style="font-size: 11px; color: var(--admin-text-tertiary);">※ 목록에서 드래그로 순서 변경</span>
            </div>
          </div>
        </div>

        <!-- 4. 연결 링크 URL & 5. 새 창에서 링크 열기 -->
        <div class="form-group" style="border: 1px solid var(--admin-border); border-radius: var(--radius-md); padding: 10px 12px; background: var(--admin-bg); margin-bottom: 10px;">
          <label class="form-label" style="margin-bottom: 4px;">연결 링크 URL (선택)</label>
          <input type="text" class="form-input" id="editPopupLink" value="${p.link || ''}" placeholder="예: #program 또는 https://..." style="margin-bottom: 6px; min-height: 34px; font-size: 13.5px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; color: var(--admin-text-primary); font-weight: 500; margin: 0;">
              <input type="checkbox" id="editPopupOpenInNewTab" ${p.openInNewTab ? 'checked' : ''}> 새 창에서 링크 열기
            </label>
            <span style="font-size: 11px; color: var(--admin-text-tertiary);">
              (클릭 시 새 브라우저 탭에서 열림)
            </span>
          </div>
        </div>

        <!-- 6. 하루 보지 않기 제어 -->
        <div class="form-group" style="border: 1px solid var(--admin-border); border-radius: var(--radius-md); padding: 10px 12px; background: var(--admin-bg); margin-bottom: 0;">
          <label class="form-label" style="display: block; margin-bottom: 4px;">하루 보지 않기 제어</label>
          <div class="dismiss-control-row" style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; white-space: nowrap; flex-shrink: 0; margin: 0;">
              <input type="checkbox" id="editPopupUseDismiss" ${p.useDismiss ? 'checked' : ''} onchange="window.togglePopupDismissInput(this.checked)"> 기능 사용
            </label>
            <div style="flex: 1; min-width: 150px;">
              <input type="text" class="form-input" id="editPopupDismissText" value="${p.dismissText || '오늘 하루 보지 않기'}" placeholder="예: 오늘 하루 보지 않기" style="margin-bottom: 0; min-height: 34px; font-size: 13px;" ${p.useDismiss ? '' : 'disabled'}>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 액션 버튼 바 -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 14px;">
      <div>
        ${!isNew ? `<button type="button" class="admin-btn admin-btn--danger" onclick="window.deletePopupFromEdit(${index})" style="min-height: 38px; padding: 0 18px; font-size: 13px; font-weight: 600;">팝업 삭제</button>` : ''}
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="admin-btn admin-btn--ghost" onclick="closeEditForm('popup')" style="min-height: 38px; padding: 0 20px; font-size: 13px;">취소</button>
        <button type="button" class="admin-btn admin-btn--primary" onclick="saveActiveEditForm('popup', ${index})" style="min-height: 38px; padding: 0 24px; font-size: 13px; font-weight: 700;">저장하기</button>
      </div>
    </div>
  `;

  bindEditNavEvents();

  const dropZone = document.getElementById('popupImageDropZone');
  const fileInput = document.getElementById('editPopupFileInput');
  if (dropZone && fileInput) {
    dropZone.onclick = function(e) {
      if (e.target === fileInput || e.target.closest('button')) return;
      fileInput.click();
    };
    fileInput.onchange = async function() {
      if (fileInput.files.length > 0) {
        await uploadPopupImageFile(fileInput.files[0]);
      }
    };
  }

  bindPopupImageUploadHandlers();
}

window.deletePopupFromEdit = function (index) {
  const p = adminData.popup[index];
  if (!p) return;

  openSafetyModal({
    title: '팝업을 삭제하시겠습니까?',
    desc: `‘${p.title}’ 팝업이 삭제됩니다. 삭제한 팝업은 복구할 수 없습니다.`,
    confirmText: '삭제하기',
    isDanger: true,
    onConfirm: async () => {
      const targetName = p.title;
      adminData.popup.splice(index, 1);
      reorderActivePopupPriorities(null);
      await DataService.updatePopup(adminData.popup);
      writeAdminLog(`팝업 "${targetName}" 삭제`);
      closeEditForm('popup');
      showToast('팝업이 삭제되었습니다.');
      if (window.selectedPopupIndex === index) {
        window.selectedPopupIndex = -1;
      }
      loadPopup();
    }
  });
};

window.togglePopupDismissInput = function (checked) {
  const input = document.getElementById('editPopupDismissText');
  if (input) {
    input.disabled = !checked;
  }
};

function bindEditNavEvents() {
  document.querySelectorAll('.edit-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.edit-nav-item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      const targetId = item.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

window.deletePopupImage = function () {
  const hiddenInput = document.getElementById('editPopupImage');
  const imgPreview = document.getElementById('popupImagePreview');
  const previewWrap = document.getElementById('popupImagePreviewWrap');
  const placeholder = document.getElementById('popupImagePlaceholder');
  if (hiddenInput) hiddenInput.value = '';
  if (imgPreview) imgPreview.src = '';
  if (previewWrap) previewWrap.style.display = 'none';
  if (placeholder) placeholder.style.display = 'block';
};

async function uploadPopupImageFile(file) {
  showToast("파일 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const hiddenInput = document.getElementById('editPopupImage');
      const imgPreview = document.getElementById('popupImagePreview');
      const previewWrap = document.getElementById('popupImagePreviewWrap');
      const placeholder = document.getElementById('popupImagePlaceholder');

      if (hiddenInput) hiddenInput.value = res.secure_url;
      if (imgPreview) imgPreview.src = res.secure_url;
      if (previewWrap) previewWrap.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';

      showToast("업로드 완료!");
    }
  } catch (err) {
    console.error("Upload error:", err);
    showToast("업로드 실패: " + err.message);
  }
}

function bindPopupImageUploadHandlers() {
  const dropZone = document.getElementById('popupImageDropZone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', async (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      await uploadPopupImageFile(files[0]);
    }
  }, false);
}

window.uploadAdminFile = async function (fileInputId, targetInputId) {
  const fileInput = document.getElementById(fileInputId);
  if (!fileInput || !fileInput.files || !fileInput.files.length) return;
  const file = fileInput.files[0];
  showToast("파일 업로드 중...");
  try {
    const res = await DataService.uploadFile(file);
    if (res && res.secure_url) {
      const targetInput = document.getElementById(targetInputId);
      if (targetInput) {
        targetInput.value = res.secure_url;
        targetInput.dispatchEvent(new Event('change'));
      }
      showToast("업로드 완료!");
    }
  } catch (err) {
    console.error("uploadAdminFile error:", err);
    showToast("업로드 실패: " + err.message);
  } finally {
    fileInput.value = '';
  }
};

// ─── Admin Backspace Keyboard Navigation ───
let adminKeyboardNavInitialized = false;

function initAdminKeyboardNav() {
  if (adminKeyboardNavInitialized) return;
  adminKeyboardNavInitialized = true;

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace' && e.keyCode !== 8) return;

    const target = e.target || document.activeElement;

    // 1. Check if focus is inside an editable element -> preserve default character deletion
    if (isEditingElement(target)) {
      return;
    }

    // Prevent default browser back navigation behavior
    e.preventDefault();

    // 2. Check if a modal/popup is open -> close top modal first
    if (closeTopAdminModal()) {
      return;
    }

    // 3. Navigate back in admin router
    navigateAdminBack();
  });
}

function isEditingElement(target) {
  if (!target) return false;

  const tagName = target.tagName ? target.tagName.toUpperCase() : '';

  // Standard input, textarea, select
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    if (target.disabled || target.readOnly) return false;
    return true;
  }

  // contenteditable elements
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') {
    return true;
  }

  // Check parent elements for contenteditable
  if (target.closest) {
    const editableParent = target.closest('input, textarea, select, [contenteditable="true"]');
    if (editableParent && !editableParent.disabled && !editableParent.readOnly) {
      return true;
    }
  }

  return false;
}

function closeTopAdminModal() {
  const activeModals = Array.from(document.querySelectorAll('.admin-modal-overlay')).filter(overlay => {
    const style = window.getComputedStyle(overlay);
    const isVisible = overlay.classList.contains('is-active') || 
                      (style.display !== 'none' && style.visibility !== 'hidden');
    return isVisible;
  });

  if (activeModals.length === 0) return false;

  const topModal = activeModals[activeModals.length - 1];

  // Try finding cancel/close buttons inside top modal
  const closeBtn = topModal.querySelector('#safetyModalCancel, #safetyModalClose, #confirmModalCancel, #confirmModalClose, .admin-modal__close, [id$="Cancel"], [id$="Close"]');
  if (closeBtn) {
    closeBtn.click();
  } else {
    topModal.classList.remove('is-active');
    setTimeout(() => {
      topModal.style.display = 'none';
    }, 250);
  }
  return true;
}

function navigateAdminBack() {
  const hash = window.location.hash || '#dashboard';
  const path = hash.substring(1);
  const parts = path.split('/');
  const mainPanel = parts[0];
  const currentHash = window.location.hash;

  if (parts[1] === 'edit') {
    // If in edit view (e.g. #programs/edit/oneday), return to main list view (#programs)
    if (window.history.length > 1) {
      window.history.back();
      setTimeout(() => {
        if (window.location.hash === currentHash) {
          window.location.hash = '#' + mainPanel;
        }
      }, 50);
    } else {
      window.location.hash = '#' + mainPanel;
    }
  } else if (mainPanel !== 'dashboard') {
    // If in main list view, go back to previous history or dashboard
    if (window.history.length > 1) {
      window.history.back();
      setTimeout(() => {
        if (window.location.hash === currentHash) {
          window.location.hash = '#dashboard';
        }
      }, 50);
    } else {
      window.location.hash = '#dashboard';
    }
  } else {
    if (window.history.length > 1) {
      window.history.back();
    }
  }
}

