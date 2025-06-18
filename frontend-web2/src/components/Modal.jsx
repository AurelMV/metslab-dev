import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "2rem",
        minWidth: "350px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer"
          }}
          aria-label="Cerrar"
        >×</button>
        {children}
      </div>
    </div>
  );
}