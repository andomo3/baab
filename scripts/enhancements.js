/* ====================================================================
   NOW-PLAYING ENHANCEMENTS — runtime
   - Scroll-reactive EQ
   - Liner notes panel (toggle on player ♪ button)
   - Visualizer overlay (V key or cover click)
   - Setlists (pills + terminal command)
   ==================================================================== */
(function () {
  'use strict';

  const TRACKS = (window.__term && window.__term.TRACKS) || [];

  // ---------- Per-track data: liner notes ----------
  const EXTRA = {
    '01': {
      liner: {
        side: 'B-side · the spread between belief and odds',
        body: `<p>started as a small bet on player props, became a serious system. sportsbooks have analysts with sharp money and injury feeds — the only edge available to a solo builder is model accuracy, and i wanted to see if a student with XGBoost could find a corner.</p>
<p>the headline is 70% accuracy across 20 metrics, 15% above the naive baseline. the operational lesson is the one that matters more: a model that's 4% better than vegas but takes 800ms to refresh isn't 4% better. it's <em>0%</em>. sub-200ms or it doesn't ship.</p>`,
      },
    },
    '02': {
      liner: {
        side: 'B-side · hours to seconds',
        body: `<p>the client's pricing data wasn't missing — it was trapped in deeply nested Excel matrices nobody else would write a parser for. PySpark + Airflow did the parsing, DuckDB did the validation, Next.js delivered the experience. what was most of a workday became one click.</p>
<p>the real win isn't the speed. it's the schema. the multi-property roadmap doesn't need a code change — it needs a Parquet partition. <em>boring infrastructure is the most expensive thing you can save someone.</em></p>`,
      },
    },
    '03': {
      liner: {
        side: 'B-side · when money has a vote',
        body: `<p>$500K live, and the model outputs informed real trades. ARIMA validated sector-rotation strategies, but the moment that stuck was the Monte Carlo run that surfaced an 8% downside tail nobody had priced in. the hedging position shifted that week.</p>
<p>first experience where being wrong had an immediate dollar cost. the math was the easy part. <em>defending the math in a room of people who'd lost money the year before — that was the project.</em></p>`,
      },
    },
    '04': {
      liner: {
        side: 'B-side · O(n²) was the bug',
        body: `<p>the latency story everyone wanted to tell was infra: bigger boxes, more replicas. the actual fix was a single O(n²) loop in the document matching step. swapping it for an O(n+m) hash-join cut p99 from 45 seconds to 8 — no infra changes, no budget request.</p>
<p>the precision story was label noise. a statistical validation framework with 50+ automated distributional checks caught the bad training examples that were silently dragging the model down. <em>profile before you provision.</em></p>`,
      },
    },
    '05': {
      liner: {
        side: 'B-side · explainability over AUC',
        body: `<p>XGBoost on 50K applications got to 0.80 AUC. the interesting part wasn't the number — it was that the lending team couldn't act on a black-box score. SHAP showed debt-to-income ratio was driving most predictions, which became the basis for a tiered risk framework they could explain to regulators.</p>
<p>a 0.78 model that auditors trust beats a 0.81 nobody will deploy. the SMOTE handled the 20:1 class imbalance. the CTE-engineered features made the bureau data legible. the framework made the model usable. <em>only one of those three made it into the deck.</em></p>`,
      },
    },
    '06': {
      liner: {
        side: 'B-side · 3NF and the 200ms',
        body: `<p>not glamorous. the hospital's data wasn't inaccessible — it was just slow and structurally inconsistent. every useful query needed a bespoke script because nobody had committed to foreign keys. i redesigned the schema to 3NF across 15 tables, eliminating 20% redundancy.</p>
<p>the bed-utilization query went from 3 seconds to 200ms with composite indexes. that's the difference between an overnight batch and a tool people use in the morning standup. window functions handled the rolling analysis. <em>boring is a feature.</em></p>`,
      },
    },
  };

  // ---------- Setlists ----------
  const SETLISTS = {
    'ml-research': {
      label: 'ML / Research',
      tag: 'For ML & research roles',
      intro: '<b>Models, experiments, methodology.</b> Leads with the live PerChance prediction system, then the explainable loan-default model, then the NLP document classifier — methodology-heavy projects first. The B-sides have the technical depth.',
      order: ['01', '05', '04', '02', '06', '03'],
    },
    'quant': {
      label: 'Quant / Fintech',
      tag: 'For quant & fintech roles',
      intro: '<b>Pricing, risk, edge.</b> Money-adjacent work first: the $500K GTSF fund, sportsbook prop prediction, credit default modeling. Same skill — finding the spread between the model and the market.',
      order: ['03', '01', '05', '02', '04', '06'],
    },
    'faang': {
      label: 'FAANG SWE',
      tag: 'For FAANG / Big Tech roles',
      intro: '<b>Scale, infra, shipped systems.</b> Leads with the production document pipeline (10K docs/mo, O(n²)→O(n+m) optimization), then the hospital ops schema work, then the Altura data pipeline. Systems thinking first, models second.',
      order: ['04', '06', '02', '01', '05', '03'],
    },
  };

  // ====================================================================
  // 1. SCROLL-REACTIVE EQ
  // ====================================================================
  let scrollEnergy = 0;
  const scroller = document.querySelector('.main') || document.scrollingElement || document.documentElement;
  let lastScroll = scroller.scrollTop || 0;
  let lastTime = performance.now();

  function onScroll() {
    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    const cur = scroller.scrollTop || 0;
    const dy = Math.abs(cur - lastScroll);
    const v = dy / dt;             // px/ms
    scrollEnergy = Math.min(1, scrollEnergy + v * 0.06);
    lastScroll = cur;
    lastTime = now;
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });

  // also nudge on click/key (so page feels alive without scrolling)
  ['click', 'keydown', 'pointermove'].forEach(ev => {
    window.addEventListener(ev, () => { scrollEnergy = Math.min(1, scrollEnergy + 0.03); }, { passive: true });
  });

  function tickEQ() {
    scrollEnergy = Math.max(0, scrollEnergy - 0.018);                      // decay
    const baseAmp = 0.45;
    const amp = baseAmp + scrollEnergy * 1.05;                              // 0.45 → 1.5
    const speed = (1.5 - scrollEnergy * 1.05).toFixed(2) + 's';             // 1.5s → 0.45s
    document.documentElement.style.setProperty('--eq-amp', amp.toFixed(2));
    document.documentElement.style.setProperty('--eq-speed', speed);
    requestAnimationFrame(tickEQ);
  }
  requestAnimationFrame(tickEQ);

  // ====================================================================
  // 2. LINER NOTES PANEL
  // ====================================================================
  const linerPanel = document.createElement('div');
  linerPanel.className = 'liner-panel';
  linerPanel.innerHTML = `
    <div class="liner-head">
      <div>
        <div class="label">Liner Notes</div>
        <div class="title" id="liner-title">—</div>
        <div class="sub" id="liner-sub">—</div>
      </div>
      <button class="liner-close" aria-label="Close" id="liner-close">✕</button>
    </div>
    <div class="liner-body" id="liner-body"></div>
  `;
  document.body.appendChild(linerPanel);

  const linerTitle = linerPanel.querySelector('#liner-title');
  const linerSub = linerPanel.querySelector('#liner-sub');
  const linerBody = linerPanel.querySelector('#liner-body');
  const linerClose = linerPanel.querySelector('#liner-close');

  function fillLiner() {
    const idx = (window.__term && window.__term.getCurrent && window.__term.getCurrent()) || 0;
    const t = TRACKS[idx];
    if (!t) return;
    const ex = EXTRA[t.n];
    if (!ex) return;
    linerTitle.textContent = t.title;
    linerSub.textContent = `${t.artist} · ${ex.liner.side}`;
    linerBody.innerHTML = ex.liner.body;
  }

  // Find lyrics button (the ♪ icon-btn in player-right with title="Lyrics")
  const lyricsBtn = document.querySelector('.player-right .icon-btn[title="Lyrics"]');
  function toggleLiner() {
    const open = linerPanel.classList.toggle('open');
    if (open) {
      fillLiner();
      lyricsBtn && lyricsBtn.classList.add('lyrics-active');
    } else {
      lyricsBtn && lyricsBtn.classList.remove('lyrics-active');
    }
  }
  if (lyricsBtn) lyricsBtn.addEventListener('click', toggleLiner);
  linerClose.addEventListener('click', toggleLiner);

  // refill on track change while open
  window.addEventListener('np-update', () => {
    if (linerPanel.classList.contains('open')) fillLiner();
  });

  // Esc closes liner panel
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'Escape' && linerPanel.classList.contains('open')) toggleLiner();
  });

  // ====================================================================
  // 3. VISUALIZER OVERLAY — REMOVED per user request
  // ====================================================================
  // Stub: visualizer disabled. Keyboard and click handlers below are no-ops.
  const viz = { classList: { contains: () => false, add: () => {}, remove: () => {} } };
  function openViz() {}
  function closeViz() {}
  function fillViz() {}
  /* DEAD-CODE START — kept for reference but unreachable
  // ====================================================================
  // 3.x ORIGINAL VISUALIZER OVERLAY
  // ====================================================================
  const viz = document.createElement('div');
  viz.className = 'viz-overlay';
  viz.innerHTML = `
    <div class="viz-head">
      <div>
        <div class="num" id="viz-num">VIZ · TRACK 01</div>
        <h2 id="viz-title">—</h2>
        <div class="sub" id="viz-sub">—</div>
        <div class="album" id="viz-album">—</div>
      </div>
      <button class="viz-close" aria-label="Close visualizer" id="viz-close">✕</button>
    </div>
    <div class="viz-body">
      <div class="viz-stage" id="viz-stage"></div>
      <div class="viz-side" id="viz-side"></div>
    </div>
  `;
  document.body.appendChild(viz);

  const vizNum = viz.querySelector('#viz-num');
  const vizTitle = viz.querySelector('#viz-title');
  const vizSub = viz.querySelector('#viz-sub');
  const vizAlbum = viz.querySelector('#viz-album');
  const vizStage = viz.querySelector('#viz-stage');
  const vizSide = viz.querySelector('#viz-side');
  viz.querySelector('#viz-close').addEventListener('click', closeViz);

  function fillViz() {
    const idx = (window.__term && window.__term.getCurrent && window.__term.getCurrent()) || 0;
    const t = TRACKS[idx];
    if (!t) return;
    const ex = EXTRA[t.n];
    vizNum.textContent = `VIZ · TRACK ${t.n}`;
    vizTitle.textContent = t.title;
    vizSub.textContent = `${t.artist} · ${t.dur} · ${t.plays} plays`;
    vizAlbum.textContent = `~/projects/${t.album}`;
    vizStage.innerHTML = renderViz(ex && ex.viz);
    vizSide.innerHTML = renderStats((ex && ex.viz && ex.viz.stats) || []);
  }
  function openViz() {
    fillViz();
    viz.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeViz() {
    viz.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Keyboard: V toggles, Esc closes
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'v' || e.key === 'V') { e.preventDefault(); viz.classList.contains('open') ? closeViz() : openViz(); }
    if (e.key === 'Escape') {
      if (viz.classList.contains('open')) closeViz();
      else if (linerPanel.classList.contains('open')) toggleLiner();
    }
  });

  // Click cover in player → open viz
  const playerCover = document.querySelector('.player-left .cover');
  if (playerCover) {
    // add hover hint glyph
    const hint = document.createElement('div');
    hint.className = 'viz-hint';
    hint.innerHTML = '◉';
    hint.title = 'Open visualizer (V)';
    playerCover.appendChild(hint);
    playerCover.addEventListener('click', openViz);
  }

  window.addEventListener('np-update', () => {
    if (viz.classList.contains('open')) fillViz();
  });

  // ---------- Stat card renderer ----------
  function renderStats(stats) {
    return stats.map(s => `
      <div class="viz-stat">
        <div class="label">${s.label}</div>
        <div class="value">${s.value}</div>
        ${s.delta ? `<div class="delta">${s.delta}</div>` : ''}
        <div class="bar"><span style="width:${Math.round((s.bar || 0)*100)}%"></span></div>
      </div>
    `).join('') + `
      <div class="viz-hint-row">
        <span><kbd>V</kbd>toggle</span>
        <span><kbd>Esc</kbd>close</span>
        <span><kbd>←</kbd><kbd>→</kbd>prev / next</span>
      </div>
    `;
  }

  // ====================================================================
  // PER-PROJECT VISUALIZER RENDERERS (SVG)
  // ====================================================================
  function renderViz(v) {
    if (!v) return '';
    switch (v.kind) {
      case 'house':   return vizHouse();
      case 'court':   return vizCourt();
      case 'world':   return vizWorld();
      case 'boxes':   return vizBoxes();
      case 'queue':   return vizQueue();
      case 'scatter': return vizScatter();
      case 'lidar':   return vizLidar();
      default:        return '';
    }
  }

  function vizHouse() {
    // Animated price ticker text positions
    const prices = ['$412,000', '$418,400', '$424,200', '$431,900', '$429,800', '$436,600'];
    return `
      <svg class="viz-house" viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg">
        <!-- ground -->
        <line x1="20" y1="270" x2="440" y2="270" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <!-- house frame -->
        <rect class="frame" x="120" y="140" width="220" height="130"/>
        <polygon class="roof" points="100,140 230,60 360,140"/>
        <!-- door -->
        <rect class="door" x="210" y="200" width="40" height="70"/>
        <circle cx="244" cy="235" r="1.5" fill="var(--p3)"/>
        <!-- windows -->
        <rect class="win" x="145" y="170" width="40" height="40"/>
        <line x1="165" y1="170" x2="165" y2="210" stroke="var(--fg-3)" stroke-width="0.5"/>
        <line x1="145" y1="190" x2="185" y2="190" stroke="var(--fg-3)" stroke-width="0.5"/>
        <rect class="win" x="275" y="170" width="40" height="40"/>
        <line x1="295" y1="170" x2="295" y2="210" stroke="var(--fg-3)" stroke-width="0.5"/>
        <line x1="275" y1="190" x2="315" y2="190" stroke="var(--fg-3)" stroke-width="0.5"/>
        <!-- chimney -->
        <rect class="frame" x="290" y="80" width="22" height="40"/>
        <!-- price ticker line -->
        ${prices.map((p, i) => `
          <text class="price-ticker" x="${30 + i*72}" y="40" opacity="${i === 5 ? 1 : 0.4}">${p}</text>
        `).join('')}
        <!-- comp pins -->
        ${[40, 90, 380, 420].map(x => `
          <circle cx="${x}" cy="270" r="3" fill="var(--primary)" opacity="0.7"/>
          <line x1="${x}" y1="270" x2="${x}" y2="${270 - Math.random()*30 - 10}" stroke="var(--primary)" stroke-width="1" opacity="0.5"/>
        `).join('')}
        <text x="230" y="295" font-family="JetBrains Mono" font-size="10" fill="var(--fg-4)" text-anchor="middle">predicted: $431,900 · actual: $428,500 · err: 0.79%</text>
      </svg>
    `;
  }

  function vizCourt() {
    // Half-court shot chart
    const shots = [
      [80, 220, 'made'], [120, 200, 'made'], [160, 180, 'made'], [200, 175, 'made'],
      [240, 178, 'miss'], [280, 190, 'made'], [320, 210, 'miss'], [360, 230, 'made'],
      [180, 140, 'made'], [220, 130, 'live'], [260, 145, 'made'],
      [140, 250, 'miss'], [180, 270, 'made'], [220, 280, 'made'], [260, 270, 'made'],
      [120, 160, 'made'], [320, 160, 'miss'],
    ];
    return `
      <svg class="viz-court" viewBox="0 0 440 320" xmlns="http://www.w3.org/2000/svg">
        <!-- court outer -->
        <rect class="court" x="20" y="20" width="400" height="280"/>
        <!-- key (paint) -->
        <rect class="key" x="160" y="20" width="120" height="120"/>
        <rect class="court" x="160" y="20" width="120" height="120"/>
        <!-- free throw circle -->
        <circle class="court" cx="220" cy="140" r="40"/>
        <!-- restricted arc -->
        <path class="court" d="M 195 20 A 25 25 0 0 0 245 20"/>
        <!-- 3-point arc -->
        <path class="court" d="M 60 20 L 60 100 A 160 160 0 0 0 380 100 L 380 20"/>
        <!-- baseline (top) hoop area -->
        <circle class="court" cx="220" cy="40" r="8"/>
        <!-- shots -->
        ${shots.map(([x, y, kind]) => `
          <circle class="shot ${kind}" cx="${x}" cy="${y}" r="${kind === 'live' ? 6 : 4}"/>
        `).join('')}
        <!-- live shot ring -->
        <circle class="shot live" cx="220" cy="130" r="9" fill="none" stroke="var(--p3)" stroke-width="1.5" opacity="0.6">
          <animate attributeName="r" values="9;14;9" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <!-- odds line -->
        <text x="30" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">vegas:</text>
        <text x="80" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--fg-2)">+138</text>
        <text x="140" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">model:</text>
        <text x="190" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--p3)">+162</text>
        <text x="260" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">edge:</text>
        <text x="305" y="305" font-family="JetBrains Mono" font-size="10" fill="var(--primary)">+3.8%</text>
      </svg>
    `;
  }

  function vizWorld() {
    // Stylized world: rough continent blobs + dots on key countries.
    const dots = [
      { x: 145, y: 155, label: 'MX', risk: 'mid' },
      { x: 185, y: 200, label: 'BR', risk: 'low' },
      { x: 290, y: 130, label: 'NG', risk: 'high' },
      { x: 315, y: 95,  label: 'TR', risk: 'mid' },
      { x: 380, y: 130, label: 'IN', risk: 'mid' },
      { x: 425, y: 110, label: 'CN', risk: 'low' },
      { x: 295, y: 100, label: 'IT', risk: 'low' },
      { x: 280, y: 75,  label: 'UK', risk: 'low' },
      { x: 110, y: 85,  label: 'CA', risk: 'low' },
      { x: 95,  y: 110, label: 'US', risk: 'low' },
      { x: 470, y: 230, label: 'AU', risk: 'low' },
    ];
    return `
      <svg class="viz-world" viewBox="0 0 540 280" xmlns="http://www.w3.org/2000/svg">
        <!-- abstract continent shapes -->
        <path class="land" d="M 70 70 Q 90 50 130 60 Q 165 75 155 110 Q 130 150 100 145 Q 60 130 70 70 Z"/>
        <path class="land" d="M 130 150 Q 165 145 175 175 Q 200 220 180 240 Q 150 245 140 215 Q 130 180 130 150 Z"/>
        <path class="land" d="M 245 60 Q 300 55 320 80 Q 305 105 290 100 Q 255 100 245 80 Z"/>
        <path class="land" d="M 260 110 Q 305 110 320 140 Q 305 195 280 200 Q 255 175 255 140 Z"/>
        <path class="land" d="M 340 80 Q 390 70 440 80 Q 470 110 460 145 Q 410 150 380 130 Q 340 110 340 80 Z"/>
        <path class="land" d="M 450 210 Q 490 205 510 225 Q 510 245 480 250 Q 450 245 450 210 Z"/>
        <!-- pulses on a few high-interest countries -->
        ${dots.filter(d => d.risk === 'high').map(d => `
          <circle class="pulse" cx="${d.x}" cy="${d.y}" r="6"/>
        `).join('')}
        <!-- country dots -->
        ${dots.map(d => `
          <circle class="country-dot ${d.risk === 'high' ? 'high' : ''}" cx="${d.x}" cy="${d.y}" r="3.5"/>
          <text x="${d.x + 6}" y="${d.y + 3}" font-family="JetBrains Mono" font-size="9" fill="var(--fg-3)">${d.label}</text>
        `).join('')}
        <!-- legend -->
        <g transform="translate(30, 250)">
          <circle cx="6" cy="6" r="3.5" fill="var(--primary)"/>
          <text x="16" y="9" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">low / mid risk</text>
          <circle cx="146" cy="6" r="3.5" fill="oklch(0.7 0.18 25)"/>
          <text x="156" y="9" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">visa-credit gap flagged</text>
        </g>
      </svg>
    `;
  }

  function vizBoxes() {
    // Stacked boxes packing into a U-Haul shape
    return `
      <svg class="viz-boxes" viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg">
        <!-- truck outline -->
        <rect x="40" y="60" width="380" height="200" stroke="var(--fg-3)" stroke-width="1.5" fill="none" rx="4"/>
        <text x="50" y="50" font-family="JetBrains Mono" font-size="11" fill="var(--fg-3)">U-HAUL · 10' BOX</text>
        <!-- shelves -->
        <line x1="40" y1="160" x2="420" y2="160" stroke="var(--fg-4)" stroke-width="0.5" stroke-dasharray="3 4"/>
        <!-- bottom row -->
        ${[60, 130, 200, 270, 340].map((x, i) => `
          <rect class="box ${i % 2 === 0 ? 'lit' : ''}" x="${x}" y="180" width="60" height="60" rx="2"/>
          <text class="label" x="${x + 6}" y="202">B-0${i+1}</text>
          <text class="label" x="${x + 6}" y="216" fill="var(--fg-4)">books</text>
        `).join('')}
        <!-- top row -->
        ${[80, 150, 220, 290].map((x, i) => `
          <rect class="box ${i === 1 ? 'lit' : ''}" x="${x}" y="80" width="60" height="60" rx="2"/>
          <text class="label" x="${x + 6}" y="102">T-0${i+1}</text>
          <text class="label" x="${x + 6}" y="116" fill="var(--fg-4)">${['linens','kitch.','clothes','misc'][i]}</text>
        `).join('')}
        <!-- progress -->
        <text x="40" y="290" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">packed:</text>
        <rect x="90" y="282" width="280" height="8" fill="rgba(255,255,255,0.06)" rx="2"/>
        <rect x="90" y="282" width="217" height="8" fill="var(--primary)" rx="2"/>
        <text x="380" y="290" font-family="JetBrains Mono" font-size="10" fill="var(--p3)">9/12</text>
        <text x="40" y="310" font-family="JetBrains Mono" font-size="9" fill="var(--fg-4)">offline-first · last sync: never (working as intended)</text>
      </svg>
    `;
  }

  function vizQueue() {
    // Top-down 4-way intersection with queueing cars
    return `
      <svg class="viz-queue" viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
        <!-- horizontal road -->
        <rect class="road" x="0" y="130" width="540" height="60"/>
        <!-- vertical road -->
        <rect class="road" x="240" y="0" width="60" height="320"/>
        <!-- center -->
        <rect x="240" y="130" width="60" height="60" fill="rgba(255,255,255,0.06)"/>
        <!-- lane lines -->
        <line class="lane-line" x1="0" y1="160" x2="240" y2="160"/>
        <line class="lane-line" x1="300" y1="160" x2="540" y2="160"/>
        <line class="lane-line" x1="270" y1="0" x2="270" y2="130"/>
        <line class="lane-line" x1="270" y1="190" x2="270" y2="320"/>
        <!-- westbound queue (heavy) -->
        ${[200, 175, 150, 125, 100, 75, 50].map((x, i) => `
          <rect class="car" x="${x}" y="135" width="20" height="10" rx="1.5"/>
        `).join('')}
        <!-- eastbound (lighter, optimized) -->
        ${[330, 360, 390].map(x => `
          <rect class="car opt" x="${x}" y="170" width="20" height="10" rx="1.5"/>
        `).join('')}
        <!-- north/south sparse -->
        ${[40, 70].map(y => `
          <rect class="car" x="245" y="${y}" width="10" height="20" rx="1.5"/>
        `).join('')}
        ${[230, 260, 290].map(y => `
          <rect class="car opt" x="280" y="${y}" width="10" height="20" rx="1.5"/>
        `).join('')}
        <!-- traffic lights -->
        <circle class="light red"   cx="232" cy="125" r="4"/>
        <circle class="light green" cx="308" cy="195" r="4"/>
        <!-- labels -->
        <text x="40" y="20" font-family="JetBrains Mono" font-size="11" fill="var(--fg-3)">FERST DRIVE × KLAUS WAY</text>
        <text x="20" y="120" font-family="JetBrains Mono" font-size="10" fill="oklch(0.7 0.18 25)">queue: 7 cars · 74s wait</text>
        <text x="320" y="220" font-family="JetBrains Mono" font-size="10" fill="var(--p3)">post +4s offset: 3 cars · 58s</text>
      </svg>
    `;
  }

  function vizScatter() {
    // 2D credit-default scatter with a decision boundary
    const good = [];
    const bad = [];
    const seed = 7;
    let r = seed;
    function rand() { r = (r * 9301 + 49297) % 233280; return r / 233280; }
    for (let i = 0; i < 70; i++) good.push([60 + rand()*140, 60 + rand()*120]);
    for (let i = 0; i < 50; i++) bad.push([220 + rand()*240, 130 + rand()*120]);
    return `
      <svg class="viz-scatter" viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
        <!-- axes -->
        <line class="axis" x1="50" y1="40" x2="50" y2="280"/>
        <line class="axis" x1="50" y1="280" x2="510" y2="280"/>
        <text class="axis-label" x="20" y="160" transform="rotate(-90, 20, 160)">debt-to-income →</text>
        <text class="axis-label" x="240" y="305">credit-utilization →</text>
        <!-- decision boundary (sigmoid-ish) -->
        <path class="boundary" d="M 60 100 Q 220 130 320 200 Q 430 240 510 250"/>
        <!-- points -->
        ${good.map(([x, y]) => `<circle class="pt-good" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`).join('')}
        ${bad.map(([x, y]) => `<circle class="pt-bad" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`).join('')}
        <!-- legend -->
        <g transform="translate(380, 50)">
          <circle cx="6" cy="6" r="4" class="pt-good"/>
          <text x="16" y="10" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">repaid (n=70)</text>
          <circle cx="6" cy="26" r="4" class="pt-bad"/>
          <text x="16" y="30" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">default (n=50)</text>
          <line x1="0" y1="46" x2="14" y2="46" class="boundary"/>
          <text x="20" y="50" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">P(default) = 0.5</text>
        </g>
      </svg>
    `;
  }

  END DEAD-CODE */ function vizLidar() { return ''; /* removed */ } function _vizLidarOld() {
    // Top-down lidar sweep with detected obstacles
    const rays = Array.from({length: 36}, (_, i) => {
      const a = (i * 10) * Math.PI / 180;
      const len = 60 + Math.sin(i * 0.7) * 30 + (i % 5 === 0 ? -20 : 0);
      return { a, len };
    });
    const obs = [
      { x: 90, y: 30 }, { x: -50, y: 80 }, { x: 60, y: -70 },
      { x: -90, y: -10 }, { x: 30, y: -90 }, { x: 100, y: -40 },
    ];
    return `
      <svg class="viz-lidar" viewBox="-160 -160 320 320" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lidarGrad">
            <stop offset="0%"  stop-color="var(--p3)" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="var(--p3)" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- grid -->
        <g class="grid">
          ${[-120,-80,-40,40,80,120].map(v => `
            <line x1="${v}" y1="-150" x2="${v}" y2="150"/>
            <line x1="-150" y1="${v}" x2="150" y2="${v}"/>
          `).join('')}
        </g>
        <!-- range rings -->
        ${[40, 80, 120].map(r => `<circle cx="0" cy="0" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)"/>`).join('')}
        <!-- rays -->
        ${rays.map(({a, len}) => `
          <line class="ray" x1="0" y1="0" x2="${(Math.cos(a)*len).toFixed(1)}" y2="${(Math.sin(a)*len).toFixed(1)}"/>
        `).join('')}
        <!-- sweep wedge -->
        <path class="sweep" d="M 0 0 L 130 0 A 130 130 0 0 1 91.9 91.9 Z"/>
        <!-- obstacles -->
        ${obs.map(o => `<circle class="obstacle" cx="${o.x}" cy="${o.y}" r="3"/>`).join('')}
        <!-- robot -->
        <circle class="robot" cx="0" cy="0" r="6"/>
        <circle cx="0" cy="0" r="10" fill="none" stroke="var(--primary)" stroke-width="1" opacity="0.5"/>
        <!-- label -->
        <text x="-150" y="-140" font-family="JetBrains Mono" font-size="10" fill="var(--fg-3)">LIDAR · IR · ODOM @ 50Hz</text>
        <text x="40" y="150" font-family="JetBrains Mono" font-size="10" fill="var(--p3)">6 obstacles · 0.04m loc-err</text>
      </svg>
    `;
  }

  // ====================================================================
  // 4. SETLISTS — reorder the IDE file tree on the Projects page
  // ====================================================================
  const ideEl = document.querySelector('.page[data-page="projects"] .ide');
  if (ideEl && ideEl.parentElement) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="setlist-bar">
        <span class="label">Setlist</span>
        <button class="setlist-pill active" data-setlist="default">All projects</button>
        <button class="setlist-pill" data-setlist="ml-research">ML / Research</button>
        <button class="setlist-pill" data-setlist="quant">Quant / Fintech</button>
        <button class="setlist-pill" data-setlist="faang">FAANG SWE</button>
      </div>
      <div class="setlist-intro" id="setlist-intro"></div>
    `;
    ideEl.parentElement.insertBefore(wrap, ideEl);
  }

  const setlistIntro = document.getElementById('setlist-intro');
  const fileTree = document.getElementById('file-tree');

  function applySetlist(name) {
    document.querySelectorAll('.setlist-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.setlist === name);
    });
    if (!fileTree) return;

    const items = Array.from(fileTree.querySelectorAll('.ide-item'));

    if (name === 'default' || !SETLISTS[name]) {
      items.sort((a, b) => Number(a.dataset.origIdx) - Number(b.dataset.origIdx));
      items.forEach(it => fileTree.appendChild(it));
      if (setlistIntro) setlistIntro.classList.remove('show');
      return;
    }

    const sl = SETLISTS[name];
    const byN = {};
    items.forEach(it => { byN[it.dataset.tab] = it; });
    sl.order.forEach(n => {
      const it = byN[n];
      if (it) fileTree.appendChild(it);
    });

    if (setlistIntro) {
      setlistIntro.innerHTML = `<span class="for">${sl.tag}</span>${sl.intro}`;
      setlistIntro.classList.add('show');
    }
  }

  // Tag file-tree items with original index so we can restore default order
  setTimeout(() => {
    if (!fileTree) return;
    Array.from(fileTree.querySelectorAll('.ide-item')).forEach((it, i) => {
      it.dataset.origIdx = i;
    });
    document.querySelectorAll('.setlist-pill').forEach(p => {
      p.addEventListener('click', () => applySetlist(p.dataset.setlist));
    });
  }, 100);

  // Terminal command — register with COMMANDS if available
  if (window.__term && window.__term.COMMANDS) {
    window.__term.COMMANDS.setlist = function(args) {
      const name = (args[0] || '').toLowerCase();
      const aliases = {
        'ml': 'ml-research', 'research': 'ml-research', 'ml-research': 'ml-research',
        'quant': 'quant', 'fintech': 'quant',
        'faang': 'faang', 'swe': 'faang',
        'all': 'default', 'reset': 'default', 'default': 'default',
      };
      const target = aliases[name];
      if (!target) {
        const list = Object.keys(SETLISTS).map(k => `<span style="color:var(--p3)">${k}</span>`).join(', ');
        return { line: `<span class="dim">setlists:</span> ${list}, <span style="color:var(--p3)">all</span>`, cls: 'out' };
      }
      applySetlist(target);
      // navigate to projects page so user sees it
      window.__navigate && window.__navigate('projects');
      const sl = SETLISTS[target];
      return { line: `<span class="ok">▸</span> setlist → <span style="color:var(--fg)">${sl ? sl.label : 'all projects'}</span>`, cls: 'out' };
    };
  }

  // expose for debugging
  window.__np = { applySetlist, openViz, closeViz, toggleLiner };
})();
