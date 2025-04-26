import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label htmlFor={props.id || props.name} style={{ color: "#b0bec5", display: "block", marginBottom: 4 }}>
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: "100%",
        padding: "0.65rem 1rem",
        borderRadius: 8,
        border: "1px solid #333",
        background: "#23272a",
        color: "#fff",
        fontSize: 16,
        ...props.style,
      }}
    />
    {error && (
      <div style={{ color: "#ff5252", marginTop: 4, fontSize: 13 }}>{error}</div>
    )}
  </div>
);
