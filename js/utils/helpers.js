// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Helper Utilities
// ═══════════════════════════════════════════════

/**
 * 외부 링크 클릭 핸들러
 * data-link 속성의 값을 links 객체에서 찾아 이동
 */
export function initLinkHandler(links) {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-link]');
    if (!el) return;

    e.preventDefault();
    const key = el.dataset.link;
    const url = links[key];

    if (url) {
      if (url.startsWith('tel:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  });
}

/**
 * Debounce
 */
export function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle
 */
export function throttle(fn, limit = 100) {
  let waiting = false;
  return (...args) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => { waiting = false; }, limit);
    }
  };
}

/**
 * 이미지 Lazy Loading (native + fallback)
 */
export function initLazyLoading() {
  // Native lazy loading이 지원되면 브라우저에 맡김
  if ('loading' in HTMLImageElement.prototype) return;

  // Fallback: IntersectionObserver
  const images = document.querySelectorAll('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' }
  );

  images.forEach(img => observer.observe(img));
}

/**
 * Escape HTML
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 별점 문자열 생성
 */
export function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}
