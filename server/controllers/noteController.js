// server/controllers/noteController.js
const Note = require("../models/Note");

// @desc    Get user notes
// @route   GET /api/notes
const getNotes = async (req, res) => {
  try {
    // ONLY find notes belonging to the logged-in user
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Create new note
// @route   POST /api/notes
const createNote = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Please add a title" });
    }

    const note = await Note.create({
      title: req.body.title,
      body: req.body.body,
      user: req.user.id, // Assign the note to the user
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    // Check for user
    if (!req.user) return res.status(401).json({ error: "User not found" });

    // Ensure the logged-in user matches the note owner
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "User not authorized" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ error: "Note not found" });

    if (!req.user) return res.status(401).json({ error: "User not found" });

    // Ensure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "User not authorized" });
    }

    await note.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };