require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Note = require('./models/Note');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));


app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


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


app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.listen(PORT, () => console.log('Server running on', PORT));


app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, body } = req.body;
    const updated = await Note.findByIdAndUpdate(req.params.id, { title, body }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'bad request' });
  }

  // Add this temporarily to verify deployment
app.get('/', (req, res) => {
  res.send('SERVER IS RUNNING! Go to /api/your-endpoint to see data.');
});

});
