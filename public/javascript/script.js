const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const newsGrid = document.getElementById('newsGrid');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentNewsData = [];

function analyzeContentTag(title, desc) {
    const content = (title + ' ' + desc).toLowerCase();
    if (content.match(/war|military|defense|troops|weapon|missile|navy|army|conflict/)) {
        return { name: 'Military', icon: 'ph-crosshair' };
    }
    if (content.match(/economy|market|bank|trade|inflation|sanction|currency|stocks/)) {
        return { name: 'Economy', icon: 'ph-chart-line-up' };
    }
    if (content.match(/president|minister|diplomat|summit|embassy|treaty|un|council/)) {
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
        const card = document.createElement('a');
        card.className = 'card';
        card.href = item.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const tagData = analyzeContentTag(item.title, item.description || '');
        const formattedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
        const fallbackImg = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

        const cleanDesc = item.description ? (item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description) : 'Access restricted. Click to view full encrypted briefing at the source.';

        card.innerHTML = `
            <div class="card-banner">
                <div class="card-tag"><i class="ph ${tagData.icon}"></i> ${tagData.name}</div>
                <img src="${item.image || fallbackImg}" alt="Intelligence Briefing Cover" onerror="this.src='${fallbackImg}'">
            </div>
            <div class="card-content">
                <span class="card-date">${formattedDate}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${cleanDesc}</p>
                <div class="card-footer">
                    <div class="source-info">
                        <i class="ph ph-newspaper-clipping"></i>
                        <span>${item.source}</span>
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

async function fetchLiveNews(query = 'geopolitics', category = 'all') {
    newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); font-weight:600; padding: 40px 0;"><i class="ph ph-spinner ph-spin" style="font-size: 1.5rem;"></i> Fetching real-time global intelligence...</p>';

    try {
        const response = await fetch(`/api/news?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        currentNewsData = data.articles || [];
        renderCards(currentNewsData);
    } catch (error) {
        console.error("Fetch error:", error);
        newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--danger); font-weight:600; padding: 40px 0;">Transmission failed. Verify API configuration and connection.</p>';
    }
}

let searchDebounce;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        const query = e.target.value.trim() || 'geopolitics';
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        fetchLiveNews(query, activeFilter);
    }, 800);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const activeFilter = e.target.dataset.filter;
        const query = searchInput.value.trim() || 'geopolitics';
        fetchLiveNews(query, activeFilter);
    });
});

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

fetchLiveNews('geopolitics', 'all');
