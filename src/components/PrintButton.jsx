import React from "react";

/**
 * PrintButton
 * Triggers the browser's native print dialog, styled to blend in with
 * the rest of the course detail page. Pair this with print.css (see the
 * accompanying file) so navigation, buttons, and other non-essential
 * elements are hidden when the page is actually printed.
 *
 * Usage: <PrintButton />
 * No props required.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      aria-label="Print this course's information"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "8px",
        border: "1px solid #d0d0d0",
        background: "#ffffff",
        color: "#444444",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print
    </button>
  );
}