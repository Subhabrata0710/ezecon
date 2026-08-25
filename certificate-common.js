/* ══════════════════════════════════════════════════════════
   Shared certificate generator logic — EZECON 2026
   Each certificate page calls window.initCertificateGenerator(config)
   with details specific to that certificate design.
   ══════════════════════════════════════════════════════════ */

(function () {
  const IMG_W = 5382;
  const IMG_H = 3805;

  // Font sizing per line type (natural pixels, auto-shrinks to fit)
  // A = name sits centered on its own dedicated line (larger, signature-style)
  // B = name sits inline within a sentence (smaller, matches paragraph text)
  const FONT_SETTINGS = {
    A: { base: 220, min: 70, yOffset: 18 },
    B: { base: 130, min: 45, yOffset: 14 }
  };

  const NAME_PREFIX = 'Dr. ';

  function normalizeName(str) {
    return str
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^dr\s+/, ''); // tolerate an accidental "Dr." typed by the user
  }

  window.initCertificateGenerator = function (config) {
    // config: {
    //   img, xStart, xEnd, lineY, lineType, filenamePart,
    //   requiresFacultyCheck (bool, optional)
    // }

    const canvas = document.getElementById('cert-canvas');
    const ctx = canvas.getContext('2d');
    const nameInput = document.getElementById('name-input');
    const downloadBtn = document.getElementById('download-btn');
    const placeholder = document.getElementById('canvas-placeholder');
    const loadingOverlay = document.getElementById('loading-overlay');
    const facultyStatus = document.getElementById('faculty-status');

    canvas.width = IMG_W;
    canvas.height = IMG_H;

    let certImage = null;
    let imageLoaded = false;
    let currentName = '';
    let currentFont = 'Pinyon Script';
    let renderScheduled = false;
    let facultyVerified = !config.requiresFacultyCheck; // true by default if no check needed

    const fontCfg = FONT_SETTINGS[config.lineType];
    const lineCenterX = (config.xStart + config.xEnd) / 2;
    const maxWidth = (config.xEnd - config.xStart) - 40;

    // ── Load certificate background image ──
    function loadImage() {
      certImage = new Image();
      certImage.onload = function () {
        imageLoaded = true;
        renderCertificate();
        placeholder.style.display = 'none';
        canvas.style.display = 'block';
      };
      certImage.onerror = function () {
        console.error('Failed to load certificate image:', config.img);
      };
      certImage.src = config.img;
    }

    // ── Faculty checker ──
    function checkFaculty(name) {
      if (!config.requiresFacultyCheck) return true;
      if (!Array.isArray(window.FACULTY_LIST)) return false;
      const target = normalizeName(name);
      if (!target) return false;
      return window.FACULTY_LIST.some(function (entry) {
        return normalizeName(entry) === target;
      });
    }

    function updateFacultyStatus() {
      if (!config.requiresFacultyCheck || !facultyStatus) return;

      const name = currentName.trim();
      if (!name) {
        facultyStatus.classList.remove('show', 'valid', 'invalid', 'checking');
        facultyVerified = false;
        return;
      }

      facultyVerified = checkFaculty(name);
      facultyStatus.classList.add('show');
      facultyStatus.classList.remove('checking');

      if (facultyVerified) {
        facultyStatus.classList.remove('invalid');
        facultyStatus.classList.add('valid');
        facultyStatus.innerHTML = '<span class="status-icon">✓</span><span>Verified faculty member — you can download your certificate.</span>';
      } else {
        facultyStatus.classList.remove('valid');
        facultyStatus.classList.add('invalid');
        facultyStatus.innerHTML = '<span class="status-icon">✕</span><span>This name was not found on the faculty list. Please check the spelling, or contact the organizing team if you believe this is an error.</span>';
      }
    }

    // ── Render certificate on canvas ──
    function renderCertificate() {
      if (!imageLoaded || !certImage) return;

      const name = currentName.trim();

      ctx.clearRect(0, 0, IMG_W, IMG_H);
      ctx.drawImage(certImage, 0, 0, IMG_W, IMG_H);

      if (!name) return;

      const displayText = NAME_PREFIX + name;
      const textY = config.lineY - fontCfg.yOffset;

      let fontSize = fontCfg.base;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      while (fontSize > fontCfg.min) {
        ctx.font = `${fontSize}px '${currentFont}', cursive`;
        const measured = ctx.measureText(displayText).width;
        if (measured <= maxWidth) break;
        fontSize -= 6;
      }

      ctx.font = `${fontSize}px '${currentFont}', cursive`;

      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillText(displayText, lineCenterX, textY);

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    function updateDownloadButtonState() {
      const name = currentName.trim();
      const canDownload = !!name && facultyVerified;
      if (canDownload) {
        downloadBtn.classList.add('visible');
        downloadBtn.disabled = false;
      } else {
        downloadBtn.classList.remove('visible');
        downloadBtn.disabled = true;
      }
    }

    function scheduleRender() {
      if (renderScheduled) return;
      renderScheduled = true;
      requestAnimationFrame(function () {
        renderScheduled = false;
        renderCertificate();
        updateFacultyStatus();
        updateDownloadButtonState();
      });
    }

    // ── Name input ──
    nameInput.addEventListener('input', function () {
      currentName = this.value;
      scheduleRender();
    });

    // ── Font picker ──
    document.querySelectorAll('input[name="font-style"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        currentFont = this.value;
        document.querySelectorAll('.font-option').forEach(function (opt) {
          opt.classList.remove('active');
        });
        this.closest('.font-option').classList.add('active');
        scheduleRender();
      });
    });

    // ── Download ──
    downloadBtn.addEventListener('click', function () {
      const name = currentName.trim();
      if (!name || !facultyVerified) return;

      loadingOverlay.classList.add('show');

      document.fonts.load(`${fontCfg.base}px '${currentFont}'`)
        .catch(function () { /* use fallback */ })
        .then(function () {
          renderCertificate();

          try {
            const dataURL = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            const safeName = name.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
            a.download = 'Certificate_Dr_' + safeName + '_' + config.filenamePart + '.png';
            a.href = dataURL;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed. Please try right-clicking the preview and choosing "Save image as".');
          } finally {
            loadingOverlay.classList.remove('show');
          }
        });
    });

    // ── Initialise fonts, then load the certificate image ──
    Promise.all([
      document.fonts.load(`220px 'Pinyon Script'`),
      document.fonts.load(`220px 'Alex Brush'`),
      document.fonts.load(`220px 'Great Vibes'`)
    ]).catch(function () { /* ignore missing fonts */ }).then(function () {
      loadImage();
    });
  };
})();
