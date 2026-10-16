import React, { useState } from "react";
import { MessageSquareText } from "lucide-react";

const FORM_ENDPOINT = "https://formsubmit.co/ajax/indlela2tech@gmail.com";

const CATEGORIES = [
  "Report inaccurate information",
  "Ask a question",
  "General feedback",
  "Something isn't working",
];

export default function FeedbackForm() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    if (trap) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("offline");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Indlela2Tech feedback: ${category}`,
          _template: "table",
          _captcha: "false",
          category,
          message: trimmedMessage,
          ...(email.trim() ? { email: email.trim() } : {}),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false || result.success === "false") {
        throw new Error(result.message || "Form service did not accept the message");
      }
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (err) {
      console.error("Could not submit feedback:", err);
      setStatus("error");
    }
  }

  const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#111111" };
  const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: "14px", borderRadius: "8px", border: "1px solid #111111", color: "#111111" };

  return (
    <section style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 20px", textAlign: "left" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px", color: "#111111" }}>
        <MessageSquareText size={22} strokeWidth={2} />
        Spotted something wrong? Have a question?
      </h2>
      <p style={{ fontSize: "15px", color: "#111111", marginBottom: "20px", lineHeight: 1.6 }}>
        Let us know and we'll look into it. Your email is optional — leave it blank if you'd rather stay anonymous.
      </p>

      {status === "sent" ? (
        <div style={{ border: "2px solid #2f6f4f", background: "#f2faf2", borderRadius: "8px", padding: "16px 18px" }}>
          <p style={{ margin: 0, fontSize: "15px", color: "#2f6f4f" }}>Thanks — we've received your message.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label htmlFor="feedback-category" style={labelStyle}>What's this about?</label>
            <select id="feedback-category" value={category} onChange={(e) => setCategory(e.target.value)} style={fieldStyle}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedback-message" style={labelStyle}>Your message</label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you noticed or what you'd like to ask..."
              required
              rows={5}
              style={{ ...fieldStyle, padding: "10px 12px", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <label htmlFor="feedback-email" style={labelStyle}>Your email (optional)</label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Only if you'd like a reply"
              style={fieldStyle}
            />
          </div>

          <input
            type="text"
            name="_honey"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          />

          {status === "error" && (
            <p style={{ fontSize: "13px", color: "#a33", margin: 0 }}>
              Something went wrong sending that — please try again.
            </p>
          )}
          {status === "offline" && (
            <p style={{ fontSize: "13px", color: "#a33", margin: 0 }}>
              You're offline right now — please send this again once you're connected.
            </p>
          )}

          <button type="submit" disabled={!message.trim() || status === "sending"} className="btn-primary">
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </section>
  );
}