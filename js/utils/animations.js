// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Animation Utilities
// IntersectionObserver-based Fade Up & Parallax
// ═══════════════════════════════════════════════

/**
 * Fade Up 애니메이션 초기화
 * .fade-up 클래스를 가진 모든 요소에 IntersectionObserver 적용
 */
export function initFadeAnimations() {
  const elements = document.querySelectorAll('.fade-up, .fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
}

/**
 * Smooth Scroll to anchor
 */
export function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;

    window.scrollTo({
      top: targetEl.offsetTop - offset,
      behavior: 'smooth'
    });
  });
}

/**
 * Parallax 효과 (Hero 배경)
 */
export function initParallax() {
  const hero = document.querySelector('.hero__media');
  if (!hero) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          hero.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Counter 애니메이션 (숫자 카운트업)
 */
export function animateCounter(el, target, suffix = '', duration = 2000) {
  const startTime = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (target - startValue) * eased);

    el.textContent = currentValue.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
