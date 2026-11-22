# Ink from 79 AD: scroll gallery

Free Windows app: https://github.com/jamiejmann/vesuvius-cpu-reader/releases/tag/v1.0.0

Static site (plain HTML/CSS/JS + OpenSeadragon) showing published ink maps from ten Herculaneum
scrolls and fragments. Six PHerc. 1447 pieces were read on a CPU with
github.com/jamiejmann/vesuvius-cpu-reader (Reader V3). The rest use the Vesuvius Challenge
team's own published full-resolution ink maps, with credit.

Public since 22 November 2026, with the Vesuvius Challenge team's written OK (21 November 2026).
Only the team's published data is shown. No new text is claimed.

- Preview locally: `cd gallery && python3 -m http.server 8811` then open http://127.0.0.1:8811/
- Rebuild pages/share cards after changing text: `python gallery_work/build_site.py`
- Per piece: `pieces/<slug>.html` (own Open Graph/Twitter card in `og/`), deep-zoom tiles in `tiles/<segment>/{ink,scan}.dzi`.
- Per scroll: `scrolls/<slug>.html`. Share links use `?x=&y=&z=&view=` so a link opens on the same spot.
- `SITE_URL` in build_site.py is https://jamiejmann.github.io/scroll-gallery/ for absolute share-card URLs.

Credits: Reader V3 by Domenico Russo (MIT); other published maps as credited on each piece page;
ScrollPrize/villa (MIT); OpenSeadragon (BSD-3, vendor/openseadragon/LICENSE.txt);
Cormorant Garamond (OFL, assets/fonts/OFL-Cormorant.txt). Data: Vesuvius Challenge, CC BY-NC 4.0.
PHerc. Paris. 4 is excluded (publication-reservation until 25 June 2027).
