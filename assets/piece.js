// Piece page: deep zoom of the ink map + scan, display-only adjustments, compare, share the exact view.
const $ = id => document.getElementById(id);
const P = window.PIECE, Q = new URLSearchParams(location.search);
const VIEW = {mode: 'overlay', contrast: 1, bright: 0, invert: false, cut: 0, color: '#e3b25a', opacity: 80};
let viewer, team = null, inkTI = null, scanTI = null, ver = 1, inkLUT, scanLUT;
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

// 0-255 model score -> what you see. Nothing is written back; only the screen changes.
function isDarkInk(r, g, b) { return r + g + b < 80; }
function colorName() {
  const el = $('vColor');
  const opt = el && el.options[el.selectedIndex];
  return (opt && opt.text) || 'Gold';
}

function buildLUTs() {
  const lo = P.ink_lo, hi = P.ink_hi, k = VIEW.contrast, b = VIEW.bright, cutRaw = VIEW.cut ? VIEW.cut / 100 * 255 : -1;
  const [cr, cg, cb] = hexRGB(VIEW.color), op = VIEW.opacity / 100;
  const darkInk = VIEW.mode === 'overlay' && isDarkInk(cr, cg, cb);
  inkLUT = new Uint8ClampedArray(1024); scanLUT = new Uint8ClampedArray(1024);
  for (let v = 0; v < 256; v++) {
    let s = Math.max(0, Math.min(1, (v - lo) / Math.max(1, hi - lo))) * 255;
    s = Math.max(0, Math.min(255, (s - 128) * k + 128 + b));
    if (v < cutRaw || v === 0) s = 0;
    const o = v * 4;
    if (VIEW.mode === 'overlay') { inkLUT[o] = cr; inkLUT[o + 1] = cg; inkLUT[o + 2] = cb; inkLUT[o + 3] = op * s; }
    else { const y = VIEW.invert ? 255 - s : s; inkLUT[o] = inkLUT[o + 1] = inkLUT[o + 2] = y; inkLUT[o + 3] = 255; }
    let g;
    if (VIEW.mode === 'scan') g = Math.max(0, Math.min(255, (v - 128) * k + 128 + b));
    else if (darkInk && !VIEW.invert) g = Math.max(0, Math.min(255, 150 + v * 0.40));
    else g = v * 0.85;
    if (VIEW.invert) g = 255 - g;
    if (darkInk && !VIEW.invert) {
      scanLUT[o] = Math.min(255, g * 1.06);
      scanLUT[o + 1] = g;
      scanLUT[o + 2] = Math.max(0, g * 0.90);
    } else {
      scanLUT[o] = scanLUT[o + 1] = scanLUT[o + 2] = g;
    }
    scanLUT[o + 3] = 255;
  }
}
function onTileDrawing(e) {
  const isInk = e.tiledImage === inkTI, isScan = e.tiledImage === scanTI;
  if (!isInk && !isScan) return;
  const cv = e.rendered.canvas;
  if (cv._ver === ver) return;
  if (!cv._orig) cv._orig = e.rendered.getImageData(0, 0, cv.width, cv.height);
  const src = cv._orig.data, out = new ImageData(cv.width, cv.height), d = out.data, L = isInk ? inkLUT : scanLUT;
  for (let i = 0; i < src.length; i += 4) { const o = src[i] * 4; d[i] = L[o]; d[i + 1] = L[o + 1]; d[i + 2] = L[o + 2]; d[i + 3] = L[o + 3]; }
  e.rendered.clearRect(0, 0, cv.width, cv.height); e.rendered.putImageData(out, 0, 0); cv._ver = ver;
}
function apply() {
  buildLUTs(); ver++;
  if (inkTI) inkTI.setOpacity(VIEW.mode === 'scan' ? 0 : 1);
  if (scanTI) scanTI.setOpacity(VIEW.mode === 'ink' ? 0 : 1);
  $('mainLabel').textContent = {overlay: colorName() + ' = where the AI sees ink', ink: 'Ink only (bright = ink)', scan: 'The X-ray scan, no AI'}[VIEW.mode];
  document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x.dataset.mode === VIEW.mode));
  viewer && viewer.forceRedraw(); saveURL();
}
// --- the exact view lives in the URL, so "Share this view" can send it
let urlTimer, ready = false;
function saveURL() {
  if (!ready) return;
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    if (!viewer || !viewer.world.getItemCount()) return;
    const c = viewer.viewport.getCenter(true), z = viewer.viewport.getZoom(true), q = new URLSearchParams();
    q.set('x', c.x.toFixed(4)); q.set('y', c.y.toFixed(4)); q.set('z', z.toFixed(2)); q.set('view', VIEW.mode);
    if ($('osdTeam').hidden === false) q.set('compare', '1');
    history.replaceState(null, '', location.pathname + '?' + q.toString());
  }, 250);
}
async function shareView(btn) {
  saveURL(); await new Promise(r => setTimeout(r, 300));
  const url = location.href, title = `${P.title}: ink from 79 AD`, text = 'Look at this spot in a 2,000-year-old scroll buried by Vesuvius';
  if (navigator.share) { try { await navigator.share({title, text, url}); } catch (e) {} return; }
  let ok = false; try { await navigator.clipboard.writeText(url); ok = true; } catch (e) { prompt('Copy this link:', url); }
  if (ok && btn) { const t = btn.textContent; btn.textContent = 'Link copied ✓'; setTimeout(() => btn.textContent = t, 2500); }
}
// --- "show a friend" moment after the first deep zoom (once per visit)
let toastShown = !!Q.get('z');  // not for people arriving on a shared link
function maybeToast() {
  if (toastShown || !viewer) return;
  if (viewer.viewport.getZoom(true) / viewer.viewport.getHomeZoom() > 2.5) {
    toastShown = true; setTimeout(() => $('toast').classList.add('show'), 500);
    setTimeout(() => $('toast').classList.remove('show'), 14000);
  }
}
function toggleCompare(force) {
  const on = typeof force === 'boolean' ? force : $('osdTeam').hidden;
  $('osdTeam').hidden = !on; $('viewers').classList.toggle('split', on); $('compare').classList.toggle('on', on);
  $('compare').textContent = on ? 'Hide the team\'s picture' : 'Compare with the team\'s picture';
  if (on && !team) {
    team = OpenSeadragon({id: 'osdTeam', prefixUrl: '../vendor/openseadragon/images/', showNavigationControl: false,
      tileSources: {type: 'image', url: '../' + P.team_local, buildPyramid: false}, mouseNavEnabled: false,
      maxZoomPixelRatio: 64, minZoomImageRatio: 0.3, visibilityRatio: 0, animationTime: 0});
    team.addHandler('open', sync);
  }
  setTimeout(sync, 60); saveURL();
}
function sync() { if (team && !$('osdTeam').hidden && team.world.getItemCount()) team.viewport.fitBounds(viewer.viewport.getBounds(true), true); }

function wire() {
  const bind = (id, key, parse = Number) => { const el = $(id); el.oninput = () => { VIEW[key] = parse(el.value); apply(); }; };
  bind('vContrast', 'contrast'); bind('vBright', 'bright'); bind('vCut', 'cut'); bind('vOpacity', 'opacity'); bind('vColor', 'color', String);
  $('vInvert').onchange = () => { VIEW.invert = $('vInvert').checked; apply(); };
  document.querySelectorAll('[data-mode]').forEach(bt => bt.onclick = () => { VIEW.mode = bt.dataset.mode; apply(); });
  $('vReset').onclick = () => { Object.assign(VIEW, {contrast: 1, bright: 0, invert: false, cut: 0, color: '#e3b25a', opacity: 80});
    $('vContrast').value = 1; $('vBright').value = 0; $('vInvert').checked = false; $('vCut').value = 0; $('vColor').value = '#e3b25a'; $('vOpacity').value = 80; apply(); };
  if ($('compare')) $('compare').onclick = () => toggleCompare();
  $('share').onclick = () => shareView($('share'));
  $('toastShare').onclick = () => shareView($('toastShare'));
  $('toastX').onclick = () => $('toast').classList.remove('show');
}

function main() {
  if (['overlay', 'ink', 'scan'].includes(Q.get('view'))) VIEW.mode = Q.get('view');
  buildLUTs();
  viewer = OpenSeadragon({
    id: 'osdMain', prefixUrl: '../vendor/openseadragon/images/', showNavigator: window.innerWidth > 700, navigatorPosition: 'BOTTOM_RIGHT',
    tileSources: [{tileSource: `../tiles/${P.id}/scan.dzi`}, {tileSource: `../tiles/${P.id}/ink.dzi`}],
    maxZoomPixelRatio: 3, crossOriginPolicy: false, drawer: 'canvas', visibilityRatio: 0.5, showRotationControl: false,
    gestureSettingsTouch: {pinchToZoom: true, flickEnabled: true, clickToZoom: false, dblClickToZoom: true},
    animationTime: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1.0,
  });
  viewer.addHandler('tile-drawing', onTileDrawing);
  viewer.world.addHandler('add-item', () => {
    if (viewer.world.getItemCount() < 2) return;
    for (let i = 0; i < 2; i++) { const it = viewer.world.getItemAt(i); if (/scan_files/.test(it.source.tilesUrl)) scanTI = it; else inkTI = it; }
    apply();
  });
  viewer.addHandler('open', () => setTimeout(() => {   // restore a shared view once everything is open
    if (Q.get('z')) { viewer.viewport.zoomTo(+Q.get('z'), null, true); viewer.viewport.panTo(new OpenSeadragon.Point(+Q.get('x'), +Q.get('y')), true); }
    ready = true;
    if (Q.get('compare')) toggleCompare(true);
  }, 50));
  viewer.addHandler('animation', sync);
  viewer.addHandler('animation-finish', () => { saveURL(); maybeToast(); });
  viewer.addHandler('resize', sync);
  wire();
  window.__viewer = viewer;
}
main();
