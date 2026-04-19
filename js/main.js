/* =============================================
   PORTFOLIO — main.js
   Sin librerías externas. Vanilla JS puro.
   ============================================= */

(function () {
  'use strict';

  /* ---- Referencias DOM ---- */
  const carousel   = document.getElementById('carousel');
  const btnPrev    = document.getElementById('btnPrev');
  const btnNext    = document.getElementById('btnNext');
  const dotsWrap   = document.getElementById('carouselDots');

  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll('.card'));
  let activeIndex = 0;

  /* =============================================
     DOTS — creación dinámica
     ============================================= */
  function buildDots () {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === activeIndex ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1));
      dot.addEventListener('click', () => activateCard(i, true));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots () {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === activeIndex);
    });
  }

  /* =============================================
     ACTIVAR CARD
     ============================================= */
  function activateCard (index, scroll) {
    if (index < 0 || index >= cards.length) return;
    activeIndex = index;

    cards.forEach((card, i) => {
      card.classList.remove('active', 'inactive');
      if (i === activeIndex) {
        card.classList.add('active');
      } else {
        card.classList.add('inactive');
      }
    });

    updateDots();

    if (scroll) scrollToCard(activeIndex);
  }

  /* =============================================
     SCROLL SUAVE A CARD ACTIVA
     ============================================= */
  function scrollToCard (index) {
    const card = cards[index];
    if (!card) return;

    const offset =
      card.offsetLeft -
      carousel.offsetWidth / 2 +
      card.offsetWidth / 2;

    carousel.scrollTo({ left: offset, behavior: 'smooth' });

    const section = document.getElementById('portfolio');
    if (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const center     = sectionTop - window.innerHeight / 2 + section.offsetHeight / 2;
      window.scrollTo({ top: Math.max(0, center), behavior: 'smooth' });
    }
  }

  /* =============================================
     CLICK en cards → activar o abrir enlace
     ============================================= */
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (card.classList.contains('active')) {
        const link = card.querySelector('.card__link');
        const href = link && link.getAttribute('href');
        if (href && href !== '#' && !e.target.closest('.card__link')) {
          window.open(href, '_blank', 'noopener');
        }
      } else {
        activateCard(i, true);
      }
    });

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (card.classList.contains('active')) {
          const link = card.querySelector('.card__link');
          const href = link && link.getAttribute('href');
          if (href && href !== '#') window.open(href, '_blank', 'noopener');
        } else {
          activateCard(i, true);
        }
      }
    });
  });

  /* =============================================
     BOTONES PREV / NEXT
     ============================================= */
  btnPrev && btnPrev.addEventListener('click', () => {
    const prev = (activeIndex - 1 + cards.length) % cards.length;
    activateCard(prev, true);
  });

  btnNext && btnNext.addEventListener('click', () => {
    const next = (activeIndex + 1) % cards.length;
    activateCard(next, true);
  });

  /* =============================================
     TECLADO — flechas
     ============================================= */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      const prev = (activeIndex - 1 + cards.length) % cards.length;
      activateCard(prev, true);
    } else if (e.key === 'ArrowRight') {
      const next = (activeIndex + 1) % cards.length;
      activateCard(next, true);
    }
  });

  /* =============================================
     DRAG / SWIPE horizontal (mouse y touch)
     ============================================= */
  let isDragging  = false;
  let startX      = 0;
  let scrollLeft  = 0;
  let moved       = false;

  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    moved      = false;
    startX     = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('grabbing');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 5) moved = true;
    carousel.scrollLeft = scrollLeft - walk;
  });

  const endDrag = () => {
    isDragging = false;
    carousel.classList.remove('grabbing');
  };

  carousel.addEventListener('mouseup',    endDrag);
  carousel.addEventListener('mouseleave', endDrag);

  /* Touch */
  let touchStartX = 0;
  let touchScrollLeft = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX     = e.touches[0].pageX;
    touchScrollLeft = carousel.scrollLeft;
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    const diff = touchStartX - e.touches[0].pageX;
    carousel.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });

  carousel.addEventListener('touchend', snapToNearest);
  carousel.addEventListener('mouseup',  snapToNearest);
  carousel.addEventListener('scroll',   onScroll, { passive: true });

  /* =============================================
     SNAP automático
     ============================================= */
  let scrollTimer = null;

  function onScroll () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(snapToNearest, 120);
  }

  function snapToNearest () {
    const center = carousel.scrollLeft + carousel.offsetWidth / 2;
    let closest  = 0;
    let minDist  = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist       = Math.abs(center - cardCenter);
      if (dist < minDist) {
        minDist  = dist;
        closest  = i;
      }
    });

    if (closest !== activeIndex) {
      activateCard(closest, false);
    }
  }

  /* =============================================
     INIT
     ============================================= */
  function init () {
    buildDots();
    activateCard(0, false);

    requestAnimationFrame(() => {
      const first = cards[0];
      if (first) {
        const offset = first.offsetLeft - carousel.offsetWidth / 2 + first.offsetWidth / 2;
        carousel.scrollLeft = Math.max(0, offset);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
