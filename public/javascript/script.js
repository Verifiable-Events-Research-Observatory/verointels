// Theme Toggle & Automatic Night/Day Detection Logic
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function initTheme() {
    const savedTheme = localStorage.getItem('vero_theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const currentHour = new Date().getHours();
        // If night time (between 19:00 and 06:00), default to Dark Mode
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

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

initTheme();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Dynamic Slogan Selector (5 Signature Slogans on Reload)
const slogans = [
    "Unfiltered Global Signals. Zero Noise.",
    "Tactical Intelligence Before the Headlines.",
    "Decrypting Geopolitics in Real Time.",
    "High-Fidelity Threat & Policy Monitoring.",
    "Raw Data. Strategic Clarity. Global Reach."
];

const heroSloganEl = document.getElementById('heroSlogan');
if (heroSloganEl) {
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    heroSloganEl.textContent = randomSlogan;
}

// Random Default Query Pool for Fresh Reloads without Excessive API Usage
const defaultTopics = [
    'geopolitics',
    'global defense',
    'international diplomacy',
    'sanctions policy',
    'global security',
    'strategic alliance'
];

function getRandomDefaultTopic() {
    return defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
}

const newsGrid = document.getElementById('newsGrid');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentNewsData = [];

function analyzeContentTag(title, desc) {
    const content = (title + ' ' + (desc || '')).toLowerCase();
    if (content.match(/war|military|defense|troops|weapon|missile|navy|army|conflict|strike/)) {
        return { name: 'Military', icon: 'ph-crosshair' };
    }
    if (content.match(/economy|market|bank|trade|inflation|sanction|currency|brics|stocks/)) {
        return { name: 'Economy', icon: 'ph-chart-line-up' };
    }
    if (content.match(/president|minister|diplomat|summit|embassy|treaty|un|council|policy/)) {
        return { name: 'Diplomacy', icon: 'ph-handshake' };
    }
    return { name: 'Global Intel', icon: 'ph-globe' };
}

function renderCards(data) {
    newsGrid.innerHTML = '';

    if (!data || data.length === 0) {
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 40px 0;">No operational intelligence matching your criteria at this moment.</p>';
        return;
    }

    data.forEach(item => {
        // Prevent 404 / broken link navigation issues by validating URL
        const targetUrl = (item.url && item.url.startsWith('http')) ? item.url : '#';

        const card = document.createElement('a');
        card.className = 'card';
        card.href = targetUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const tagData = analyzeContentTag(item.title, item.description || '');
        const formattedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
        const fallbackImg = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        const cleanDesc = item.description ? (item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description) : 'Access restricted. Click to view full encrypted briefing at the source.';

        card.innerHTML = `
            <div class="card-banner">
                <div class="card-tag"><i class="ph ${tagData.icon}"></i> ${tagData.name}</div>
                <img src="${item.image || fallbackImg}" alt="Intelligence Cover" onerror="this.onerror=null;this.src='${fallbackImg}';">
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

// Fetch Live News - Gracefully handles empty queries without crashing or returning 404
async function fetchLiveNews(query = '', category = 'all') {
    const activeQuery = query.trim() !== '' ? query.trim() : getRandomDefaultTopic();

    newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 40px 0;"><i class="ph ph-spinner ph-spin" style="font-size: 1.5rem;"></i> Fetching real-time global intelligence...</p>';

    try {
        const response = await fetch(`/api/news?q=${encodeURIComponent(activeQuery)}&category=${encodeURIComponent(category)}`);

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        currentNewsData = data.articles || [];
        renderCards(currentNewsData);
    } catch (error) {
        console.error("Fetch error:", error);
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--danger); font-weight:600; padding: 40px 0;">Transmission standby. Verify connection or query parameters.</p>';
    }
}

// Quick Fetch trigger for Strategic Theater Buttons
function quickFetch(topicQuery) {
    if (searchInput) searchInput.value = topicQuery;
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    fetchLiveNews(topicQuery, activeFilter);
    const intelligenceSec = document.getElementById('intelligence');
    if (intelligenceSec) {
        intelligenceSec.scrollIntoView({ behavior: 'smooth' });
    }
}

// Fixed Input Event Listener (Handles deletion/empty input cleanly)
let searchDebounce;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        const query = e.target.value.trim();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        fetchLiveNews(query, activeFilter);
    }, 600);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const activeFilter = e.target.dataset.filter;
        const query = searchInput.value.trim();
        fetchLiveNews(query, activeFilter);
    });
});

// Contact Form Handler
document.getElementById('contactForm').addEventListener('submit', async (e) => {
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

// Modal Controller
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

// Initial Load with dynamic topic
fetchLiveNews('', 'all');
