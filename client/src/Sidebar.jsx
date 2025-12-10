import React from "react";

export default function Sidebar({ user, onLogout }) {
  // Safe defaults in case user is null
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">QuickNotes</div>
      
      <nav className="nav-menu">
        <div className="nav-item active">
          <span>📝</span> All Notes
        </div>
      </nav>

      <div className="user-profile">
        <div className="user-info">
          <div className="user-avatar">{initial}</div>
          <div className="user-text">
            <div className="name">{userName}</div>
            <div className="email">{userEmail}</div>
          </div>
        </div>
        
        <button className="btn-logout" onClick={onLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}