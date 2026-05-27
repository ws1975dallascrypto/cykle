/* =====================================================
   ICCS — Dynamic Site JavaScript
   Navbar scroll, counters, reveal animations, form
   ===================================================== */

(function () {
  'use strict';

  /* ---- NAVBAR scroll effect ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ---- Mobile hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---- Animated counter ---- */
  function animateCounter(el, target, duration) {
    const start    = performance.now();
    const startVal = 0;

    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent  = Math.floor(eased * (target - startVal) + startVal);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ---- Intersection Observer for reveal + counters ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let countersStarted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Counter observer — fires once when stats section enters view
  const statsObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      statNumbers.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target, 1800);
      });
      statsObs.disconnect();
    }
  }, { threshold: 0.3 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) statsObs.observe(statsStrip);

  /* ---- Stagger delay for grid items ---- */
  document.querySelectorAll('.services-grid .service-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 80) + 'ms';
  });
  document.querySelectorAll('.gcc-grid .gcc-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 70) + 'ms';
  });
  document.querySelectorAll('.why-grid .why-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 70) + 'ms';
  });
  document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 90) + 'ms';
  });

  /* ---- Smooth anchor scroll (handles fixed navbar offset) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- Contact form ---- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate submission (replace with real fetch to your backend)
      setTimeout(() => {
        form.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
        successMsg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send Consultation Request';

        // Hide success after 6s
        setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
      }, 1400);
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sTop = section.offsetTop - 120;
      if (window.scrollY >= sTop) current = section.getAttribute('id');
    });
    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

})();
