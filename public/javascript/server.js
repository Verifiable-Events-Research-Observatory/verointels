const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Connected successfully'))
        .catch(err => console.error('MongoDB Connection Error:', err));
}

const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    topic: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'about', 'into', 'over', 'that', 'this', 'news', 'latest']);

const CATEGORY_TERMS = {
    military: ['military', 'defense', 'troops', 'missile', 'navy', 'army', 'weapons', 'drone', 'airstrike', 'nato'],
    economy: ['economy', 'sanctions', 'trade', 'tariffs', 'inflation', 'oil', 'markets', 'currency', 'gdp'],
    diplomacy: ['diplomacy', 'summit', 'talks', 'treaty', 'envoy', 'ministers', 'ceasefire', 'negotiations', 'embassy']
};

const GEO_PATTERN = /geopolit|diplomat|sanction|military|defen[cs]e|troops|missile|navy|army|\bwar\b|conflict|ceasefire|treaty|summit|nato|security council|foreign (policy|minister)|embassy|alliance|nuclear|tariff|border|insurg|coup|junta|ukrain|russia|china|taiwan|iran|israel|gaza|syria|korea|sahel|brics|opec|airstrike|drone/i;

function tokenize(text) {
    return [...new Set(
        text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(t => t.length >= 3 && !STOP_WORDS.has(t))
    )].slice(0, 8);
}

function scoreArticle(art, terms) {
    const title = (art.title || '').toLowerCase();
    const desc = (art.description || '').toLowerCase();
    let matched = 0;
    let score = 0;
    for (const term of terms) {
        const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const inTitle = re.test(title);
        const inDesc = re.test(desc);
        if (inTitle || inDesc) matched++;
        if (inTitle) score += 4;
        if (inDesc) score += 2;
    }
    if (GEO_PATTERN.test(title)) score += 2;
    if (GEO_PATTERN.test(desc)) score += 1;
    if (art.image) score += 0.5;
    return { matched, score };
}

app.get('/api/news', async (req, res) => {
    const rawQuery = req.query.q ? req.query.q.trim() : '';
    const query = rawQuery !== '' ? rawQuery : 'geopolitics';
    const category = (req.query.category || 'all').toLowerCase();
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key is missing in environment variables." });
    }

    const terms = tokenize(query);
    const queryTerms = terms.length ? terms : [query.replace(/["()]/g, '')];
    let searchQuery = queryTerms.join(' OR ');
    if (CATEGORY_TERMS[category]) {
        searchQuery = `(${searchQuery}) AND (${CATEGORY_TERMS[category].join(' OR ')})`;
    }

    try {
        const fetchUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=15&in=title,description&apikey=${apiKey}`;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            console.error(`GNews API status: ${response.status}`);
            return res.json({ articles: [] });
        }

        const data = await response.json();

        if (!data.articles) {
            return res.json({ articles: [] });
        }

        const seenTitles = new Set();
        const seenImages = new Set();
        const candidates = [];

        for (const art of data.articles) {
            const rawTitle = art.title || 'Untitled Report';
            const normalizedTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
            if (seenTitles.has(normalizedTitle)) continue;
            seenTitles.add(normalizedTitle);

            let image = art.image && /^https?:\/\//.test(art.image) ? art.image : null;
            if (image && seenImages.has(image)) image = null;
            if (image) seenImages.add(image);

            const article = {
                title: rawTitle,
                description: art.description || '',
                url: art.url || '#',
                image,
                publishedAt: art.publishedAt || new Date().toISOString(),
                source: art.source ? art.source.name : 'Verified Source'
            };
            candidates.push({ article, ...scoreArticle(article, queryTerms) });
        }

        const needed = Math.min(2, queryTerms.length);
        let ranked = candidates.filter(c => c.matched >= needed);
        if (ranked.length < 3) ranked = candidates.filter(c => c.matched >= 1);
        if (ranked.length === 0) ranked = candidates;

        ranked.sort((x, y) => y.score - x.score || new Date(y.article.publishedAt) - new Date(x.article.publishedAt));

        res.json({ articles: ranked.map(c => c.article) });
    } catch (err) {
        console.error("GNews Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch live intelligence data" });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const newContact = new Contact(req.body);
            await newContact.save();
        }
        res.status(200).json({ success: true, message: "Transmission received." });
    } catch (err) {
        res.status(500).json({ error: "Failed to save transmission." });
    }
});

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`VERO Server active on port ${PORT}`);
});
