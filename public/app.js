const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* القائمة */
const menuBtn = $('#menuBtn');
const nav = $('#mainNav');

menuBtn?.addEventListener('click', () => nav?.classList.toggle('open'));

$$('#mainNav a').forEach(a =>
  a.addEventListener('click', () => nav?.classList.remove('open'))
);


/* =========================================================
   الشريط الإعلاني
   تعديل الشريط فقط
========================================================= */

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


function setupTicker(items) {

  if (!ticker) return;

  const texts = (Array.isArray(items) ? items : [])
    .filter(a => a && a.visible !== false)
    .map(a => a.text || a.title || '')
    .filter(Boolean);

  if (!texts.length) {
    ticker.innerHTML = '';
    return;
  }

  /*
    تكرار الإعلانات حتى تستمر الحركة
    بصورة متواصلة.
  */
  const repeated = [...texts, ...texts];

  ticker.innerHTML = repeated.map(text => `
    <span class="ticker-item">
      ${escapeHtml(text)}
    </span>
  `).join('');


  /*
    تجهيز الشريط للحركة
  */

  const trackParent = ticker.parentElement;

  if (trackParent) {
    trackParent.style.overflow = 'hidden';
    trackParent.style.position = 'relative';
  }


  ticker.style.display = 'flex';
  ticker.style.width = 'max-content';
  ticker.style.maxWidth = 'none';
  ticker.style.alignItems = 'center';
  ticker.style.gap = '55px';
  ticker.style.direction = 'ltr';
  ticker.style.animation =
    'peaceTickerMove 28s linear infinite';
  ticker.style.willChange = 'transform';

  ticker.style.animationPlayState =
    tickerPaused ? 'paused' : 'running';


  ticker.querySelectorAll('.ticker-item').forEach(item => {

    item.style.display = 'inline-flex';
    item.style.flex = '0 0 auto';
    item.style.direction = 'rtl';
    item.style.whiteSpace = 'nowrap';

  });


  /*
    إضافة CSS الخاص بالشريط مرة واحدة فقط
  */

  if (!document.getElementById('peaceTickerStyle')) {

    const style = document.createElement('style');

    style.id = 'peaceTickerStyle';

    style.textContent = `

      @keyframes peaceTickerMove {

        from {
          transform: translateX(0);
        }

        to {
          transform: translateX(-50%);
        }

      }

      #tickerTrack .ticker-item {
        font-family: inherit;
      }

      #tickerTrack:hover {
        animation-play-state: paused !important;
      }

    `;

    document.head.appendChild(style);

  }

}


/* زر إيقاف وتشغيل الشريط */

pauseBtn?.addEventListener('click', e => {

  tickerPaused = !tickerPaused;

  if (ticker) {

    ticker.style.animationPlayState =
      tickerPaused ? 'paused' : 'running';

  }

  e.currentTarget.textContent =
    tickerPaused ? '▶' : 'Ⅱ';

  e.currentTarget.setAttribute(
    'aria-label',
    tickerPaused
      ? 'تشغيل الحركة'
      : 'إيقاف الحركة'
  );

});


/* زر الإعلان التالي */

$('[data-next]')?.addEventListener('click', () => {

  if (!ticker?.firstElementChild) return;

  ticker.appendChild(
    ticker.firstElementChild
  );

});


/* زر الإعلان السابق */

$('[data-prev]')?.addEventListener('click', () => {

  if (!ticker?.lastElementChild) return;

  ticker.insertBefore(
    ticker.lastElementChild,
    ticker.firstElementChild
  );

});


/* =========================================================
   المحتوى القادم من لوحة التحكم
========================================================= */

(async function loadManagedContent() {

  try {

    const r = await fetch('/api/public', {
      cache: 'no-store'
    });

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    const d = await r.json();


    /* =====================================================
       الإعلانات
    ===================================================== */

    setupTicker(
      d.announcements || []
    );


    /* =====================================================
       الواجهة الرئيسية
       الحفاظ على صورة التبلدي
    ===================================================== */

    const heroBox = $('#heroSlides');
    const dotsBox = $('#heroDots');


    /*
      صورة التبلدي الأصلية كصورة احتياطية
      إذا لم توجد صورة صحيحة في قاعدة البيانات.
    */

    const fallbackHero = [

      {
        image:
          'https://upload.wikimedia.org/wikipedia/commons/2/2b/Baobab_vibes_01.jpg',

        caption:
          'شجرة التبلدي في غرب كردفان',

        source:
          'Wikimedia Commons · CC BY-SA 4.0',

        url:
          'https://commons.wikimedia.org/wiki/File:Baobab_vibes_01.jpg'
      }

    ];


    const heroes =
      Array.isArray(d.hero)
        ? d.hero.filter(
            h => h && h.image
          )
        : [];


    const finalHeroes =
      heroes.length
        ? heroes
        : fallbackHero;


    if (heroBox && dotsBox) {

      heroBox.innerHTML =
        finalHeroes.map((h, i) => `

          <div
            class="hero-slide ${i === 0 ? 'active' : ''}"
            style="
              background-image:url('${String(
                h.image
              ).replace(/'/g, "%27")}')
            "
          ></div>

        `).join('');


      dotsBox.innerHTML =
        finalHeroes.map((_, i) => `

          <button
            class="${i === 0 ? 'active' : ''}"
            aria-label="الشريحة ${i + 1}"
          ></button>

        `).join('');


      const slides =
        [...heroBox.querySelectorAll(
          '.hero-slide'
        )];


      const dots =
        [...dotsBox.querySelectorAll(
          'button'
        )];


      let ix = 0;


      function go(i) {

        if (!slides.length) return;

        ix =
          (i + slides.length) %
          slides.length;


        slides.forEach((x, n) => {

          x.classList.toggle(
            'active',
            n === ix
          );

        });


        dots.forEach((x, n) => {

          x.classList.toggle(
            'active',
            n === ix
          );

        });


        const h =
          finalHeroes[ix];


        const t =
          $('#photoCreditText');

        const a =
          $('#photoCreditLink');


        if (t) {

          t.textContent =
            `الصورة: ${
              h.caption || ''
            } —`;

        }


        if (a) {

          a.textContent =
            h.source || '';

          a.href =
            h.url || '#';

        }

      }


      $('.hero-next')?.addEventListener(
        'click',
        () => go(ix + 1)
      );


      $('.hero-prev')?.addEventListener(
        'click',
        () => go(ix - 1)
      );


      dots.forEach((b, n) => {

        b.addEventListener(
          'click',
          () => go(n)
        );

      });


      go(0);


      if (slides.length > 1) {

        setInterval(
          () => go(ix + 1),
          7000
        );

      }

    }


    /* =====================================================
       عن المركز
    ===================================================== */

    if (d.settings) {

      const aboutTitle =
        $('.about-copy h2');

      const ps =
        $$('.about-copy p');


      if (aboutTitle) {

        aboutTitle.textContent =
          d.settings.aboutTitle ||
          aboutTitle.textContent;

      }


      if (ps[0]) {

        ps[0].textContent =
          d.settings.aboutText1 ||
          ps[0].textContent;

      }


      if (ps[1]) {

        ps[1].textContent =
          d.settings.aboutText2 ||
          ps[1].textContent;

      }

    }


    /* =====================================================
       البحوث والدراسات
    ===================================================== */

    const research =
      $('#researchGrid');


    if (
      research &&
      d.documents &&
      d.documents.length
    ) {

      research.innerHTML =
        d.documents.map(
          (doc, i) => {

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

                <div class="research-icon">
                  ▤
                </div>

                <div>

                  <span class="research-tag">
                    بحث ودراسة
                  </span>

                  <h3>
                    ${escapeHtml(title)}
                  </h3>

                  <p>
                    ${escapeHtml(text)}
                  </p>

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

          }
        ).join('');

    }


    /* =====================================================
       البرامج
    ===================================================== */

    const programs =
      $('.program-grid');


    if (
      programs &&
      d.programs
    ) {

      programs.innerHTML =
        d.programs.map(
          (p, i) => `

            <article>

              <span class="num">
                0${i + 1}
              </span>

              <h3>
                ${escapeHtml(
                  p.title || ''
                )}
              </h3>

              <p>
                ${escapeHtml(
                  p.text || ''
                )}
              </p>

            </article>

          `
        ).join('');

    }


    /* =====================================================
       الأخبار
    ===================================================== */

    const news =
      $('.news-grid');


    if (
      news &&
      d.news
    ) {

      news.innerHTML =
        d.news.map(
          (n, i) => {

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
              icons[
                i % icons.length
              ];


            const category =
              n.category ||
              n.type ||
              'أخبار المركز';


            return `

              <article class="news-card">

                <div
                  class="news-img"
                  style="${
                    n.image
                      ? `background-image:url('${String(
                          n.image
                        ).replace(
                          /'/g,
                          "%27"
                        )}')`
                      : ''
                  }"
                >

                  <span class="news-icon">
                    ${escapeHtml(icon)}
                  </span>

                </div>


                <div class="news-body">

                  <div class="news-meta">

                    <small>
                      ${escapeHtml(
                        category
                      )}
                    </small>

                    <time>
                      ${escapeHtml(
                        n.date || ''
                      )}
                    </time>

                  </div>


                  <h3>
                    ${escapeHtml(
                      n.title || ''
                    )}
                  </h3>


                  <p>
                    ${escapeHtml(
                      n.text || ''
                    )}
                  </p>


                  <a href="#contact">
                    اقرأ المزيد
                    <b>←</b>
                  </a>

                </div>

              </article>

            `;

          }
        ).join('');

    }


  } catch (e) {

    console.warn(
      'Managed content unavailable',
      e
    );

  }

})();
