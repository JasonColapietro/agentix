"use client";

import { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "6vh 1rem 2rem",
        background: "rgba(17,19,23,0.34)",
        backdropFilter: "blur(2px)",
        overflowY: "auto",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 480 }}>
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: "var(--hairline)" }}
        >
          <h2 className="display" style={{ fontSize: "1.25rem" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
