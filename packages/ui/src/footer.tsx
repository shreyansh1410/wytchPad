import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "1.2rem 0",
        textAlign: "center",
        fontSize: "1rem",
        color: "#b0bec5",
        background: "rgba(0,0,0,0.12)",
        letterSpacing: 1,
      }}
    >
      &copy; {new Date().getFullYear()} WytchPad. Built with ❤️ by Shreyansh Shukla.
    </footer>
  );
}
