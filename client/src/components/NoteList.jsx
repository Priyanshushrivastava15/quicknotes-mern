import React from "react";

export default function NoteList({ 
  notes, 
  loading, 
  searchQuery, 
  setSearchQuery, 
  onEdit, 
  onDelete,
  editingId 
}) {
  // Filter logic handled inside the component or passed down
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || note.body || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="notes-section">
      <div className="section-header">
        <div>
          <h1>Your Collection</h1>
          <span className="badge">{filteredNotes.length} Notes</span>
        </div>
        <input 
          className="glass-input"
          style={{ width: "250px", margin: 0 }}
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{textAlign: "center", color: "#94a3b8", marginTop: "2rem"}}>
          Loading notes...
        </div>
      )}

      <div className="notes-grid">
        {!loading && filteredNotes.map((note) => (
          <div 
            key={note._id} 
            className={`note-card ${editingId === note._id ? "active-editing" : ""}`}
          >
            <div className="note-content">
              <div className="note-title">{note.title}</div>
              <div className="note-body">{note.content || note.body}</div>
              <div className="note-date">
                {note.updatedAt 
                  ? new Date(note.updatedAt).toLocaleDateString() 
                  : "Just now"}
              </div>
            </div>
            <div className="card-actions">
              <button 
                onClick={() => onEdit(note)} 
                className="btn-icon edit" 
                title="Edit"
              >
                ✏️
              </button>
              <button 
                onClick={() => onDelete(note._id)} 
                className="btn-icon delete" 
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        
        {!loading && filteredNotes.length === 0 && (
          <div style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", marginTop: "2rem" }}>
            {searchQuery ? "No matching notes found." : "No notes yet. Create one!"}
          </div>
        )}
      </div>
    </section>
  );
}