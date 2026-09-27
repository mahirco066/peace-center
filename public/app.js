const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

$('#year').textContent = new Date().getFullYear();

const menuBtn = $('#menuBtn');
const nav = $('#mainNav');
menuBtn?.addEventListener('click', () => nav.classList.toggle('open'));
$$('#mainNav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const ticker = $('#tickerTrack');
let tickerPaused = false;
$('#pauseTicker')?.addEventListener('click', (e)=>{
  tickerPaused = !tickerPaused;
  ticker.style.animationPlayState = tickerPaused ? 'paused' : 'running';
  e.currentTarget.textContent = tickerPaused ? '▶' : 'Ⅱ';
});
$('[data-next]')?.addEventListener('click',()=>ticker.appendChild(ticker.firstElementChild));
$('[data-prev]')?.addEventListener('click',()=>ticker.insertBefore(ticker.lastElementChild,ticker.firstElementChild));

(async function loadManagedContent(){
  try{
    const r=await fetch('/api/public'); if(!r.ok)return; const d=await r.json();
    const ticker=document.querySelector('#tickerTrack');
    if(ticker&&d.announcements) ticker.innerHTML=d.announcements.map(a=>`<span>${a.text}</span>`).join('');
    const heroBox=document.querySelector('#heroSlides'), dotsBox=document.querySelector('#heroDots');
    if(heroBox&&d.hero&&d.hero.length){
      heroBox.innerHTML=d.hero.map((h,i)=>`<div class="hero-slide ${i===0?'active':''}" style="background-image:url('${String(h.image).replace(/'/g,"%27")}')"></div>`).join('');
      dotsBox.innerHTML=d.hero.map((_,i)=>`<button class="${i===0?'active':''}"></button>`).join('');
      const ns=[...heroBox.querySelectorAll('.hero-slide')], ds=[...dotsBox.querySelectorAll('button')]; let ix=0;
      function go(i){ix=(i+ns.length)%ns.length;ns.forEach((x,n)=>x.classList.toggle('active',n===ix));ds.forEach((x,n)=>x.classList.toggle('active',n===ix));const h=d.hero[ix],t=document.querySelector('#photoCreditText'),a=document.querySelector('#photoCreditLink');if(t)t.textContent=`الصورة: ${h.caption||''} —`;if(a){a.textContent=h.source||'';a.href=h.url||'#';}}
      document.querySelector('.hero-next')?.addEventListener('click',()=>go(ix+1));document.querySelector('.hero-prev')?.addEventListener('click',()=>go(ix-1));ds.forEach((b,n)=>b.addEventListener('click',()=>go(n)));go(0);setInterval(()=>go(ix+1),7000);
    }
    if(d.settings){const a=document.querySelector('.about-copy h2'),ps=document.querySelectorAll('.about-copy p');if(a)a.textContent=d.settings.aboutTitle||a.textContent;if(ps[0])ps[0].textContent=d.settings.aboutText1||ps[0].textContent;if(ps[1])ps[1].textContent=d.settings.aboutText2||ps[1].textContent;}
    const research=document.querySelector('#researchGrid');
    if(research&&d.documents&&d.documents.length){
      research.innerHTML=d.documents.map((doc,i)=>{
        const title=doc.title||doc.name||`بحث ودراسة ${i+1}`;
        const text=doc.description||doc.text||'إصدار علمي من منشورات مركز دراسات السلام والتنمية.';
        const href=doc.url||doc.file||doc.path||'#';
        return `<article class="research-card"><div class="research-icon">▤</div><div><span class="research-tag">بحث ودراسة</span><h3>${title}</h3><p>${text}</p><a href="${href}" target="_blank" rel="noopener noreferrer">فتح البحث ←</a></div></article>`;
      }).join('');
    }
    const programs=document.querySelector('.program-grid');if(programs&&d.programs)programs.innerHTML=d.programs.map((p,i)=>`<article><span class="num">0${i+1}</span><h3>${p.title}</h3><p>${p.text}</p></article>`).join('');
    const news=document.querySelector('.news-grid');if(news&&d.news)news.innerHTML=d.news.map(n=>`<article class="news-card"><div class="news-img" style="${n.image?`background-image:url('${n.image}')`:''}"></div><small>أخبار المركز</small><time>${n.date||''}</time><h3>${n.title}</h3><p style="font-size:10px;color:#657879;margin:0 12px 10px">${n.text||''}</p><a href="#news">اقرأ المزيد ←</a></article>`).join('');
  }catch(e){console.warn('Managed content unavailable',e)}
})();
