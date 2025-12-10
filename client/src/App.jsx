import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { api } from "./utils/api"; // Integrating your existing API file
import "./styles.css";

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoginView, setIsLoginView] = useState(true); // Toggle Login/Signup
  
  // Data State
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [noteForm, setNoteForm] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    // If we have a token, try to fetch notes (validates session)
    if (token) {
      fetchNotes();
      // Optionally decode token to get user name, or just store user in localstorage too
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token]);

  // --- API ACTIONS ---

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.fetchNotes(token);
      setNotes(data);
    } catch (err) {
      console.error(err);
      if (err.message === "Unauthorized" || err.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isLoginView) {
        data = await api.login(authForm.email, authForm.password);
      } else {
        data = await api.signup(authForm.name, authForm.email, authForm.password);
      }

      // Save Session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Clear sensitive form data
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    try {
      if (editingId) {
        // UPDATE
        const updated = await api.updateNote(token, editingId, noteForm);
        setNotes(notes.map(n => n._id === editingId ? updated : n));
        setEditingId(null);
      } else {
        // CREATE
        const created = await api.createNote(token, noteForm);
        setNotes([created, ...notes]);
      }
      setNoteForm({ title: "", body: "" });
    } catch (err) {
      alert("Failed to save note: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.deleteNote(token, id);
      setNotes(notes.filter(n => n._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setNoteForm({ title: "", body: "" });
      }
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setNotes([]);
  };

  const startEditing = (note) => {
    setEditingId(note._id);
    setNoteForm({ title: note.title, body: note.content || note.body || "" });
  };

  // --- RENDER HELPERS ---
  
  // 1. AUTH SCREEN
  if (!token) {
    return (
      <div className="auth-container">
        <div className="blob-container">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        
        <div className="auth-box glass-panel">
          <h1 className="brand-title">QuickNotes</h1>
          <h2 style={{marginTop: 0}}>{isLoginView ? "Welcome Back" : "Create Account"}</h2>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleAuth}>
            {!isLoginView && (
              <input 
                className="glass-input" 
                placeholder="Full Name" 
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
                required
              />
            )}
            <input 
              className="glass-input" 
              type="email"
              placeholder="Email Address" 
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            <input 
              className="glass-input" 
              type="password"
              placeholder="Password" 
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              required
            />
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : (isLoginView ? "Log In" : "Sign Up")}
            </button>
          </form>

          <p className="auth-switch">
            {isLoginView ? "New here?" : "Already have an account?"}{" "}
            <span onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? "Create an account" : "Login"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 2. MAIN APP SCREEN
  return (
    <div className="app-container">
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <Sidebar user={user} onLogout={handleLogout} />

      <main className="main-content">
        {/* LEFT: FORM */}
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

        {/* RIGHT: NOTES LIST */}
        <section className="notes-section">
          <div className="section-header">
            <h1>Your Collection</h1>
            <span className="badge">{notes.length} Notes</span>
          </div>

          {loading && <div style={{textAlign: "center", color: "#94a3b8"}}>Loading your notes...</div>}

          <div className="notes-grid">
            {!loading && notes.map((note) => (
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
            
            {!loading && notes.length === 0 && (
              <div style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", marginTop: "2rem" }}>
                No notes found. Create one on the left!
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}