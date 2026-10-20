/* App glue v3: navigation, IDE explorer, langs. */
(function () {
  const PROJECTS = (window.__term && window.__term.TRACKS) || [];

  // Names, stacks and links. Each project's sentence and its Situation / Task /
  // Action / Result text are strings (proj.<id>.*), so they can be translated.
  const PROJECT_FILES = [
    {
      id: '01', file: 'perchance.py', icon: '🏀', art: 'a1', title: 'PerChance',
      metrics: [['Daily Users', '500+'], ['Daily API Calls', '500K+'], ['p95 Latency', '<200ms'], ['Uptime', '99.5%']],
      stack: ['XGBoost', 'CatBoost', 'SHAP', 'Django', 'React', 'Airflow', 'Spark', 'Redis', 'Docker'],
      github: 'https://github.com/andomo3/nbaPropsPrediction',
      liveUrl: 'https://nba-props-prediction.vercel.app/',
      preview: 'perchance.webp',
    },
    {
      id: '02', file: 'altura_estimator.py', icon: '🏗️', art: 'a2', title: 'Altura',
      metrics: [['Estimate Time', 'hours → 5s'], ['Categories', '13'], ['Units', '101'], ['Pipeline', 'Airflow DAG']],
      stack: ['PySpark', 'Airflow', 'DuckDB', 'Parquet', 'Next.js', 'Python'],
      liveUrl: 'https://altura-orcin.vercel.app/',
      preview: 'altura.webp',
    },
    {
      id: '03', file: 'gtsf_portfolio.py', icon: '📈', art: 'a3', title: 'GTSF',
      metrics: [['Portfolio', '$500K live'], ['VaR Reduction', '15%'], ['Coverage', '50 → 120 stocks'], ['Simulations', '10,000 runs']],
      stack: ['Python', 'Bloomberg Terminal', 'ARIMA', 'NumPy', 'Statsmodels', 'Monte Carlo'],
    },
    {
      id: '04', file: 'doc_intelligence.py', icon: '📄', art: 'a4', title: 'Document Intelligence System',
      metrics: [['Precision', '95%'], ['Latency', '45s → 8s'], ['Volume', '10K docs/mo'], ['Error Rate', '40% → 5%']],
      stack: ['Python', 'PostgreSQL', 'NLP', 'Multiprocessing', 'PyTest'],
    },
    {
      id: '05', file: 'credit_classifier.py', icon: '💳', art: 'a5', title: 'Credit Classification System',
      metrics: [['Inference p95', '<10ms'], ['Cache Hit Rate', '70%+'], ['Retraining', 'Weekly'], ['Drift Detection', 'KS-test']],
      stack: ['FastAPI', 'XGBoost', 'Redis', 'Airflow', 'dbt', 'Great Expectations', 'MLflow', 'Docker'],
    },
    {
      id: '06', file: 'hospital_ops.sql', icon: '🏥', art: 'a6', title: 'Hospital Operations Database',
      metrics: [['Tables', '15'], ['Records', '50,000+'], ['Redundancy', '-20%'], ['Query Time', '3s → 200ms']],
      stack: ['PostgreSQL', 'Python', 'CTEs', 'Window Functions'],
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
    a.addEventListener('click', (e) => {
      if (!a.dataset.nav) return;
      if (a.tagName === 'A') {
        // Modified clicks open the link's href (#page) in a new tab as usual.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault(); // navigate() sets the hash itself, without a history entry
      }
      navigate(a.dataset.nav);
    });
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
    // Text in the current language. data-i18n lets a later language switch
    // update it in place.
    const tx = (key) => window.i18n.t(key).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const links = [
      p.github ? `<a class="proj-link" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>` : '',
      p.liveUrl ? `<a class="proj-link" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer"><span data-i18n="proj.live">${tx('proj.live')}</span> <span aria-hidden="true">↗</span></a>` : '',
    ].filter(Boolean).join('');
    const star = ['situation', 'task', 'action', 'result'].map(k => `
          <div class="star-item">
            <div class="star-label" data-i18n="star.${k}">${tx('star.' + k)}</div>
            <p data-i18n="proj.${id}.${k}">${tx(`proj.${id}.${k}`)}</p>
          </div>`).join('');
    return `
      <div class="project-detail">
        <h2>${p.title}</h2>
        <div class="sub" data-i18n="proj.${id}.sub">${tx(`proj.${id}.sub`)}</div>
        <div class="proj-actions">
          <p class="stack-line">${p.stack.join(' · ')}</p>
          ${links ? `<div class="proj-links">${links}</div>` : ''}
        </div>
        <div class="star-grid">${star}
        </div>
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

  // ----------- Top artists (a plain numbered list) -----------
  const ag = document.getElementById('artist-grid');
  if (ag) {
    const renderArtists = names => {
      ag.innerHTML = names.map(n => `<li>${n}</li>`).join('');
    };
    fetch('data/spotify-top-artists.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(artists => renderArtists(artists.slice(0, 12).map(a => a.name)))
      .catch(() => renderArtists(['Playboi Carti', 'Jaden', 'Ken Carson', 'Yeat']));
  }

})();
