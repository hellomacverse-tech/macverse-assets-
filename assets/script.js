// ==========================================================================
// ELEVAR — SHARED SITE BEHAVIOR
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* Theme toggle (persists for the session only — no localStorage per artifact rules,
     but on a real deployed site this can safely use localStorage) */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const isDark = body.getAttribute('data-theme') === 'dark';
      body.setAttribute('data-theme', isDark ? 'light' : 'dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
  }

  /* Mobile hamburger menu */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
    });
  }

  /* Scroll progress + back to top */
  const progress = document.getElementById('progress');
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progress) progress.style.width = scrolled + '%';
    if (backTop) backTop.classList.toggle('show', h.scrollTop > 500);
  });
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimal || 0);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 60;
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
        el.textContent = prefix + cur.toFixed(decimals) + suffix;
        requestAnimationFrame(tick);
      };
      tick();
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterIO.observe(el));

  /* ROI Calculator (Home page) */
  const visitors = document.getElementById('visitors');
  const cr = document.getElementById('cr');
  const aov = document.getElementById('aov');
  if (visitors && cr && aov) {
    const visitorsVal = document.getElementById('visitorsVal');
    const crVal = document.getElementById('crVal');
    const aovVal = document.getElementById('aovVal');
    const calcOut = document.getElementById('calcOut');
    function updateCalc() {
      const v = parseFloat(visitors.value);
      const c = parseFloat(cr.value);
      const a = parseFloat(aov.value);
      visitorsVal.textContent = v.toLocaleString();
      crVal.textContent = c.toFixed(1) + '%';
      aovVal.textContent = '$' + a.toLocaleString();
      const currentRevenue = v * (c / 100) * a;
      const improvedRevenue = v * ((c + 1) / 100) * a;
      const lift = improvedRevenue - currentRevenue;
      calcOut.textContent = '$' + Math.round(lift).toLocaleString();
    }
    let roiTracked = false;
    [visitors, cr, aov].forEach(el => el.addEventListener('input', () => {
      updateCalc();
      if (!roiTracked) {
        roiTracked = true;
        trackEvent('roi_calculator_used', { page_path: window.location.pathname });
      }
    }));
    updateCalc();
  }

  /* Portfolio / Case Study filter */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        filterItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* FAQ accordion */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* FAQ category tabs */
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqGroups = document.querySelectorAll('[data-faq-group]');
  if (faqTabs.length) {
    faqTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        faqTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const group = tab.dataset.group;
        faqGroups.forEach(g => {
          g.style.display = (group === 'all' || g.dataset.faqGroup === group) ? '' : 'none';
        });
      });
    });
  }

  /* Blog search filter (client-side, matches on title text) */
  const blogSearch = document.getElementById('blogSearch');
  const postCards = document.querySelectorAll('.post-card');
  if (blogSearch && postCards.length) {
    blogSearch.addEventListener('input', () => {
      const q = blogSearch.value.toLowerCase();
      postCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        card.style.display = title.includes(q) ? '' : 'none';
      });
    });
  }

  /* Contact form — front-end only submit feedback (wire to Formspree / Web3Forms / Apps Script endpoint) */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type=submit]');
      const original = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        contactForm.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2500);
      }, 900);
    });
  }

  /* Universal Modal System (VSL + Case Study Quick View + Portfolio Quick View) */
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  function openModal(id){
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof trackEvent === 'function') {
      trackEvent('modal_open', { modal_id: id, page_path: window.location.pathname });
    }
  }
  function closeModal(modal){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    const vidFrame = modal.querySelector('.vsl-frame[data-playing]');
    if(vidFrame) vidFrame.removeAttribute('data-playing');
  }
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.dataset.modalTarget);
    });
  });
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) closeModal(overlay);
    });
    const closeBtn = overlay.querySelector('.modal-close');
    if(closeBtn) closeBtn.addEventListener('click', () => closeModal(overlay));
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      modalOverlays.forEach(overlay => { if(overlay.classList.contains('open')) closeModal(overlay); });
    }
  });

  /* VSL play button — swaps poster for embedded player on click */
  document.querySelectorAll('.vsl-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const frame = btn.closest('.vsl-frame');
      if (frame) frame.setAttribute('data-playing', 'true');
    });
  });

  /* Testimonial carousel arrows */
  const carousel = document.querySelector('.test-carousel');
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');
  if (carousel && prevBtn && nextBtn) {
    const scrollAmount = 362;
    prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
  }

  /* Skill bar fill animation (About page) */
  const skillBars = document.querySelectorAll('.skill-fill');
  const skillIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.level + '%';
        skillIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  skillBars.forEach(bar => skillIO.observe(bar));

  /* Lead-magnet gated download modal */
  const gateForm = document.getElementById('gateForm');
  const gateModal = document.getElementById('gateModal');
  const gateTitle = document.getElementById('gateResourceTitle');
  let pendingResourceName = '';
  document.querySelectorAll('[data-gate-resource]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      pendingResourceName = btn.dataset.gateResource;
      if (gateTitle) gateTitle.textContent = pendingResourceName;
      const gateTitle2 = document.getElementById('gateResourceTitle2');
      if (gateTitle2) gateTitle2.textContent = pendingResourceName;
      const gateStep1 = document.getElementById('gateStep1');
      const gateStep2 = document.getElementById('gateStep2');
      if (gateStep1) gateStep1.style.display = '';
      if (gateStep2) gateStep2.style.display = 'none';
      if (gateForm) gateForm.reset();
      openModal('gateModal');
    });
  });
  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('gateStep1').style.display = 'none';
      document.getElementById('gateStep2').style.display = '';
    });
  }

  /* ==========================================================================
     ANALYTICS EVENT TRACKING
     Pushes structured events to window.dataLayer for GTM/GA4 to pick up.
     Works whether or not GTM has finished loading (dataLayer array queues events).
     ========================================================================== */
  window.dataLayer = window.dataLayer || [];
  function trackEvent(eventName, params) {
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  // CTA click tracking — every primary/dark CTA button or link
  document.querySelectorAll('.btn-primary, .btn-dark').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('cta_click', {
        cta_text: btn.textContent.trim(),
        cta_href: btn.getAttribute('href') || null,
        page_path: window.location.pathname
      });
    });
  });

  // Outbound / contact-channel click tracking (WhatsApp, Telegram, Calendly, social)
  document.querySelectorAll('a[href^="https://wa.me"], a[href^="https://t.me"], a[href*="calendly.com"], a[href*="linkedin.com"], a[href*="twitter.com"]').forEach(link => {
    link.addEventListener('click', () => {
      let channel = 'outbound';
      const href = link.getAttribute('href') || '';
      if (href.includes('wa.me')) channel = 'whatsapp';
      else if (href.includes('t.me')) channel = 'telegram';
      else if (href.includes('calendly.com')) channel = 'calendly';
      else if (href.includes('linkedin.com')) channel = 'linkedin';
      else if (href.includes('twitter.com')) channel = 'twitter';
      trackEvent('contact_channel_click', { channel: channel, page_path: window.location.pathname });
    });
  });

  // File download tracking (resume, resources)
  document.querySelectorAll('a[download], a[href$=".pdf"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('file_download', {
        file_url: link.getAttribute('href'),
        page_path: window.location.pathname
      });
    });
  });

  // Form submission tracking (contact form, lead-magnet gate form)
  ['contactForm', 'gateForm'].forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', () => {
        trackEvent('form_submit', { form_id: formId, page_path: window.location.pathname });
      });
    }
  });

  // Scroll depth tracking — fires once per milestone per page load
  const scrollMilestones = [25, 50, 75, 100];
  const scrollFired = {};
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolledPct = Math.round((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    scrollMilestones.forEach(milestone => {
      if (scrolledPct >= milestone && !scrollFired[milestone]) {
        scrollFired[milestone] = true;
        trackEvent('scroll_depth', { percent: milestone, page_path: window.location.pathname });
      }
    });
  });

  // Engagement: time-on-page milestone (30s) — signals genuine engagement vs. bounce
  setTimeout(() => {
    trackEvent('engaged_session', { seconds: 30, page_path: window.location.pathname });
  }, 30000);

  /* Sticky CTA bar — shows after scrolling, dismissible per session, hidden on contact page */
  const stickyCta = document.getElementById('stickyCta');
  const stickyCtaClose = document.getElementById('stickyCtaClose');
  const isContactPage = /contact\.html$/.test(window.location.pathname);
  let stickyCtaDismissed = sessionStorage ? sessionStorage.getItem('stickyCtaDismissed') === 'true' : false;
  if (stickyCta && !isContactPage) {
    window.addEventListener('scroll', () => {
      if (stickyCtaDismissed) return;
      const h = document.documentElement;
      if (h.scrollTop > 700) stickyCta.classList.add('show');
    });
  }
  if (stickyCtaClose) {
    stickyCtaClose.addEventListener('click', () => {
      stickyCta.classList.remove('show');
      stickyCtaDismissed = true;
      try { sessionStorage.setItem('stickyCtaDismissed', 'true'); } catch(e) {}
    });
  }

  /* Exit-intent popup — fires once per session when mouse leaves viewport top, skipped on contact page */
  const exitModal = document.getElementById('exitIntentModal');
  let exitIntentShown = sessionStorage ? sessionStorage.getItem('exitIntentShown') === 'true' : true;
  if (exitModal && !isContactPage) {
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        try { sessionStorage.setItem('exitIntentShown', 'true'); } catch(err) {}
        openModal('exitIntentModal');
      }
    });
  }

  /* Cookie preferences modal — wired to the "Preferences" button in the cookie banner */
  document.querySelectorAll('.cookie-banner .btn-ghost').forEach(btn => {
    btn.addEventListener('click', () => openModal('cookiePrefsModal'));
  });
  const savePrefsBtn = document.getElementById('savePrefsBtn');
  if (savePrefsBtn) {
    savePrefsBtn.addEventListener('click', () => {
      const overlay = document.getElementById('cookiePrefsModal');
      if (overlay) closeModal(overlay);
      const banner = document.getElementById('cookieBanner');
      if (banner) banner.classList.remove('show');
    });
  }

  /* Global search modal */
  const SITE_INDEX = [
    {title:"Home", url:"index.html", desc:"Growth systems for brands that refuse to plateau."},
    {title:"About", url:"about.html", desc:"The story, mission, and methodology behind Elevar."},
    {title:"Services", url:"services.html", desc:"Paid media, SEO, analytics, automation, and growth systems."},
    {title:"Portfolio", url:"portfolio.html", desc:"Campaigns, dashboards, and systems shipped for clients."},
    {title:"Case Studies", url:"case-studies.html", desc:"12 full case studies with real strategy and results."},
    {title:"Testimonials", url:"testimonials.html", desc:"Client reviews, ratings, and video success stories."},
    {title:"Resources", url:"resources.html", desc:"Free templates, checklists, and frameworks."},
    {title:"Blog", url:"blog.html", desc:"Long-form articles on growth, ads, SEO, and analytics."},
    {title:"FAQ", url:"faq.html", desc:"Answers on pricing, process, and working with Elevar."},
    {title:"Contact", url:"contact.html", desc:"Book a free consultation call or send a message."},
    {title:"Northwind Case Study", url:"case-study-example.html", desc:"Scaling a DTC brand from $80K to $410K/mo."},
    {title:"Orbital Case Study", url:"case-study-orbital.html", desc:"286% organic traffic growth for a B2B SaaS."},
    {title:"Harbor & Co Case Study", url:"case-study-harbor.html", desc:"Rebuilding retention after a growth plateau."},
    {title:"Core Web Vitals Article", url:"blog-post-example.html", desc:"Why Core Web Vitals fixes aren't moving rankings."},
    {title:"90-Day Growth Framework", url:"resources.html", desc:"The planning template used in every engagement."},
  ];
  const searchIconBtn = document.getElementById('searchIconBtn');
  const searchModalInput = document.getElementById('searchModalInput');
  const searchResults = document.getElementById('searchResults');
  if (searchIconBtn) {
    searchIconBtn.addEventListener('click', () => {
      openModal('searchModal');
      setTimeout(() => searchModalInput && searchModalInput.focus(), 200);
    });
  }
  function renderSearchResults(query){
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    const matches = q === '' ? SITE_INDEX : SITE_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
    searchResults.innerHTML = matches.length ? matches.map(item =>
      `<a class="search-result-item" href="${item.url}"><div class="sr-title">${item.title}</div><div class="sr-desc">${item.desc}</div></a>`
    ).join('') : '<div class="search-empty">No pages match your search.</div>';
  }
  if (searchModalInput) {
    searchModalInput.addEventListener('input', () => renderSearchResults(searchModalInput.value));
    renderSearchResults('');
  }

  /* Lightbox for images marked .lightboxable */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.lightboxable').forEach(img => {
    img.addEventListener('click', () => {
      if (!lightboxOverlay || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxOverlay.classList.add('open');
    });
  });
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', () => lightboxOverlay.classList.remove('open'));
  }

  /* Dynamic footer year (Blogger theme uses #footerYear; no-op on static site pages) */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* Cookie banner */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
    if (cookieAccept) cookieAccept.addEventListener('click', () => cookieBanner.classList.remove('show'));
  }

  /* Set active nav link based on current page */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === path) link.classList.add('active');
  });

});
