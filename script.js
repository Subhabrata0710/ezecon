/* ============================================================
   EZECON 2026 — Shared JavaScript
   Navigation, animations, registration (Razorpay), login, dashboard
   ============================================================ */

(function () {
  'use strict';

  // ---- Configuration ----
  const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycby_Q5vkRDgSWkyrXhXxpjGzy-z2mGL-AiGt9H-eJBLYblK8COcU_jCWknefcVGe6JDRSw/exec',   // Replace with deployed Apps Script URL
    RZP_KEY: 'rzp_live_Ss2p3xvUwcYje7',       // Replace with Razorpay key
    ANIMATION_THRESHOLD: 0.15,
    TOAST_DURATION: 4000,
    LOADER_DELAY: 600
  };

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadComponent('marquee-placeholder', 'marquee.html');
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
    const workshop = document.getElementById('reg-workshop');
    const hasConf = document.getElementById('reg-conf');
    const simwars = document.getElementById('reg-simwars');

    if (!delType) return { total: 0, confPrice: 0, galaPrice: 0, workshopPrice: 0, simwarsPrice: 0, delType: '' };

    const category = delType.value;
    const gala = hasGala ? hasGala.checked : false;
    const workshopCategory = workshop ? workshop.value : '';
    const simwarsSelected = simwars ? simwars.value : 'No';
    const isConfSelected = hasConf ? hasConf.checked : true;
    const now = new Date();
    const earlyBirdEnd = new Date('2026-06-30T23:59:59');
    let isEarlyBird = now <= earlyBirdEnd;

    let voucherCode = document.getElementById('reg-voucher') ? document.getElementById('reg-voucher').value.trim().toUpperCase() : '';
    if (voucherCode === 'EARLYBIRD') {
      isEarlyBird = true;
    }

    let confPrice = 0;
    if (isConfSelected) {
      if (category === 'SEMI Member' || category === 'Faculty') {
        confPrice = isEarlyBird ? 2000 : 2500;
      } else if (category === 'Non-SEMI Member') {
        confPrice = isEarlyBird ? 2500 : 3000;
      } else if (category === 'PG Resident') {
        confPrice = isEarlyBird ? 1500 : 2000;
      }
    }
    // else if (category === 'Faculty') {
    //   confPrice = 0;
    // }

    const galaPrice = (gala && category !== 'Faculty') ? 3000 : 0;

    let workshopPrice = 0;
    if (workshopCategory === 'Doctors') {
      workshopPrice = 1000;
    } else if (workshopCategory === 'Nurses') {
      workshopPrice = 600;
    }

    let simwarsPrice = 0;
    if (simwarsSelected === 'Yes') {
      simwarsPrice = 3000 - confPrice;
      if (simwarsPrice < 0) simwarsPrice = 0;
    }

    let total = confPrice + galaPrice + workshopPrice + simwarsPrice;
    let discount = 0;
    let voucherMsg = '';
    let voucherStatus = 'success';

    if (voucherCode) {
      if (voucherCode === 'EARLYBIRD') {
        voucherMsg = 'Early bird pricing applied.';
      } else if (voucherCode === 'SEMI1000') {
        if (category === 'SEMI Member') {
          discount = 1000;
          voucherMsg = '₹1,000 discount applied.';
        } else {
          voucherMsg = 'Voucher only valid for SEMI Members.';
          voucherStatus = 'error';
        }
      } else if (voucherCode === 'FREEUNIVERSAL') {
        discount = total;
        voucherMsg = 'Free registration applied.';
      } else if (voucherCode === 'DOC1000') {
        discount = 1000;
        voucherMsg = 'Flat ₹1,000 discount applied.';
      } else if (voucherCode === 'SEMI2000') {
        if (category === 'SEMI Member') {
          discount = 2000;
          voucherMsg = '₹2,000 discount applied.';
        } else {
          voucherMsg = 'Voucher only valid for SEMI Members.';
          voucherStatus = 'error';
        }
      } else if (voucherCode === 'NONSEMI2000') {
        if (category === 'Non-SEMI Member') {
          discount = 2000;
          voucherMsg = '₹2,000 discount applied.';
        } else {
          voucherMsg = 'Voucher only valid for Non-SEMI Members.';
          voucherStatus = 'error';
        }
      } else {
        voucherMsg = 'Invalid voucher code.';
        voucherStatus = 'error';
      }
    }

    total = total - discount;
    if (total < 0) total = 0;

    return {
      total: total,
      discount: discount,
      voucherMsg: voucherMsg,
      voucherStatus: voucherStatus,
      confPrice: confPrice,
      galaPrice: galaPrice,
      workshopPrice: workshopPrice,
      simwarsPrice: simwarsPrice,
      delType: category,
      workshopCategory: workshopCategory,
      simwarsSelected: simwarsSelected,
      isConfSelected: isConfSelected,
      isEarlyBird: isEarlyBird,
      hasGala: gala
    };
  };

  window.updateTotalAmount = function () {
    const delType = document.getElementById('reg-delegate-type');
    const hasGala = document.getElementById('reg-gala');
    const galaWrapper = document.getElementById('gala-wrapper');
    const workshop = document.getElementById('reg-workshop');
    const confCheckbox = document.getElementById('reg-conf');
    const confText = document.getElementById('reg-conf-text');

    if (workshop && confCheckbox) {
      if (workshop.value === 'Nurses') {
        confCheckbox.disabled = false;
        if (confText) confText.textContent = 'Conference Registration (Optional)';
      } else {
        confCheckbox.checked = true;
        confCheckbox.disabled = true;
        if (confText) confText.textContent = 'Conference Registration (Mandatory)';
      }
    }

    if (delType && hasGala) {
      const category = delType.value;
      const galaText = galaWrapper ? galaWrapper.querySelector('span') : null;

      if (category === 'SEMI Member' || category === 'Faculty') {
        hasGala.disabled = false;
        if (galaWrapper) galaWrapper.style.opacity = '1';
        if (galaText) {
          if (category === 'Faculty') {
            galaText.innerHTML = 'Add Gala Dinner &mdash; <span style="color:var(--color-success);font-weight:600;">Complementary</span>';
          } else {
            galaText.innerHTML = 'Add Gala Dinner &mdash; &#8377;3,000';
          }
        }
      } else {
        hasGala.checked = false;
        hasGala.disabled = true;
        if (galaWrapper) galaWrapper.style.opacity = '0.5';
        if (galaText) {
          galaText.innerHTML = 'Add Gala Dinner &mdash; &#8377;3,000';
        }
      }
    }

    const priceData = calculateCurrentPrice();
    const display = document.getElementById('total-display');
    if (display) {
      display.textContent = '₹' + priceData.total.toLocaleString('en-IN');
    }

    const voucherMsgEl = document.getElementById('voucher-message');
    if (voucherMsgEl && document.getElementById('reg-voucher') && document.getElementById('reg-voucher').value.trim() !== '') {
      voucherMsgEl.style.display = 'block';
      voucherMsgEl.textContent = priceData.voucherMsg;
      if (priceData.voucherStatus === 'error') {
        voucherMsgEl.style.color = 'var(--color-danger, red)';
      } else {
        voucherMsgEl.style.color = 'var(--color-success, green)';
      }
    } else if (voucherMsgEl) {
      voucherMsgEl.style.display = 'none';
    }
  };

  window.applyVoucher = function () {
    updateTotalAmount();
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
    const simwarsSelected = document.getElementById('reg-simwars') ? document.getElementById('reg-simwars').value : 'No';
    const teamName = document.getElementById('reg-simwars-team') ? document.getElementById('reg-simwars-team').value.trim() : '';

    if (!name || !email || !phone || !institution || !city || !designation || !pass) {
      return showToast('Please fill all required fields.', 'error');
    }
    if (!category) {
      return showToast('Please select a delegate category.', 'error');
    }
    if (!food) {
      return showToast('Please select food preference.', 'error');
    }
    if (simwarsSelected === 'Yes' && !teamName) {
      return showToast('Please enter your team name for SIMWARS.', 'error');
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
      return showToast('Invalid registration amount. Please select a category or workshop.', 'error');
    }

    let regTypeStr = category;
    if (!priceData.isConfSelected) {
      regTypeStr = 'Workshop Only';
    }

    let regType = regTypeStr + (priceData.hasGala ? ' + Gala Dinner' : '') + (priceData.workshopCategory ? ' + Workshop (' + priceData.workshopCategory + ')' : '');
    if (priceData.simwarsSelected === 'Yes') {
      regType += ' + SIMWARS (' + teamName + ')';
    }









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
      workshopCategory: document.getElementById('reg-workshop') ? document.getElementById('reg-workshop').value : '',
      simwarsSelected: document.getElementById('reg-simwars') ? document.getElementById('reg-simwars').value : 'No',
      teamName: document.getElementById('reg-simwars-team') ? document.getElementById('reg-simwars-team').value.trim() : '',
      voucherCode: document.getElementById('reg-voucher') ? document.getElementById('reg-voucher').value.trim().toUpperCase() : '',
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
    const tabs = document.querySelectorAll('.tab-btn[data-day]');
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
