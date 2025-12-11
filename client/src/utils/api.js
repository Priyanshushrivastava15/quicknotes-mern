import { API_BASE_URL } from "../config";

const BASE_URL = `${API_BASE_URL}/api`;

const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Check Server Health
  ping: async () => {
    const res = await fetch(`${API_BASE_URL}/ping`);
    return res;
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  signup: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Notes
  fetchNotes: async (token) => {
    const res = await fetch(`${BASE_URL}/notes`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  createNote: async (token, note) => {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to create note");
    return res.json();
  },

  deleteNote: async (token, id) => {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to delete note");
    return true;
  },

  updateNote: async (token, id, note) => {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to update note");
    return res.json();
  }
};