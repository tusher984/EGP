const storyHost = document.getElementById('app');
let mounted = false;

function authorityMapMarkup() {
  const section = document.createElement('section');
  section.className = 'authority-map-report';
  section.id = 'authority-map-report';
  section.setAttribute('aria-labelledby', 'authority-map-title');
  section.innerHTML = `
    <div class="authority-map-tools">
      <button class="btn btn-quiet" id="download-map" type="button">Download PNG</button>
    </div>
    <div class="authority-map-layout" id="map-export">
      <figure class="authority-map-figure">
        <div id="map" role="img" aria-label="Map of Bangladesh showing district boundaries and corruption indicators for six development authorities"><div style="color: var(--text-muted);">Loading map...</div></div>
        <div class="authority-map-copy">
          <p class="authority-map-kicker">Six development authorities · Bangladesh</p>
          <h2 id="authority-map-title">Corruption indicators by authority</h2>
          <p>Composite scores combine single-bid awards, market concentration and late contract signing. Larger, warmer circles indicate higher measured risk.</p>
        </div>
        <div class="map-note" role="status" aria-live="polite"></div>
        <figcaption class="authority-map-source">Source: supplied authority-level procurement indicators; district boundaries from the vendored Bangladesh ADM2 GeoJSON.</figcaption>
      </figure>
      <aside class="authority-map-sidebar" aria-label="Authority ranking">
        <div class="authority-map-heading"><h3>Measured risk</h3><span>score / 100</span></div>
        <ol id="ranking" class="authority-ranking"></ol>
        <div class="authority-legend">
          <h3>How to read the map</h3>
          <div class="authority-gradient" aria-label="Color scale from low to high corruption"></div>
          <div class="authority-legend-labels"><span>Low</span><span>Medium</span><span>High</span></div>
          <p>Circle size = composite score. Weights: single-bid 40%, concentration 35%, late signing 25%.</p>
        </div>
      </aside>
    </div>
    <section class="authority-detail" id="detail-section" aria-live="polite">
      <div><p class="authority-map-kicker">Selected authority</p><h3 id="detail-title">Select a circle</h3><p id="detail-summary">Hover over a marker for a quick read. Click one to compare its three indicators.</p></div>
      <div class="authority-chart"><canvas id="indicator-chart" role="img" aria-label="Bar chart of selected authority indicators"></canvas></div>
    </section>`;
  return section;
}

function mount() {
  if (mounted || !storyHost) return;
  const story = storyHost.querySelector('#panel-story .prose');
  if (!story) return;
  mounted = true;
  const mapReport = authorityMapMarkup();
  const anchor = Array.from(story.querySelectorAll('p')).find((paragraph) =>
    paragraph.textContent.trim().startsWith('These stringent prerequisites raise fundamental concerns')
  );
  if (anchor) anchor.after(mapReport);
  else story.appendChild(mapReport);
  tagMapSteps(story);
  import(`./map.js?authority-map=${Date.now()}`).catch(() => {
    const note = document.querySelector('.authority-map-figure .map-note');
    if (note) note.textContent = 'The interactive authority map could not be loaded.';
  });
}

function tagMapSteps(proseColumn) {
  const steps = [
    ['In February 2021, the Chittagong Development Authority', '22.3569,91.7832', '10', 'Chittagong'],
    ['Further analysis highlighted a CDA tender', '22.3569,91.7832', '10', 'Chittagong'],
    ['Single-bidder rates vary substantially across authorities', '24.3745,88.6042', '8', 'Rajshahi'],
    ['RAJUK, overseeing a higher project volume', '23.8103,90.4125', '9', 'Dhaka'],
    ['This is particularly evident in Chattogram', '22.3569,91.7832', '9', 'Chittagong'],
  ];
  Array.from(proseColumn.querySelectorAll('p')).forEach((paragraph) => {
    const step = steps.find(([text]) => paragraph.textContent.trim().startsWith(text));
    if (!step) return;
    paragraph.classList.add('map-step');
    paragraph.dataset.mapCenter = step[1];
    paragraph.dataset.mapZoom = step[2];
    paragraph.dataset.mapHighlight = step[3];
  });
}

new MutationObserver(() => {
  if (!document.getElementById('authority-map-report')) mounted = false;
  mount();
}).observe(storyHost, { childList: true, subtree: true });
mount();
