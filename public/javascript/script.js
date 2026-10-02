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
    let text = "";
    if (hour >= 6 && hour < 12) {
        text = "Good Morning, Strategist.";
    } else if (hour >= 12 && hour < 18) {
        text = "Good Afternoon, Strategist.";
    } else {
        text = "Good Evening, Strategist.";
    }
    if (greetingEl) {
        greetingEl.innerHTML = `<h2>${text}</h2>`;
    }
}
setGreeting();

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

function analyzeContentTag(title, desc) {
    const content = (title + ' ' + (desc || '')).toLowerCase();
    if (content.match(/war|military|defense|troops|weapon|missile|navy|army|conflict|strike|fighter|artillery|drone|escalation|nuclear|pentagon|nato|pla|rebel|junta|combat|tactical/)) {
        return { name: 'Military', icon: 'ph-crosshair', tone: 'tone-military' };
    }
    if (content.match(/economy|market|bank|trade|inflation|sanction|currency|brics|stocks|tariff|financial|oil|gas|export|import|gdp|invest/)) {
        return { name: 'Economy', icon: 'ph-chart-line-up', tone: 'tone-economy' };
    }
    if (content.match(/president|minister|diplomat|summit|embassy|treaty|un|council|policy|envoy|talks|pact|diplomacy|ambassador|geopolitics|alliance/)) {
        return { name: 'Diplomacy', icon: 'ph-handshake', tone: 'tone-diplomacy' };
    }
    return { name: 'Global Intel', icon: 'ph-globe', tone: 'tone-intel' };
}

function renderCards(data) {
    newsGrid.innerHTML = '';

    if (!data || data.length === 0) {
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 40px 0;">No operational intelligence matching your criteria at this moment.</p>';
        return;
    }

    data.forEach(item => {
        const targetUrl = (item.url && item.url.startsWith('http')) ? item.url : '#';
        const card = document.createElement('a');
        card.className = 'card';
        card.href = targetUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const tagData = analyzeContentTag(item.title, item.description || '');
        const formattedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

        const coverImg = item.image;
        const invalidImg = !coverImg || ['generic', 'business', 'placeholder', 'logo', 'avatar', 'default', 'icon', 'stock'].some(kw => coverImg.toLowerCase().includes(kw));
        const imgTag = invalidImg ? '' : `<img src="${coverImg}" alt="Intelligence Cover" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`;

        const cleanDesc = item.description ? (item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description) : 'Access restricted. Click to view full encrypted briefing at the source.';

        card.innerHTML = `
            <div class="card-banner">
                <div class="card-tag"><i class="ph ${tagData.icon}"></i> ${tagData.name}</div>
                <div class="cover-ph ${tagData.tone}"><i class="ph ${tagData.icon}"></i></div>
                ${imgTag}
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
        newsGrid.appendChild(card);
    });
}

async function fetchLiveNews(query = '', category = 'all') {
    newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 60px 0;"><i class="ph ph-spinner ph-spin" style="font-size: 1.8rem; vertical-align: middle; margin-right: 8px;"></i> Fetching real-time global intelligence...</p>';

    const activeQuery = query.trim() !== '' ? query.trim() : getRandomDefaultTopic();

    try {
        const response = await fetch(`/api/news?q=${encodeURIComponent(activeQuery)}&category=${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error(`Server returned status ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        currentNewsData = data.articles || [];
        renderCards(currentNewsData);
    } catch (error) {
        console.error("Fetch error:", error);
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--danger); font-weight:600; padding: 40px 0;">Transmission standby. Verify connection or query parameters.</p>';
    }
}

function quickFetch(topicQuery) {
    if (searchInput) searchInput.value = topicQuery;
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    fetchLiveNews(topicQuery, activeFilter);
    const intelligenceSec = document.getElementById('archives');
    if (intelligenceSec) intelligenceSec.scrollIntoView({ behavior: 'smooth' });
}

let searchDebounce;
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            const query = e.target.value.trim();
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            fetchLiveNews(query, activeFilter);
        }, 500);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchDebounce);
            const query = searchInput.value.trim();
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            fetchLiveNews(query, activeFilter);
            document.getElementById('archives')?.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

const searchTrigger = document.getElementById('searchTrigger');
if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
        clearTimeout(searchDebounce);
        const query = searchInput ? searchInput.value.trim() : '';
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        fetchLiveNews(query, activeFilter);
        document.getElementById('archives')?.scrollIntoView({ behavior: 'smooth' });
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const activeFilter = e.target.dataset.filter;
        const query = searchInput ? searchInput.value.trim() : '';
        fetchLiveNews(query, activeFilter);
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
