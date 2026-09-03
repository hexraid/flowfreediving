// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Gallery Full Page Script
// ═══════════════════════════════════════════════

import { DataService } from './data-service.js';
import { MOCK_DATA } from './mock-data.js';
import { getIcon } from './utils/icons.js';
import { initLinkHandler, initLazyLoading } from './utils/helpers.js';

const ITEMS_PER_PAGE = 8;

const state = {
  links: {},
  mobileOpen: false,
  currentLightboxIndex: -1,
  galleryImages: [],
  categories: [],
  currentFilteredImages: [],
  selectedCategory: 'all',
  currentPage: 1
};

// ─── 카테고리 명칭 표준화 매핑 ───
function normalizeCategory(category) {
  if (!category) return 'freediving';
  const c = String(category).trim().toLowerCase();
  if (c === 'freediving' || c === '프리다이빙' || c.includes('프리다이빙')) {
    return 'freediving';
  }
  if (c === 'swimming' || c === '수영' || c.includes('수영') || c === 'eggyeong' || c.includes('입영')) {
    return 'swimming';
  }
  return 'etc';
}

async function init() {
  let gallery = [];
  let footer = null;
  let links = {};
  let seo = null;

  try {
    gallery = await DataService.getGallery();
  } catch (err) {
    console.warn('DataService.getGallery error, using MOCK_DATA fallback:', err);
    gallery = MOCK_DATA.gallery;
  }

  if (!Array.isArray(gallery) || gallery.length === 0) {
    gallery = MOCK_DATA.gallery || [];
  }

  try {
    links = await DataService.getLinks();
    state.links = links || {};
  } catch (e) {}

  try {
    seo = await DataService.getSEO();
    if (seo && seo.siteTitle) {
      document.title = `GALLERY | ${seo.siteTitle}`;
    }
  } catch (e) {}

  let categories = [];
  try {
    categories = await DataService.getGalleryCategories();
  } catch (e) {
    categories = MOCK_DATA.galleryCategories || [];
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    categories = [
      { id: 'freediving', name: '프리다이빙' },
      { id: 'swimming', name: '입영' },
      { id: 'course', name: '강습' },
      { id: 'etc', name: '기타' }
    ];
  }

  try {
    footer = await DataService.getFooter();
  } catch (e) {}

  try {
    const headerNav = await DataService.getHeaderNav();
    renderHeaderNav(headerNav);
  } catch (e) {}

  // 1. 갤러리 렌더링
  renderFullGallery(gallery, categories);

  // 2. 푸터 렌더링
  if (footer) {
    renderFooter(footer);
  }

  // 3. UI 인터랙션 초기화
  initHeader();
  if (links) {
    initLinkHandler(links);
  }
  initFloatingCTA();
  initLazyLoading();
}

function renderHeaderNav(navItems) {
  if (!Array.isArray(navItems) || navItems.length === 0) return;

  navItems.forEach(item => {
    if (!item || !item.target || !item.label) return;
    const targets = [item.target, `index.html${item.target}`];
    targets.forEach(t => {
      const links = document.querySelectorAll(`.header__nav a[href="${t}"], .mobile-drawer a[href="${t}"]`);
      links.forEach(link => {
        link.textContent = item.label;
      });
    });
  });
}

function initHeader() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('headerToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');

  function openMobileMenu() {
    if (state.mobileOpen) return;
    state.mobileOpen = true;
    toggle?.classList.add('is-active');
    drawer?.classList.add('is-active');
    overlay?.classList.add('is-active');
    document.body.classList.add('no-scroll');
    if (history.pushState) {
      history.pushState({ flowState: 'mobileMenu' }, '');
    }
  }

  function closeMobileMenu() {
    if (!state.mobileOpen) return;
    state.mobileOpen = false;
    toggle?.classList.remove('is-active');
    drawer?.classList.remove('is-active');
    overlay?.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  }

  function toggleMobileMenu() {
    if (state.mobileOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });

  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  overlay?.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileMenu();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.mobileOpen) {
      closeMobileMenu();
    }
  });
}

// ─── 갤러리 풀 페이지 렌더링 ───
function renderFullGallery(gallery, categories = []) {
  const grid = document.getElementById('galleryPageGrid');
  const tabs = document.getElementById('galleryPageTabs');
  const paginationEl = document.getElementById('galleryPagination');
  if (!grid) return;

  const rawGallery = Array.isArray(gallery) ? gallery : [];
  // visible !== false && enabled !== false인 사진/영상만 필터링
  const visibleGallery = rawGallery.filter(item => item && item.visible !== false && item.enabled !== false);
  state.galleryImages = visibleGallery;
  state.categories = categories || [];

  const activeCats = (Array.isArray(categories) && categories.length > 0) ? categories : [
    { id: 'freediving', name: '프리다이빙' },
    { id: 'swimming', name: '입영' },
    { id: 'course', name: '강습' },
    { id: 'etc', name: '기타' }
  ];

  // 1. 상단 카테고리 탭 렌더링 및 클릭 이벤트 등록
  if (tabs) {
    tabs.innerHTML = `
      <button class="gallery-tab is-active" data-category="all">전체</button>
      ${activeCats.map(c => `<button class="gallery-tab" data-category="${c.id}">${c.name}</button>`).join('')}
    `;

    tabs.querySelectorAll('.gallery-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        state.selectedCategory = tab.dataset.category;
        state.currentPage = 1; // 카테고리 변경 시 1페이지로 초기화
        filterAndRenderGallery();
      });
    });
  }

  // 2. 카테고리 필터링 및 페이지네이션 렌더링 함수
  function filterAndRenderGallery() {
    const selectedCatId = state.selectedCategory;

    const filtered = visibleGallery.filter(item => {
      if (selectedCatId === 'all') return true;
      const itemCatId = DataService.normalizeCategory 
        ? DataService.normalizeCategory(item.category, activeCats) 
        : normalizeCategory(item.category);
      return itemCatId === selectedCatId || String(item.category || '').toLowerCase() === String(selectedCatId).toLowerCase();
    });

    state.currentFilteredImages = filtered;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div id="galleryPageEmptyState" class="text-center" style="grid-column: 1 / -1; padding: 64px 24px; color: var(--light-text-secondary);">
          <p style="font-size: 15px;">현재 등록된 항목이 없습니다.</p>
        </div>
      `;
      if (paginationEl) {
        paginationEl.style.display = 'none';
        paginationEl.innerHTML = '';
      }
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }
    if (state.currentPage < 1) {
      state.currentPage = 1;
    }

    const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 현재 페이지 미디어 카드 렌더링
    grid.innerHTML = pageItems.map((item, idx) => {
      const isVideo = item.mediaType === 'video';
      const thumbSrc = isVideo ? (item.thumbnailUrl || item.src || item.videoUrl) : (item.src || 'images/gallery-1.jpg');
      const altText = item.alt || (isVideo ? '갤러리 영상' : '갤러리 사진');

      return `
        <div class="gallery-item ${isVideo ? 'gallery-item--video' : ''}" data-category="${normalizeCategory(item.category)}" data-index="${idx}" data-media-type="${isVideo ? 'video' : 'image'}">
          <img src="${thumbSrc}" alt="${altText}" loading="lazy" onerror="this.onerror=null; this.src='images/gallery-1.jpg';">
          ${isVideo ? `
            <div class="gallery-item__play-badge">
              <span class="gallery-item__play-icon">▶</span>
            </div>
          ` : `
            <div class="gallery-item__overlay">${getIcon('expand')}</div>
          `}
        </div>
      `;
    }).join('');

    // 미디어 카드 클릭 시 라이트박스 열기 (필터링된 전체 목록 기반 연결)
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const localIdx = parseInt(item.dataset.index, 10);
        const globalIdx = startIndex + localIdx;
        openLightbox(globalIdx);
      });
    });

    // 페이지네이션 번호 및 이전/다음 버튼 렌더링
    renderPagination(totalPages);
  }

  // 3. 페이지네이션 범위 축약 생성 함수 (모바일/대용량 대응 < 1 2 3 ... 8 9 >)
  function getPaginationRange(currentPage, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range = [];
    if (currentPage <= 4) {
      range.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      range.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return range;
  }

  // 4. 페이지네이션 렌더링 함수 (< 1 2 3 ... >) — 하단 전용
  function renderPagination(totalPages) {
    const bottomEl = document.getElementById('galleryPagination');
    if (!bottomEl) return;

    if (totalPages <= 1) {
      bottomEl.style.display = 'none';
      bottomEl.innerHTML = '';
      return;
    }

    const range = getPaginationRange(state.currentPage, totalPages);
    const isFirstPage = state.currentPage === 1;
    const isLastPage = state.currentPage === totalPages;

    let html = '';

    // 이전 버튼 <
    html += `
      <button class="pagination__btn pagination__prev ${isFirstPage ? 'is-disabled' : ''}" 
              data-page="${state.currentPage - 1}" 
              ${isFirstPage ? 'disabled' : ''} 
              aria-label="이전 페이지">‹</button>
    `;

    // 페이지 번호 및 축약 (...)
    range.forEach(item => {
      if (item === '...') {
        html += `<span class="pagination__dots">…</span>`;
      } else {
        const isActive = item === state.currentPage;
        html += `
          <button class="pagination__num ${isActive ? 'is-active' : ''}" data-page="${item}">${item}</button>
        `;
      }
    });

    // 다음 버튼 >
    html += `
      <button class="pagination__btn pagination__next ${isLastPage ? 'is-disabled' : ''}" 
              data-page="${state.currentPage + 1}" 
              ${isLastPage ? 'disabled' : ''} 
              aria-label="다음 페이지">›</button>
    `;

    bottomEl.style.display = 'flex';
    bottomEl.innerHTML = html;

    // 페이지 이동 클릭 핸들러 (스크롤 위치 고정, 데이터만 변경)
    bottomEl.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (btn.disabled || btn.classList.contains('is-disabled')) return;
        const targetPage = parseInt(btn.dataset.page, 10);
        if (!isNaN(targetPage) && targetPage !== state.currentPage && targetPage >= 1 && targetPage <= totalPages) {
          state.currentPage = targetPage;
          filterAndRenderGallery();
        }
      });
    });
  }

  // 기본값: '전체' 카테고리 1페이지 렌더링
  filterAndRenderGallery();
}

let lightboxKeydownHandler = null;

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  state.currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('is-active');
  document.body.classList.add('no-scroll');
  if (history.pushState) {
    history.pushState({ flowState: 'modal', modalId: 'lightbox' }, '');
  }

  const closeLightbox = () => {
    // 닫을 때 비디오 즉시 중지 및 리셋
    const video = lightbox.querySelector('.lightbox__video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.style.display = 'none';
    }
    const img = lightbox.querySelector('.lightbox__img');
    if (img) {
      img.removeAttribute('src');
      img.style.display = 'none';
    }

    lightbox.classList.remove('is-active');
    document.body.classList.remove('no-scroll');

    if (lightboxKeydownHandler) {
      document.removeEventListener('keydown', lightboxKeydownHandler);
      lightboxKeydownHandler = null;
    }
  };

  // 닫기 버튼
  const closeBtn = lightbox.querySelector('.lightbox__close');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeLightbox();
    };
  }

  // 배경 클릭 시 닫기
  lightbox.onclick = (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  };

  // 비디오 컨트롤 클릭 시 닫힘 방지
  const videoEl = lightbox.querySelector('.lightbox__video');
  if (videoEl) {
    videoEl.onclick = (e) => e.stopPropagation();
  }

  // 이전/다음 버튼
  const prevBtn = lightbox.querySelector('.lightbox__prev');
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      if (state.currentLightboxIndex > 0) {
        state.currentLightboxIndex--;
        updateLightbox();
      }
    };
  }

  const nextBtn = lightbox.querySelector('.lightbox__next');
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
      if (state.currentLightboxIndex < currentList.length - 1) {
        state.currentLightboxIndex++;
        updateLightbox();
      }
    };
  }

  // 키보드 네비게이션 (ESC, ←, →)
  if (lightboxKeydownHandler) {
    document.removeEventListener('keydown', lightboxKeydownHandler);
  }

  lightboxKeydownHandler = function (e) {
    const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && state.currentLightboxIndex > 0) {
      state.currentLightboxIndex--;
      updateLightbox();
    } else if (e.key === 'ArrowRight' && state.currentLightboxIndex < currentList.length - 1) {
      state.currentLightboxIndex++;
      updateLightbox();
    }
  };
  document.addEventListener('keydown', lightboxKeydownHandler);

  // 모바일 터치 스와이프 바인딩
  bindLightboxTouchSwipe(lightbox);
}

let touchStartX = 0;
let touchStartY = 0;

function bindLightboxTouchSwipe(lightbox) {
  if (!lightbox || lightbox.dataset.touchBound === 'true') return;
  lightbox.dataset.touchBound = 'true';

  lightbox.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // 가로 스와이프 임계값 (40px)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
        if (diffX < 0) {
          // Swipe Left -> Next
          if (state.currentLightboxIndex < currentList.length - 1) {
            state.currentLightboxIndex++;
            updateLightbox();
          }
        } else {
          // Swipe Right -> Prev
          if (state.currentLightboxIndex > 0) {
            state.currentLightboxIndex--;
            updateLightbox();
          }
        }
      }
    }
  }, { passive: true });
}

function updateLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
  const item = currentList[state.currentLightboxIndex];
  if (!item) return;

  // 1. 순서 카운터 업데이트 (예: "2 / 12")
  const counterEl = lightbox.querySelector('#lightboxCounter');
  if (counterEl) {
    counterEl.textContent = `${state.currentLightboxIndex + 1} / ${currentList.length}`;
  }

  // 2. 미디어 렌더링
  const img = lightbox.querySelector('.lightbox__img');
  const video = lightbox.querySelector('.lightbox__video');
  const isVideo = item.mediaType === 'video';

  if (isVideo) {
    if (img) {
      img.style.display = 'none';
      img.removeAttribute('src');
    }
    if (video) {
      const videoSrc = item.videoUrl || item.src || '';
      const posterSrc = item.thumbnailUrl || item.src || '';
      if (posterSrc) {
        video.poster = posterSrc;
      }
      video.preload = 'metadata';
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.src = videoSrc;
      video.style.display = 'block';
      video.load();
      video.play().catch(() => {});
    }
  } else {
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.style.display = 'none';
    }
    if (img) {
      img.src = item.src || 'images/gallery-1.jpg';
      img.alt = item.alt || '갤러리 사진';
      img.style.display = 'block';
    }
  }

  // 3. 이전/다음 버튼 가시성 업데이트
  const prev = lightbox.querySelector('.lightbox__prev');
  const next = lightbox.querySelector('.lightbox__next');
  if (prev) prev.style.visibility = state.currentLightboxIndex > 0 ? 'visible' : 'hidden';
  if (next) next.style.visibility = state.currentLightboxIndex < currentList.length - 1 ? 'visible' : 'hidden';
}

function renderFooter(data) {
  const grid = document.getElementById('footerGrid');
  const bottom = document.getElementById('footerBottom');
  if (!grid || !data) return;

  const visibleSns = (data.sns || []).filter(s => s.visible);

  grid.innerHTML = `
    <div class="footer__col">
      <p class="footer__logo">FLOW <span>FREEDIVING</span></p>
      <p class="footer__slogan">${data.slogan || ''}</p>
    </div>
    <div class="footer__col">
      <h4 class="footer__heading">Company</h4>
      <div class="footer__info">
        <p>대표: ${data.company?.representative || ''}</p>
        <p>사업자번호: ${data.company?.businessNumber || ''}</p>
        <p>${data.company?.address || ''}</p>
        <p>${data.company?.phone || ''}</p>
        <p>${data.company?.email || ''}</p>
      </div>
    </div>
    <div class="footer__col">
      <h4 class="footer__heading">Connect</h4>
      <div class="footer__sns-list">
        ${visibleSns.map(sns => `
          <a href="#" class="footer__sns-item" data-link="${sns.link}">
            ${getIcon(sns.icon)}
            <span>${sns.name}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  if (bottom && data.legal) {
    bottom.innerHTML = `
      <div class="footer__legal">
        <a href="${data.legal.terms}">이용약관</a>
        <a href="${data.legal.privacy}">개인정보처리방침</a>
      </div>
      <p class="footer__copyright">${data.legal.copyright}</p>
      <a href="admin-login.html" class="footer__admin-link">Admin</a>
    `;
  }
}

function initFloatingCTA() {
  const topBtn = document.getElementById('floatingTop');
  if (!topBtn) return;

  const handleScroll = () => {
    const isMobile = window.innerWidth <= 768;
    topBtn.classList.toggle('is-visible', isMobile && window.scrollY > 500);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  handleScroll();

  topBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Mobile Back Button & History Priority Handler (Gallery Page) ───
window.addEventListener('popstate', () => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox?.classList.contains('is-active')) {
    const video = lightbox.querySelector('.lightbox__video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.style.display = 'none';
    }
    const img = lightbox.querySelector('.lightbox__img');
    if (img) {
      img.removeAttribute('src');
      img.style.display = 'none';
    }
    lightbox.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
    return;
  }

  if (state.mobileOpen) {
    const toggle = document.getElementById('headerToggle');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileOverlay');
    state.mobileOpen = false;
    toggle?.classList.remove('is-active');
    drawer?.classList.remove('is-active');
    overlay?.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
    return;
  }
});

// ─── DOMContentLoaded / Ready State 실행 ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
