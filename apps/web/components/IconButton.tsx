import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  activated: boolean;
}

export default function IconButton({
  icon,
  onClick,
  activated,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: `${activated ? "#222" : "transparent"}`,
        border: "none",
        padding: 8,
        borderRadius: "50%",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
      }}
    >
      {icon}
    </button>
  );
}
