/* App glue v3: navigation, IDE explorer, langs. */
(function () {
  const PROJECTS = (window.__term && window.__term.TRACKS) || [];

  const PROJECT_FILES = [
    {
      id: '01', file: 'perchance.py', icon: '🏀', art: 'a1', title: 'PerChance',
      sub: 'Open-source player analytics platform — behavioral profiling, edge calibration, and opponent exploitability for NBA props.',
      metrics: [['Daily Users', '500+'], ['Daily API Calls', '500K+'], ['p95 Latency', '<200ms'], ['Uptime', '99.5%']],
      stack: ['XGBoost', 'CatBoost', 'SHAP', 'Django', 'React', 'Airflow', 'Spark', 'Redis', 'Docker'],
      github: 'https://github.com/andomo3/nbaPropsPrediction',
      liveUrl: 'https://nba-props-prediction.vercel.app/',
      preview: 'perchance.webp',
      star: {
        situation: 'Sportsbooks publish lines, but nobody tells you when a player is actually predictable.',
        task: 'Profile every player: calibrated edge, output distributions, and matchup splits.',
        action: 'XGBoost/CatBoost models behind a Django API, fed by nightly Airflow jobs, with a React frontend.',
        result: '500+ daily users at sub-200ms p95 and 99.5% uptime.'
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
        situation: 'Renovation pricing lived in nested Excel sheets; one estimate took most of a workday.',
        task: 'Turn that into an itemized estimate in seconds.',
        action: 'PySpark + Airflow ETL into Parquet, DuckDB validation, and a Next.js front end.',
        result: 'Estimates went from hours to 5 seconds.'
      }
    },
    {
      id: '03', file: 'gtsf_portfolio.py', icon: '📈', art: 'a3', title: 'GTSF',
      sub: 'Quantitative tools for a $500K live student-managed equity fund.',
      metrics: [['Portfolio', '$500K live'], ['VaR Reduction', '15%'], ['Coverage', '50 → 120 stocks'], ['Simulations', '10,000 runs']],
      stack: ['Python', 'Bloomberg Terminal', 'ARIMA', 'NumPy', 'Statsmodels', 'Monte Carlo'],
      star: {
        situation: 'A $500K live fund covered 50 tickers with no macro stress testing.',
        task: 'Widen coverage and surface tail risk before positions are sized.',
        action: 'Bloomberg screener, 10,000-run Monte Carlo under macro shocks, and ARIMA backtests.',
        result: 'Coverage grew to 120 tickers and portfolio VaR fell 15%.'
      }
    },
    {
      id: '04', file: 'doc_intelligence.py', icon: '📄', art: 'a4', title: 'Document Intelligence System',
      sub: 'Production classifier processing 10,000+ documents monthly for 50+ auditors.',
      metrics: [['Precision', '95%'], ['Latency', '45s → 8s'], ['Volume', '10K docs/mo'], ['Error Rate', '40% → 5%']],
      stack: ['Python', 'PostgreSQL', 'NLP', 'Multiprocessing', 'PyTest'],
      star: {
        situation: 'Auditors waited 45s per document, with a 40% error rate.',
        task: 'Fix speed and accuracy without new infrastructure.',
        action: 'Replaced an O(n²) loop with a hash-join and added 50+ data validation checks.',
        result: '8s per document, 95% precision, errors down to 5%.'
      }
    },
    {
      id: '05', file: 'credit_classifier.py', icon: '💳', art: 'a5', title: 'Credit Classification System',
      sub: 'Real-time credit risk API with a fully automated MLOps retraining loop.',
      metrics: [['Inference p95', '<10ms'], ['Cache Hit Rate', '70%+'], ['Retraining', 'Weekly'], ['Drift Detection', 'KS-test']],
      stack: ['FastAPI', 'XGBoost', 'Redis', 'Airflow', 'dbt', 'Great Expectations', 'MLflow', 'Docker'],
      star: {
        situation: 'Most credit models stop at a notebook and drift silently in production.',
        task: 'Serve decisions in real time and retrain automatically.',
        action: 'FastAPI + Redis serving, a weekly Airflow retraining pipeline, and KS-test drift alerts.',
        result: 'Sub-10ms p95 inference; new models ship only if they beat production.'
      }
    },
    {
      id: '06', file: 'hospital_ops.sql', icon: '🏥', art: 'a6', title: 'Hospital Operations Database',
      sub: 'Redesigned data infrastructure for 50,000+ patient records.',
      metrics: [['Tables', '15'], ['Records', '50,000+'], ['Redundancy', '-20%'], ['Query Time', '3s → 200ms']],
      stack: ['PostgreSQL', 'Python', 'CTEs', 'Window Functions'],
      star: {
        situation: 'An unnormalized schema made the key bed-utilization report an overnight batch job.',
        task: 'Make it fast enough for morning standups.',
        action: '3NF redesign across 15 tables, composite indexes, and window functions.',
        result: 'Query time from 3s to 200ms; redundancy down 20%.'
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
