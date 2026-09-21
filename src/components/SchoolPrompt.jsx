import React, { useState } from "react";

/**
 * SchoolPrompt
 * An optional, dismissible prompt asking a visiting student which school
 * they're from, purely for community engagement reporting purposes.
 *
 * This is intentionally low-pressure: it can be skipped or closed entirely,
 * and only appears once per browser (tracked via localStorage) so it
 * doesn't nag returning visitors.
 *
 * By default it just saves the response locally (localStorage), but you
 * can pass an onSubmit function to send it to a backend (e.g. Supabase)
 * instead - see the onSubmit prop below.
 *
 * Usage:
 *   <SchoolPrompt />
 *   <SchoolPrompt onSubmit={(schoolName) => saveToSupabase(schoolName)} />
 */

const DISMISSED_KEY = "school_prompt_dismissed";
const RESPONSE_KEY = "school_prompt_response";

function hasBeenDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, "true");
  } catch (err) {
    console.error("Could not save dismissal state:", err);
  }
}

function saveResponseLocally(schoolName) {
  try {
    localStorage.setItem(RESPONSE_KEY, schoolName);
  } catch (err) {
    console.error("Could not save school response:", err);
  }
}

export default function SchoolPrompt({ onSubmit }) {
  const [dismissed, setDismissed] = useState(() => hasBeenDismissed());
  const [schoolName, setSchoolName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (dismissed) return null;

  function handleClose() {
    markDismissed();
    setDismissed(true);
  }

  function handleSkip() {
    handleClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = schoolName.trim();
    if (!trimmed) return;

    if (onSubmit) {
      try {
        await onSubmit(trimmed);
      } catch (err) {
        console.error("Could not submit school response:", err);
      }
    } else {
      saveResponseLocally(trimmed);
    }

    markDismissed();
    setSubmitted(true);

    // Briefly show a thank-you message, then close
    setTimeout(() => setDismissed(true), 1800);
  }

  return (
    <div
      role="dialog"
      aria-label="Which school are you from?"
      style={{
        maxWidth: "420px",
        margin: "24px auto",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        padding: "18px 20px",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          color: "#999999",
        }}
      >
        ✕
      </button>

      {submitted ? (
        <p style={{ fontSize: "15px", color: "#333333", margin: 0 }}>
          Thanks! That really helps us understand who we're reaching. 🎓
        </p>
      ) : (
        <>
          <h3 style={{ fontSize: "16px", margin: "0 0 6px 0" }}>
            Quick question, if you don't mind
          </h3>
          <p style={{ fontSize: "14px", color: "#666666", margin: "0 0 14px 0" }}>
            Which school are you visiting from? This is completely optional
            and just helps us track which schools we're reaching.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Kwazakhele High School"
              aria-label="Your school name"
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #d0d0d0",
              }}
            />
            <button
              type="submit"
              disabled={!schoolName.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: schoolName.trim() ? "#333333" : "#cccccc",
                color: "#ffffff",
                cursor: schoolName.trim() ? "pointer" : "not-allowed",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              Submit
            </button>
          </form>

          <button
            type="button"
            onClick={handleSkip}
            style={{
              marginTop: "10px",
              background: "none",
              border: "none",
              color: "#999999",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            No thanks, skip this
          </button>
        </>
      )}
    </div>
  );
}