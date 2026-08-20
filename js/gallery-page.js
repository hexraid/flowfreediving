// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Gallery Full Page Script
// ═══════════════════════════════════════════════

import { DataService } from './data-service.js';
import { MOCK_DATA } from './mock-data.js';
import { getIcon } from './utils/icons.js';
import { initLinkHandler, initLazyLoading } from './utils/helpers.js';

const state = {
  links: {},
  mobileOpen: false,
  currentLightboxIndex: -1,
  galleryImages: [],
  currentFilteredImages: []
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

  try {
    footer = await DataService.getFooter();
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

function initHeader() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('headerToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    state.mobileOpen = !state.mobileOpen;
    toggle.classList.toggle('is-active', state.mobileOpen);
    drawer?.classList.toggle('is-active', state.mobileOpen);
    overlay?.classList.toggle('is-active', state.mobileOpen);
    document.body.classList.toggle('no-scroll', state.mobileOpen);
  });

  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      state.mobileOpen = false;
      toggle?.classList.remove('is-active');
      drawer.classList.remove('is-active');
      overlay?.classList.remove('is-active');
      document.body.classList.remove('no-scroll');
    });
  });

  overlay?.addEventListener('click', () => {
    state.mobileOpen = false;
    toggle?.classList.remove('is-active');
    drawer?.classList.remove('is-active');
    overlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  });
}

// ─── 갤러리 풀 페이지 렌더링 ───
function renderFullGallery(gallery, categories = []) {
  const grid = document.getElementById('galleryPageGrid');
  const tabs = document.getElementById('galleryPageTabs');
  if (!grid) return;

  const rawGallery = Array.isArray(gallery) ? gallery : [];
  // visible !== false인 이미지만 필터링
  const visibleGallery = rawGallery.filter(item => item && item.visible !== false);
  state.galleryImages = visibleGallery;

  // 1. 상단 탭 렌더링 및 이벤트 등록
  if (tabs) {
    const activeCats = (Array.isArray(categories) && categories.length > 0) ? categories : [
      { id: 'freediving', name: '프리다이빙' },
      { id: 'course', name: '강습' },
      { id: 'etc', name: '기타' }
    ];

    tabs.innerHTML = `
      <button class="gallery-tab is-active" data-category="all">전체</button>
      ${activeCats.map(c => `<button class="gallery-tab" data-category="${c.id}">${c.name}</button>`).join('')}
    `;

    tabs.querySelectorAll('.gallery-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        filterFullGallery(tab.dataset.category);
      });
    });
  }

  // 2. 카테고리 필터링 및 렌더링 함수 (사진/영상 모두 카테고리별 동시 필터링)
  function filterFullGallery(selectedCatId) {
    const activeCats = (Array.isArray(categories) && categories.length > 0) ? categories : [
      { id: 'freediving', name: '프리다이빙' },
      { id: 'course', name: '강습' },
      { id: 'etc', name: '기타' }
    ];

    const filtered = visibleGallery.filter(item => {
      if (selectedCatId === 'all') return true;
      const itemCatId = DataService.normalizeCategory ? DataService.normalizeCategory(item.category, activeCats) : normalizeCategory(item.category);
      return itemCatId === selectedCatId || String(item.category || '').toLowerCase() === String(selectedCatId).toLowerCase();
    });

    state.currentFilteredImages = filtered;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div id="galleryPageEmptyState" class="text-center" style="grid-column: 1 / -1; padding: 64px 24px; color: var(--light-text-secondary);">
          <p style="font-size: 15px;">현재 등록된 항목이 없습니다.</p>
        </div>
      `;
      return;
    }

    // 사진/영상 카드 렌더링
    grid.innerHTML = filtered.map((item, idx) => {
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

    // 클릭 시 라이트박스 열기
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10);
        openLightbox(idx);
      });
    });
  }

  // 기본값: '전체' 카테고리 렌더링
  filterFullGallery('all');
}

let lightboxKeydownHandler = null;

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  state.currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('is-active');
  document.body.classList.add('no-scroll');

  const closeLightbox = () => {
    // Stop and reset video playback immediately on close
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

  // Close button
  const closeBtn = lightbox.querySelector('.lightbox__close');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeLightbox();
    };
  }

  // Backdrop click to close
  lightbox.onclick = (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  };

  // Stop propagation on video element so clicking video controls doesn't close lightbox
  const videoEl = lightbox.querySelector('.lightbox__video');
  if (videoEl) {
    videoEl.onclick = (e) => e.stopPropagation();
  }

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

  if (lightboxKeydownHandler) {
    document.removeEventListener('keydown', lightboxKeydownHandler);
  }

  lightboxKeydownHandler = function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && state.currentLightboxIndex > 0) {
      state.currentLightboxIndex--;
      updateLightbox();
    } else if (e.key === 'ArrowRight') {
      const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
      if (state.currentLightboxIndex < currentList.length - 1) {
        state.currentLightboxIndex++;
        updateLightbox();
      }
    }
  };
  document.addEventListener('keydown', lightboxKeydownHandler);
}

function updateLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const currentList = state.currentFilteredImages.length > 0 ? state.currentFilteredImages : state.galleryImages;
  const item = currentList[state.currentLightboxIndex];
  if (!item) return;

  const img = lightbox.querySelector('.lightbox__img');
  const video = lightbox.querySelector('.lightbox__video');
  const isVideo = item.mediaType === 'video';

  if (isVideo) {
    // Hide image, setup and play video
    if (img) {
      img.style.display = 'none';
      img.removeAttribute('src');
    }
    if (video) {
      const videoSrc = item.videoUrl || item.src || '';
      video.src = videoSrc;
      video.style.display = 'block';
      video.load();
      video.play().catch(() => {
        // Autoplay may be blocked by browser policy until user interacts, which is expected
      });
    }
  } else {
    // Stop video, show image
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
  window.addEventListener('scroll', () => {
    if (topBtn) {
      topBtn.classList.toggle('is-visible', window.scrollY > 600);
    }
  }, { passive: true });

  topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── DOMContentLoaded 실행 ───
document.addEventListener('DOMContentLoaded', init);
