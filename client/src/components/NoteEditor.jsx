import React from "react";

export default function NoteEditor({ 
  noteForm, 
  setNoteForm, 
  onSubmit, 
  editingId, 
  onCancel 
}) {
  return (
    <section className="create-panel">
      <h2>{editingId ? "Edit Note" : "Create New Note"}</h2>
      <form onSubmit={onSubmit}>
        <input 
          className="glass-input" 
          placeholder="Title" 
          value={noteForm.title}
          onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
          required
        />
        <textarea 
          className="glass-input" 
          rows="12" 
          placeholder="Write your thoughts..." 
          style={{ resize: "none" }}
          value={noteForm.body}
          onChange={(e) => setNoteForm({...noteForm, body: e.target.value})}
          required
        ></textarea>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? "Update Note" : "Save Note"}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}