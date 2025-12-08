// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/Note');

const app = express();

// Use FRONTEND_ORIGIN in production for safety; fallback to '*' for dev
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Root route (friendly)
app.get('/', (req, res) => {
  res.json({ message: 'QuickNotes backend is alive', version: process.env.npm_package_version || 'unknown' });
});

// Ping
app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

// Get notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'title required' });

    const note = await Note.create({ title: title.trim(), body: body || '' });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'bad request' });
  }
});

// Update note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, body } = req.body;
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'bad request' });
  }
});

// Delete note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'not found' }));

// Start server
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
