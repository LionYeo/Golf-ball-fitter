(() => {
    // ─── Constants ───────────────────────────────────────────────────────────

    const STORAGE_KEY = 'golfFitterProfile_v2';

    const BRAND_GRADIENT = {
        'Titleist':           'from-gray-700 to-gray-900',
        'Callaway':           'from-blue-700 to-blue-900',
        'TaylorMade':         'from-slate-600 to-slate-900',
        'Srixon':             'from-red-600 to-red-800',
        'Bridgestone':        'from-orange-700 to-red-900',
        'Mizuno':             'from-blue-600 to-blue-900',
        'Volvik':             'from-emerald-500 to-teal-700',
        'Vice Golf':          'from-zinc-700 to-zinc-900',
        'Snell Golf':         'from-sky-600 to-sky-900',
        'Wilson':             'from-purple-700 to-purple-900',
        'Maxfli':             'from-gray-600 to-gray-800',
        'Kirkland Signature': 'from-red-700 to-red-900',
        'Cut Golf':           'from-slate-500 to-slate-700',
        'Top Flite':          'from-indigo-600 to-indigo-900',
        'Dixon Golf':         'from-green-600 to-green-900',
        'Nitro Golf':         'from-rose-500 to-red-700',
        'Honma':              'from-amber-600 to-amber-900',
        'PXG':                'from-stone-700 to-stone-900',
        'Noodle':             'from-cyan-500 to-cyan-800',
        'Inesis':             'from-teal-600 to-teal-900',
    };

    const BRAND_COLORS = {
        'Titleist':           '#be0000',
        'Callaway':           '#1d4ed8',
        'TaylorMade':         '#1e3a5f',
        'Srixon':             '#dc2626',
        'Bridgestone':        '#c2410c',
        'Mizuno':             '#1d4ed8',
        'Volvik':             '#059669',
        'Vice Golf':          '#27272a',
        'Snell Golf':         '#0284c7',
        'Wilson':             '#7c3aed',
        'Maxfli':             '#374151',
        'Kirkland Signature': '#991b1b',
        'Cut Golf':           '#334155',
        'Top Flite':          '#3730a3',
        'Dixon Golf':         '#166534',
        'Nitro Golf':         '#be123c',
        'Honma':              '#b45309',
        'PXG':                '#1c1917',
        'Noodle':             '#0369a1',
        'Inesis':             '#0f766e',
    };

    const MODEL_SHORT = {
        'Pro V1x Left Dash': 'Left Dash',
        'Chrome Tour X':     'Chr Tour X',
        'Chrome Soft X':     'Chr Soft X',
        'Soft Response':     'Soft Resp',
        'Tour Response':     'Tour Resp',
        'Distance+':         'Dist+',
        'Speed Soft':        'Speed Soft',
        'Tour B RXS':        'Tour RXS',
        'e12 Contact':       'e12 Cont',
        'Z-Star Diamond':    'Z-Star Dia',
        'Q-Star Tour':       'Q-Star T',
        'RB Tour X':         'RB Tour X',
        'Vivid Matte':       'Vivid Mat',
        'Power Soft':        'Pwr Soft',
        'MTB Black':         'MTB Black',
        'Staff Model X':     'Staff X',
        'Staff Model R':     'Staff R',
        'Staff Model':       'Staff',
        'Duo Soft+':         'Duo Soft+',
        'Gamer Tour':        'Gmr Tour',
        'Tour Titanium':     'Tour Ti',
        'White Out':         'White Out',
        'Long Distance':     'Long Dist',
        'Long & Soft':       'Long & Sft',
        'Easy Distance':     'Easy Dist',
        'Performance+':      'Perf+',
        'Kirkland Signature':'Signature',
        '0311 Tour':         '0311 Tour',
    };

    const PRICE_TIER = {
        value:   { label: 'Value',     cls: 'badge-value'   },
        mid:     { label: 'Mid-Range', cls: 'badge-mid'     },
        premium: { label: 'Premium',   cls: 'badge-premium' },
        tour:    { label: 'Tour',      cls: 'badge-tour'    },
    };

    const COVER_BADGE = {
        urethane: { label: 'Urethane', cls: 'badge-urethane' },
        ionomer:  { label: 'Ionomer',  cls: 'badge-ionomer'  },
    };

    const SWING_SPEED_MAP = { slow: 80, average: 92, fast: 102, tour: 112 };
    const BUDGET_TIERS    = { value: 0, mid: 1, premium: 2, tour: 3 };

    // ─── State ────────────────────────────────────────────────────────────────

    let golfBalls      = [];
    let currentResults = [];
    let viewMode       = 'cards';

    // ─── Element refs ─────────────────────────────────────────────────────────

    const currentBallInput = document.getElementById('current-ball');
    const scoreInput       = document.getElementById('average-score');
    const driverInput      = document.getElementById('driver-distance');
    const ironInput        = document.getElementById('iron-distance');
    const missInput        = document.getElementById('typical-miss');
    const p1Input          = document.getElementById('priority-1');
    const p2Input          = document.getElementById('priority-2');
    const p3Input          = document.getElementById('priority-3');
    const budgetInput      = document.getElementById('budget');
    const coverInput       = document.getElementById('cover-pref');

    const findBtn      = document.getElementById('find-balls-btn');
    const resetBtn     = document.getElementById('reset-btn');
    const resultsGrid  = document.getElementById('results-grid');
    const compareView  = document.getElementById('compare-view');
    const compareThead = document.getElementById('compare-thead');
    const compareTbody = document.getElementById('compare-tbody');
    const resultCount  = document.getElementById('result-count');
    const viewToggle   = document.getElementById('view-toggle');
    const btnCards     = document.getElementById('btn-cards');
    const btnCompare   = document.getElementById('btn-compare');
    const emptyState   = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const errorState   = document.getElementById('error-state');

    const allInputs = [currentBallInput, scoreInput, driverInput, ironInput, missInput, p1Input, p2Input, p3Input, budgetInput, coverInput];

    // ─── Bootstrap ────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', async () => {
        showLoading(true);
        const ok = await loadDatabase();
        showLoading(false);

        if (!ok) { showError(true); return; }

        populateCurrentBalls();
        restoreFromStorage();
        setupEventListeners();
        if (canRun()) updateResults();
    });

    // ─── Database ─────────────────────────────────────────────────────────────

    async function loadDatabase() {
        try {
            const res = await fetch('database.json');
            if (!res.ok) return false;
            golfBalls = await res.json();
            return true;
        } catch {
            return false;
        }
    }

    function populateCurrentBalls() {
        const sorted = [...golfBalls].sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        let currentBrand = '';
        let optGroup = null;

        sorted.forEach(b => {
            if (b.brand !== currentBrand) {
                currentBrand = b.brand;
                optGroup = document.createElement('optgroup');
                optGroup.label = currentBrand;
                currentBallInput.appendChild(optGroup);
            }
            const opt = document.createElement('option');
            opt.value = `${b.brand}|${b.model}`;
            opt.textContent = b.model;
            optGroup.appendChild(opt);
        });
    }

    // ─── Persistence ──────────────────────────────────────────────────────────

    function saveToStorage() {
        const data = {};
        allInputs.forEach(el => { data[el.id] = el.value; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function restoreFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            allInputs.forEach(el => { if (data[el.id]) el.value = data[el.id]; });
            deduplicatePriorities();
        } catch { /* corrupt storage — ignore */ }
    }

    function clearStorage() { localStorage.removeItem(STORAGE_KEY); }

    // ─── Priority deduplication ───────────────────────────────────────────────

    function deduplicatePriorities() {
        const vals = [p1Input.value, p2Input.value, p3Input.value];
        [p1Input, p2Input, p3Input].forEach((sel, idx) => {
            const others = vals.filter((v, i) => i !== idx && v !== '');
            Array.from(sel.options).forEach(opt => {
                if (!opt.value) return;
                opt.disabled = others.includes(opt.value);
            });
        });
    }

    // ─── Inline validation ────────────────────────────────────────────────────

    function validateForm() {
        const isDriverValid   = !!driverInput.value;
        const isPriorityValid = !!p1Input.value;

        driverInput.classList.toggle('field-error', !isDriverValid);
        document.getElementById('driver-error').classList.toggle('hidden', isDriverValid);

        p1Input.classList.toggle('field-error', !isPriorityValid);
        document.getElementById('priority-error').classList.toggle('hidden', isPriorityValid);

        return isDriverValid && isPriorityValid;
    }

    function canRun() { return !!(driverInput.value && p1Input.value); }

    // ─── Scoring ──────────────────────────────────────────────────────────────

    function scoreAllBalls() {
        const scoreVal  = scoreInput.value;
        const driver    = driverInput.value;
        const iron      = ironInput.value;
        const missVal   = missInput.value;
        const p1        = p1Input.value;
        const p2        = p2Input.value;
        const p3        = p3Input.value;
        const budgetVal = budgetInput.value;
        const coverPref = coverInput.value;

        // Estimate swing speed bucket robustly (averaging driver and iron if both exist)
        const speedPoints = { '<200': 1, '200-240': 2, '240-275': 3, '275+': 4,
                              '<130': 1, '130-150': 2, '150-170': 3, '170+': 4 };
        let sPts = 0, sCnt = 0;
        if (driver && speedPoints[driver]) { sPts += speedPoints[driver]; sCnt++; }
        if (iron && speedPoints[iron]) { sPts += speedPoints[iron]; sCnt++; }
        const avgSpeed = sCnt > 0 ? Math.round(sPts / sCnt) : 2;

        let estimatedSpeed = 'average';
        if (avgSpeed === 1) estimatedSpeed = 'slow';
        else if (avgSpeed === 3) estimatedSpeed = 'fast';
        else if (avgSpeed === 4) estimatedSpeed = 'tour';

        const playerSpeed = SWING_SPEED_MAP[estimatedSpeed];

        return golfBalls.map(ball => {
            let score = 0;
            const reasons = [];

            // 1 — Swing speed match
            const t = ball.target_swing_speed_mph;
            let minSpd = 0, maxSpd = 150;
            if (t.includes('-')) {
                const [a, b] = t.split('-');
                minSpd = parseInt(a); maxSpd = parseInt(b);
            } else if (t.includes('+')) {
                minSpd = parseInt(t);
            } else if (t.startsWith('<')) {
                maxSpd = parseInt(t.slice(1));
            }

            if (playerSpeed >= minSpd && playerSpeed <= maxSpd) {
                score += 15;
                reasons.push(`Optimal swing speed match (target: ${t} mph)`);
            } else if (playerSpeed >= minSpd - 5 && playerSpeed <= maxSpd + 5) {
                score += 8;
                reasons.push(`Good swing speed fit (target: ${t} mph)`);
            } else {
                score -= 10;
            }

            // 2 — Score profile
            if      (scoreVal === '100+' && ball.compression_rating <= 70)  { score += 8; reasons.push(`Low compression (${ball.compression_rating}) suits higher handicaps`); }
            else if (scoreVal === '90-99'&& ball.compression_rating > 60 && ball.compression_rating <= 85) { score += 5; reasons.push(`Balanced compression for bogey-level play`); }
            else if (scoreVal === '80-89'&& ball.greenside_spin_rpm >= 7500) { score += 5; reasons.push(`Greenside control for mid-handicappers`); }
            else if (scoreVal === '<80'  && ball.greenside_spin_rpm >= 8000) { score += 8; reasons.push(`High greenside spin (${ball.greenside_spin_rpm.toLocaleString()} rpm) for low handicap control`); }

            // 3 — Priorities (weighted)
            const priorities = [
                { val: p1, weight: 3 },
                { val: p2, weight: 2 },
                { val: p3, weight: 1 },
            ];

            priorities.forEach(({ val, weight }) => {
                if (!val) return;
                switch (val) {
                    case 'distance':
                        score += ((3200 - ball.driver_spin_rpm) / 100) * weight;
                        if (weight === 3) reasons.push(`Low driver spin (${ball.driver_spin_rpm.toLocaleString()} rpm) maximises distance`);
                        break;
                    case 'spin':
                        score += ((ball.greenside_spin_rpm - 5000) / 300) * weight;
                        if (weight === 3) reasons.push(`Elite greenside spin: ${ball.greenside_spin_rpm.toLocaleString()} rpm`);
                        break;
                    case 'spin_low':
                        score += ((9000 - ball.greenside_spin_rpm) / 300) * weight;
                        score += ((3200 - ball.driver_spin_rpm) / 100) * weight;
                        if (weight === 3) reasons.push(`Lower overall spin reduces offline shots`);
                        break;
                    case 'feel':
                        score += ((110 - ball.compression_rating) / 5) * weight;
                        if (weight === 3) reasons.push(`Very soft feel — compression ${ball.compression_rating}`);
                        break;
                    case 'feel_firm':
                        score += ((ball.compression_rating - 30) / 5) * weight;
                        if (weight === 3) reasons.push(`Firm, responsive feel — compression ${ball.compression_rating}`);
                        break;
                    case 'forgiveness':
                        score += ((3200 - ball.driver_spin_rpm) / 100) * weight;
                        if (weight === 3) reasons.push(`Low driver spin (${ball.driver_spin_rpm.toLocaleString()} rpm) keeps drives straight`);
                        break;
                    case 'workability':
                        score += ((ball.driver_spin_rpm - 2000) / 100) * weight;
                        score += ((ball.greenside_spin_rpm - 5000) / 300) * weight;
                        if (weight === 3) reasons.push(`High spin profile for shot shaping`);
                        break;
                    case 'flight_low':
                        score += ((3200 - ball.driver_spin_rpm) / 100) * weight;
                        if (ball.driver_spin_rpm < 2400) score += 5 * weight;
                        if (weight === 3) reasons.push(`Penetrating flight from low spin (${ball.driver_spin_rpm.toLocaleString()} rpm)`);
                        break;
                    case 'flight_high':
                        score += ((ball.driver_spin_rpm - 2000) / 100) * weight;
                        if (ball.driver_spin_rpm > 2600) score += 5 * weight;
                        if (weight === 3) reasons.push(`Higher trajectory from elevated spin (${ball.driver_spin_rpm.toLocaleString()} rpm)`);
                        break;
                }
            });

            // 4 — Typical miss
            if (missVal === 'big_curve') {
                score += ((3000 - ball.driver_spin_rpm) / 100) * 2.5;
                if (ball.driver_spin_rpm < 2450) reasons.push(`Low driver spin reduces side-spin contribution to misses`);
            } else if (missVal === 'slight_curve') {
                score += ((2900 - ball.driver_spin_rpm) / 100) * 1.2;
            } else if (missVal === 'straight') {
                score += 3;
            }

            // 5 — Cover preference
            if (coverPref === 'urethane') {
                if (ball.cover === 'urethane') { score += 12; reasons.push(`Urethane cover — tour-grade spin and feel`); }
                else score -= 20;
            } else if (coverPref === 'ionomer') {
                if (ball.cover === 'ionomer') { score += 8; reasons.push(`Ionomer cover — durable, consistent, great value`); }
                else score -= 10;
            }

            // 6 — Budget
            if (budgetVal) {
                const ballTier = BUDGET_TIERS[ball.price_tier] ?? 0;
                const budgetTier = BUDGET_TIERS[budgetVal] ?? 0;
                const diff = ballTier - budgetTier;
                
                if (diff === 0) {
                    score += 8;
                } else if (diff > 0) {
                    score -= diff * 15; // Heavy penalty if ball is more expensive
                } else {
                    score -= Math.abs(diff) * 2; // Light penalty if ball is cheaper
                }
            }

            // Always-visible "why" bullets
            reasons.push(
                `${ball.layers}-piece ${ball.cover} construction`,
                compressionLabel(ball.compression_rating),
                priceTierLabel(ball.price_tier)
            );

            return { ...ball, _score: score, _reasons: [...new Set(reasons)] };
        });
    }

    function compressionLabel(c) {
        const feel = c <= 50 ? 'very soft' : c <= 72 ? 'soft' : c <= 88 ? 'medium' : 'firm';
        return `Compression ${c} — ${feel} feel`;
    }

    function priceTierLabel(tier) {
        const map = { value: 'Value (~$20/dz)', mid: 'Mid-range (~$30/dz)', premium: 'Premium (~$45/dz)', tour: 'Tour (~$55+/dz)' };
        return map[tier] || tier;
    }

    // ─── Update results ───────────────────────────────────────────────────────

    function updateResults() {
        if (!validateForm()) return;

        const allScored = scoreAllBalls();
        allScored.sort((a, b) => b._score - a._score);
        currentResults = allScored.slice(0, 3);

        const baseScore = Math.max(currentResults[0]._score, 1);
        currentResults.forEach(b => {
            b._matchPct = Math.max(0, Math.min(100, Math.round((b._score / baseScore) * 100)));
        });

        if (viewMode === 'cards') renderCards();
        else renderCompare();

        viewToggle.classList.remove('hidden');
        resultCount.textContent = `Showing top 3 of ${allScored.length} balls`;

        if (window.innerWidth < 768) {
            resultsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        saveToStorage();
    }

    // ─── Ball SVG ─────────────────────────────────────────────────────────────

    function ballSVG(ball) {
        const color = BRAND_COLORS[ball.brand] || '#374151';
        const uid   = (ball.brand + ball.model).replace(/[^a-zA-Z0-9]/g, '');
        const label = MODEL_SHORT[ball.model] || ball.model;

        const words = label.split(' ');
        let line1 = label, line2 = '';
        if (words.length >= 2 && label.length > 8) {
            const mid = Math.ceil(words.length / 2);
            line1 = words.slice(0, mid).join(' ');
            line2 = words.slice(mid).join(' ');
        }
        const y1 = line2 ? '36' : '41';

        return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="width:60px;height:60px;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5))">
            <defs>
                <radialGradient id="bg${uid}" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="60%" stop-color="#f0f0f0"/>
                    <stop offset="100%" stop-color="#c8c8c8"/>
                </radialGradient>
                <clipPath id="cp${uid}"><circle cx="40" cy="40" r="36"/></clipPath>
            </defs>
            <circle cx="40" cy="40" r="36" fill="url(#bg${uid})"/>
            <g clip-path="url(#cp${uid})" fill="#bbb" opacity="0.55">
                <circle cx="25" cy="21" r="2.3"/><circle cx="33" cy="17" r="2.3"/><circle cx="41" cy="16" r="2.3"/>
                <circle cx="49" cy="17" r="2.3"/><circle cx="57" cy="21" r="2.3"/>
                <circle cx="18" cy="29" r="2.3"/><circle cx="26" cy="26" r="2.3"/>
                <circle cx="55" cy="26" r="2.3"/><circle cx="63" cy="29" r="2.3"/>
                <circle cx="14" cy="39" r="2.3"/><circle cx="66" cy="39" r="2.3"/>
                <circle cx="18" cy="51" r="2.3"/><circle cx="26" cy="54" r="2.3"/>
                <circle cx="55" cy="54" r="2.3"/><circle cx="63" cy="51" r="2.3"/>
                <circle cx="25" cy="59" r="2.3"/><circle cx="33" cy="63" r="2.3"/>
                <circle cx="49" cy="63" r="2.3"/><circle cx="57" cy="59" r="2.3"/>
            </g>
            <ellipse cx="40" cy="40" rx="36" ry="7" fill="none" stroke="${color}" stroke-width="1.8" clip-path="url(#cp${uid})" opacity="0.55"/>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#d4d4d4" stroke-width="0.6"/>
            <text x="40" y="${y1}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="${line2 ? '7.5' : '8.5'}" font-weight="900" fill="${color}" letter-spacing="0.3">${line1}</text>
            ${line2 ? `<text x="40" y="47" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="7.5" font-weight="900" fill="${color}" letter-spacing="0.3">${line2}</text>` : ''}
            <ellipse cx="28" cy="26" rx="9" ry="6" fill="white" opacity="0.28" transform="rotate(-35 28 26)"/>
        </svg>`;
    }

    function ballPhoto(ball) {
        const query    = encodeURIComponent(`${ball.brand} ${ball.model} golf ball`);
        const photoUrl = `https://tse1.mm.bing.net/th?q=${query}`;

        return `
            <div class="card-ball-wrap" style="position:relative;z-index:2;width:60px;height:60px;display:flex;align-items:center;justify-content:center">
                <img src="${photoUrl}" alt="${ball.brand} ${ball.model}"
                     style="width:60px;height:60px;object-fit:cover;border-radius:50%;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.4);position:absolute;inset:0"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                <div style="display:none;width:60px;height:60px;align-items:center;justify-content:center">
                    ${ballSVG(ball)}
                </div>
            </div>
        `;
    }

    // ─── Trajectory SVG ───────────────────────────────────────────────────────

    function buildTrajectorySVG(recBall, currBall) {
        const getPath = (spin, isCurrent) => {
            const s      = Math.max(0, Math.min(1.2, (spin - 2000) / 1000));
            const yPeak  = 35 - (s * 25);
            const xCarry = 160 - (s * 30);
            const xRoll  = xCarry + 35 - (s * 25);

            const color  = isCurrent ? '#3D5068' : '#1DB954';
            const strokeW = isCurrent ? '1.5' : '2.5';
            const dash   = isCurrent ? 'stroke-dasharray="4 4"' : '';

            return `
                <path d="M 10,50 Q ${xCarry * 0.6},${yPeak - 20} ${xCarry},50 L ${xRoll},50"
                      fill="none" stroke="${color}" stroke-width="${strokeW}" ${dash}
                      class="${isCurrent ? '' : 'animate-draw-path'}"
                      stroke-linecap="round"/>
                <circle cx="${xRoll}" cy="50" r="${isCurrent ? '2' : '3'}" fill="${color}"
                        style="opacity:0;animation:fadeUp 0.3s ease-out ${isCurrent ? '0s' : '1.2s'} forwards"/>
            `;
        };

        let paths      = '';
        let legendHtml = '';

        if (currBall) {
            paths      += getPath(currBall.driver_spin_rpm, true);
            legendHtml += `<div class="legend-item"><div class="legend-line-current"></div><span>Current</span></div>`;
        }
        paths      += getPath(recBall.driver_spin_rpm, false);
        legendHtml += `<div class="legend-item"><div class="legend-line-rec"></div><span>Rec</span></div>`;

        const bg = `
            <rect x="0" y="0" width="200" height="60" fill="transparent" rx="4"/>
            <line x1="10" y1="50" x2="190" y2="50" stroke="#1E3048" stroke-width="1.5"/>
            <rect x="5" y="47" width="5" height="5" fill="#1E3048" rx="1"/>
        `;

        return `
            <div class="trajectory-block">
                <div class="trajectory-header">
                    <span class="trajectory-title">
                        Driver Trajectory
                        <span style="font-weight:500;color:var(--text-3);margin-left:3px">(${recBall.driver_spin_rpm.toLocaleString()} rpm)</span>
                    </span>
                    <div class="trajectory-legend">${legendHtml}</div>
                </div>
                <svg viewBox="0 0 200 60" style="width:100%;height:54px;overflow:visible">
                    ${bg}${paths}
                </svg>
            </div>
        `;
    }

    // ─── Spectrum ─────────────────────────────────────────────────────────────

    function buildSpectrum(title, val, labelLeft, labelRight, min, max, recVal, currVal, gradientStyle) {
        const rPct = Math.max(3, Math.min(94, ((recVal - min) / (max - min)) * 100));
        let currMarker = '';
        if (currVal !== undefined) {
            const cPct = Math.max(3, Math.min(94, ((currVal - min) / (max - min)) * 100));
            currMarker = `<div class="spectrum-current-marker" style="left:${cPct}%" title="Current Ball"></div>`;
        }

        return `
            <div class="spectrum-item">
                <div class="spectrum-meta">
                    <span class="spectrum-label">${labelLeft}</span>
                    <span class="spectrum-value">${title}: ${val}</span>
                    <span class="spectrum-label" style="text-align:right">${labelRight}</span>
                </div>
                <div class="spectrum-track" style="${gradientStyle}">
                    ${currMarker}
                    <div class="spectrum-dot" style="left:${rPct}%"></div>
                </div>
            </div>
        `;
    }

    // ─── Render: Cards ────────────────────────────────────────────────────────

    function renderCards() {
        Array.from(resultsGrid.children).forEach(el => { if (el.dataset.card) el.remove(); });

        if (!currentResults.length) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        const currentBallVal = currentBallInput.value;
        let currentBallObj   = null;
        if (currentBallVal) {
            const [bBrand, bModel] = currentBallVal.split('|');
            currentBallObj = golfBalls.find(x => x.brand === bBrand && x.model === bModel);
        }

        currentResults.forEach((ball, idx) => {
            const gradient = BRAND_GRADIENT[ball.brand] || 'from-emerald-700 to-teal-900';
            const priceCfg = PRICE_TIER[ball.price_tier] || PRICE_TIER.mid;
            const coverCfg = COVER_BADGE[ball.cover]     || COVER_BADGE.ionomer;

            const matchCls = ball._matchPct >= 80 ? 'match-high'
                           : ball._matchPct >= 60 ? 'match-mid'
                           : 'match-low';

            const rankLabel = ['Best Match', '2nd Match', '3rd Match'][idx];

            const reasonsBullets = ball._reasons.slice(0, 6).map(r =>
                `<li class="why-item"><span class="why-check">✓</span><span>${r}</span></li>`
            ).join('');

            const feelSpectrum = buildSpectrum(
                'Compression', ball.compression_rating,
                'Soft', 'Firm',
                35, 110,
                ball.compression_rating,
                currentBallObj ? currentBallObj.compression_rating : undefined,
                'background: linear-gradient(to right, #7DD3FC, #86EFAC, #FDE68A)'
            );

            const spinSpectrum = buildSpectrum(
                'GS Spin', ball.greenside_spin_rpm.toLocaleString() + ' rpm',
                'Low', 'High',
                6000, 9000,
                ball.greenside_spin_rpm,
                currentBallObj ? currentBallObj.greenside_spin_rpm : undefined,
                'background: linear-gradient(to right, #93C5FD, #C4B5FD, #F9A8D4)'
            );

            const flightVisualizer = buildTrajectorySVG(ball, currentBallObj);

            const card = document.createElement('div');
            card.dataset.card = '1';
            card.className    = `result-card${idx === 0 ? ' is-best' : ''}`;
            card.style.cssText = `opacity:0;animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${idx * 0.12}s forwards`;

            card.innerHTML = `
                <div class="card-header bg-gradient-to-br ${gradient}">
                    <div class="card-header-overlay"></div>
                    <span class="card-rank">${rankLabel}</span>
                    <span class="card-match-pct ${matchCls}">${ball._matchPct}%</span>
                    ${ballPhoto(ball)}
                </div>

                <div class="card-body">
                    <div>
                        <p class="card-brand">${ball.brand}</p>
                        <h3 class="card-model">${ball.model}</h3>
                    </div>

                    <div class="badge-row">
                        <span class="badge ${priceCfg.cls}">${priceCfg.label}</span>
                        <span class="badge ${coverCfg.cls}">${coverCfg.label}</span>
                        <span class="badge badge-piece">${ball.layers}-Piece</span>
                    </div>

                    <div class="spectrum-block">
                        ${feelSpectrum}
                        ${spinSpectrum}
                    </div>

                    ${flightVisualizer}

                    <details class="why-details">
                        <summary class="why-summary">
                            <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 5l7 7-7 7"/>
                            </svg>
                            Why this ball?
                        </summary>
                        <ul class="why-list">${reasonsBullets}</ul>
                    </details>
                </div>
            `;

            resultsGrid.appendChild(card);
        });
    }

    // ─── Render: Compare ──────────────────────────────────────────────────────

    function renderCompare() {
        if (!currentResults.length) return;

        const balls = currentResults;

        compareThead.innerHTML = `<tr>
            <th>Stat</th>
            ${balls.map((b, i) => `
            <th>
                <span style="display:block;font-size:0.62rem;font-weight:600;color:var(--text-3);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.07em">${['Best Match','2nd Match','3rd Match'][i]}</span>
                ${b.brand} ${b.model}
            </th>`).join('')}
        </tr>`;

        const minDrvSpin = Math.min(...balls.map(b => b.driver_spin_rpm));
        const maxGsSpin  = Math.max(...balls.map(b => b.greenside_spin_rpm));
        const maxPct     = Math.max(...balls.map(b => b._matchPct));

        const rows = [
            { label: 'Match Score',       vals: balls.map(b => `${b._matchPct}%`),                             winner: balls.findIndex(b => b._matchPct === maxPct) },
            { label: 'Cover',             vals: balls.map(b => b.cover.charAt(0).toUpperCase() + b.cover.slice(1)), winner: -1 },
            { label: 'Construction',      vals: balls.map(b => `${b.layers}-Piece`),                            winner: -1 },
            { label: 'Compression',       vals: balls.map(b => String(b.compression_rating)),                   winner: -1 },
            { label: 'Driver Spin (rpm)', vals: balls.map(b => b.driver_spin_rpm.toLocaleString()), winnerNote: '(lowest)',  winner: balls.findIndex(b => b.driver_spin_rpm === minDrvSpin) },
            { label: 'GS Spin (rpm)',     vals: balls.map(b => b.greenside_spin_rpm.toLocaleString()), winnerNote: '(highest)', winner: balls.findIndex(b => b.greenside_spin_rpm === maxGsSpin) },
            { label: 'Price Tier',        vals: balls.map(b => PRICE_TIER[b.price_tier]?.label || b.price_tier), winner: -1 },
            { label: 'Speed Target',      vals: balls.map(b => `${b.target_swing_speed_mph} mph`),              winner: -1 },
        ];

        compareTbody.innerHTML = rows.map(row => `
            <tr>
                <td>
                    ${row.label}
                    ${row.winnerNote ? `<span style="font-weight:500;color:var(--text-3);margin-left:3px">${row.winnerNote}</span>` : ''}
                </td>
                ${row.vals.map((v, i) => `<td class="${i === row.winner ? 'compare-winner' : ''}">${v}</td>`).join('')}
            </tr>
        `).join('');
    }

    // ─── View toggle ──────────────────────────────────────────────────────────

    function setViewMode(mode) {
        viewMode = mode;
        if (mode === 'cards') {
            resultsGrid.classList.remove('hidden');
            compareView.classList.add('hidden');
            btnCards.classList.add('active');
            btnCompare.classList.remove('active');
            renderCards();
        } else {
            resultsGrid.classList.add('hidden');
            compareView.classList.remove('hidden');
            btnCompare.classList.add('active');
            btnCards.classList.remove('active');
            renderCompare();
        }
    }

    // ─── Show/hide helpers ────────────────────────────────────────────────────

    function showLoading(show) {
        loadingState.classList.toggle('hidden', !show);
        resultsGrid.classList.toggle('hidden', show);
    }

    function showError(show) {
        errorState.classList.toggle('hidden', !show);
        if (show) resultsGrid.classList.add('hidden');
    }

    // ─── Event listeners ──────────────────────────────────────────────────────

    function setupEventListeners() {
        allInputs.forEach(el => {
            el.addEventListener('change', (e) => {
                if ([p1Input, p2Input, p3Input].includes(el)) {
                    const newVal = e.target.value;
                    if (newVal) {
                        [p1Input, p2Input, p3Input].forEach(other => {
                            if (other !== el && other.value === newVal) other.value = '';
                        });
                    }
                    deduplicatePriorities();
                }
                if (canRun()) updateResults();
            });
        });

        findBtn.addEventListener('click', () => {
            if (validateForm()) updateResults();
        });

        resetBtn.addEventListener('click', () => {
            allInputs.forEach(el => { el.value = ''; });
            deduplicatePriorities();
            clearStorage();
            currentResults = [];
            viewToggle.classList.add('hidden');
            resultCount.textContent = '';
            viewMode = 'cards';
            resultsGrid.classList.remove('hidden');
            compareView.classList.add('hidden');
            btnCards.classList.add('active');
            btnCompare.classList.remove('active');

            Array.from(resultsGrid.children).forEach(el => { if (el.dataset.card) el.remove(); });
            emptyState.classList.remove('hidden');

            driverInput.classList.remove('field-error');
            p1Input.classList.remove('field-error');
            document.getElementById('driver-error').classList.add('hidden');
            document.getElementById('priority-error').classList.add('hidden');
        });

        btnCards.addEventListener('click',   () => setViewMode('cards'));
        btnCompare.addEventListener('click', () => setViewMode('compare'));
    }

})();
