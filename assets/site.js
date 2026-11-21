document.documentElement.classList.add('js');
// Home page: before/after swipe with a slow first reveal, fade-ins, share.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sw = document.getElementById('swipe'), range = document.getElementById('swipeRange');
function setCut(v) { sw.style.setProperty('--cut', v + '%'); range.value = v; }
if (sw) {
  range.addEventListener('input', () => { userMoved = true; setCut(range.value); });
  let userMoved = false;
  const start = () => {
    if (reduce) { setCut(45); return; }
    const t0 = performance.now(), dur = 3200;
    const step = t => { if (userMoved) return; const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setCut(100 - 55 * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const imgs = [...sw.querySelectorAll('img')];
  Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = r; i.onerror = r; }))).then(() => setTimeout(start, 400));
}
// fade sections in as they scroll into view
const els = document.querySelectorAll('.reveal');
if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: .05, rootMargin: '0px 0px 10% 0px'});
  els.forEach(e => io.observe(e)); }
// share the site
async function share(url, title, text) {
  if (navigator.share) { try { await navigator.share({url, title, text}); return 'shared'; } catch (e) { return 'cancel'; } }
  try { await navigator.clipboard.writeText(url); return 'copied'; } catch (e) { prompt('Copy this link:', url); return 'prompt'; }
}
window.__share = share;
const ss = document.getElementById('shareSite');
if (ss) ss.onclick = async () => { const r = await share(location.href.split('#')[0], document.title, 'Zoom into a 2,000-year-old scroll buried by Vesuvius'); if (r === 'copied') { ss.textContent = 'Link copied ✓'; setTimeout(() => ss.textContent = 'Share this site', 2500); } };
// optional "a closer look" block
fetch('findings/finding.html').then(r => r.ok ? r.text() : '').then(t => { const f = document.getElementById('finding'); if (t && f) f.innerHTML = t; else if (f) f.remove(); }).catch(() => {});
