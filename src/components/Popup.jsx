
import React, { useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import Button from "./Button";

export default function Popup({
  title = "Are you sure?",
  message = "Do you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-secondary/25 bg-secondary/10">
            <FiAlertTriangle className="text-xl text-secondary" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-tmuted hover:bg-white/5 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        <h2
          id="confirmation-title"
          className="mt-5 text-2xl font-bold text-white"
        >
          {title}
        </h2>

        <p
          id="confirmation-message"
          className="mt-3 text-sm leading-6 text-tsecondary"
        >
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
