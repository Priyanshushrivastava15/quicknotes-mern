import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Auth from "./components/Auth";
import ServerLoading from "./components/ServerLoading";
import NoteEditor from "./components/NoteEditor";
import NoteList from "./components/NoteList";
import { api } from "./utils/api";
import "./styles.css";

export default function App() {
  // --- STATE ---
  const [serverReady, setServerReady] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [noteForm, setNoteForm] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);

  // --- 1. SERVER WAKE-UP ---
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const res = await api.ping().catch(() => null);
        if (res) setServerReady(true);
        else throw new Error("Sleeping");
      } catch (e) {
        setTimeout(wakeUpServer, 2000);
      }
    };
    wakeUpServer();
  }, []);

  // --- 2. INITIAL FETCH ---
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
    localStorage.clear();
    setToken(null);
    setUser(null);
    setNotes([]);
    toast("See you later!", { icon: "👋" });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

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

  const handleCancelEdit = () => {
    setEditingId(null);
    setNoteForm({ title: "", body: "" });
  };

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
        <NoteEditor 
          noteForm={noteForm}
          setNoteForm={setNoteForm}
          onSubmit={handleCreateOrUpdate}
          editingId={editingId}
          onCancel={handleCancelEdit}
        />

        <NoteList 
          notes={notes}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEdit={startEditing}
          onDelete={handleDelete}
          editingId={editingId}
        />
      </main>
    </div>
  );
}