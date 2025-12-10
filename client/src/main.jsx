import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// -------------------------------------------
// 🔥 STEP 1: Auto-wake backend before UI loads
// -------------------------------------------
const BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://quicknotes-backend-9k0a.onrender.com";

// Send silent wake request (doesn't block UI)
fetch(`${BASE}/api/ping`).catch(() => {});
// -------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
