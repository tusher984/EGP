const authorities = [
  { code: 'CDA', name: 'Chittagong Development Authority', district: 'Chattogram', lat: 22.3569, lng: 91.7832, singleBid: 51, concentration: 80.2, lateSigning: 33.7 },
  { code: 'RAJUK', name: 'Rajdhani Unnayan Kartripakkha', district: 'Dhaka', lat: 23.8103, lng: 90.4125, singleBid: 22.6, concentration: 7.8, lateSigning: 86.2 },
  { code: 'RDA', name: 'Rajshahi Development Authority', district: 'Rajshahi', lat: 24.3745, lng: 88.6042, singleBid: 60.7, concentration: 41.9, lateSigning: 17.2 },
  { code: 'CoxDA', name: "Cox's Bazar Development Authority", district: "Cox's Bazar", lat: 21.4272, lng: 92.0058, singleBid: 56.8, concentration: 29.5, lateSigning: 18.3 },
  { code: 'KDA', name: 'Khulna Development Authority', district: 'Khulna', lat: 22.8456, lng: 89.5403, singleBid: 27, concentration: 24.3, lateSigning: 21.6 },
  { code: 'GDA', name: 'Gazipur Development Authority', district: 'Gazipur', lat: 24.0022, lng: 90.4264, singleBid: 0, concentration: 36.5, lateSigning: 0, noData: { singleBid: true, lateSigning: true } },
];

const scores = authorities.map((authority) => ({
  ...authority,
  score: authority.singleBid * .4 + authority.concentration * .35 + authority.lateSigning * .25,
}));
const byDistrict = new Map(scores.map((authority) => [authority.district, authority]));
byDistrict.set('Chittagong', byDistrict.get('Chattogram'));
const map = L.map('map', { zoomControl: false, attributionControl: true }).setView([23.75, 90.35], 7);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', opacity: .18 }).addTo(map);
let selectedCode = null;
let chart;

function colorFor(score) {
  const stops = [[0, [46, 204, 113]], [50, [241, 196, 15]], [100, [231, 76, 60]]];
  const lower = score <= 50 ? stops[0] : stops[1];
  const upper = score <= 50 ? stops[1] : stops[2];
  const amount = (score - lower[0]) / (upper[0] - lower[0]);
  const rgb = lower[1].map((channel, index) => Math.round(channel + (upper[1][index] - channel) * amount));
  return `rgb(${rgb.join(',')})`;
}
function metric(value, noData) { return noData ? 'No data (0%)' : `${value}%`; }
function tooltip(authority) {
  return `<div class="authority-tooltip"><strong>${authority.code} · ${authority.district}</strong><span>Single-bid rate: ${metric(authority.singleBid, authority.noData?.singleBid)}</span><span>Market concentration: ${authority.concentration}%</span><span>Late signing: ${metric(authority.lateSigning, authority.noData?.lateSigning)}</span><span>Composite score: <b>${authority.score.toFixed(1)}/100</b></span></div>`;
}
function fillFor(district) {
  const authority = byDistrict.get(district);
  return authority ? colorFor(authority.score) : '#edf3ef';
}

fetch('site/build/geo/bgd-adm2-districts.geojson')
  .then((response) => response.json())
  .then((geojson) => {
    const boundaryLayer = L.geoJSON(geojson, {
      style: (feature) => ({ color: '#b3c5be', weight: .65, fillColor: fillFor(feature.properties.shapeName), fillOpacity: byDistrict.has(feature.properties.shapeName) ? .22 : .58 }),
      onEachFeature: (feature, layer) => layer.bindTooltip(feature.properties.shapeName, { sticky: true, className: 'district-tooltip' }),
    }).addTo(map);
    map.invalidateSize({ pan: false });
    map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
    requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
    });
  })
  .catch(() => { document.querySelector('.map-note').textContent = 'District boundary data could not be loaded.'; });

scores.forEach((authority) => {
  const marker = L.circleMarker([authority.lat, authority.lng], {
    radius: 10 + authority.score * .3,
    color: '#fff', weight: 2, fillColor: colorFor(authority.score), fillOpacity: .9,
  }).addTo(map);
  marker.bindTooltip(tooltip(authority), { sticky: true, direction: 'top', offset: [0, -8] });
  marker.on('click', () => selectAuthority(authority.code));
});

function selectAuthority(code) {
  const authority = scores.find((item) => item.code === code);
  if (!authority) return;
  selectedCode = code;
  document.querySelectorAll('.ranking-item').forEach((item) => item.classList.toggle('active', item.dataset.code === code));
  document.getElementById('detail-title').textContent = `${authority.code} / ${authority.district}`;
  document.getElementById('detail-summary').textContent = `${authority.name} records a composite corruption score of ${authority.score.toFixed(1)} out of 100. Values are weighted 40% single-bid, 35% concentration and 25% late signing.`;
  const chartData = [authority.singleBid, authority.concentration, authority.lateSigning];
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('indicator-chart'), { type: 'bar', data: { labels: ['Single-bid rate', 'Market concentration', 'Late signing'], datasets: [{ data: chartData, backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'], borderWidth: 0, borderRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.raw}%` } } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${value}%` }, grid: { color: '#d8e1dd' } }, x: { grid: { display: false } } } } });
}

const ranking = document.getElementById('ranking');
[...scores].sort((a, b) => b.score - a.score).forEach((authority) => {
  const item = document.createElement('li');
  item.className = 'ranking-item'; item.dataset.code = authority.code; item.tabIndex = 0;
  item.innerHTML = `<div><span class="ranking-name">${authority.code}</span><span class="ranking-district">${authority.district}</span></div><span></span><strong class="ranking-score" style="color:${colorFor(authority.score)}">${authority.score.toFixed(1)}</strong>`;
  item.addEventListener('click', () => selectAuthority(authority.code));
  item.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectAuthority(authority.code); } });
  ranking.appendChild(item);
});

selectAuthority('CDA');
document.getElementById('download-map').addEventListener('click', async () => {
  const button = document.getElementById('download-map');
  button.disabled = true; button.textContent = 'Preparing PNG...';
  try {
    const canvas = await html2canvas(document.getElementById('map-export'), { backgroundColor: '#f5f7f2', scale: 2, useCORS: true });
    const link = document.createElement('a'); link.download = 'bangladesh-procurement-risk-map.png'; link.href = canvas.toDataURL('image/png'); link.click();
  } finally { button.disabled = false; button.textContent = 'Download PNG'; }
});
