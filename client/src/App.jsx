// client/src/App.jsx
import { useEffect, useState } from "react";
import "./styles.css";

function App() {
  const [ping, setPing] = useState("loading...");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetch("/api/ping")
      .then((r) => r.json())
      .then((d) => setPing(d.message))
      .catch((err) => { console.error("ping error:", err); setPing("error"); });

    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("loadNotes error:", err);
      setNotes([]);
    }
  }

  async function addNote() {
    if (!title.trim()) return alert("Enter a title");
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const newNote = await res.json();
      setNotes((p) => [newNote, ...p]);
      setTitle(""); setBody("");
    } catch (err) {
      console.error("addNote error:", err);
      alert("Failed to add note");
    } finally { setLoading(false); }
  }

  async function deleteNote(id) {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setNotes(n => n.filter(x => x._id !== id));
    } catch (err) {
      console.error("deleteNote error:", err);
      alert("Delete failed");
    }
  }

  function startEdit(note) {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditBody(note.body || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  async function saveEdit() {
    if (!editTitle.trim()) return alert("Title required");
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, body: editBody }),
      });
      if (!res.ok) throw new Error("update failed");
      const updated = await res.json();
      setNotes(n => n.map(x => x._id === updated._id ? updated : x));
      cancelEdit();
    } catch (err) {
      console.error("saveEdit error:", err);
      alert("Update failed");
    }
  }

  return (
    <div className="app-container">
      {/* Background blobs for visual effect */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Left Sidebar: Create Note */}
      <aside className="sidebar">
        <div className="glass-panel">
          <header className="header">
            <h1 className="logo-text">Quick<span className="gradient-text">Notes</span></h1>
            <div className="status-badge">
              <span className={`dot ${ping === 'pong' ? 'online' : 'offline'}`}></span>
              {ping === 'pong' ? 'System Online' : ping}
            </div>
          </header>

          <div className="create-form">
            <h3>Create New Note</h3>
            <input 
              className="glass-input" 
              placeholder="Title" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
            />
            <textarea 
              className="glass-input textarea" 
              placeholder="Write your thoughts here..." 
              value={body} 
              onChange={e=>setBody(e.target.value)} 
              rows={6} 
            />
            <div className="button-group">
              <button className="btn-primary" onClick={addNote} disabled={loading}>
                {loading ? "Saving..." : "Create Note"}
              </button>
              <button className="btn-ghost" onClick={()=>{ setTitle(''); setBody(''); }}>
                Clear
              </button>
            </div>
          </div>
        </div>
        
        <div className="footer-credits">
          <p>© 2025 Priyanshu Shrivastava</p>
        </div>
      </aside>

      {/* Right Content: Notes Grid */}
      <main className="main-content">
        <h2 className="section-title">Your Collection <span className="count">{notes.length}</span></h2>
        
        <div className="notes-grid">
          {notes.length === 0 && (
            <div className="empty-state">
              <p>No notes found. Start by creating one!</p>
            </div>
          )}
          
          {notes.map(n => (
            <div key={n._id} className="note-card">
              <div className="note-content">
                <h4>{n.title}</h4>
                <p>{n.body}</p>
              </div>
              <div className="note-footer">
                <button className="icon-btn edit" onClick={()=>startEdit(n)}>Edit</button>
                <button className="icon-btn delete" onClick={()=>deleteNote(n._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Overlay */}
      {editingId && (
        <div className="modal-overlay">
          <div className="modal-glass">
            <h3>Edit Note</h3>
            <input className="glass-input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
            <textarea className="glass-input textarea" rows={6} value={editBody} onChange={e=>setEditBody(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={cancelEdit}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;