const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* =========================
   السنة الحالية
========================= */
const yearEl = $('#year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* =========================
   القائمة الرئيسية
========================= */
const menuBtn = $('#menuBtn');
const nav = $('#mainNav');

menuBtn?.addEventListener('click', () => {
  nav?.classList.toggle('open');
});

$$('#mainNav a').forEach((a) => {
  a.addEventListener('click', () => {
    nav?.classList.remove('open');
  });
});

/* =========================
   الشريط الإعلاني
========================= */
const ticker = $('#tickerTrack');
const pauseBtn = $('#pauseTicker');

let tickerPaused = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/*
  تجهيز الشريط الإعلاني
  يتم تكرار الإعلانات حتى تستمر الحركة
  بصورة متواصلة بدون ظهور فراغ.
*/
function buildTicker(announcements) {
  if (!ticker) return;

  const items = Array.isArray(announcements)
    ? announcements
        .filter((a) => a && a.visible !== false)
        .map((a) => a.text || a.title || '')
        .filter(Boolean)
    : [];

  if (!items.length) {
    ticker.innerHTML = '';
    ticker.classList.add('ticker-empty');
    return;
  }

  ticker.classList.remove('ticker-empty');

  /*
    نكرر المحتوى مرتين حتى يمكن عمل حركة
    مستمرة وسلسة.
  */
  const repeated = [...items, ...items];

  ticker.innerHTML = repeated
    .map(
      (text) => `
        <span class="ticker-item">
          ${escapeHtml(text)}
        </span>
      `
    )
    .join('');

  /*
    إعطاء مدة مناسبة للحركة حسب عدد الإعلانات
  */
  const itemCount = items.length;
  const duration = Math.max(18, itemCount * 8);

  ticker.style.setProperty('--ticker-duration', `${duration}s`);
  ticker.style.animationPlayState = tickerPaused ? 'paused' : 'running';
}

/* زر إيقاف / تشغيل */
pauseBtn?.addEventListener('click', (e) => {
  tickerPaused = !tickerPaused;

  if (ticker) {
    ticker.style.animationPlayState = tickerPaused
      ? 'paused'
      : 'running';
  }

  e.currentTarget.textContent = tickerPaused ? '▶' : 'Ⅱ';

  e.currentTarget.setAttribute(
    'aria-label',
    tickerPaused ? 'تشغيل الحركة' : 'إيقاف الحركة'
  );
});

/*
  أزرار السابق والتالي
*/
$('[data-next]')?.addEventListener('click', () => {
  if (!ticker) return;

  ticker.classList.add('manual-move');

  const first = ticker.firstElementChild;

  if (first) {
    ticker.appendChild(first);
  }

  setTimeout(() => {
    ticker.classList.remove('manual-move');
  }, 50);
});

$('[data-prev]')?.addEventListener('click', () => {
  if (!ticker) return;

  ticker.classList.add('manual-move');

  const last = ticker.lastElementChild;

  if (last) {
    ticker.insertBefore(last, ticker.firstElementChild);
  }

  setTimeout(() => {
    ticker.classList.remove('manual-move');
  }, 50);
});

/* =========================
   المحتوى القادم من لوحة التحكم
========================= */
(async function loadManagedContent() {
  try {
    const response = await fetch('/api/public', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const d = await response.json();

    /* =========================
       الإعلانات
    ========================= */
    buildTicker(d.announcements || []);

    /* =========================
       شرائح الواجهة الرئيسية
    ========================= */
    const heroBox = $('#heroSlides');
    const dotsBox = $('#heroDots');

    if (
      heroBox &&
      dotsBox &&
      Array.isArray(d.hero) &&
      d.hero.length
    ) {
      heroBox.innerHTML = d.hero
        .map(
          (h, i) => `
            <div
              class="hero-slide ${i === 0 ? 'active' : ''}"
              style="background-image:url('${String(
                h.image || ''
              ).replace(/'/g, '%27')}')"
            ></div>
          `
        )
        .join('');

      dotsBox.innerHTML = d.hero
        .map(
          (_, i) =>
            `<button class="${i === 0 ? 'active' : ''}" aria-label="الشريحة ${
              i + 1
            }"></button>`
        )
        .join('');

      const slides = [
        ...heroBox.querySelectorAll('.hero-slide')
      ];

      const dots = [
        ...dotsBox.querySelectorAll('button')
      ];

      let index = 0;

      function goToSlide(i) {
        if (!slides.length) return;

        index = (i + slides.length) % slides.length;

        slides.forEach((slide, n) => {
          slide.classList.toggle('active', n === index);
        });

        dots.forEach((dot, n) => {
          dot.classList.toggle('active', n === index);
        });

        const h = d.hero[index];

        const creditText = $('#photoCreditText');
        const creditLink = $('#photoCreditLink');

        if (creditText) {
          creditText.textContent =
            `الصورة: ${h.caption || ''} —`;
        }

        if (creditLink) {
          creditLink.textContent = h.source || '';
          creditLink.href = h.url || '#';
        }
      }

      $('.hero-next')?.addEventListener('click', () => {
        goToSlide(index + 1);
      });

      $('.hero-prev')?.addEventListener('click', () => {
        goToSlide(index - 1);
      });

      dots.forEach((button, n) => {
        button.addEventListener('click', () => {
          goToSlide(n);
        });
      });

      goToSlide(0);

      if (slides.length > 1) {
        setInterval(() => {
          goToSlide(index + 1);
        }, 7000);
      }
    }

    /* =========================
       قسم عن المركز
    ========================= */
    if (d.settings) {
      const aboutTitle = $('.about-copy h2');
      const aboutParagraphs = $$('.about-copy p');

      if (aboutTitle) {
        aboutTitle.textContent =
          d.settings.aboutTitle ||
          aboutTitle.textContent;
      }

      if (aboutParagraphs[0]) {
        aboutParagraphs[0].textContent =
          d.settings.aboutText1 ||
          aboutParagraphs[0].textContent;
      }

      if (aboutParagraphs[1]) {
        aboutParagraphs[1].textContent =
          d.settings.aboutText2 ||
          aboutParagraphs[1].textContent;
      }
    }

    /* =========================
       البحوث والدراسات
    ========================= */
    const research = $('#researchGrid');

    if (
      research &&
      Array.isArray(d.documents) &&
      d.documents.length
    ) {
      research.innerHTML = d.documents
        .map((doc, i) => {
          const title =
            doc.title ||
            doc.name ||
            `بحث ودراسة ${i + 1}`;

          const text =
            doc.description ||
            doc.text ||
            'إصدار علمي من منشورات مركز دراسات السلام والتنمية.';

          const href =
            doc.url ||
            doc.file ||
            doc.path ||
            '#';

          return `
            <article class="research-card">
              <div class="research-icon">▤</div>

              <div>
                <span class="research-tag">
                  بحث ودراسة
                </span>

                <h3>${escapeHtml(title)}</h3>

                <p>${escapeHtml(text)}</p>

                <a
                  href="${escapeHtml(href)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  فتح البحث ←
                </a>
              </div>
            </article>
          `;
        })
        .join('');
    }

    /* =========================
       البرامج
    ========================= */
    const programs = $('.program-grid');

    if (
      programs &&
      Array.isArray(d.programs)
    ) {
      programs.innerHTML = d.programs
        .map(
          (p, i) => `
            <article>
              <span class="num">
                ${String(i + 1).padStart(2, '0')}
              </span>

              <h3>
                ${escapeHtml(p.title || '')}
              </h3>

              <p>
                ${escapeHtml(p.text || '')}
              </p>
            </article>
          `
        )
        .join('');
    }

    /* =========================
       الأخبار
    ========================= */
    const news = $('.news-grid');

    if (
      news &&
      Array.isArray(d.news)
    ) {
      news.innerHTML = d.news
        .map((n, i) => {
          const icons = [
            '🕊️',
            '📚',
            '🎓',
            '🤝',
            '🌱',
            '📰'
          ];

          const icon =
            n.icon ||
            icons[i % icons.length];

          const category =
            n.category ||
            n.type ||
            'أخبار المركز';

          const imageStyle = n.image
            ? `background-image:url('${String(
                n.image
              ).replace(/'/g, '%27')}')`
            : '';

          return `
            <article class="news-card">

              <div
                class="news-img"
                style="${imageStyle}"
              >
                <span class="news-icon">
                  ${escapeHtml(icon)}
                </span>
              </div>

              <div class="news-body">

                <div class="news-meta">
                  <small>
                    ${escapeHtml(category)}
                  </small>

                  <time>
                    ${escapeHtml(n.date || '')}
                  </time>
                </div>

                <h3>
                  ${escapeHtml(n.title || '')}
                </h3>

                <p>
                  ${escapeHtml(n.text || '')}
                </p>

                <a href="#contact">
                  اقرأ المزيد <b>←</b>
                </a>

              </div>

            </article>
          `;
        })
        .join('');
    }

  } catch (e) {
    console.warn(
      'Managed content unavailable',
      e
    );
  }
})();
