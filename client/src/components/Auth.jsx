import React, { useState } from "react";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";

export default function Auth({ onAuthSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isLoginView) {
        data = await api.login(form.email, form.password);
      } else {
        data = await api.signup(form.name, form.email, form.password);
      }
      
      toast.success(isLoginView ? "Welcome back!" : "Account created!");
      onAuthSuccess(data); // Pass data back to App
    } catch (err) {
      setError(err.message || "Authentication failed");
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-box glass-panel">
        <h1 className="brand-title">QuickNotes</h1>
        <h2 style={{ marginTop: 0 }}>
          {isLoginView ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <input
              className="glass-input"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            className="glass-input"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait..." : isLoginView ? "Log In" : "Sign Up"}
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