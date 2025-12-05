import React, { useEffect, useState } from "react";

function App() {
  const [ping, setPing] = useState("loading...");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // on load, call backend
  useEffect(() => {
    fetch("/api/ping")
      .then((res) => res.json())
      .then((data) => setPing(data.message))
      .catch(() => setPing("error"));

    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch(() => setNotes([]));
  }, []);

  const addNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const newNote = await res.json();
    setNotes((prev) => [...prev, newNote]);
    setTitle("");
    setBody("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>QuickNotes (MERN)</h1>
      <p>Backend ping: {ping}</p>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <br />
        <button onClick={addNote}>Add Note</button>
      </div>

      <h2>Notes</h2>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong>
            <p>{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
