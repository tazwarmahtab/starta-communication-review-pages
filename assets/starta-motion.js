/* Starta Communication — progressive scroll arrival for supporting pages only.
   Existing STA–pill–RTA hero remains owned by the preserved homepage scripts. */
(function () {
  'use strict';
  function mount() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var targets = Array.from(document.querySelectorAll(
      '.hero-grid > div:first-child, .hero-grid > .orbit, .section-intro, .feature-card, .split > div, .split > .detail-list, .highlight'
    ));
    if (!targets.length) return;
    targets.forEach(function (element, index) {
      element.setAttribute('data-starta-reveal', '');
      element.style.setProperty('--starta-enter-delay', ((index % 3) * 85) + 'ms');
    });
    document.documentElement.classList.add('starta-reveal-on');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (element) { observer.observe(element); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
