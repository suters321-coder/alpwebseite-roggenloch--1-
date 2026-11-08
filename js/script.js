// Hero-Bildslider (Startseite): sanfter Wechsel zwischen mehreren Hintergrundbildern
const heroSlider = document.getElementById('heroSlider');

if (heroSlider) {
  const slides = heroSlider.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }
}

// Karussell: klickbare Bildergalerie mit Pfeilen und Punkten (z.B. Startseite)
document.querySelectorAll('.carousel').forEach((carousel) => {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function show(index) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  prevBtn && prevBtn.addEventListener('click', () => { show(current - 1); restartAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { show(current + 1); restartAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restartAutoplay(); }));

  restartAutoplay();
});

// Nav-Dropdown ("Mehr"): Klick zum Öffnen/Schliessen (auch touch-freundlich)
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

document.addEventListener('click', (e) => {
  document.querySelectorAll('.nav-dropdown.open').forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Nach-oben-Button: erscheint nach etwas Scrollen, scrollt sanft zum Seitenanfang
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

// Header state on scroll
const header = document.querySelector('.site-header');

function updateHeader() {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Scroll-reveal animations
// Hinweis: .gallery-item bewusst ausgenommen - bei der grossen Foto-Galerie
// (600+ Bilder) wirkt das Rein-/Ausblenden beim Scrollen wie ein ständiges
// Nachladen. Bilder erscheinen dort normal, nur echtes Laden blendet sanft ein.
const revealSelectors = [
  '.section-header', '.card', '.intro-visual',
  '.intro-text', '.about-content', '.portrait', '.contact-info',
  'form', '.info-box', '.link-card', '.route-steps li'
].join(', ');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(revealSelectors).forEach(el => {
    const siblings = Array.from(el.parentElement.children).filter(s => s.matches('.card, .link-card'));
    const index = siblings.indexOf(el);
    if (index > 0) {
      el.style.transitionDelay = `${(index % 8) * 60}ms`;
    }
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// Gallery filtering (foto-galerie.html)
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryEmpty = document.getElementById('galleryEmpty');

if (filterButtons.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      document.querySelectorAll('.gallery-year').forEach(yearBlock => {
        const visibleInYear = yearBlock.querySelectorAll('.gallery-item').length
          ? Array.from(yearBlock.querySelectorAll('.gallery-item')).some(i => i.style.display !== 'none')
          : true;
        yearBlock.style.display = visibleInYear ? '' : 'none';
      });

      if (galleryEmpty) {
        galleryEmpty.classList.toggle('visible', visibleCount === 0);
      }
    });
  });
}

// Lightbox: Bilder in Grossansicht
const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));

if (galleryImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-label', 'Bildansicht');
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Schliessen">&times;</button>
    <button class="lightbox-prev" aria-label="Vorheriges Bild">&#8249;</button>
    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>
    <button class="lightbox-next" aria-label="N&auml;chstes Bild">&#8250;</button>
  `;
  document.body.appendChild(lightbox);

  const lbImage = lightbox.querySelector('figure img');
  const lbCaption = lightbox.querySelector('figcaption');
  const btnClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');

  let currentList = [];
  let currentIndex = 0;

  function visibleImages() {
    return galleryImages.filter(img => {
      const item = img.closest('.gallery-item');
      return item && item.style.display !== 'none';
    });
  }

  function renderLightbox() {
    const img = currentList[currentIndex];
    if (!img) return;
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    lbCaption.textContent = img.alt || '';
    const multiple = currentList.length > 1;
    btnPrev.style.display = multiple ? '' : 'none';
    btnNext.style.display = multiple ? '' : 'none';
  }

  function openLightbox(img) {
    currentList = visibleImages();
    currentIndex = Math.max(0, currentList.indexOf(img));
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function stepLightbox(direction) {
    if (!currentList.length) return;
    currentIndex = (currentIndex + direction + currentList.length) % currentList.length;
    renderLightbox();
  }

  galleryImages.forEach(img => {
    const item = img.closest('.gallery-item');
    if (item) {
      item.addEventListener('click', () => openLightbox(img));
    }
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(-1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(1); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
}

// Kontaktformular: Versand über Web3Forms (api.web3forms.com)
// Hinweis: der access_key im HTML ist ein Platzhalter und muss vor dem Live-Gang
// durch einen echten, für diese Domain registrierten Web3Forms-Key ersetzt werden.
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const formSubmitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (formSubmitBtn) {
      formSubmitBtn.disabled = true;
      formSubmitBtn.textContent = 'Wird gesendet …';
    }

    formNote.classList.remove('visible', 'error');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      });
      const result = await response.json();

      if (result.success) {
        formNote.textContent = 'Danke für deine Nachricht! Wir melden uns bald bei dir zurück.';
        formNote.classList.add('visible');
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      formNote.textContent = 'Ups, das hat leider nicht geklappt. Bitte versuch es in ein paar Minuten nochmal oder ruf uns direkt an.';
      formNote.classList.add('visible', 'error');
    } finally {
      if (formSubmitBtn) {
        formSubmitBtn.disabled = false;
        formSubmitBtn.textContent = 'Nachricht senden';
      }
    }
  });
}
