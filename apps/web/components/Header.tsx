"use client";

import axios from "axios";
import React from "react";

export default function Header() {
  return (
    <header
      style={{
        padding: "1.5rem 0",
        textAlign: "center",
        letterSpacing: 2,
        fontWeight: 700,
        fontSize: "2.5rem",
        background: "rgba(0,0,0,0.15)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        color: "#64b5f6",
        marginLeft: 30,
        marginRight: 30,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span>WytchPad</span>
      </div>
      <div>
        <button
          style={{
            backgroundColor: "#64b5f6",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
          onClick={async (e) => {
            await axios.post("/api/auth/logout");
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
