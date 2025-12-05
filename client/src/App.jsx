import { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState("loading...");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ping").then((r) => r.json()).then((d) => setPing(d.message)).catch(()=>setPing('error'));
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch (e) {
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
      setNotes((p) => [...p, newNote]);
      setTitle(""); setBody("");
    } catch (e) {
      alert("Failed to add note");
    } finally { setLoading(false); }
  }

  async function deleteNote(id){
    try{
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes(n => n.filter(x => x.id !== id));
    }catch(e){
      alert('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: "Inter, Arial" }}>
      <h1>QuickNotes</h1>
      <p style={{color:'#444'}}>Backend: {ping}</p>

      <div style={{ marginTop: 20, marginBottom: 20, display:'grid', gap:8 }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} rows={4}/>
        <div>
          <button onClick={addNote} disabled={loading}>{loading ? "Adding..." : "Add Note"}</button>
        </div>
      </div>

      <h2>Notes ({notes.length})</h2>
      <div style={{display:'grid', gap:10}}>
        {notes.length === 0 && <p>No notes yet</p>}
        {notes.map(n => (
          <div key={n.id} style={{padding:12, border:'1px solid #ddd', borderRadius:8}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong>{n.title}</strong>
              <button onClick={()=>deleteNote(n.id)} style={{background:'transparent',border:'none',color:'red'}}>Delete</button>
            </div>
            <p style={{marginTop:8}}>{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
