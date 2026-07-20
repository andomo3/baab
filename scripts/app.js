/* App glue v3: navigation, IDE explorer, langs. */
(function () {
  const PROJECTS = (window.__term && window.__term.TRACKS) || [];

  const PROJECT_FILES = [
    {
      id: '01', file: 'perchance.py', icon: '🏀', art: 'a1', title: 'PerChance',
      sub: 'Open-source player analytics platform — behavioral profiling, edge calibration, and opponent exploitability for NBA props.',
      metrics: [['Players Profiled', '450+'], ['Intelligence Views', '5'], ['API Latency', '<200ms'], ['Seasons Backtested', '3']],
      stack: ['XGBoost', 'CatBoost', 'SHAP', 'Django', 'React', 'Airflow', 'Spark', 'Redis', 'Docker'],
      github: 'https://github.com/andomo3/nbaPropsPrediction',
      liveUrl: 'https://nba-props-prediction.vercel.app/',
      preview: 'perchance.webp',
      star: {
        situation: 'Sportsbooks publish lines. Nobody tells you when a player is genuinely predictable — or why performance shifts by rest, form, and matchup.',
        task: 'Build an open-source platform with full player behavioral profiles: calibrated edge, output distributions, opponent splits, and a predictability fingerprint.',
        action: 'Built a Django REST API with XGBoost/CatBoost regressors per player/stat and SHAP explainability. Wired Airflow DAGs for nightly ingestion, Spark for scale, Redis for caching. Built a React frontend with five intelligence views and a composite predictability leaderboard.',
        result: 'Five views per player per stat. Leaderboard ranks all tracked players across seasons. Self-hostable end-to-end with a single Docker Compose up.'
      }
    },
    {
      id: '02', file: 'altura_estimator.py', icon: '🏗️', art: 'a2', title: 'Altura',
      sub: 'Automated pricing platform for a 101-unit multi-family property operator.',
      metrics: [['Estimate Time', 'hours → 5s'], ['Categories', '13'], ['Units', '101'], ['Pipeline', 'Airflow DAG']],
      stack: ['PySpark', 'Airflow', 'DuckDB', 'Parquet', 'Next.js', 'Python'],
      liveUrl: 'https://altura-orcin.vercel.app/',
      preview: 'altura.webp',
      star: {
        situation: 'A 101-unit property operator priced renovations from nested Excel matrices no off-the-shelf tool could parse. One estimate took most of a workday.',
        task: 'Automate the full extraction and pricing flow so the client receives an itemized estimate in seconds, not hours.',
        action: 'Built a PySpark + Airflow ETL to extract Excel matrices into Parquet tables, added a DuckDB validation layer for data quality, and wired the output into a Next.js 4-step configuration interface.',
        result: 'Estimate time dropped from hours to 5 seconds. Schema is PySpark-ready for multi-property expansion — no code changes required.'
      }
    },
    {
      id: '03', file: 'gtsf_portfolio.py', icon: '📈', art: 'a3', title: 'GTSF',
      sub: 'Quantitative tools for a $500K live student-managed equity fund.',
      metrics: [['Portfolio', '$500K live'], ['VaR Reduction', '15%'], ['Coverage', '50 → 120 stocks'], ['Simulations', '10,000 runs']],
      stack: ['Python', 'Bloomberg Terminal', 'ARIMA', 'NumPy', 'Statsmodels', 'Monte Carlo'],
      star: {
        situation: 'The GT Student Fund manages $500K in live equity with model outputs driving real allocations. Coverage sat at 50 tickers with no macro stress-testing.',
        task: 'Triple the investable universe and build a quantitative risk framework to surface tail risk before positions are sized.',
        action: 'Built a Bloomberg screener to expand coverage. Ran 10,000-iteration Monte Carlo simulations under macro shocks. Implemented ARIMA models to validate sector-rotation strategies against historical regime data.',
        result: 'Coverage expanded from 50 to 120 tickers. Simulations surfaced 8% downside risk that directly shaped the fund\'s hedging position. Portfolio VaR reduced 15%.'
      }
    },
    {
      id: '04', file: 'doc_intelligence.py', icon: '📄', art: 'a4', title: 'Document Intelligence System',
      sub: 'Production classifier processing 10,000+ documents monthly for 50+ auditors.',
      metrics: [['Precision', '95%'], ['Latency', '45s → 8s'], ['Volume', '10K docs/mo'], ['Error Rate', '40% → 5%']],
      stack: ['Python', 'PostgreSQL', 'NLP', 'A/B Testing', 'PyTest'],
      star: {
        situation: '50+ auditors processed 10,000+ documents monthly through a pipeline running at 45s per doc with a 40% error rate. Real-time use had been abandoned.',
        task: 'Fix latency and accuracy without retraining the model or rebuilding the infrastructure.',
        action: 'Profiled the pipeline, identified an O(n²) matching loop, and swapped it for an O(n+m) hash-join — no model changes. Built a statistical validation framework with 50+ distributional checks to catch label noise upstream.',
        result: 'Latency cut from 45s to 8s. Precision hit 95%. Error rate fell from 40% to 5%. The pipeline now supports real-time use during live audits.'
      }
    },
    {
      id: '05', file: 'loan_default.py', icon: '💳', art: 'a5', title: 'Loan Default Risk Model',
      sub: 'ML classifier to flag high-risk loan applications before approval.',
      metrics: [['AUC', '0.80'], ['Recall', '82%'], ['Applications', '50,000+'], ['Decision Quality', '+10%']],
      stack: ['XGBoost', 'SHAP', 'SQL', 'Python', 'SMOTE'],
      star: {
        situation: 'A lending team needed a regulatory-grade risk model. Black-box scores weren\'t deployable — auditors had to explain every denial in plain language.',
        task: 'Build an interpretable classifier on 50,000+ applications with a tiered risk score auditors can defend to regulators.',
        action: 'Engineered 15 features from credit bureau data via CTE-based SQL ETL. Applied SMOTE to fix a 20:1 class imbalance, trained XGBoost, and used SHAP to identify dominant predictors and build the tiered risk framework.',
        result: '0.80 AUC, 82% recall. SHAP surfaced debt-to-income ratio as the primary driver — gave auditors a defensible narrative. Decision quality improved 10%.'
      }
    },
    {
      id: '06', file: 'hospital_ops.sql', icon: '🏥', art: 'a6', title: 'Hospital Operations Database',
      sub: 'Redesigned data infrastructure for 50,000+ patient records.',
      metrics: [['Tables', '15'], ['Records', '50,000+'], ['Redundancy', '-20%'], ['Query Time', '3s → 200ms']],
      stack: ['PostgreSQL', 'Python', 'CTEs', 'Window Functions'],
      star: {
        situation: 'A hospital operations team ran every query through bespoke scripts on an unnormalized schema. The primary bed utilization report took 3 seconds — treated as overnight batch.',
        task: 'Redesign the schema for correctness and make the critical utilization query fast enough for morning standups.',
        action: 'Redesigned to 3NF across 15 tables with FK enforcement and composite indexes targeting the utilization query. Rewrote rolling analysis using window functions to replace all bespoke scripts.',
        result: 'Query time dropped from 3s to 200ms. Data redundancy cut 20%. The overnight batch report became a real-time operational tool.'
      }
    },
  ];

  // ----------- Navigation -----------
  function navigate(page) {
    const main = document.querySelector('.main');
    const current = document.querySelector('.page.active');
    const target = document.querySelector(`.page[data-page="${page}"]`);
    if (!target) return;
    document.querySelectorAll('.nav-item, .nav-logo, .mob-tab, [data-nav]').forEach(a => {
      const isActive = a.dataset.nav === page;
      a.classList.toggle('active', isActive);
      if (a.classList.contains('nav-item')) {
        if (isActive) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      }
    });
    const screenLabel = document.getElementById('screen-label');
    if (screenLabel) screenLabel.textContent = target.dataset.screenLabel || '';
    history.replaceState({}, '', '#' + page);
    if (current === target) return;
    if (current) {
      current.classList.add('leaving');
      setTimeout(() => {
        current.classList.remove('active', 'leaving');
        target.classList.add('active');
        if (main) main.scrollTo({ top: 0, behavior: 'instant' });
      }, 180);
    } else {
      target.classList.add('active');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  window.__navigate = navigate;

  document.querySelectorAll('.nav-item, .nav-logo, .mob-tab, [data-nav]').forEach(a => {
    a.addEventListener('click', () => { if (a.dataset.nav) navigate(a.dataset.nav); });
  });

  // Delegated terminal-command triggers (the Projects "Shuffle" button)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cmd]');
    if (el && window.__term) window.__term.runCmd(el.dataset.cmd);
  });

  // Nav logo click
  document.querySelector('.nav-logo')?.addEventListener('click', () => navigate('home'));

  const hash = (location.hash || '').replace('#', '');
  if (['home', 'projects', 'about', 'contact'].includes(hash)) navigate(hash);

  // Plain digit shortcuts (1-4) — no modifiers, so browser combos like
  // Ctrl+1 (tab switching) are never hijacked. Inactive while typing.
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return; // leave browser-reserved combos alone
    const a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return;
    const map = { '1': 'home', '2': 'projects', '3': 'about', '4': 'contact' };
    if (map[e.key]) navigate(map[e.key]);
    if (e.key === '/') {
      const ti = document.getElementById('term-input');
      if (ti && ti.offsetParent !== null) { // terminal visible (home page)
        e.preventDefault(); // keep the slash out of the input
        ti.focus();
      }
    }
  });

  // ----------- Contextual icons (24px, line) -----------
  const ICONS = {
    '01': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    '02': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12c3-2 6-2 9 0s6 2 9 0"/><path d="M12 3c-2 3-2 6 0 9s2 6 0 9"/></svg>',
    '03': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 010 18"/><path d="M12 3a14 14 0 000 18"/></svg>',
    '04': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
    '05': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/></svg>',
    '06': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>',
  };
  window.__ICONS = ICONS;
  // ----------- File tree + IDE tabs -----------
  const tree = document.getElementById('file-tree');
  if (tree) {
    PROJECT_FILES.forEach(p => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'ide-item';
      el.dataset.tab = p.id;
      el.innerHTML = `<span class="glyph">›</span><span>${p.file}</span>`;
      el.addEventListener('click', () => openTab(p.id));
      tree.appendChild(el);
    });
  }

  const content = document.getElementById('ide-content');

  function renderEmptyView() {
    return `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 380px; text-align:center; color: var(--fg-3);">
        <div style="font-size: 36px; margin-bottom: 12px; opacity: 0.6;">♫</div>
        <div style="font-size: 15px; color: var(--fg-2); margin-bottom: 6px;">No file open</div>
        <div style="font-size: 13px;">Pick a file from the tree, or browse the playlist above.</div>
      </div>
    `;
  }

  function renderFileView(id) {
    const p = PROJECT_FILES.find(x => x.id === id);
    if (!p) return renderEmptyView();
    const idx = PROJECT_FILES.indexOf(p);
    const prev = PROJECT_FILES[idx - 1];
    const next = PROJECT_FILES[idx + 1];
    const links = [
      p.github ? `<a class="proj-link" href="${p.github}" target="_blank" rel="noopener noreferrer"><span class="proj-link-icon">⌥</span>GitHub</a>` : '',
      p.liveUrl ? `<a class="proj-link" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer"><span class="proj-link-icon">↗</span>Live Site</a>` : '',
    ].filter(Boolean).join('');
    const star = p.star;
    return `
      <div class="project-detail">
        <div class="crumb">~/projects/${p.file}</div>
        <h2>${p.title}</h2>
        <div class="sub">${p.sub}</div>
        <div class="proj-actions">
          <div class="stack-row">${p.stack.map(s => `<span class="tag">${s}</span>`).join('')}</div>
          ${links ? `<div class="proj-links">${links}</div>` : ''}
        </div>
        ${star ? `
        <div class="star-grid">
          <div class="star-item">
            <div class="star-label"><span class="star-letter">S</span>ituation</div>
            <p>${star.situation}</p>
          </div>
          <div class="star-item">
            <div class="star-label"><span class="star-letter">T</span>ask</div>
            <p>${star.task}</p>
          </div>
          <div class="star-item">
            <div class="star-label"><span class="star-letter">A</span>ction</div>
            <p>${star.action}</p>
          </div>
          <div class="star-item">
            <div class="star-label"><span class="star-letter">R</span>esult</div>
            <p>${star.result}</p>
          </div>
        </div>
        ` : ''}
        <div class="proj-nav">
          ${prev ? `<button class="proj-nav-btn" data-go="${prev.id}">← ${prev.title.split('—')[0].trim()}</button>` : '<span></span>'}
          ${next ? `<button class="proj-nav-btn" data-go="${next.id}">→ ${next.title.split('—')[0].trim()}</button>` : '<span></span>'}
        </div>
      </div>
    `;
  }

  let syncingFromTab = false;
  let syncingFromTerm = false;

  function openTab(id, opts = {}) {
    if (!content) return;
    const p = PROJECT_FILES.find(x => x.id === id);
    if (!p) return;
    if (tree) tree.querySelectorAll('.ide-item').forEach(t => {
      const open = t.dataset.tab === id;
      t.classList.toggle('active', open);
      if (open) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    content.innerHTML = renderFileView(id);
    content.style.animation = 'none';
    content.offsetHeight;
    content.style.animation = '';
    content.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => openTab(btn.dataset.go));
    });
    if (!syncingFromTerm) {
      syncingFromTab = true;
      const n = parseInt(id, 10);
      if (window.__term) window.__term.runCmd('play ' + n, opts.silent ? { echo: false, silent: true } : undefined);
      syncingFromTab = false;
    }
  }
  window.__openTab = openTab;

  // Initial IDE sync: execute silently so no stray `play 1` block
  // prints above the terminal boot intro.
  openTab(PROJECT_FILES[0].id, { silent: true });
  // Sync the terminal to the initially-active project so the IDE and the
  // shell agree on first render — independent of the
  // terminal intro timing.
  window.dispatchEvent(new CustomEvent('np-update', { detail: { idx: 0 } }));

  // When the track changes (terminal, prev/next, shelf tile), open the matching IDE tab.
  // Only navigate to projects if the user is already there — don't auto-jump pages.
  window.addEventListener('np-update', (e) => {
    if (syncingFromTab) return;
    const idx = e.detail && e.detail.idx;
    const t = (window.__term && window.__term.TRACKS && window.__term.TRACKS[idx]);
    if (!t) return;
    const projectsPage = document.querySelector('.page[data-page="projects"]');
    const onProjects = projectsPage && projectsPage.classList.contains('active');
    if (!onProjects) return;
    syncingFromTerm = true;
    openTab(t.n);
    syncingFromTerm = false;
  });

  // ----------- Languages -----------
  const langsEl = document.getElementById('langs');
  if (langsEl) {
    const langs = [['Python', 32], ['TypeScript', 22], ['SQL', 12], ['C++', 9], ['R', 8], ['JavaScript', 7], ['Go', 5], ['Bash', 5]];
    langsEl.innerHTML = langs.map(([n, p]) => `
      <div class="row">
        <div class="name">${n}</div>
        <div class="bar"><span style="width: ${p * 2.5}%"></span></div>
        <div class="pct">${p}%</div>
      </div>
    `).join('');
  }

  // ----------- Artist grid -----------
  const ag = document.getElementById('artist-grid');
  if (ag) {
    function renderFallbackArtists() {
      const fallback = ['playboi carti', 'jaden smith', 'ken carson', 'yeat', '—', '—', '—', '—', '—', '—', '—', '—'];
      ag.innerHTML = fallback.map((name, i) => {
        const angle = (i * 30) % 360;
        const flip = i % 2 === 0;
        return `<div class="artist-tile" style="background:linear-gradient(${angle}deg,${flip ? 'var(--p1)' : 'var(--p3)'},${flip ? 'var(--p3)' : 'var(--p1)'})"><span>${name}</span></div>`;
      }).join('');
    }

    fetch('data/spotify-top-artists.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(artists => {
        ag.innerHTML = artists.slice(0, 12).map(a => {
          const bg = a.image
            ? `background-image:url(${a.image})`
            : `background:linear-gradient(135deg,var(--p1),var(--p3))`;
          return `<div class="artist-tile" style="${bg}"><span>${a.name}</span></div>`;
        }).join('');
      })
      .catch(renderFallbackArtists);
  }

})();
