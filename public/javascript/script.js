const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function initTheme() {
    const savedTheme = localStorage.getItem('vero_theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 19 || currentHour < 6;
        setTheme(isNight ? 'dark' : 'light');
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vero_theme', theme);
    if (theme === 'dark') {
        themeIcon.className = 'ph ph-sun';
    } else {
        themeIcon.className = 'ph ph-moon';
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

initTheme();

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

function setGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greetingHeader');
    if (!greetingEl) return;
    let text;
    if (hour >= 5 && hour < 12) {
        text = "Good Morning, Strategist.";
    } else if (hour >= 12 && hour < 18) {
        text = "Good Afternoon, Strategist.";
    } else {
        text = "Good Evening, Strategist.";
    }
    greetingEl.innerHTML = `<h2>${text}</h2>`;
}
setGreeting();
setInterval(setGreeting, 60000);

const slogans = [
    "Unfiltered Global Signals. Zero Noise.",
    "Tactical Intelligence Before the Headlines.",
    "Decrypting Geopolitics in Real Time.",
    "High-Fidelity Threat & Policy Monitoring.",
    "Raw Data. Strategic Clarity. Global Reach."
];

const heroSloganEl = document.getElementById('heroSlogan');
if (heroSloganEl) {
    heroSloganEl.textContent = slogans[Math.floor(Math.random() * slogans.length)];
}

const placeholders = [
    "Scan global defense news...",
    "Analyze economic sanctions...",
    "Monitor diplomatic summits...",
    "Search conflict theaters...",
    "Initialize tactical briefing..."
];

const searchInput = document.getElementById('searchInput');
let pIndex = 0;
if (searchInput) {
    setInterval(() => {
        pIndex = (pIndex + 1) % placeholders.length;
        searchInput.setAttribute("placeholder", placeholders[pIndex]);
    }, 3500);
}

const suggestionPool = [
    "Taiwan Strait", "BRICS", "Nuclear Deterrence", "OPEC+", "NATO Expansion",
    "Sahel Juntas", "Cyber Warfare", "Red Sea Security", "UN Security Council"
];

function loadSuggestions() {
    const suggestEl = document.getElementById('searchSuggestions');
    if (!suggestEl) return;

    const shuffled = [...suggestionPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    suggestEl.innerHTML = selected.map(term => `<button class="suggestion-pill" onclick="quickFetch('${term}')">${term}</button>`).join('');
}
loadSuggestions();

const defaultTopics = [
    'geopolitics', 'global defense', 'international diplomacy',
    'sanctions policy', 'global security', 'strategic alliance'
];

function getRandomDefaultTopic() {
    return defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
}

const newsGrid = document.getElementById('newsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentNewsData = [];

const WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
const coverFallbacks = {
    military: WM + 'b/b2/USS_Gerald_R._Ford_%28CVN-78%29_underway_on_8_April_2017.JPG/960px-USS_Gerald_R._Ford_%28CVN-78%29_underway_on_8_April_2017.JPG',
    economy: WM + 'd/df/Pudong_Shanghai_November_2017_panorama.jpg/960px-Pudong_Shanghai_November_2017_panorama.jpg',
    diplomacy: WM + 'e/ea/070401_Panmunjeom3.jpg/960px-070401_Panmunjeom3.jpg',
    intel: WM + 'b/bc/Taipei_Landscape.jpg/960px-Taipei_Landscape.jpg'
};

function analyzeContentTag(title, desc) {
    const content = (title + ' ' + (desc || '')).toLowerCase();
    if (content.match(/war|military|defense|troops|weapon|missile|navy|army|conflict|strike|fighter|artillery|drone|escalation|nuclear|pentagon|nato|pla|rebel|junta|combat|tactical/)) {
        return { name: 'Military', icon: 'ph-crosshair', key: 'military' };
    }
    if (content.match(/economy|market|bank|trade|inflation|sanction|currency|brics|stocks|tariff|financial|oil|gas|export|import|gdp|invest/)) {
        return { name: 'Economy', icon: 'ph-chart-line-up', key: 'economy' };
    }
    if (content.match(/president|minister|diplomat|summit|embassy|treaty|un|council|policy|envoy|talks|pact|diplomacy|ambassador|geopolitics|alliance/)) {
        return { name: 'Diplomacy', icon: 'ph-handshake', key: 'diplomacy' };
    }
    return { name: 'Global Intel', icon: 'ph-globe', key: 'intel' };
}

function proxiedImage(url) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=720&h=400&fit=cover&a=attention&output=webp&q=78`;
}

function attachCover(banner, sources, index) {
    const img = new Image();
    img.alt = 'Intelligence Cover';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.loading = index < 6 ? 'eager' : 'lazy';
    if (index < 3) img.fetchPriority = 'high';

    let step = 0;
    let timer;

    const advance = () => {
        clearTimeout(timer);
        step++;
        if (step < sources.length) {
            load();
        } else {
            img.remove();
            banner.classList.remove('loading');
        }
    };

    const load = () => {
        img.src = sources[step];
        if (step < sources.length - 1) timer = setTimeout(advance, 4500);
    };

    img.onload = () => {
        clearTimeout(timer);
        img.classList.add('ready');
        banner.classList.remove('loading');
    };
    img.onerror = advance;

    banner.appendChild(img);
    load();
}

function renderCards(data) {
    newsGrid.innerHTML = '';

    if (!data || data.length === 0) {
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 40px 0;">No operational intelligence matching your criteria at this moment.</p>';
        return;
    }

    data.forEach((item, index) => {
        const targetUrl = (item.url && item.url.startsWith('http')) ? item.url : '#';
        const card = document.createElement('a');
        card.className = 'card';
        card.href = targetUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const tagData = analyzeContentTag(item.title, item.description || '');
        const formattedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

        const coverImg = item.image;
        const invalidImg = !coverImg || !coverImg.startsWith('http') || ['generic', 'business', 'placeholder', 'logo', 'avatar', 'default', 'icon', 'stock'].some(kw => coverImg.toLowerCase().includes(kw));
        const sources = invalidImg ? [coverFallbacks[tagData.key]] : [proxiedImage(coverImg), coverImg, coverFallbacks[tagData.key]];

        const cleanDesc = item.description ? (item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description) : 'Access restricted. Click to view full encrypted briefing at the source.';

        card.innerHTML = `
            <div class="card-banner loading">
                <div class="card-tag"><i class="ph ${tagData.icon}"></i> ${tagData.name}</div>
            </div>
            <div class="card-content">
                <span class="card-date">${formattedDate}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${cleanDesc}</p>
                <div class="card-footer">
                    <div class="source-info">
                        <i class="ph ph-newspaper-clipping"></i>
                        <span>${item.source || 'Intelligence Feed'}</span>
                    </div>
                    <div class="read-more">
                        Read Source <i class="ph ph-arrow-up-right"></i>
                    </div>
                </div>
            </div>
        `;
        attachCover(card.querySelector('.card-banner'), sources, index);
        newsGrid.appendChild(card);
    });
}

const PAGE_SIZE = 9;
const state = { query: '', activeQuery: '', category: 'all', range: 'all', page: 1 };
let requestId = 0;

const pagination = document.getElementById('pagination');
const resultsMeta = document.getElementById('resultsMeta');
const rangeBtns = document.querySelectorAll('.range-btn');

function pageSequence(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [...new Set([1, 2, current - 1, current, current + 1, total - 1, total])]
        .filter(p => p >= 1 && p <= total)
        .sort((x, y) => x - y);
    const out = [];
    pages.forEach((p, i) => {
        if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
        out.push(p);
    });
    return out;
}

function renderPagination(page, totalPages) {
    if (!pagination) return;
    if (totalPages <= 1) {
        pagination.hidden = true;
        pagination.innerHTML = '';
        return;
    }
    const numbers = pageSequence(page, totalPages).map(p => p === 'gap'
        ? '<span class="page-gap">&hellip;</span>'
        : `<button type="button" class="page-num${p === page ? ' active' : ''}" data-page="${p}" ${p === page ? 'aria-current="page"' : ''}>${p}</button>`
    ).join('');

    pagination.innerHTML = `
        <button type="button" class="page-arrow" data-page="${page - 1}" aria-label="Previous page" ${page <= 1 ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
        <div class="page-center">
            <div class="page-numbers">${numbers}</div>
            <label class="page-jump">Go to
                <input type="text" id="pageJump" inputmode="numeric" maxlength="3" placeholder="${page}" aria-label="Go to page" autocomplete="off">
                <span>/ ${totalPages}</span>
            </label>
        </div>
        <button type="button" class="page-arrow" data-page="${page + 1}" aria-label="Next page" ${page >= totalPages ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
    `;
    pagination.hidden = false;
    pagination.dataset.total = totalPages;
}

if (pagination) {
    pagination.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        goToPage(parseInt(btn.dataset.page, 10));
    });

    pagination.addEventListener('input', (e) => {
        if (e.target.id === 'pageJump') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });

    pagination.addEventListener('keydown', (e) => {
        if (e.target.id !== 'pageJump' || e.key !== 'Enter') return;
        e.preventDefault();
        const total = parseInt(pagination.dataset.total, 10) || 1;
        const value = parseInt(e.target.value, 10);
        if (!value) return;
        goToPage(Math.min(Math.max(value, 1), total));
    });
}

function goToPage(page) {
    if (!page || page === state.page) return;
    fetchLiveNews(state.query, state.category, page, true);
}

function updateMeta(data) {
    if (!resultsMeta) return;
    if (!data.total) {
        resultsMeta.textContent = '';
        return;
    }
    const start = (data.page - 1) * PAGE_SIZE + 1;
    const end = Math.min(data.page * PAGE_SIZE, data.total);
    resultsMeta.textContent = `Showing ${start}\u2013${end} of ${data.total} reports`;
}

async function fetchLiveNews(query = '', category = 'all', page = 1, scrollToFeed = false) {
    const id = ++requestId;
    state.query = query;
    state.category = category;
    if (page === 1) state.activeQuery = query.trim() !== '' ? query.trim() : getRandomDefaultTopic();

    newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 60px 0;"><i class="ph ph-spinner ph-spin" style="font-size: 1.8rem; vertical-align: middle; margin-right: 8px;"></i> Fetching real-time global intelligence...</p>';
    if (pagination) pagination.hidden = true;
    if (scrollToFeed) document.getElementById('archives')?.scrollIntoView({ behavior: 'smooth' });

    try {
        const params = new URLSearchParams({
            q: state.activeQuery,
            category,
            range: state.range,
            page,
            size: PAGE_SIZE
        });
        const response = await fetch(`/api/news?${params}`);
        if (!response.ok) throw new Error(`Server returned status ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (id !== requestId) return;

        state.page = data.page || 1;
        currentNewsData = data.articles || [];
        renderCards(currentNewsData);
        renderPagination(state.page, data.totalPages || 1);
        updateMeta(data);
    } catch (error) {
        if (id !== requestId) return;
        console.error("Fetch error:", error);
        if (resultsMeta) resultsMeta.textContent = '';
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--danger); font-weight:600; padding: 40px 0;">Transmission standby. Verify connection or query parameters.</p>';
    }
}

const RECENT_KEY = 'vero_recent';

function getRecent() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch (err) {
        return [];
    }
}

function renderRecent() {
    const el = document.getElementById('recentSearches');
    if (!el) return;
    el.innerHTML = '';
    const list = getRecent();
    if (!list.length) return;

    const label = document.createElement('span');
    label.className = 'recent-label';
    label.textContent = 'Recent';
    el.appendChild(label);

    list.forEach(term => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'suggestion-pill recent-pill';
        b.textContent = term;
        b.addEventListener('click', () => quickFetch(term));
        el.appendChild(b);
    });

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'recent-clear';
    clear.setAttribute('aria-label', 'Clear recent searches');
    clear.innerHTML = '&times;';
    clear.addEventListener('click', () => {
        localStorage.removeItem(RECENT_KEY);
        renderRecent();
    });
    el.appendChild(clear);
}

function saveRecent(term) {
    const clean = (term || '').trim();
    if (!clean) return;
    const list = [clean, ...getRecent().filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (err) {
        return;
    }
    renderRecent();
}
renderRecent();

function currentCategory() {
    return document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
}

function quickFetch(topicQuery) {
    if (searchInput) searchInput.value = topicQuery;
    saveRecent(topicQuery);
    fetchLiveNews(topicQuery, currentCategory());
    document.getElementById('archives')?.scrollIntoView({ behavior: 'smooth' });
}

function runSearch() {
    clearTimeout(searchDebounce);
    const query = searchInput ? searchInput.value.trim() : '';
    saveRecent(query);
    fetchLiveNews(query, currentCategory());
    document.getElementById('archives')?.scrollIntoView({ behavior: 'smooth' });
}

let searchDebounce;
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            fetchLiveNews(e.target.value.trim(), currentCategory());
        }, 500);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        } else if (e.key === 'Escape') {
            searchInput.blur();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput?.focus();
});

const searchTrigger = document.getElementById('searchTrigger');
if (searchTrigger) searchTrigger.addEventListener('click', runSearch);

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        fetchLiveNews(searchInput ? searchInput.value.trim() : '', e.currentTarget.dataset.filter);
    });
});

rangeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        rangeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.range = e.currentTarget.dataset.range;
        fetchLiveNews(searchInput ? searchInput.value.trim() : '', currentCategory());
    });
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-submit');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Transmitting...';

        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            topic: document.getElementById('topic').value,
            message: document.getElementById('message').value
        };

        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            btn.innerHTML = '<i class="ph ph-check-circle"></i> Securely Transmitted';
            btn.style.background = 'var(--success)';
            e.target.reset();
        } catch (err) {
            btn.innerHTML = '<i class="ph ph-warning-circle"></i> Transmission Failed';
            btn.style.background = 'var(--danger)';
        }
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 3000);
    });
}

const openPrivacy = document.getElementById('openPrivacy');
const openTerms = document.getElementById('openTerms');
const modalPrivacy = document.getElementById('modalPrivacy');
const modalTerms = document.getElementById('modalTerms');
const closePrivacy = document.getElementById('closePrivacy');
const closeTerms = document.getElementById('closeTerms');

if (openPrivacy) openPrivacy.addEventListener('click', () => modalPrivacy.classList.add('active'));
if (openTerms) openTerms.addEventListener('click', () => modalTerms.classList.add('active'));
if (closePrivacy) closePrivacy.addEventListener('click', () => modalPrivacy.classList.remove('active'));
if (closeTerms) closeTerms.addEventListener('click', () => modalTerms.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === modalPrivacy) modalPrivacy.classList.remove('active');
    if (e.target === modalTerms) modalTerms.classList.remove('active');
});

fetchLiveNews('', 'all');
