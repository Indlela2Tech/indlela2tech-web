import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const DISMISSED_KEY = "school_prompt_dismissed";
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];
const GRADES = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

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

export default function SchoolPrompt() {
  const [dismissed, setDismissed] = useState(() => hasBeenDismissed());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [allSchools, setAllSchools] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [notListed, setNotListed] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customProvince, setCustomProvince] = useState(PROVINCES[0]);

  const [grade, setGrade] = useState("");

  useEffect(() => {
    if (dismissed) return;
    fetch("/schools.json")
      .then((res) => res.json())
      .then((data) => setAllSchools(data))
      .catch((err) => console.error("Could not load school list:", err));
  }, [dismissed]);

  if (dismissed) return null;

  function handleQueryChange(value) {
    setQuery(value);
    setSelectedSchool(null);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const q = value.trim().toLowerCase();
    const matches = allSchools.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
    setSuggestions(matches);
  }

  function selectSchool(school) {
    setSelectedSchool(school);
    setQuery(school.name);
    setSuggestions([]);
  }

  function handleClose() {
    markDismissed();
    setDismissed(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = notListed
      ? { school_name: customName.trim(), province: customProvince, grade: grade || null, is_custom_entry: true }
      : { school_name: selectedSchool ? selectedSchool.name : query.trim(), province: selectedSchool ? selectedSchool.province : null, grade: grade || null, is_custom_entry: !selectedSchool };

    if (!payload.school_name) return;

    setSubmitting(true);
    const { error } = await supabase.from("school_checkin").insert([payload]);
    setSubmitting(false);

    if (error) {
      console.error("Could not submit school check-in:", error);
    }

    markDismissed();
    setSubmitted(true);
    setTimeout(() => setDismissed(true), 1800);
  }

  const canSubmit = notListed ? customName.trim().length > 0 : (selectedSchool || query.trim().length > 0);

  return (
    <div
      role="dialog"
      aria-label="Which school are you from?"
      style={{
        maxWidth: "440px",
        margin: "24px auto",
        border: "2px solid #111111",
        borderTop: "6px solid #FFEE00",
        borderRadius: "14px",
        padding: "18px 20px",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close"
        style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#111111" }}
      >
        ✕
      </button>

      {submitted ? (
        <p style={{ fontSize: "15px", color: "#111111", margin: 0 }}>
          Thanks! That really helps us understand who we're reaching.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: "16px", margin: "0 0 6px 0", color: "#111111" }}>Quick question, if you don't mind</h3>
          <p style={{ fontSize: "14px", color: "#333333", margin: "0 0 14px 0" }}>
            Which school and grade are you? Completely optional, and just helps us track who we're reaching.
          </p>

          {!notListed && (
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#111111" }}>
                Search for your school
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Start typing your school's name..."
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "14px", borderRadius: "8px", border: "1px solid #d0d0d0", color: "#111111" }}
              />
              {suggestions.length > 0 && (
                <ul style={{ listStyle: "none", margin: "4px 0 0 0", padding: 0, border: "1px solid #d0d0d0", borderRadius: "8px", maxHeight: "180px", overflowY: "auto", position: "absolute", background: "#ffffff", width: "100%", zIndex: 20 }}>
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => selectSchool(s)}
                      style={{ padding: "8px 12px", cursor: "pointer", fontSize: "13px", color: "#111111", borderBottom: i < suggestions.length - 1 ? "1px solid #eeeeee" : "none" }}
                    >
                      {s.name} <span style={{ color: "#888888" }}>({s.province})</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => { setNotListed(true); setQuery(""); setSelectedSchool(null); setSuggestions([]); }}
                style={{ marginTop: "8px", background: "none", border: "none", color: "#1a4dbf", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                My school isn't listed
              </button>
            </div>
          )}

          {notListed && (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#111111" }}>
                Your school's name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Type your school's name"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "14px", borderRadius: "8px", border: "1px solid #d0d0d0", color: "#111111", marginBottom: "8px" }}
              />
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#111111" }}>
                Province
              </label>
              <select
                value={customProvince}
                onChange={(e) => setCustomProvince(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "14px", borderRadius: "8px", border: "1px solid #d0d0d0", color: "#111111" }}
              >
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button
                type="button"
                onClick={() => { setNotListed(false); setCustomName(""); }}
                style={{ marginTop: "8px", background: "none", border: "none", color: "#1a4dbf", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              >
                Search the list instead
              </button>
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "#111111" }}>
              Your current grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", fontSize: "14px", borderRadius: "8px", border: "1px solid #d0d0d0", color: "#111111" }}
            >
              <option value="">Prefer not to say</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "14px" }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{ background: "none", border: "none", color: "#888888", fontSize: "13px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              No thanks, skip this
            </button>
          </div>
        </form>
      )}
    </div>
  );
}