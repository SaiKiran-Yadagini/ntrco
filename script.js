'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── ICAI Disclaimer Modal ─────────────────────────── */
  const modal    = document.getElementById('disclaimer-modal');
  const agreeBtn = document.getElementById('agree-btn');

  if (modal && !sessionStorage.getItem('icai_disclaimer_agreed')) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    agreeBtn.focus();
  }

  agreeBtn && agreeBtn.addEventListener('click', () => {
    sessionStorage.setItem('icai_disclaimer_agreed', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  /* ─── Mobile Menu ───────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const closeNav  = document.querySelector('.nav-close');

  const openMenu = () => {
    navLinks.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.innerHTML = '&#10005;';
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '&#9776;';
    document.body.style.overflow = '';
  };

  hamburger && hamburger.addEventListener('click', () =>
    navLinks.classList.contains('active') ? closeMenu() : openMenu()
  );
  closeNav && closeNav.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-item').forEach(link =>
    link.addEventListener('click', closeMenu)
  );

  /* ─── Shared throttle ──────────────────────────────── */
  const throttle = (fn, ms) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...args); }
    };
  };

  /* ─── Sticky Header + Scroll Spy + Back-to-top ─────── */
  const header    = document.querySelector('.header');
  const backToTop = document.getElementById('back-to-top');
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navItems  = Array.from(document.querySelectorAll('a.nav-item, a.btn-cta'));
  const logoLink  = document.querySelector('.logo-link');

  // Smooth scroll without changing the URL hash for all anchor links
  const smoothScrollTo = (e, targetId) => {
    e.preventDefault();
    const targetEl = document.getElementById(targetId.replace('#', ''));
    if (targetEl) {
      const topOffset = targetEl.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      // Update history state without jumping
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  };

  // Apply to nav items
  navItems.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMenu();
      const targetId = link.getAttribute('href');
      if (targetId === '#hero') {
         e.preventDefault();
         window.scrollTo({ top: 0, behavior: 'smooth' });
         history.replaceState(null, null, window.location.pathname + window.location.search);
      } else {
         smoothScrollTo(e, targetId);
      }
    });
  });

  // Apply to any other internal link (like "Explore Our Services", "Know More ->", etc.)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip if it's already a nav item to avoid double-firing
    if (!anchor.classList.contains('nav-item') && !anchor.classList.contains('btn-cta')) {
        anchor.addEventListener('click', function(e) {
            smoothScrollTo(e, this.getAttribute('href'));
        });
    }
  });

  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, null, window.location.pathname + window.location.search);
    });
  }

  const onScroll = throttle(() => {
    const y = window.scrollY;

    // Sticky header shadow
    if (header) header.classList.toggle('scrolled', y > 50);

    // Back-to-top visibility
    if (backToTop) backToTop.classList.toggle('visible', y > 400);

    // Scroll spy
    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 160) current = sec.id;
    });
    navItems.forEach(a => {
      if (a.classList.contains('nav-item')) {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
      }
    });
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, null, window.location.pathname + window.location.search);
    });
  }

  /* ─── Stats Counter ─────────────────────────────────── */
  const statsSection = document.querySelector('.stats');
  const statEls      = Array.from(document.querySelectorAll('.stat-number'));
  let countersStarted = false;

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const fps      = 60;
    const steps    = (duration / 1000) * fps;
    const increment = target / steps;
    let current = 0;

    const tick = () => {
      current = Math.min(current + increment, target);
      el.textContent = Math.ceil(current).toLocaleString('en-IN') + suffix;
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (statsSection && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        statEls.forEach(animateCounter);
        obs.disconnect();
      }
    }, { threshold: 0.4 }).observe(statsSection);
  } else {
    statEls.forEach(el =>
      el.textContent = parseInt(el.dataset.target).toLocaleString('en-IN') + (el.dataset.suffix || '')
    );
  }

  /* ─── Testimonials Carousel ─────────────────────────── */
  const cards  = Array.from(document.querySelectorAll('.testimonial-card'));
  const dots   = Array.from(document.querySelectorAll('.dot'));
  let current  = 0;
  let autoplay;

  const showSlide = (idx) => {
    cards.forEach((c, i) => {
      c.classList.toggle('active', i === idx);
      c.setAttribute('aria-hidden', i !== idx ? 'true' : 'false');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
  };

  const nextSlide = () => showSlide((current + 1) % cards.length);

  const startAutoplay = () => {
    stopAutoplay();
    autoplay = setInterval(nextSlide, 5000);
  };
  const stopAutoplay = () => clearInterval(autoplay);

  if (cards.length > 1) {
    startAutoplay();
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { showSlide(i); startAutoplay(); });
    });
  }

  /* ─── FAQ Accordion ─────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon   = item.querySelector('.faq-icon');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item.active').forEach(open => {
        open.classList.remove('active');
        open.querySelector('.faq-answer').style.maxHeight = '0';
        open.querySelector('.faq-icon').textContent = '+';
        open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '−';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ─── Scroll Reveal ─────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ─── Contact Form → WhatsApp ───────────────────────── */
  const form     = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const WA_NUMBER = '919951946976';

  if (form && statusEl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic client-side validation
      const name    = (form.querySelector('#name')?.value    || '').trim();
      const email   = (form.querySelector('#email')?.value   || '').trim();
      const phone   = (form.querySelector('#phone')?.value   || '').trim();
      const service = (form.querySelector('#service')?.value || '').trim();
      const message = (form.querySelector('#message')?.value || '').trim();

      if (!name) {
        statusEl.className = 'form-status error';
        statusEl.textContent = '✗ Please enter your full name.';
        form.querySelector('#name').focus();
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.className = 'form-status error';
        statusEl.textContent = '✗ Please enter a valid email address.';
        form.querySelector('#email').focus();
        return;
      }

      // Build the WhatsApp message
      const lines = [
        '📋 *New Enquiry — NTR & CO LLP*',
        '',
        `👤 *Name:* ${name}`,
        `📧 *Email:* ${email}`,
        phone   ? `📞 *Phone:* ${phone}`     : null,
        service ? `🗂 *Service:* ${service}`  : null,
        message ? `💬 *Message:*\n${message}` : null,
        '',
        '_Sent via ntrllp.com contact form_',
      ].filter(l => l !== null).join('\n');

      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;

      // Show brief confirmation then open WhatsApp
      statusEl.className = 'form-status success';
      statusEl.textContent = '✓ Opening WhatsApp with your details…';

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        form.reset();
        setTimeout(() => {
          statusEl.className = 'form-status';
          statusEl.textContent = '';
        }, 5000);
      }, 400);
    });
  }

});
