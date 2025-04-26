"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName?: string;
  loading?: boolean;
}

export const Button = ({
  children,
  className,
  appName,
  loading,
}: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={() => appName && alert(`Hello from your ${appName} app!`)}
      disabled={loading}
      style={{
        background: "#fff",
        color: "#000",
        fontWeight: 600,
        border: "none",
        borderRadius: 8,
        padding: "0.75rem 1.5rem",
        fontSize: 16,
        marginTop: 12,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "opacity 0.2s",
        ...(!loading && { boxShadow: "0 2px 8px rgba(88,101,242,0.12)" }),
      }}
    >
      {children}
    </button>
  );
};
