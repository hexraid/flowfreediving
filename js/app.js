// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Main App Entry
// 모든 컴포넌트 초기화 및 조합
// ═══════════════════════════════════════════════

import { DataService } from './data-service.js';
import { getIcon } from './utils/icons.js';
import { initFadeAnimations, initSmoothScroll, initParallax } from './utils/animations.js';
import { initLinkHandler, initLazyLoading, renderStars } from './utils/helpers.js';

// ─── App State ───
const state = {
  links: {},
  mobileOpen: false,
  currentLightboxIndex: -1,
  galleryImages: [],
  reviewIndex: 0,
  finderAnswers: {},
  finderStep: 1,
  faqItems: [],
  visibleFaqCount: 6
};

// ─── Initialize App ───
async function init() {
  try {
    // Load all data
    const [links, seo, hero, whyFlow, courseFinder, programs, instructors, reviews, gallery, faq, cta, footer, popups] = await Promise.all([
      DataService.getLinks(),
      DataService.getSEO(),
      DataService.getHero(),
      DataService.getWhyFlow(),
      DataService.getCourseFinder(),
      DataService.getVisiblePrograms(),
      DataService.getInstructors(),
      DataService.getReviews(),
      DataService.getGallery(),
      DataService.getFAQ(),
      DataService.getCTA(),
      DataService.getFooter(),
      DataService.getPopup()
    ]);

    state.links = links;
    state.galleryImages = gallery;

    // Apply SEO
    applySEO(seo);

    // Render sections
    renderHero(hero);
    renderWhyFlow(whyFlow);
    renderCourseFinder(courseFinder);
    renderPrograms(programs);
    renderInstructors(instructors);
    renderReviews(reviews);
    renderGallery(gallery);
    renderFAQ(faq);
    renderCTA(cta);
    renderFooter(footer);
    renderPopup(popups);

    // Init interactions
    initHeader();
    initLinkHandler(links);
    initSmoothScroll();
    initParallax();
    initLazyLoading();
    initFloatingCTA();
    handleProgramHashRoute(programs);
    window.addEventListener('hashchange', () => handleProgramHashRoute(programs));

    // Init animations last
    requestAnimationFrame(() => {
      initFadeAnimations();
    });

  } catch (err) {
    console.error('App init error:', err);
  }
}

// ─── SEO ───
function applySEO(seo) {
  document.title = seo.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = seo.description;
}

// ─── Header ───
function initHeader() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('headerToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');

  let pushedMenuState = false;

  function openMobileMenu() {
    if (state.mobileOpen) return;
    state.mobileOpen = true;
    toggle?.classList.add('is-active');
    drawer?.classList.add('is-active');
    overlay?.classList.add('is-active');
    document.body.classList.add('no-scroll');

    if (!history.state?.mobileMenuOpen) {
      history.pushState({ mobileMenuOpen: true }, '');
      pushedMenuState = true;
    }
  }

  function closeMobileMenu(options = {}) {
    if (!state.mobileOpen) return;
    state.mobileOpen = false;
    toggle?.classList.remove('is-active');
    drawer?.classList.remove('is-active');
    overlay?.classList.remove('is-active');
    document.body.classList.remove('no-scroll');

    if (pushedMenuState && !options.isPopState && !options.isNewPage) {
      pushedMenuState = false;
      history.back();
    } else {
      pushedMenuState = false;
    }
  }

  function toggleMobileMenu() {
    if (state.mobileOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollY > 50);
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close drawer on link click
  drawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      const isNewPage = href && !href.startsWith('#') && href !== '#';
      closeMobileMenu({ isNewPage });
    });
  });

  // Close drawer on overlay click
  overlay?.addEventListener('click', () => {
    closeMobileMenu();
  });

  // Close drawer on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.mobileOpen) {
      closeMobileMenu();
    }
  });

  // Handle popstate for mobile back button
  window.addEventListener('popstate', () => {
    if (state.mobileOpen) {
      closeMobileMenu({ isPopState: true });
    }
  });
}

// ─── Hero ───
function renderHero(data) {
  const container = document.getElementById('heroContent');
  if (!container) return;

  // Video or Image Priority:
  // 1. If videoUrl exists and is not empty -> Video is rendered & autoplayed
  // 2. Else -> Background image is rendered
  const mediaContainer = document.getElementById('heroMedia');
  if (mediaContainer) {
    const videoUrl = data && data.videoUrl ? data.videoUrl.trim() : '';
    if (videoUrl) {
      mediaContainer.innerHTML = '';
      const videoEl = document.createElement('video');
      videoEl.className = 'hero__video';
      videoEl.src = videoUrl;
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('autoplay', '');
      videoEl.setAttribute('muted', '');
      videoEl.setAttribute('loop', '');
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');

      mediaContainer.appendChild(videoEl);

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[FLOW] Hero video autoplay notice:', err);
        });
      }
    } else {
      const bgImage = (data && data.bgImage) ? data.bgImage : 'images/hero-bg.jpg';
      mediaContainer.innerHTML = `<img class="hero__image" src="${bgImage}" alt="FLOW FREEDIVING">`;
    }
  }

  // Content
  const buttons = (data && Array.isArray(data.buttons)) ? data.buttons : [
    { text: '카카오톡 상담', link: 'kakao', style: 'kakao', icon: 'kakao' },
    { text: '네이버 예약', link: 'naverBooking', style: 'naver', icon: 'naver' }
  ];

  container.innerHTML = `
    <h1 class="hero__title">${(data && data.title) || '처음이어도 괜찮습니다.'}<br>${(data && data.titleLine2) || ''}</h1>
    <p class="hero__subtitle">${(data && data.subtitle) || ''}</p>
    <div class="hero__buttons">
      ${buttons.map(btn => `
        <a href="#" class="btn btn--${btn.style}" data-link="${btn.link}">
          ${getIcon(btn.icon)} ${btn.text}
        </a>
      `).join('')}
    </div>
  `;
}

// ─── WHY FLOW ───
function renderWhyFlow(data) {
  const grid = document.getElementById('whyFlowGrid');
  const title = document.getElementById('whyFlowTitle');
  const subtitle = document.getElementById('whyFlowSubtitle');
  if (!grid || !data) return;

  if (title) title.textContent = data.title || 'WHY FLOW';
  if (subtitle) subtitle.textContent = data.subtitle || '';

  const visibleItems = (data.items || []).filter(item => item.visible !== false && item.enabled !== false);

  grid.innerHTML = visibleItems.map(item => {
    return `
      <div class="value-card fade-up">
        <h3 class="value-card__title">${item.title}</h3>
        <p class="value-card__desc">${item.desc}</p>
      </div>
    `;
  }).join('');
}

// ─── Course Finder ───
function renderCourseFinder(data) {
  const container = document.getElementById('finderContainer');
  if (!container) return;

  state.finderData = data;
  state.finderStep = 1;
  state.finderAnswers = {};

  renderFinderStep(data, 1);
}

function renderFinderStep(data, stepNum) {
  const container = document.getElementById('finderContainer');
  const progress = document.getElementById('finderProgress');
  const result = document.getElementById('finderResult');

  if (!container) return;

  // Update progress
  if (progress) {
    progress.innerHTML = data.steps.map((_, i) => {
      const num = i + 1;
      let cls = 'finder-progress__step';
      if (num < stepNum) cls += ' is-done';
      if (num === stepNum) cls += ' is-active';
      return `<div class="${cls}"></div>`;
    }).join('');
  }

  const stepContainer = document.getElementById('finderSteps');
  if (!stepContainer) return;

  if (stepNum > data.steps.length) {
    // Show result
    stepContainer.innerHTML = '';
    showFinderResult(data);
    return;
  }

  const step = data.steps[stepNum - 1];
  if (result) result.classList.remove('is-active');

  stepContainer.innerHTML = `
    <div class="finder-step is-active" data-step="${stepNum}">
      <p class="finder-step__question">${step.question}</p>
      <div class="finder-step__options">
        ${step.options.map(opt => `
          <button class="finder-option" data-step-id="${step.id}" data-value="${opt.value}">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Bind option clicks
  stepContainer.querySelectorAll('.finder-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepId = btn.dataset.stepId;
      const value = btn.dataset.value;
      state.finderAnswers[stepId] = value;
      state.finderStep = stepNum + 1;
      renderFinderStep(data, state.finderStep);
    });
  });
}

function showFinderResult(data) {
  const resultContainer = document.getElementById('finderResult');
  if (!resultContainer) return;

  // Find matching result
  const answers = state.finderAnswers;
  let matchedResult = data.results[data.results.length - 1]; // default fallback

  for (const result of data.results) {
    const conditions = result.conditions;
    if (!conditions || Object.keys(conditions).length === 0) continue;

    let match = true;
    for (const [key, value] of Object.entries(conditions)) {
      if (answers[key] !== value) {
        match = false;
        break;
      }
    }
    if (match) {
      matchedResult = result;
      break;
    }
  }

  resultContainer.classList.add('is-active');
  resultContainer.innerHTML = `
    <div class="finder-result__card">
      ${matchedResult.image ? `<img class="finder-result__image" src="${matchedResult.image}" alt="${matchedResult.title}" loading="lazy">` : ''}
      <div class="finder-result__body">
        <p class="finder-result__label">추천 과정</p>
        <h3 class="finder-result__title">${matchedResult.title}</h3>
        <p class="finder-result__desc">${matchedResult.desc}</p>
        <div class="finder-result__buttons">
          ${matchedResult.buttons.map(btn => {
    if (btn.action === 'link') {
      return `<a href="#" class="btn btn--${btn.target === 'kakao' ? 'kakao' : 'naver'} btn--sm" data-link="${btn.target}">${getIcon(btn.target === 'kakao' ? 'kakao' : 'naver')} ${btn.text}</a>`;
    }
    return `<button class="btn btn--primary btn--sm" onclick="document.getElementById('${btn.target}')?.scrollIntoView({behavior:'smooth'})">${btn.text}</button>`;
  }).join('')}
        </div>
      </div>
    </div>
    <button class="finder-restart" id="finderRestart">${getIcon('refresh')} 다시 해보기</button>
  `;

  document.getElementById('finderRestart')?.addEventListener('click', () => {
    state.finderStep = 1;
    state.finderAnswers = {};
    resultContainer.classList.remove('is-active');
    renderFinderStep(state.finderData, 1);
  });
}

// ─── Programs ───
function renderPrograms(programs) {
  const grid = document.getElementById('programsGrid');
  if (!grid) return;

  grid.innerHTML = programs.map(prog => `
    <div class="program-card fade-up" data-program-id="${prog.id}">
      <div class="program-card__main">
        <div class="program-card__image-wrap">
          ${prog.image ? `<img class="program-card__image" src="${prog.image}" alt="${prog.title}" loading="lazy">` : `<div class="program-card__image" style="background: var(--midnight); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--accent);">🤿</div>`}
        </div>
        <div class="program-card__body">
          <div class="program-card__tags">
            ${prog.tags.map(tag => `<span class="program-card__tag">${tag}</span>`).join('')}
          </div>
          <h3 class="program-card__title">${prog.title}</h3>
          <p class="program-card__subtitle">${prog.subtitle}</p>
          <p class="program-card__desc">${prog.desc}</p>
        </div>
      </div>
      <div class="program-card__meta">
        <span class="program-card__price">${prog.price}</span>
        <span class="program-card__detail">자세히 보기 ${getIcon('arrowRight')}</span>
      </div>
    </div>
  `).join('');

  // Program card click → modal
  grid.querySelectorAll('.program-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.programId;
      const prog = programs.find(p => p.id === id);
      if (prog) openProgramModal(prog);
    });
  });
}

function openProgramModal(prog) {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;

  const modal = overlay.querySelector('.modal');
  modal.innerHTML = `
    <button class="modal__close" id="modalClose">${getIcon('x')}</button>
    <h2 class="modal__title">${prog.title}</h2>
    <p class="modal__subtitle">${prog.subtitle} — ${prog.desc}</p>

    <div class="modal__meta-grid" style="grid-template-columns: 1fr;">
      <div class="modal__meta-item" style="text-align: center;">
        <p class="modal__meta-label">비용</p>
        <p class="modal__meta-value">${prog.price}</p>
      </div>
    </div>

    ${prog.curriculum && prog.curriculum.length ? `
      <div class="modal__section">
        <h4>커리큘럼</h4>
        <ul>${prog.curriculum.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${prog.includes && prog.includes.length ? `
      <div class="modal__section">
        <h4>포함 사항</h4>
        <ul>${prog.includes.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${prog.prep && prog.prep.length ? `
      <div class="modal__section">
        <h4>준비물</h4>
        <ul>${prog.prep.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    ` : ''}

    <div class="modal__cta">
      <a href="#" class="btn btn--kakao" data-link="kakao">${getIcon('kakao')} 카톡 상담</a>
      <a href="#" class="btn btn--naver" data-link="naverBooking">${getIcon('naver')} 네이버 예약</a>
      <a href="#" class="btn btn--naver-outline" data-link="naverPlace" style="border: 1px solid var(--naver-bg); color: var(--naver-bg); background: transparent;">
        ${getIcon('naverPlace')} 스마트플레이스
      </a>
    </div>
  `;

  overlay.classList.add('is-active');
  document.body.classList.add('no-scroll');

  // Close
  const closeModal = () => {
    overlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  };

  modal.querySelector('#modalClose')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handler);
    }
  });
}

function handleProgramHashRoute(programs) {
  const hash = window.location.hash;
  if (!hash) return;

  if (hash.startsWith('#program-')) {
    const progId = hash.replace('#program-', '');
    const prog = programs.find(p => p.id === progId);
    if (prog) {
      setTimeout(() => {
        const sec = document.getElementById('program');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        openProgramModal(prog);
      }, 350);
    }
  } else if (hash === '#program') {
    setTimeout(() => {
      const sec = document.getElementById('program');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  }
}

// ─── Instructors ───
function renderInstructors(instructors) {
  const container = document.getElementById('instructorContent');
  const section = document.getElementById('instructor');
  if (!container) return;

  // 상단 데스크톱 및 모바일 내비게이션 메뉴 링크 제어 (메인 노출 강사 1명 이상 기준)
  const anyPublicInstructor = instructors.some(inst => inst.mainShow !== false);
  const instructorMenuLinks = document.querySelectorAll('a[href="#instructor"]');
  instructorMenuLinks.forEach(link => {
    link.style.display = anyPublicInstructor ? '' : 'none';
  });

  // 홈페이지 강사 렌더링 배열 생성 (메인 노출 == ON) - 관리자에서 정한 순서 그대로 반영
  const visibleInstructors = instructors.filter(inst => inst.mainShow !== false);

  if (!visibleInstructors.length) {
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = '';

  container.innerHTML = visibleInstructors.map((inst, index) => `
    <div class="instructor-card fade-up" style="margin-bottom: 48px; border-bottom: ${index < visibleInstructors.length - 1 ? '1px solid var(--border-subtle)' : 'none'}; padding-bottom: ${index < visibleInstructors.length - 1 ? '48px' : '0'};">
      <div class="instructor-card__photo-wrap">
        ${inst.photo ? `<img class="instructor-card__photo" src="${inst.photo}" alt="${inst.name}" loading="lazy">` : `<div class="instructor-card__photo" style="background: var(--midnight); display:flex; align-items:center; justify-content:center; font-size: 3rem;">🤿</div>`}
      </div>
      <div class="instructor-card__info">
        <h3 class="instructor-card__name">${inst.name}</h3>
        <p class="instructor-card__role">${inst.role || ''}</p>
        ${inst.philosophy ? `<p class="instructor-card__philosophy">"${inst.philosophy}"</p>` : ''}
        <p class="instructor-card__bio">${inst.bio || ''}</p>
        <div class="instructor-card__certs">
          ${(inst.certifications || []).map(cert => `
            <span class="cert-tag">${getIcon('certificate')} ${cert}</span>
          `).join('')}
        </div>
        ${inst.career?.length ? `
          <div class="timeline">
            ${inst.career.map(item => `
              <div class="timeline-item">
                <span class="timeline__year">${item.year}</span>
                <span class="timeline__text">${item.text}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// ─── Reviews ───
function renderReviews(reviews) {
  const track = document.getElementById('reviewsTrack');
  const navContainer = document.getElementById('reviewsNav');
  if (!track) return;

  track.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-card__stars">${renderStars(review.stars)}</div>
      <p class="review-card__text">${review.text}</p>
      <div class="review-card__author">
        <div class="review-card__avatar">${review.name.charAt(0)}</div>
        <div>
          <p class="review-card__name">${review.name}</p>
          <p class="review-card__course">${review.course} · ${review.date}</p>
        </div>
      </div>
    </div>
  `).join('');

  // Slider logic
  initReviewSlider(reviews.length);
}

function initReviewSlider(totalCards) {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');

  if (!track) return;

  let currentIndex = 0;

  function getVisibleCards() {
    const w = window.innerWidth;
    if (w > 1024) return 3;
    if (w > 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - getVisibleCards());
  }

  function updateSlider() {
    const card = track.querySelector('.review-card');
    if (!card) return;
    const gap = 24;
    const cardWidth = card.offsetWidth + gap;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    // Update dots
    if (dotsContainer) {
      const maxIdx = getMaxIndex();
      dotsContainer.innerHTML = '';
      for (let i = 0; i <= maxIdx; i++) {
        const dot = document.createElement('button');
        dot.className = `reviews-nav__dot${i === currentIndex ? ' is-active' : ''}`;
        dot.addEventListener('click', () => { currentIndex = i; updateSlider(); });
        dotsContainer.appendChild(dot);
      }
    }

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= getMaxIndex();
  }

  prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; updateSlider(); }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) { currentIndex++; updateSlider(); }
  });

  // Touch swipe
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < getMaxIndex()) currentIndex++;
      else if (diff < 0 && currentIndex > 0) currentIndex--;
      updateSlider();
    }
    isDragging = false;
  }, { passive: true });

  // Init
  updateSlider();
  window.addEventListener('resize', () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    updateSlider();
  });
}

function renderGallery(gallery) {
  const grid = document.getElementById('galleryGrid');
  const moreWrap = document.getElementById('galleryMoreWrap');
  if (!grid) return;

  // 관리자에서 노출 ON(visible !== false)인 이미지만 필터링하여 앞쪽 최대 8개 표시 (관리자 순서 보존)
  const rawGallery = Array.isArray(gallery) ? gallery : [];
  const visibleGallery = rawGallery.filter(item => item && item.visible !== false);
  const MAIN_PREVIEW_LIMIT = 8;
  const previewItems = visibleGallery.slice(0, MAIN_PREVIEW_LIMIT);

  state.galleryImages = previewItems;

  if (previewItems.length === 0) {
    grid.innerHTML = `
      <div id="galleryEmptyState" class="text-center fade-up" style="grid-column: 1 / -1; padding: 48px 24px; color: var(--text-secondary);">
        <p>현재 등록된 갤러리 미디어가 없습니다.</p>
      </div>
    `;
    if (moreWrap) moreWrap.style.display = 'none';
    return;
  }

  if (moreWrap) moreWrap.style.display = '';

  grid.innerHTML = previewItems.map((item, idx) => {
    const isVideo = item.mediaType === 'video';
    const thumbSrc = isVideo ? (item.thumbnailUrl || item.src || item.videoUrl) : (item.src || 'images/gallery-1.jpg');
    const altText = item.alt || (isVideo ? '갤러리 영상' : '갤러리 사진');

    return `
      <div class="gallery-item fade-up ${isVideo ? 'gallery-item--video' : ''}" data-category="${item.category || 'freediving'}" data-index="${idx}" data-media-type="${isVideo ? 'video' : 'image'}">
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

  // Lightbox click
  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index, 10);
      openLightbox(idx);
    });
  });

  const moreBtn = document.getElementById('btnGalleryMore');
  if (moreBtn) {
    moreBtn.onclick = () => {
      window.location.href = 'gallery.html';
    };
  }
}

let appLightboxKeydownHandler = null;

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  state.currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('is-active');
  document.body.classList.add('no-scroll');

  // Close
  const closeLightbox = () => {
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

    if (appLightboxKeydownHandler) {
      document.removeEventListener('keydown', appLightboxKeydownHandler);
      appLightboxKeydownHandler = null;
    }
  };

  const closeBtn = lightbox.querySelector('.lightbox__close');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeLightbox();
    };
  }

  lightbox.onclick = (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  };

  const videoEl = lightbox.querySelector('.lightbox__video');
  if (videoEl) {
    videoEl.onclick = (e) => e.stopPropagation();
  }

  // Nav
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
      if (state.currentLightboxIndex < state.galleryImages.length - 1) {
        state.currentLightboxIndex++;
        updateLightbox();
      }
    };
  }

  if (appLightboxKeydownHandler) {
    document.removeEventListener('keydown', appLightboxKeydownHandler);
  }

  appLightboxKeydownHandler = function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && state.currentLightboxIndex > 0) {
      state.currentLightboxIndex--;
      updateLightbox();
    } else if (e.key === 'ArrowRight' && state.currentLightboxIndex < state.galleryImages.length - 1) {
      state.currentLightboxIndex++;
      updateLightbox();
    }
  };
  document.addEventListener('keydown', appLightboxKeydownHandler);
}

function updateLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const item = state.galleryImages[state.currentLightboxIndex];
  if (!item) return;

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
      video.src = videoSrc;
      video.style.display = 'block';
      video.load();
      video.play().catch(() => {
        // Autoplay policy handling
      });
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

  const prev = lightbox.querySelector('.lightbox__prev');
  const next = lightbox.querySelector('.lightbox__next');
  if (prev) prev.style.visibility = state.currentLightboxIndex > 0 ? 'visible' : 'hidden';
  if (next) next.style.visibility = state.currentLightboxIndex < state.galleryImages.length - 1 ? 'visible' : 'hidden';
}

// ─── FAQ ───
const FAQ_BATCH_SIZE = 6;

function renderFAQ(faqItems) {
  const container = document.getElementById('faqList');
  if (!container) return;

  const items = faqItems || state.faqItems || [];
  state.faqItems = items;
  const totalCount = items.length;

  if (totalCount === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--light-text-secondary); padding: 32px 0;">등록된 FAQ가 없습니다.</p>';
    return;
  }

  if (typeof state.visibleFaqCount !== 'number' || state.visibleFaqCount < FAQ_BATCH_SIZE) {
    state.visibleFaqCount = FAQ_BATCH_SIZE;
  }

  const currentShow = Math.min(state.visibleFaqCount, totalCount);
  const pagedItems = items.slice(0, currentShow);

  const itemsHtml = pagedItems.map((item, idx) => `
    <div class="accordion-item" data-faq="${idx}">
      <button class="accordion-trigger" aria-expanded="false">
        <span>${item.question}</span>
        <span class="accordion-trigger__icon">${getIcon('plus')}</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-content__inner">${item.answer}</div>
      </div>
    </div>
  `).join('');

  let buttonsHtml = '';
  if (totalCount > FAQ_BATCH_SIZE) {
    const hasMore = currentShow < totalCount;

    buttonsHtml = `
      <div class="faq-more-wrap">
        ${hasMore ? `
          <button type="button" class="faq-btn" id="faqMoreBtn">
            <span>FAQ 더보기</span>
            <span class="faq-btn__icon">${getIcon('chevronDown')}</span>
          </button>
        ` : `
          <button type="button" class="faq-btn" id="faqCollapseBtn">
            <span>FAQ 접기</span>
            <span class="faq-btn__icon">${getIcon('chevronUp')}</span>
          </button>
        `}
      </div>
    `;
  }

  container.innerHTML = itemsHtml + buttonsHtml;

  // Accordion toggle events
  initAccordionEvents(container);

  // FAQ More event (6개씩 추가 노출)
  const moreBtn = container.querySelector('#faqMoreBtn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      state.visibleFaqCount += FAQ_BATCH_SIZE;
      renderFAQ(items);
    });
  }

  // FAQ Collapse event (초기 6개로 복구 및 상단 스크롤)
  const collapseBtn = container.querySelector('#faqCollapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      state.visibleFaqCount = FAQ_BATCH_SIZE;
      renderFAQ(items);
      const faqSec = document.getElementById('faq');
      if (faqSec) {
        faqSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

function initAccordionEvents(container) {
  container.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const inner = content.querySelector('.accordion-content__inner');
      const isOpen = item.classList.contains('is-open');

      // Close all
      container.querySelectorAll('.accordion-item').forEach(ai => {
        ai.classList.remove('is-open');
        const aiTrigger = ai.querySelector('.accordion-trigger');
        const aiContent = ai.querySelector('.accordion-content');
        if (aiTrigger) aiTrigger.setAttribute('aria-expanded', 'false');
        if (aiContent) aiContent.style.maxHeight = '0';
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });
}

// ─── CTA ───
function renderCTA(data) {
  const section = document.getElementById('ctaSection');
  if (!section) return;

  section.innerHTML = `
    <div class="container text-center">
      <h2 class="cta-section__title fade-up">${data.title}</h2>
      <p class="cta-section__subtitle fade-up">${data.subtitle || ''}</p>
      <div class="cta-section__buttons fade-up">
        ${data.buttons.map(btn => `
          <a href="#" class="btn btn--${btn.style}" data-link="${btn.link}">
            ${getIcon(btn.icon)} ${btn.text}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── Footer ───
function renderFooter(data) {
  const grid = document.getElementById('footerGrid');
  const bottom = document.getElementById('footerBottom');
  if (!grid) return;

  const visibleSns = data.sns.filter(s => s.visible);

  grid.innerHTML = `
    <div class="footer__col">
      <p class="footer__logo">FLOW <span>FREEDIVING</span></p>
      <p class="footer__slogan">${data.slogan}</p>
    </div>
    <div class="footer__col">
      <h4 class="footer__heading">Company</h4>
      <div class="footer__info">
        <p>대표: ${data.company.representative}</p>
        <p>사업자번호: ${data.company.businessNumber}</p>
        <p>${data.company.address}</p>
        <p>${data.company.phone}</p>
        <p>${data.company.email}</p>
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

  if (bottom) {
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

// ─── Floating CTA ───
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

// ─── Popup Overlay ───
function renderPopup(popups) {
  const overlay = document.getElementById('popupOverlay');
  if (!overlay || !popups) return;

  const popupList = Array.isArray(popups) ? popups : [popups];
  const today = new Date().toISOString().slice(0, 10);

  function isDismissed(id) {
    try {
      const exp = localStorage.getItem(`popup_dismissed_${id}`);
      if (!exp) return false;
      return Date.now() < parseInt(exp, 10);
    } catch {
      return false;
    }
  }

  // Filter active and valid popups
  const activePopups = popupList.filter(p => {
    if (!p || p.enabled === false) return false;
    if (p.startDate && today < p.startDate) return false;
    if (p.endDate && today > p.endDate) return false;
    if (isDismissed(p.id)) return false;
    return true;
  }).sort((a, b) => (a.priority || 1) - (b.priority || 1));

  if (!activePopups.length) {
    overlay.classList.remove('is-active');
    overlay.innerHTML = '';
    return;
  }

  let currentIndex = 0;
  const total = activePopups.length;
  const isSingle = total <= 1;
  let autoSlideTimer = null;
  let isTransitioning = false;

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (total <= 1) return;
    autoSlideTimer = setInterval(() => {
      goToPopup((currentIndex + 1) % total);
    }, 4000);
  }

  function closePopup() {
    stopAutoSlide();
    const p = activePopups[currentIndex];
    const dismissCheck = document.getElementById('popupDismissCheck');
    if (p && dismissCheck && dismissCheck.checked) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`popup_dismissed_${p.id}`, String(expiry));
    }
    overlay.classList.remove('is-active');
  }

  function goToPopup(nextIndex) {
    if (isTransitioning) return;
    if (total <= 1 || nextIndex === currentIndex) return;

    isTransitioning = true;
    const slides = overlay.querySelectorAll('.popup-slide');
    const counterEl = overlay.querySelector('.popup-card__nav-counter');

    // 이전 슬라이드(1->0)와 다음 슬라이드(0->1)가 동일 위치에서 동시에 크로스페이드됨
    slides.forEach((slide, idx) => {
      if (idx === nextIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    currentIndex = nextIndex;
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${total}`;
    }

    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }

  // 모든 슬라이드를 겹쳐진 Grid Stack 구조로 1회 렌더링
  const slidesHTML = activePopups.map((p, idx) => `
    <div class="popup-slide ${idx === 0 ? 'is-active' : ''}" data-index="${idx}">
      ${p.image ? `
        <div class="popup-card__image-wrap">
          <img class="popup-card__image" src="${p.image}" alt="${p.title}" onerror="this.src='images/gallery-1.jpg'">
          <div class="popup-card__image-overlay"></div>
        </div>
      ` : ''}
      <div class="popup-card__body">
        <h3 class="popup-card__title">${p.title}</h3>
        ${p.desc ? `<p class="popup-card__desc">${p.desc}</p>` : ''}
        ${p.link ? `
          <a href="${p.link}" class="popup-card__link-btn" ${p.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : 'target="_self"'}>
            자세히 보기
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');

  const firstP = activePopups[0];

  overlay.innerHTML = `
    <div class="popup-card">
      <button class="popup-card__close" id="popupCloseBtn" aria-label="팝업 닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div class="popup-card__slider">
        ${slidesHTML}
      </div>

      <div class="popup-card__footer">
        ${firstP.useDismiss !== false ? `
          <label class="popup-card__dismiss">
            <input type="checkbox" id="popupDismissCheck">
            <span>${firstP.dismissText || '오늘 하루 보지 않기'}</span>
          </label>
        ` : '<span></span>'}
        <div class="popup-card__nav ${isSingle ? 'is-single' : ''}">
          <button class="popup-card__nav-btn popup-card__nav-prev" id="popupPrevBtn" aria-label="이전 팝업">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="popup-card__nav-counter">1 / ${total}</span>
          <button class="popup-card__nav-btn popup-card__nav-next" id="popupNextBtn" aria-label="다음 팝업">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // 단 1회만 이벤트 바인딩
  const closeBtn = document.getElementById('popupCloseBtn');
  const prevBtn = document.getElementById('popupPrevBtn');
  const nextBtn = document.getElementById('popupNextBtn');
  const card = overlay.querySelector('.popup-card');

  closeBtn?.addEventListener('click', closePopup);

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isTransitioning) return;
    goToPopup((currentIndex - 1 + total) % total);
    startAutoSlide();
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isTransitioning) return;
    goToPopup((currentIndex + 1) % total);
    startAutoSlide();
  });

  // Hover pause / resume
  if (card && total > 1) {
    card.addEventListener('mouseenter', stopAutoSlide);
    card.addEventListener('mouseleave', startAutoSlide);
  }

  // Backdrop click to close
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closePopup();
    }
  };

  // Keyboard ESC
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closePopup();
      document.removeEventListener('keydown', escHandler);
    }
  });

  overlay.classList.add('is-active');

  if (total > 1) {
    startAutoSlide();
  }
}

// ─── Start App ───
document.addEventListener('DOMContentLoaded', init);
