# Ink from 79 AD: local gallery (PRIVATE DRAFT — do not publish until Jamie approves)

Static site (plain HTML/CSS/JS + OpenSeadragon) showing published ink maps from ten Herculaneum
scrolls and fragments. Six PHerc. 1447 pieces were read on a CPU with
github.com/jamiejmann/vesuvius-cpu-reader (Reader V3). The rest use the Vesuvius Challenge
team's own published full-resolution ink maps, with credit.

**Not for publication until approved.** The Vesuvius Challenge data agreement asks that
revelations of hidden text are not published without the team's written approval. This preview
stays unlisted (`noindex`, `robots.txt` Disallow) until Jamie signs off on the December 1 launch.

- Preview locally: `cd gallery && python3 -m http.server 8811` then open http://127.0.0.1:8811/
- Rebuild pages/share cards after changing text: `python gallery_work/build_site.py`
- Per piece: `pieces/<slug>.html` (own Open Graph/Twitter card in `og/`), deep-zoom tiles in `tiles/<segment>/{ink,scan}.dzi`.
- Per scroll: `scrolls/<slug>.html`. Share links use `?x=&y=&z=&view=` so a link opens on the same spot.
- `SITE_URL` in build_site.py is https://jamiejmann.github.io/scroll-gallery/ for absolute share-card URLs.

Credits: Reader V3 by Domenico Russo (MIT); other published maps as credited on each piece page;
ScrollPrize/villa (MIT); OpenSeadragon (BSD-3, vendor/openseadragon/LICENSE.txt);
Cormorant Garamond (OFL, assets/fonts/OFL-Cormorant.txt). Data: Vesuvius Challenge, CC BY-NC 4.0.
PHerc. Paris. 4 is excluded (publication-reservation until 25 June 2027).
