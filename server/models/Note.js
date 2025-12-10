// server/models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Links to the User model
  },
  title: { type: String, required: true },
  body: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);