#!/usr/bin/env node
// Builds the standalone comparison sheet: one HTML file with every frame
// embedded, so it can be published and read on a phone with no server.
//
//     node data/sheet.mjs > shots/compare/sheet.html
//
// Each frame carries the real-world latitude and longitude of the camera, so
// the same viewpoint can be opened in Street View and held side by side. That
// is the entire point: the frames are only useful next to the real thing.
import { readFileSync } from 'fs';

const OUT = 'shots/compare';
const shots = JSON.parse(readFileSync(`${OUT}/shots.json`, 'utf8'));
const scene = JSON.parse(readFileSync('data/orchard.json', 'utf8'));

// The inverse of process.py's projection. Same constants, or the pins land in
// the wrong street.
const { lat: LAT0, lon: LON0 } = scene.origin;
const M_LAT = 110574.0;
const M_LON = 111320.0 * Math.cos((LAT0 * Math.PI) / 180);
const toLL = (x, z) => [LAT0 - z / M_LAT, LON0 + x / M_LON];

const b64 = (f) => readFileSync(`${OUT}/web/${f}`).toString('base64');

const frames = shots.map((s) => {
  const [lat, lon] = toLL(s.x, s.z);
  return { ...s, lat: lat.toFixed(6), lon: lon.toFixed(6), img: b64(s.file) };
});

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

process.stdout.write(`<title>Orchard Road: what is wrong with this?</title>
<style>
:root{
  /* Taken off the render itself: tarmac, kerb, and the oxide red of Ngee Ann
     City's granite podium, which is the one saturated thing on the street. */
  --ink:#15181a; --ink-2:#4a5257; --ink-3:#6f7a80;
  --bg:#e9ebe8; --panel:#f4f5f3; --line:#ccd1cc;
  --accent:#8e4034; --flag:#8a6a1f;
  color-scheme:light dark;
}
@media (prefers-color-scheme:dark){
  :root{ --ink:#e6e9e6; --ink-2:#a4aeaf; --ink-3:#798386;
    --bg:#0f1214; --panel:#171b1e; --line:#2a3034; --accent:#c9705f; --flag:#c6a44e; }
}
:root[data-theme="dark"]{ --ink:#e6e9e6; --ink-2:#a4aeaf; --ink-3:#798386;
  --bg:#0f1214; --panel:#171b1e; --line:#2a3034; --accent:#c9705f; --flag:#c6a44e; }
:root[data-theme="light"]{ --ink:#15181a; --ink-2:#4a5257; --ink-3:#6f7a80;
  --bg:#e9ebe8; --panel:#f4f5f3; --line:#ccd1cc; --accent:#8e4034; --flag:#8a6a1f; }

*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.55 ui-sans-serif,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
  -webkit-text-size-adjust:100%}
.wrap{max-width:1180px;margin:0 auto;padding:0 18px 72px}

header{padding:40px 0 22px;border-bottom:1px solid var(--line)}
h1{margin:0 0 10px;font-size:clamp(22px,3.4vw,31px);line-height:1.16;
  font-weight:640;letter-spacing:-.015em;text-wrap:balance;max-width:20ch}
.lede{margin:0;color:var(--ink-2);max-width:64ch}
.lede + .lede{margin-top:10px}
.ask{margin-top:18px;padding:13px 15px;background:var(--panel);
  border-left:3px solid var(--accent);border-radius:2px;max-width:64ch}
.ask p{margin:0;color:var(--ink)}
.ask p + p{margin-top:7px}

.meta{display:flex;flex-wrap:wrap;gap:6px 22px;margin:16px 0 0;padding:0;list-style:none;
  font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink-3);
  font-variant-numeric:tabular-nums}
.meta b{color:var(--ink-2);font-weight:600}

.frames{display:flex;flex-direction:column;gap:44px;padding-top:34px}
figure{margin:0}
img{display:block;width:100%;height:auto;border-radius:3px;background:var(--panel)}
figcaption{display:flex;flex-wrap:wrap;gap:6px 28px;align-items:baseline;
  padding-top:11px;border-top:1px solid var(--line);margin-top:11px}
.no{font:600 12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
  color:var(--accent);font-variant-numeric:tabular-nums}
.ttl{font-weight:625;letter-spacing:-.005em;flex:1 1 22ch;min-width:0}
.note{flex:1 1 100%;color:var(--ink-2);font-size:14.5px;max-width:70ch;margin:0}
.gps{font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink-3);
  font-variant-numeric:tabular-nums;white-space:nowrap}
.gps a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid var(--line)}
.gps a:hover,.gps a:focus-visible{color:var(--accent);border-color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.moved{color:var(--flag)}

.known{margin-top:56px;padding-top:26px;border-top:1px solid var(--line)}
.known h2{margin:0 0 6px;font-size:17px;font-weight:640;letter-spacing:-.01em}
.known > p{margin:0 0 16px;color:var(--ink-2);max-width:64ch}
.known ul{margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:9px;max-width:72ch}
.known li{display:flex;gap:11px;color:var(--ink-2);font-size:15px}
.known li::before{content:"";flex:none;width:3px;margin-top:8px;height:calc(100% - 14px);
  background:var(--line);border-radius:2px}
.known b{color:var(--ink);font-weight:625}
</style>

<div class="wrap">
<header>
  <h1>Fourteen views of Orchard Road. What is wrong with them?</h1>
  <p class="lede">These are frames from the world, not concept art. Every camera
  stands at a real position on the pavement, worked out from the surveyed road
  centreline and the actual building footprint it is pointed at, at standing eye
  height. Nothing was moved to make a shot look better.</p>
  <p class="lede">Each frame carries the latitude and longitude the camera is
  standing on. Open it in Street View and you are looking at the same spot.</p>
  <div class="ask">
    <p>The audit can prove nothing is standing in the road and the sweep can
    prove the frame rate holds for 2,586 metres. Neither can tell us whether
    this reads as Orchard Road.</p>
    <p>You are the only person on this project who has stood on that street. Go
    through these and say what is wrong. By frame number is easiest.</p>
  </div>
  <ul class="meta">
    <li><b>2,586 m</b> Tanglin to Dhoby Ghaut</li>
    <li><b>1,565</b> buildings</li>
    <li><b>18 / 28</b> feature classes from real data</li>
    <li><b>1.6 m</b> eye height</li>
    <li><b>50&deg;</b> vertical field of view</li>
  </ul>
  <div class="ask">
    <p><b>Two things changed since the first version of this sheet</b>, both
    found by checking sources instead of asking you.</p>
    <p><b>The trees were the wrong tree.</b> Orchard Road is an Angsana avenue:
    NParks gives the crown as 12 to 34 metres across, dense and dome shaped,
    with drooping branches that meet over the road. These were 10 to 14 metre
    crowns of thin foliage on bare trunks, which is why they read as palms.</p>
    <p><b>Traffic was driving both ways up a one-way street.</b> Orchard Road
    has been one-way since 1974, five lanes, all running south-east to Dhoby
    Ghaut. Every Orchard Road way in our own map file says so and the flag was
    sitting there unread. All eighteen vehicles now run with the flow, measured
    rather than assumed.</p>
  </div>
</header>

<div class="frames">
${frames.map((f) => `  <figure>
    <img src="data:image/jpeg;base64,${f.img}" alt="${esc(f.title)}" ${f.id === '01' ? '' : 'loading="lazy"'}>
    <figcaption>
      <span class="no">${f.id}</span>
      <span class="ttl">${esc(f.title)}</span>
      <span class="gps"><a href="https://www.google.com/maps/@?api=1&amp;map_action=pano&amp;viewpoint=${f.lat},${f.lon}" target="_blank" rel="noopener">${f.lat}, ${f.lon}</a>${f.slid ? ` <span class="moved">&middot; moved ${Math.abs(f.slid)}m to clear a tree</span>` : ''}</span>
      <p class="note">${esc(f.note)}</p>
    </figcaption>
  </figure>`).join('\n')}
</div>

<section class="known">
  <h2>Already known, no need to spend feedback on these</h2>
  <p>Listed so the sheet gets your eye on what I cannot see rather than what I
  already have on the list.</p>
  <ul>
    <li><b>Most buildings are plain massing.</b> 87 of 1,565 have designed
    shapes. The rest are extruded footprints at a guessed height. 919 of them
    are invented, and it shows most on the long blank flanks.</li>
    <li><b>Ngee Ann City's podium is plain.</b> It should be the Great Wall
    massing clad in 3.8 by 3.2 metre African Red granite panels. Researched, not
    yet built.</li>
    <li><b>Hilton Singapore Orchard is drawn as one mass.</b> It is two towers,
    144 and 152 metres.</li>
    <li><b>The street is quiet.</b> Traffic and pedestrians exist and move, and
    the traffic now runs the correct way, but the density is nothing like a real
    Saturday afternoon.</li>
    <li><b>Shopfronts are named but not glazed.</b> 992 real shop names sit on
    the frontages with no window, no light, no display behind them.</li>
    <li><b>Haze from above.</b> Frame 14 has the fog switched off; left on, it
    washes the whole skyline flat from any height. It is tuned for street level,
    where it looks right.</li>
  </ul>
</section>
</div>
`);
