/* ====================================================================
   NOW-PLAYING ENHANCEMENTS — runtime
   - Scroll-reactive EQ
   - Liner notes panel (toggle on player ♪ button)
   - Setlists (pills + terminal command)
   ==================================================================== */
(function () {
  'use strict';

  const TRACKS = (window.__term && window.__term.TRACKS) || [];

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    startEQ();
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });

  // also nudge on click/key (so page feels alive without scrolling)
  ['click', 'keydown', 'pointermove'].forEach(ev => {
    window.addEventListener(ev, () => {
      scrollEnergy = Math.min(1, scrollEnergy + 0.03);
      startEQ();
    }, { passive: true });
  });

  let eqRunning = false;
  function tickEQ() {
    scrollEnergy = Math.max(0, scrollEnergy - 0.018);                      // decay
    const baseAmp = 0.45;
    const amp = baseAmp + scrollEnergy * 1.05;                              // 0.45 → 1.5
    const speed = (1.5 - scrollEnergy * 1.05).toFixed(2) + 's';             // 1.5s → 0.45s
    document.documentElement.style.setProperty('--eq-amp', amp.toFixed(2));
    document.documentElement.style.setProperty('--eq-speed', speed);
    if (scrollEnergy <= 0) { eqRunning = false; return; }  // idle → stop the rAF loop
    requestAnimationFrame(tickEQ);
  }
  function startEQ() {
    if (REDUCED_MOTION || eqRunning) return; // CSS kills .eq span animation under reduce
    eqRunning = true;
    requestAnimationFrame(tickEQ);
  }
  startEQ();

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
  // No-op stubs kept only for the window.__np debug export below.
  function openViz() {}
  function closeViz() {}
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
        const list = Object.keys(SETLISTS).map(k => `<span style="color:var(--accent)">${k}</span>`).join(', ');
        window.__term.print(`<span class="dim">setlists:</span> ${list}, <span style="color:var(--accent)">all</span>`, 'out');
        return;
      }
      applySetlist(target);
      // navigate to projects page so user sees it
      window.__navigate && window.__navigate('projects');
      const sl = SETLISTS[target];
      window.__term.print(`<span class="ok">▸</span> setlist → <span style="color:var(--dark-fg)">${sl ? sl.label : 'all projects'}</span>`, 'out');
    };
  }

  // expose for debugging
  window.__np = { applySetlist, openViz, closeViz, toggleLiner };
})();
