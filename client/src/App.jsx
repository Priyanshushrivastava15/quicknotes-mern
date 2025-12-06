// client/src/App.jsx
import { useEffect, useState, useRef } from "react";
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
  const editTitleRef = useRef(null);

  useEffect(() => {
    // ping + load notes on mount
    fetch("/api/ping")
      .then((r) => r.json())
      .then((d) => setPing(d.message === "pong" ? "pong" : d.message))
      .catch((err) => {
        console.error("ping error:", err);
        setPing("error");
      });

    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      // ensure newest first
      if (Array.isArray(data)) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadNotes error:", err);
      setNotes([]);
    }
  }

  async function addNote() {
    if (!title.trim()) return alert("Please enter a title");
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body }),
      });
      if (!res.ok) throw new Error("create failed");
      const newNote = await res.json();
      setNotes((p) => [newNote, ...p]);
      setTitle("");
      setBody("");
    } catch (err) {
      console.error("addNote error:", err);
      alert("Failed to add note");
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id) {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "delete failed");
      }
      setNotes((n) => n.filter((x) => String(x._id) !== String(id)));
    } catch (err) {
      console.error("deleteNote error:", err);
      alert("Delete failed");
    }
  }

  function startEdit(note) {
    setEditingId(String(note._id));
    setEditTitle(note.title || "");
    setEditBody(note.body || "");
    // focus input after modal renders
    setTimeout(() => {
      if (editTitleRef.current) editTitleRef.current.focus();
    }, 60);
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
        body: JSON.stringify({ title: editTitle.trim(), body: editBody }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "update failed");
      }
      const updated = await res.json();
      setNotes((n) => n.map((x) => (String(x._id) === String(updated._id) ? updated : x)));
      cancelEdit();
    } catch (err) {
      console.error("saveEdit error:", err);
      alert("Update failed");
    }
  }

  // close modal when clicking the backdrop
  function onModalBgClick(e) {
    if (e.target.classList && e.target.classList.contains("modal-overlay")) {
      cancelEdit();
    }
  }

  return (
    <div className="app-container">
      {/* background blobs */}
      <div className="blob blob-1" aria-hidden></div>
      <div className="blob blob-2" aria-hidden></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="glass-panel">
          <header className="header">
            <h1 className="logo-text">Quick<span className="gradient-text">Notes</span></h1>
            <div className="status-badge">
              <span className={`dot ${ping === "pong" ? "online" : "offline"}`}></span>
              {ping === "pong" ? "System Online" : ping}
            </div>
          </header>

          <div className="create-form" aria-label="create-note">
            <h3>Create New Note</h3>
            <input
              className="glass-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="note-title"
            />
            <textarea
              className="glass-input textarea"
              placeholder="Write your thoughts here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              aria-label="note-body"
            />
            <div className="button-group">
              <button className="btn-primary" onClick={addNote} disabled={loading}>
                {loading ? "Saving..." : "Create Note"}
              </button>
              <button className="btn-ghost" onClick={() => { setTitle(""); setBody(""); }}>
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="footer-credits">
          <p>© 2025 Priyanshu Shrivastava</p>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="section-title">
          <h2>Your Collection</h2>
          <span className="count">{notes.length}</span>
        </div>

        <div className="notes-grid" role="list">
          {notes.length === 0 && (
            <div className="empty-state">
              <p>No notes yet — create your first one.</p>
            </div>
          )}

          {notes.map((n) => (
            <article key={n._id} className="note-card" role="listitem" aria-label={n.title}>
              <div className="note-content">
                <h4>{n.title}</h4>
                <p>{n.body}</p>
              </div>

              <div className="note-footer" aria-hidden>
                <button className="icon-btn edit" onClick={() => startEdit(n)} title="Edit">Edit</button>
                <button className="icon-btn delete" onClick={() => deleteNote(n._id)} title="Delete">Delete</button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingId && (
        <div className="modal-overlay" onMouseDown={onModalBgClick}>
          <div className="modal-glass" role="dialog" aria-modal="true">
            <h3>Edit Note</h3>
            <input ref={editTitleRef} className="glass-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <textarea className="glass-input textarea" rows={6} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
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
