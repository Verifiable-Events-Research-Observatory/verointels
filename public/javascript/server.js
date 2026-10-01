const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static files from root directory
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

// Safe API endpoint handling empty or invalid search queries gracefully
app.get('/api/news', async (req, res) => {
    const rawQuery = req.query.q ? req.query.q.trim() : '';
    const query = rawQuery !== '' ? rawQuery : 'geopolitics';
    const category = req.query.category || 'all';
    const apiKey = process.env.GNEWS_API_KEY;

    let searchQuery = query;
    if (category !== 'all' && category !== 'undefined') {
        searchQuery = `${query} ${category}`;
    }

    if (!apiKey) {
        return res.status(500).json({ error: "API key is missing in environment variables." });
    }

    try {
        const fetchUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=12&apikey=${apiKey}`;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            console.error(`GNews API status: ${response.status}`);
            return res.json({ articles: [] });
        }

        const data = await response.json();

        if (!data.articles) {
            return res.json({ articles: [] });
        }

        const formattedArticles = data.articles.map(art => ({
            title: art.title || 'Untitled Report',
            description: art.description || '',
            url: art.url || '#',
            image: art.image || null,
            publishedAt: art.publishedAt || new Date().toISOString(),
            source: art.source ? art.source.name : 'Verified Source'
        }));

        res.json({ articles: formattedArticles });
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

// Express route fallback handling for SPA
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`VERO Server active on port ${PORT}`);
});
