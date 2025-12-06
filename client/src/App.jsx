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
      // newNote uses _id from MongoDB
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
    <div className="app">
      <div className="card">
        <h1 className="title">QuickNotes</h1>
        <p className="sub">Backend: <span className="muted">{ping}</span></p>

        <div className="form">
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="textarea" placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} rows={4} />
          <div className="row">
            <button className="btn primary" onClick={addNote} disabled={loading}>{loading ? "Adding..." : "Add Note"}</button>
            <button className="btn" onClick={()=>{ setTitle(''); setBody(''); }}>Clear</button>
          </div>
        </div>

        <h2 className="section">Notes ({notes.length})</h2>

        <div className="notes">
          {notes.length === 0 && <p className="muted">No notes yet</p>}
          {notes.map(n => (
            <div key={n._id} className="note">
              <div className="noteHeader">
                <strong>{n.title}</strong>
                <div className="noteActions">
                  <button className="link" onClick={()=>startEdit(n)}>Edit</button>
                  <button className="link danger" onClick={()=>deleteNote(n._id)}>Delete</button>
                </div>
              </div>
              <p className="noteBody">{n.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal area */}
      {editingId && (
        <div className="modal">
          <div className="modalCard">
            <h3>Edit note</h3>
            <input className="input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
            <textarea className="textarea" rows={4} value={editBody} onChange={e=>setEditBody(e.target.value)} />
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn" onClick={cancelEdit}>Cancel</button>
              <button className="btn primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
