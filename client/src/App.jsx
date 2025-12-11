import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Auth from "./components/Auth";
import ServerLoading from "./components/ServerLoading";
import { api } from "./utils/api";
import "./styles.css";

export default function App() {
  // --- STATE ---
  const [serverReady, setServerReady] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  
  // Data State
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [noteForm, setNoteForm] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);

  // --- 1. SERVER WAKE-UP LOGIC ---
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const res = await api.ping().catch(() => null);
        if (res) {
          setServerReady(true);
        } else {
          throw new Error("Server sleeping");
        }
      } catch (e) {
        console.log("Server sleeping... pinging again in 2s");
        setTimeout(wakeUpServer, 2000);
      }
    };
    wakeUpServer();
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (token && serverReady) {
      fetchNotes();
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token, serverReady]);

  // --- ACTIONS ---
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.fetchNotes(token);
      setNotes(data);
    } catch (err) {
      if (err.message === "Unauthorized" || err.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setNotes([]);
    toast("See you later!", { icon: "👋" });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    // Optimistic UI Update (Optional) - or just wait for server
    const loadingToast = toast.loading(editingId ? "Updating..." : "Saving...");

    try {
      if (editingId) {
        const updated = await api.updateNote(token, editingId, noteForm);
        setNotes(notes.map(n => n._id === editingId ? updated : n));
        setEditingId(null);
        toast.success("Note updated!", { id: loadingToast });
      } else {
        const created = await api.createNote(token, noteForm);
        setNotes([created, ...notes]);
        toast.success("Note created!", { id: loadingToast });
      }
      setNoteForm({ title: "", body: "" });
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    
    const loadingToast = toast.loading("Deleting...");
    try {
      await api.deleteNote(token, id);
      setNotes(notes.filter(n => n._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setNoteForm({ title: "", body: "" });
      }
      toast.success("Note deleted", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to delete", { id: loadingToast });
    }
  };

  const startEditing = (note) => {
    setEditingId(note._id);
    setNoteForm({ title: note.title, body: note.content || note.body || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Notes based on Search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || note.body || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER ---
  if (!serverReady) return <ServerLoading />;
  if (!token) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <Sidebar user={user} onLogout={handleLogout} />

      <main className="main-content">
        {/* Create / Edit Panel */}
        <section className="create-panel">
          <h2>{editingId ? "Edit Note" : "Create New Note"}</h2>
          <form onSubmit={handleCreateOrUpdate}>
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
                <button type="button" onClick={() => { setEditingId(null); setNoteForm({title:"", body:""}); }} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Notes List */}
        <section className="notes-section">
          <div className="section-header">
            <div>
              <h1>Your Collection</h1>
              <span className="badge">{filteredNotes.length} Notes</span>
            </div>
            {/* Search Bar */}
            <input 
              className="glass-input"
              style={{ width: "250px", margin: 0 }}
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading && <div style={{textAlign: "center", color: "#94a3b8"}}>Loading notes...</div>}

          <div className="notes-grid">
            {!loading && filteredNotes.map((note) => (
              <div key={note._id} className={`note-card ${editingId === note._id ? "active-editing" : ""}`}>
                <div className="note-content">
                  <div className="note-title">{note.title}</div>
                  <div className="note-body">{note.content || note.body}</div>
                  <div className="note-date">
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "Just now"}
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => startEditing(note)} className="btn-icon edit" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(note._id)} className="btn-icon delete" title="Delete">🗑️</button>
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
      </main>
    </div>
  );
}