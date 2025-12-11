import React, { useState, useEffect } from "react";

export default function ServerLoading() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Initiating handshake...",
    "Waking up the free-tier instance...",
    "Connecting to MongoDB Atlas...",
    "Spinning up backend services...",
    "Almost there...",
  ];

  // Timer to animate progress bar over ~60 seconds
  useEffect(() => {
    const duration = 60000; // 60 seconds
    const intervalTime = 100; // Update every 100ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Timer to cycle through text messages every 4 seconds
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(msgTimer);
  }, [messages.length]);

  return (
    <div className="app-container">
      {/* Background Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="loading-container">
        {/* New Glass Card UI */}
        <div className="loading-card glass-panel">
          
          {/* Animated Spinner Icon */}
          <div className="loader-ring"></div>

          <h2 className="loading-title">QuickNotes</h2>

          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Dynamic Status Text */}
          <p className="loading-status">
            {messages[messageIndex]}
          </p>

          {/* Helpful Tip */}
          <div className="loading-tip">
            <small>
              <strong>Note:</strong> We use a free server on Render. <br/>
              It sleeps when inactive. First load takes ~60s.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}