/* scripts.js — client-side interactions
   - toggle mobile nav (basic)
   - gallery modal with auto horizontal scroll (pause on hover)
   - appointment form handling (placeholder POST to backend)
   - BMI calculation
   - year update
*/

document.addEventListener('DOMContentLoaded', function(){
  // year in footer
  const y = new Date().getFullYear();
  ['year','year2','year3','year4','year5','year6','year7'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });

  // Gallery modal open
  const viewBtn = document.getElementById('viewGalleryBtn');
  if(viewBtn) viewBtn.addEventListener('click', openGallery);

  // Modal: click outside to close
  const modal = document.getElementById('galleryModal');
  if(modal) modal.addEventListener('click', function(e){
    if(e.target === modal) closeGallery();
  });

  // Appointment form handling
  const form = document.getElementById('appointmentForm');
  if(form) {
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const msg = document.getElementById('formMsg');
      msg.textContent = 'Sending...';

      // Collect data
      const data = new FormData(form);
      // Convert to object
      const obj = {};
      data.forEach((v,k)=>{ obj[k]=v; });

      // If file is uploaded, you may want to send via FormData to backend.
      // Here we send JSON as a placeholder to /api/appointments (you must create backend)
      try {
        // Replace URL below with your actual backend endpoint that saves to MongoDB
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(obj)
        });

        if(response.ok){
          msg.textContent = 'Appointment request sent — we will call to confirm.';
          form.reset();
        } else {
          // If backend not ready, still show local success to user but keep placeholder
          msg.textContent = 'Request saved locally (backend not connected). Replace /api/appointments with your server URL.';
        }
      } catch (err) {
        // Backend not available — keep graceful note
        msg.textContent = 'Could not reach server. Save this data locally or connect to backend. See comments in code.';
        console.warn('Send failed:', err);
      }
    });
  }

  // BMI calculator
  const calcBtn = document.getElementById('calcBmi');
  if(calcBtn){
    calcBtn.addEventListener('click', function(e){
      e.preventDefault();
      const w = parseFloat(document.getElementById('weight').value);
      const h = parseFloat(document.getElementById('height').value);
      const res = document.getElementById('bmiResult');
      if(!w || !h){ res.textContent = 'Enter valid weight and height.'; return; }
      // BMI = kg / (m^2)
      const hm = h/100;
      const bmi = w / (hm * hm);
      const bmiRound = Math.round(bmi * 10)/10;
      let cat = '';
      if(bmi < 18.5) cat = 'Underweight';
      else if (bmi < 25) cat = 'Normal';
      else if (bmi < 30) cat = 'Overweight';
      else cat = 'Obese';
      res.textContent = `Your BMI: ${bmiRound} — ${cat}.`;
    });

    const resetBtn = document.getElementById('resetBmi');
    if(resetBtn){
      resetBtn.addEventListener('click', function(e){
        e.preventDefault();
        document.getElementById('weight').value = '';
        document.getElementById('height').value = '';
        document.getElementById('bmiResult').textContent = '';
      });
    }
  }

  // Small helper for toggling mobile nav
  window.toggleMobileNav = function(){
    const nav = document.querySelector('.main-nav');
    if(!nav) return;
    if(nav.style.display === 'flex') nav.style.display = 'none';
    else nav.style.display = 'flex';
  };
});

/* Gallery auto-scroll logic */
let galleryInterval;
function openGallery(){
  const modal = document.getElementById('galleryModal');
  const scrollRow = document.getElementById('galleryScroll');
  if(!modal || !scrollRow) return;
  modal.setAttribute('aria-hidden','false');

  // auto-scroll by incrementing scrollLeft
  const speedPx = 0.6; // pixels per frame (tweak)
  function step(){
    // If user hovers, pause (we add mouseenter/mouseleave)
    scrollRow.scrollLeft += speedPx;
    // loop: if reached end, scroll back to start
    if(scrollRow.scrollLeft >= (scrollRow.scrollWidth - scrollRow.clientWidth - 1)) {
      scrollRow.scrollLeft = 0;
    }
  }
  galleryInterval = setInterval(step, 16); // ~60fps

  // Pause on hover
  scrollRow.addEventListener('mouseenter', pauseGallery);
  scrollRow.addEventListener('mouseleave', resumeGallery);
}

function pauseGallery(){
  if(galleryInterval) clearInterval(galleryInterval);
  galleryInterval = null;
}
function resumeGallery(){
  if(galleryInterval) return;
  const speedPx = 0.6;
  function step(){
    const scrollRow = document.getElementById('galleryScroll');
    if(!scrollRow) return;
    scrollRow.scrollLeft += speedPx;
    if(scrollRow.scrollLeft >= (scrollRow.scrollWidth - scrollRow.clientWidth - 1)) {
      scrollRow.scrollLeft = 0;
    }
  }
  galleryInterval = setInterval(step,16);
}

function closeGallery(){
  const modal = document.getElementById('galleryModal');
  const scrollRow = document.getElementById('galleryScroll');
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  if(galleryInterval) { clearInterval(galleryInterval); galleryInterval = null; }
  if(scrollRow){
    scrollRow.removeEventListener('mouseenter', pauseGallery);
    scrollRow.removeEventListener('mouseleave', resumeGallery);
    // reset position
    scrollRow.scrollLeft = 0;
  }
}
// animations.js — Entrance + Scroll reveal (paste into js/scripts.js)
// Automatically adds reveal effects to common page blocks.
// Respects prefers-reduced-motion and staggers animations.

(function () {
  // If user prefers reduced motion, skip animations.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // make sure all elements are visible
    document.querySelectorAll('.reveal, .header-reveal, .hero-img-reveal').forEach(el => {
      el.classList.add('in-view');
    });
    return;
  }

  // Utility: set delay in ms
  const setDelay = (el, ms) => {
    el.style.setProperty('--r-delay', ms + 'ms');
    el.setAttribute('data-delay', ms);
  };

  // Elements we want to animate on page load (staggered)
  const loadTargets = [
    { sel: '.site-header', cls: 'header-reveal' },
    { sel: '.hero-panel-inner', cls: 'reveal from-left' },
    { sel: '.hero-right .hero-card', cls: 'reveal from-right scale' },
    { sel: '.hero-mini-grid img', cls: 'reveal from-bottom' },
    { sel: '.hero-img', cls: 'hero-img-reveal' }
  ];

  // Elements to reveal when scrolled into view (using IntersectionObserver)
  const scrollSelectors = [
    '.features .feature',
    '.steps-grid .step-card',
    '.quick-links-grid .ql-card',
    '.hero-card',      // in case not yet in view
    '.hero-panel-inner' // safety
  ];

  // Apply base classes and initial state
  loadTargets.forEach((t, i) => {
    const el = document.querySelector(t.sel);
    if (!el) return;
    // split class names if provided
    const classes = (t.cls || '').split(' ').filter(Boolean);
    el.classList.add(...classes);
    // stagger: multiply index by 120ms
    setDelay(el, i * 120 + 80);
  });

  // For multiple items (like thumbnails) add reveal class to all
  document.querySelectorAll('.hero-mini-grid img').forEach((img, i) => {
    img.classList.add('reveal', 'from-bottom');
    setDelay(img, 220 + i * 80);
  });

  // Make header reveal immediate on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.add('header-reveal');
      // slight delay so CSS transition is noticed
      setTimeout(() => header.classList.add('in-view'), 70);
    }

    // Reveal hero image (subtle)
    const hi = document.querySelector('.hero-img');
    if (hi) {
      hi.classList.add('hero-img-reveal');
      setTimeout(() => hi.classList.add('in-view'), 140);
    }

    // Stagger in the main loadTargets
    loadTargets.forEach((t, i) => {
      const el = document.querySelector(t.sel);
      if (!el) return;
      // Read delay and apply
      const delay = parseInt(el.getAttribute('data-delay') || 0, 10);
      setTimeout(() => el.classList.add('in-view'), delay + 180);
    });
  });

  // IntersectionObserver for on-scroll reveals
  const ioOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // trigger a bit before reaching bottom
    threshold: 0.12
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('in-view');
        // if you want a reveal only once:
        io.unobserve(el);
      }
    });
  }, ioOptions);

  // Attach observer to all items matching scrollSelectors
  scrollSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, idx) => {
      // if element doesn't have a reveal class, add default
      if (!el.classList.contains('reveal') && !el.classList.contains('header-reveal')) {
        el.classList.add('reveal', 'from-bottom');
        setDelay(el, idx * 80);
      }
      io.observe(el);
    });
  });

  // Also observe any manual .reveal elements the user added
  document.querySelectorAll('.reveal').forEach(el => {
    // if already in-view via load, skip
    if (!el.classList.contains('in-view')) io.observe(el);
  });

  // Optional: simple fallback to add in-view after 3s (ensures nothing remains hidden)
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('in-view')) el.classList.add('in-view');
    });
  }, 3000);

})();
/* ambulance.js — add to js/scripts.js or paste inline in ambulance.html */

/* Wrap in DOMContentLoaded to be safe if you append to global scripts.js */
document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const mapWrap = document.querySelector('.map-wrap');
  const fabCall = document.querySelector('.fab-call');
  const callBtns = document.querySelectorAll('.call-btn');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = 'Dialer opened — calling hospital...';
  document.body.appendChild(toast);

  // Lazy-load map iframe when user clicks the placeholder or scrolls nearby
  function loadMapIframe() {
    if (!mapWrap) return;
    const existing = mapWrap.querySelector('iframe');
    if (existing) return;
    const iframe = document.createElement('iframe');
    // replace the query/location with your exact embedded map link later
    iframe.src = mapWrap.getAttribute('data-src') || 'https://www.google.com/maps?q=karnataka&output=embed';
    iframe.className = 'map-iframe';
    iframe.loading = 'lazy';
    mapWrap.innerHTML = '';
    mapWrap.appendChild(iframe);
  }

  // click placeholder to load map
  if (mapWrap) {
    mapWrap.addEventListener('click', loadMapIframe, { once: true });
  }

  // Observe map proximity and auto-load when near viewport
  if (mapWrap && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { loadMapIframe(); obs.unobserve(e.target); }
      });
    }, { root: null, threshold: 0.15 });
    io.observe(mapWrap);
  }

  // Show toast helper
  function showToast(msg, ms = 2200) {
    toast.textContent = msg || toast.textContent;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms);
  }

  // Call button handlers - show small toast and allow default tel: link
  callBtns.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      // If it's an <a href="tel:..."> default action will open phone dialer on mobile.
      showToast('Opening phone dialer...');
      // give toast a moment; don't prevent default.
      // If you want to track events add XHR/fetch here.
    });
  });

  // Floating call button behavior: hide on scroll down, show on scroll up
  if (fabCall) {
    let last = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          if (current > last + 30) { // scrolling down
            fabCall.style.transform = 'translateY(40px)'; fabCall.style.opacity = '0'; fabCall.style.pointerEvents = 'none';
          } else if (current < last - 10) { // scrolling up
            fabCall.style.transform = 'translateY(0)'; fabCall.style.opacity = '1'; fabCall.style.pointerEvents = 'auto';
          }
          last = current;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Accessibility: allow pressing Enter on the placeholder to load map
  if (mapWrap) {
    mapWrap.setAttribute('tabindex', '0');
    mapWrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') loadMapIframe(); });
  }
});
/* ======================================================
   BMI PAGE JS — calculate, animate number, copy result
   Append to js/scripts.js
   ====================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Only run on pages with the BMI form
  const bmiPage = document.querySelector('.bmi-page');
  if (!bmiPage) return;

  const heightEl = document.getElementById('bmiHeight');
  const weightEl = document.getElementById('bmiWeight');
  const calcBtn = document.getElementById('bmiCalcBtn');
  const clearBtn = document.getElementById('bmiClearBtn');
  const resultValue = document.getElementById('bmiValue');
  const resultCategory = document.getElementById('bmiCategory');
  const copyBtn = document.getElementById('bmiCopyBtn');

  // Utility: animate number from 0 -> target
  function animateNumber(el, from, to, duration = 700) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t<.5 ? 2*t*t : -1 + (4 - 2*t)*t; // easeInOutQuad-ish
      const current = from + diff * eased;
      el.textContent = (Math.round(current*10)/10).toFixed(1);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function evaluateBMI(h, w) {
    // h in cm, w in kg
    const m = h / 100;
    const bmi = w / (m*m);
    return Math.round(bmi*10)/10;
  }

  function categoryForBMI(bmi) {
    if (bmi < 18.5) return { name: 'Underweight', cls: 'bmi-under', advice: 'You are underweight. Consider a balanced diet and consult a doctor.' };
    if (bmi < 25) return { name: 'Normal weight', cls: 'bmi-normal', advice: 'You have a normal body weight. Keep up the healthy habits!' };
    if (bmi < 30) return { name: 'Overweight', cls: 'bmi-over', advice: 'Overweight — consider lifestyle changes and consult a doctor.' };
    return { name: 'Obesity', cls: 'bmi-obese', advice: 'Obesity — seek medical advice for weight management.' };
  }

  calcBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const h = parseFloat(heightEl.value);
    const w = parseFloat(weightEl.value);

    if (!h || !w || h <= 0 || w <= 0) {
      resultCategory.textContent = 'Please enter valid height and weight.';
      resultCategory.style.color = 'var(--muted)';
      resultValue.textContent = '--';
      return;
    }

    const bmi = evaluateBMI(h, w);
    const cat = categoryForBMI(bmi);

    // animate number
    animateNumber(resultValue, parseFloat(resultValue.textContent) || 0, bmi, 750);

    // set category pill with color
    resultCategory.textContent = cat.name + ' — ' + cat.advice;
    // remove previous pill classes
    resultCategory.className = 'bmi-category';
    const pill = document.createElement('span');
    pill.className = `bmi-pill ${cat.cls}`;
    pill.textContent = cat.name;
    // Clear previous children and append pill + advice text
    resultCategory.innerHTML = '';
    resultCategory.appendChild(pill);
    const advice = document.createElement('div');
    advice.style.marginTop = '8px';
    advice.style.color = 'var(--muted)';
    advice.style.fontSize = '0.95rem';
    advice.textContent = cat.advice;
    resultCategory.appendChild(advice);

    // store last result for copy
    resultCategory.dataset.lastBmi = bmi;
  });

  clearBtn.addEventListener('click', function () {
    heightEl.value = '';
    weightEl.value = '';
    resultValue.textContent = '--';
    resultCategory.textContent = 'Enter height and weight to calculate your BMI.';
    resultCategory.style.color = 'var(--muted)';
    if (resultCategory.dataset) delete resultCategory.dataset.lastBmi;
  });

  // Copy result to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const bmi = resultCategory.dataset.lastBmi || resultValue.textContent;
      const text = `My BMI is ${bmi} — checked at Basaveshwar Hospital.`;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied ✓';
          setTimeout(()=> copyBtn.textContent = 'Copy result', 1600);
        });
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); copyBtn.textContent = 'Copied ✓'; } catch (err) { copyBtn.textContent = 'Copy'; }
        ta.remove();
        setTimeout(()=> copyBtn.textContent = 'Copy result', 1600);
      }
    });
  }

});
/* ============================================================
   MEDICAL SHOP JS — search, cart (localStorage), upload preview, toast
   Append to js/scripts.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Only run on shop page
  const shopPage = document.querySelector('.shop-page');
  if (!shopPage) return;

  // Elements
  const searchInput = document.getElementById('shopSearch');
  const productsContainer = document.getElementById('productsContainer');
  const cartCountEl = document.getElementById('cartCount');
  const uploadInput = document.getElementById('prescriptionFile');
  const previewWrap = document.getElementById('prescriptionPreview');
  const toast = (function createToast() {
    const t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
    return {
      show(msg = '', time = 2000) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(()=> t.classList.remove('show'), time);
      }
    };
  })();

  // sample product data (if you don't have backend yet)
  const products = [
    { id: 'p1', name: 'Pain Relief Tablets', price: 80, img: 'images/med1.jpg', desc: 'Fast acting pain relief' },
    { id: 'p2', name: 'Antibiotic Capsule', price: 120, img: 'images/med2.jpg', desc: 'Broad spectrum antibiotic' },
    { id: 'p3', name: 'Wound Dressing Pack', price: 60, img: 'images/med3.jpg', desc: 'Sterile dressing materials' },
    { id: 'p4', name: 'After-surgery Ointment', price: 220, img: 'images/med4.jpg', desc: 'Healing and soothing' }
  ];

  // Render product list
  function renderProducts(list) {
    productsContainer.innerHTML = '';
    if (!list.length) {
      productsContainer.innerHTML = '<div class="empty-note">No medicines match your search.</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card reveal from-bottom';
      card.innerHTML = `
        <img class="product-thumb" src="${p.img}" alt="${p.name}">
        <div class="product-info">
          <h4>${p.name}</h4>
          <p>${p.desc}</p>
        </div>
        <div class="product-actions">
          <div class="product-price">₹ ${p.price}</div>
          <div>
            <button class="btn btn-outline small add-to-cart" data-id="${p.id}" aria-label="Add ${p.name} to cart">Add</button>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });
    productsContainer.appendChild(frag);
    // register add-to-cart events
    productsContainer.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        addToCart(id);
      });
    });
  }

  // Cart helpers (simple localStorage)
  function getCart() {
    try { return JSON.parse(localStorage.getItem('bh_cart') || '[]'); } catch { return []; }
  }
  function saveCart(c) { localStorage.setItem('bh_cart', JSON.stringify(c)); }
  function addToCart(productId) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) item.qty++;
    else cart.push({ id: productId, qty: 1 });
    saveCart(cart);
    updateCartCount();
    toast.show('Added to cart');
  }
  function updateCartCount() {
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    cartCountEl.textContent = count;
  }

  // Search handler (filter by name)
  function handleSearch() {
    const q = (searchInput.value || '').trim().toLowerCase();
    if (!q) renderProducts(products);
    else {
      const filtered = products.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q));
      renderProducts(filtered);
    }
  }
  searchInput.addEventListener('input', handleSearch);

  // Prescription upload preview
  if (uploadInput && previewWrap) {
    uploadInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      previewWrap.innerHTML = '';
      if (!f) return;
      if (f.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = 'Prescription preview';
        img.onload = () => URL.revokeObjectURL(img.src);
        img.className = 'prescription-preview-img';
        previewWrap.appendChild(img);
      } else {
        const note = document.createElement('div');
        note.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
        previewWrap.appendChild(note);
      }
    });
  }

  // initial render
  renderProducts(products);
  updateCartCount();

  // Accessibility: allow Enter on search to focus first add button
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = productsContainer.querySelector('.add-to-cart');
      if (first) first.focus();
    }
  });
});
/* ============================================================
   CONTACT PAGE JS — validation, lazy map load, copy address
   Append to js/scripts.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const contactPage = document.querySelector('.contact-page');
  if (!contactPage) return;

  // Elements
  const form = document.getElementById('contactForm');
  const msgEl = document.getElementById('contactMsg');
  const mapWrap = document.querySelector('.contact-map');
  const copyBtn = document.getElementById('copyAddressBtn');

  // Simple client-side validation & fake-submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#cname').value.trim();
    const phone = form.querySelector('#cphone').value.trim();
    const message = form.querySelector('#cmsg').value.trim();

    // Basic checks
    if (!name || !phone || !message) {
      msgEl.textContent = 'Please fill in name, phone and message.';
      msgEl.className = 'form-msg error';
      return;
    }

    // Phone basic pattern (India-ish)
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s+/g,''))) {
      msgEl.textContent = 'Enter a valid phone number (digits only).';
      msgEl.className = 'form-msg error';
      return;
    }

    // Simulate sending (since no backend)
    msgEl.textContent = 'Sending...';
    msgEl.className = 'form-msg';
    setTimeout(() => {
      msgEl.textContent = 'Message sent — our team will contact you soon.';
      msgEl.className = 'form-msg success';
      form.reset();
    }, 900);
  });

  // Lazy-load map on click or when scrolled into view
  function loadMap() {
    if (!mapWrap) return;
    if (mapWrap.dataset.loaded) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'map-iframe';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = mapWrap.getAttribute('data-src') || 'https://www.google.com/maps?q=Basaveshwar%20Hospital&output=embed';
    mapWrap.innerHTML = '';
    mapWrap.appendChild(iframe);
    mapWrap.dataset.loaded = '1';
  }

  if (mapWrap) {
    mapWrap.addEventListener('click', loadMap, { once: true });
    // IntersectionObserver trigger
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) { loadMap(); obs.unobserve(ent.target); }
        });
      }, { root: null, threshold: 0.15 });
      io.observe(mapWrap);
    }
  }

  // Copy address to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const addressText = copyBtn.dataset.address || 'Basaveshwar Hospital, Your City, Karnataka — PIN';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(addressText);
        } else {
          const ta = document.createElement('textarea'); ta.value = addressText; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied ✓';
        setTimeout(()=> copyBtn.textContent = orig, 1400);
      } catch (err) {
        copyBtn.textContent = 'Copy failed';
        setTimeout(()=> copyBtn.textContent = 'Copy address', 1400);
      }
    });
  }

});
// Simple performant parallax for hero background
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  const img = document.querySelector('.hero-img.hero-img-parallax') || document.querySelector('.hero-img');
  if (!hero || !img) return;

  let latest = 0;
  let ticking = false;

  function onScroll() {
    latest = window.scrollY || window.pageYOffset;
    requestTick();
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function update() {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    // Calculate progress of hero relative to viewport center
    const heroCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const distance = heroCenter - viewportCenter;
    // normalize
    const max = windowHeight;
    const norm = clamp(distance / max, -1, 1);

    // translate background image slightly opposite to scroll for subtle parallax
    const translateY = norm * -20; // up to +-20px
    const scale = 1.03 - Math.abs(norm) * 0.01; // slight scale variation
    img.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', requestTick);

  // initial frame
  update();
})();
/* Premium Parallax Background Effect */

(function(){
  const img = document.querySelector('.hero-img.hero-enhanced');
  if (!img) return;

  let scrollY = 0;
  let ticking = false;

  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    ticking = false;
    const offset = scrollY * 0.08;   // Smooth parallax
    img.style.transform = `translateY(${offset}px) scale(1.02)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
/* ============================================================
   DOCTORS PAGE JS — modal open / close
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector('.doc-modal');
  if (!modal) return; // Only run on doctors.html

  const modalImg = modal.querySelector('img');
  const modalName = modal.querySelector('.doc-name');
  const modalSpec = modal.querySelector('.doc-spec');
  const modalDays = modal.querySelector('.doc-days-modal');

  document.querySelectorAll('.doc-card').forEach(card => {
    card.querySelector('.view-btn').addEventListener('click', () => {
      modalImg.src = card.dataset.img;
      modalName.textContent = card.dataset.name;
      modalSpec.textContent = card.dataset.special;
      modalDays.textContent = card.dataset.days;

      modal.classList.add('open');
      document.body.classList.add('modal-open');
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('doc-modal-close')) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  });
});
/* ===================== FULL UPGRADE JS =====================
   Splits headline, animates words, ambient light, auto contrast,
   glow card, and advanced reveal observer. Append to scripts.js
   ========================================================== */

(function(){
  // Respect reduced motion
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    // ensure reveals are visible
    document.querySelectorAll('.reveal-adv, .hero-title .word, .hero-ctas .btn').forEach(el => el.classList.add('in-view'));
    return;
  }

  // util: set CSS var on an element
  const setVar = (el, name, value) => el && el.style.setProperty(name, value);

  // 1) HEADLINE: split into spans if not already
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent.trim();
    // Avoid double-splitting
    if (!heroTitle.dataset.split) {
      heroTitle.innerHTML = '';
      const words = text.split(/\s+/);
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w + (i < words.length-1 ? '\u00A0' : '');
        heroTitle.appendChild(span);
      });
      heroTitle.dataset.split = '1';
    }
  }

  // 2) Ambient: create ambient element if missing
  let ambient = document.querySelector('.hero .ambient');
  const heroEl = document.querySelector('.hero');
  if (heroEl && !ambient) {
    ambient = document.createElement('div');
    ambient.className = 'ambient';
    heroEl.insertBefore(ambient, heroEl.firstChild);
  }

  // 3) Parallax + ambient follow pointer (subtle)
  const heroImg = document.querySelector('.hero-img');
  function onScrollParallax() {
    if (!heroEl || !heroImg) return;
    const rect = heroEl.getBoundingClientRect();
    const winH = window.innerHeight;
    const centerDist = (rect.top + rect.height/2) - winH/2;
    const norm = Math.max(-1, Math.min(1, centerDist / winH));
    // parallax translate
    const ty = norm * -18;
    heroImg.style.transform = `translateY(${ty}px) scale(1.02)`;
    // ambient move: set CSS vars
    const ambientX = 50 + norm * -8; // shift left/right
    const ambientY = 20 + norm * 6;  // vertical subtle
    setVar(heroEl, '--ambient-x', ambientX + '%');
    setVar(heroEl, '--ambient-y', ambientY + '%');
  }
  window.addEventListener('scroll', onScrollParallax, { passive: true });
  window.addEventListener('resize', onScrollParallax);
  onScrollParallax();

  // 4) AUTO-CONTRAST: sample hero image brightness (center area)
  // If image not loaded yet, wait for load.
  function sampleHeroBrightness(imgEl, cb) {
    try {
      const img = imgEl;
      // create an offscreen canvas
      const canvas = document.createElement('canvas');
      const w = Math.min(200, img.naturalWidth);
      const h = Math.min(120, img.naturalHeight);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      // draw center crop
      const sx = Math.max(0, (img.naturalWidth - w)/2);
      const sy = Math.max(0, (img.naturalHeight - h)/2);
      ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
      const data = ctx.getImageData(0,0,w,h).data;
      let total = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        // luminance formula
        const r = data[i], g = data[i+1], b = data[i+2];
        const lum = 0.2126*r + 0.7152*g + 0.0722*b;
        total += lum; count++;
      }
      const avg = total / count; // 0..255
      cb(null, avg / 255);
    } catch (err) {
      cb(err, 0.45);
    }
  }

  function applyAutoContrast() {
    if (!heroImg || !heroEl) return;
    const apply = (norm) => {
      // norm: 0 (very dark) .. 1 (very bright)
      // we want stronger overlay when image is bright so text remains readable
      // overlay strength (0..1) = clamp(0.36 + (norm * 0.6), 0.36, 0.86)
      const strength = Math.max(0.32, Math.min(0.86, 0.36 + (norm * 0.6)));
      setVar(heroEl, '--hero-overlay-strong', strength.toFixed(2));
    };

    if (heroImg.complete && heroImg.naturalWidth) {
      sampleHeroBrightness(heroImg, (err, val) => apply(err ? 0.45 : val));
    } else {
      heroImg.addEventListener('load', () => {
        sampleHeroBrightness(heroImg, (err, val) => apply(err ? 0.45 : val));
      });
    }
  }
  applyAutoContrast();
  // Re-apply if window resized or image source changed
  window.addEventListener('resize', applyAutoContrast);

  // 5) HEADLINE & CTA stagger reveal on DOMContentLoaded
  function staggerHeroText() {
    const words = heroEl ? heroEl.querySelectorAll('.hero-title .word') : [];
    words.forEach((w, i) => {
      setTimeout(() => { w.style.opacity = '1'; w.style.transform = 'translateY(0) scale(1)'; }, 160 + i * 70);
    });
    // reveal CTA buttons
    const ctas = heroEl ? heroEl.querySelectorAll('.hero-ctas .btn') : [];
    ctas.forEach((b, i) => {
      setTimeout(() => { b.style.opacity = '1'; b.style.transform = 'translateY(0)'; }, 520 + i * 140);
    });
    // accent bar
    const accent = heroEl ? heroEl.querySelector('.hero-title-accent') : null;
    if (accent) setTimeout(()=> accent.style.opacity = '1', 640);
  }
  // trigger after small delay so image/ambient looks ready
  document.addEventListener('DOMContentLoaded', () => setTimeout(staggerHeroText, 120));

  // 6) Glow the right card (if present)
  const rightCard = document.querySelector('.hero-right .hero-card');
  if (rightCard) {
    rightCard.classList.add('glow');
    // subtle entrance
    rightCard.style.opacity = 0;
    setTimeout(()=> { rightCard.style.transition = 'opacity 520ms ease, transform 420ms ease'; rightCard.style.opacity = 1; }, 260);
  }

  // 7) Advanced reveal observer for other blocks
  const OBS_OPTS = { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 };
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('in-view');
        obs.unobserve(ent.target);
      }
    });
  }, OBS_OPTS);

  document.querySelectorAll('.reveal-adv').forEach(el => revealObserver.observe(el));
  // also observe elements with earlier .reveal class if present
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // done
})();
// Contact page small helpers: copy address & tiny feedback
document.addEventListener('DOMContentLoaded', function () {
  const copyBtn = document.querySelector('.copy-address-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const addr = copyBtn.dataset.address || 'Basaveshwar Hospital, Your City, Karnataka';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(addr);
      } else {
        const ta = document.createElement('textarea');
        ta.value = addr; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = 'Copied ✓';
      setTimeout(()=> copyBtn.innerHTML = orig, 1400);
    } catch (err) {
      copyBtn.innerHTML = 'Copy failed';
      setTimeout(()=> copyBtn.innerHTML = 'Copy address', 1400);
    }
  });
});

