/* ============================================================
   EZECON 2026 — Shared JavaScript
   Navigation, animations, registration (Razorpay), login, dashboard
   ============================================================ */

(function () {
  'use strict';

  // ---- Configuration ----
  const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbw_7KNj-ySBdzuohkTLL3pjWjfGiqjLKL3t151UgXuV1-0H6TUPIFoTMJRb5j_4WIpHaA/exec',   // Replace with deployed Apps Script URL
    RZP_KEY: 'rzp_live_S9kFXcSkm7C1Rc',       // Replace with Razorpay key
    ANIMATION_THRESHOLD: 0.15,
    TOAST_DURATION: 4000,
    LOADER_DELAY: 600
  };

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadComponent('nav-placeholder', 'nav.html', initNavigation);
    loadComponent('footer-placeholder', 'footer.html');
    initScrollAnimations();
    initSmoothScroll();
    initBackToTop();
    initLoader();
  }

  // ============================================================
  // COMPONENT LOADER
  // ============================================================
  function loadComponent(placeholderId, file, callback) {
    const el = document.getElementById(placeholderId);
    if (!el) return;
    fetch(file + '?v=' + Date.now())
      .then(r => r.text())
      .then(html => {
        el.innerHTML = html;
        if (callback) callback();
        highlightActiveNav();
      })
      .catch(err => console.warn('Failed to load ' + file + ':', err));
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const mobile = document.querySelector('.nav-mobile');
    const overlay = document.querySelector('.nav-overlay');
    const navbar = document.querySelector('.navbar');

    function closeMenu() {
      if (toggle) toggle.classList.remove('active');
      if (mobile) mobile.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        if (mobile.classList.contains('open')) {
          closeMenu();
        } else {
          toggle.classList.add('active');
          mobile.classList.add('open');
          if (overlay) overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
      mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
      if (overlay) overlay.addEventListener('click', closeMenu);
    }

    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    }
  }

  function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) link.classList.add('active');
    });
  }

  // ============================================================
  // SCROLL ANIMATIONS
  // ============================================================
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.ANIMATION_THRESHOLD });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => observer.observe(el));
    }, 500);
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
      }
    });
  }

  // ============================================================
  // BACK TO TOP
  // ============================================================
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ============================================================
  // PAGE LOADER
  // ============================================================
  function initLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }, CONFIG.LOADER_DELAY);
    });
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  window.showToast = function (message, type) {
    type = type || 'success';
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-message">' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
  };

  // ============================================================
  // REGISTRATION — PRICING LOGIC
  // ============================================================
  window.calculateCurrentPrice = function () {
    const delType = document.getElementById('reg-delegate-type');
    const hasGala = document.getElementById('reg-gala');
    if (!delType) return { total: 0, confPrice: 0, galaPrice: 0, delType: '' };

    const category = delType.value;
    const gala = hasGala ? hasGala.checked : false;
    const now = new Date();
    const earlyBirdEnd = new Date('2026-06-30T23:59:59');
    const isEarlyBird = now <= earlyBirdEnd;

    let confPrice = 0;
    if (category === 'SEMI Member') {
      confPrice = isEarlyBird ? 2000 : 2500;
    } else if (category === 'Non-SEMI Member') {
      confPrice = isEarlyBird ? 2500 : 3000;
    } else if (category === 'PG Resident') {
      confPrice = isEarlyBird ? 1500 : 2000;
    }

    const galaPrice = gala ? 3000 : 0;
    return {
      total: confPrice + galaPrice,
      confPrice: confPrice,
      galaPrice: galaPrice,
      delType: category,
      isEarlyBird: isEarlyBird,
      hasGala: gala
    };
  };

  window.updateTotalAmount = function () {
    const priceData = calculateCurrentPrice();
    const display = document.getElementById('total-display');
    if (display) {
      display.textContent = '₹' + priceData.total.toLocaleString('en-IN');
    }
  };

  // ============================================================
  // REGISTRATION — RAZORPAY + BACKEND
  // ============================================================
  window.payAndRegister = function () {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const institution = document.getElementById('reg-institution').value.trim();
    const city = document.getElementById('reg-city').value.trim();
    const designation = document.getElementById('reg-designation').value.trim();
    const pass = document.getElementById('reg-password').value.trim();
    const food = document.getElementById('reg-food').value;
    const category = document.getElementById('reg-delegate-type').value;

    if (!name || !email || !phone || !institution || !city || !designation || !pass) {
      return showToast('Please fill all required fields.', 'error');
    }
    if (!category) {
      return showToast('Please select a delegate category.', 'error');
    }
    if (!food) {
      return showToast('Please select food preference.', 'error');
    }
    if (pass.length < 6) {
      return showToast('Password must be at least 6 characters.', 'error');
    }
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showToast('Please enter a valid email address.', 'error');
    }

    const priceData = calculateCurrentPrice();
    const amount = priceData.total;

    if (amount === 0) {
      return showToast('Invalid registration amount. Please select a category.', 'error');
    }

    const regType = category + (priceData.hasGala ? ' + Gala Dinner' : '');









    // ==========================================
    // TESTING BYPASS: Skip Razorpay for testing
    // If name is 'test' or 'testing', bypass payment
    // ==========================================
    // if (name.toLowerCase() === 'test' || name.toLowerCase() === 'testing') {
    //   showToast('TEST MODE: Skipping Razorpay payment...', 'info');
    //   // Simulate slight delay then register directly
    //   setTimeout(() => {
    //     registerBackend('pay_TEST_' + Date.now(), regType, amount);
    //   }, 1000);
    //   return;
    // }
    // ==========================================






    // Razorpay Payment
    var options = {
      key: CONFIG.RZP_KEY,
      amount: amount * 100,
      currency: 'INR',
      name: 'EZECON 2026',
      description: regType + ' Registration',
      handler: function (response) {
        registerBackend(response.razorpay_payment_id, regType, amount);
      },
      prefill: { name: name, email: email, contact: phone },
      theme: { color: '#1B4F72' }
    };

    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast('Payment Failed: ' + response.error.description, 'error');
    });
    rzp.open();
  };

  function registerBackend(paymentId, regType, amount) {
    const btn = document.getElementById('reg-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

    const data = {
      action: 'register',
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      phone: document.getElementById('reg-phone').value.trim(),
      institution: document.getElementById('reg-institution').value.trim(),
      city: document.getElementById('reg-city').value.trim(),
      designation: document.getElementById('reg-designation').value.trim(),
      password: document.getElementById('reg-password').value.trim(),
      delegateType: document.getElementById('reg-delegate-type').value,
      foodPreference: document.getElementById('reg-food').value,
      hasGala: document.getElementById('reg-gala') ? document.getElementById('reg-gala').checked : false,
      regType: regType,
      amount: amount,
      paymentId: paymentId
    };

    const sendRequest = function (retryCount) {
      fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify(data) })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (result) {
          if (btn) { btn.disabled = false; btn.textContent = 'Proceed to Payment'; }
          if (result.success) {
            showToast('Registration Successful! Check your email for confirmation.', 'success');
            setTimeout(function () { window.location.href = 'login.html'; }, 2000);
          } else {
            showToast('Error: ' + (result.message || 'Registration failed'), 'error');
          }
        })
        .catch(function (error) {
          if (retryCount < 1) {
            setTimeout(function () { sendRequest(retryCount + 1); }, 2000);
          } else {
            if (btn) { btn.disabled = false; btn.textContent = 'Proceed to Payment'; }
            showToast('Server Error. Payment ID: ' + paymentId + '. Contact support.', 'error');
          }
        });
    };
    sendRequest(0);
  }

  // ============================================================
  // LOGIN
  // ============================================================
  window.loginUser = function () {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) return showToast('Please fill all fields.', 'error');

    const btn = document.getElementById('login-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

    fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email: email, password: password })
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
        if (result.success) {
          localStorage.setItem('ezecon_session', JSON.stringify(result));
          showToast('Login successful!', 'success');
          setTimeout(function () { window.location.href = 'dashboard.html'; }, 800);
        } else {
          showToast(result.message || 'Invalid credentials.', 'error');
        }
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
        showToast('Network error. Please try again.', 'error');
      });
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  window.logout = function () {
    localStorage.removeItem('ezecon_session');
    showToast('Logged out successfully.', 'success');
    setTimeout(function () { window.location.href = 'index.html'; }, 500);
  };

  // ============================================================
  // PROGRAM TABS
  // ============================================================
  window.initProgramTabs = function () {
    const tabs = document.querySelectorAll('.tab-btn');
    const timelines = document.querySelectorAll('.program-timeline');
    if (tabs.length === 0) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        timelines.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var day = tab.getAttribute('data-day');
        var target = document.querySelector('.program-timeline[data-day="' + day + '"]');
        if (target) target.classList.add('active');
      });
    });
  };

  // Expose config
  window.EZECON_CONFIG = CONFIG;

})();

// Init program tabs after DOM loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { if (typeof initProgramTabs === 'function') initProgramTabs(); });
} else {
  if (typeof initProgramTabs === 'function') initProgramTabs();
}
