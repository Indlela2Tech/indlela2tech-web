import React, { useState } from "react";
import { MessageSquareText } from "lucide-react";

const CATEGORIES = [
  "Report inaccurate information",
  "Ask a question",
  "General feedback",
  "Something isn't working",
];

export default function FeedbackForm({ onSubmit, contactEmail = "" }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const payload = {
      category,
      message: trimmedMessage,
      email: email.trim() || null,
      submittedAt: new Date().toISOString(),
    };

    if (onSubmit) {
      setStatus("sending");
      try {
        await onSubmit(payload);
        setStatus("sent");
        setMessage("");
        setEmail("");
      } catch (err) {
        console.error("Could not submit feedback:", err);
        setStatus("error");
      }
      return;
    }

    if (contactEmail) {
      const subject = encodeURIComponent(`Indlela2Tech feedback: ${category}`);
      const body = encodeURIComponent(
        `${trimmedMessage}\n\n---\nCategory: ${category}${
          email ? `\nReply to: ${email}` : ""
        }`
      );
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      setStatus("sent");
      setMessage("");
      setEmail("");
    } else {
      console.error(
        "FeedbackForm: no onSubmit handler and no contactEmail provided - nowhere to send this."
      );
      setStatus("error");
    }
  }

  return (
    <section style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 20px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px", color: "#111111" }}>
        <MessageSquareText size={22} strokeWidth={2} />
        Spotted something wrong? Have a question?
      </h2>
      <p style={{ fontSize: "15px", color: "#111111", marginBottom: "20px", lineHeight: 1.6 }}>
        Let us know and we'll look into it. Your email is optional — leave
        it blank if you'd rather stay anonymous.
      </p>

      {status === "sent" ? (
        <div
          style={{
            border: "2px solid #2f6f4f",
            background: "#f2faf2",
            borderRadius: "8px",
            padding: "16px 18px",
          }}
        >
          <p style={{ margin: 0, fontSize: "15px", color: "#2f6f4f" }}>
            Thanks — we've received your message.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              htmlFor="feedback-category"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#111111" }}
            >
              What's this about?
            </label>
            <select
              id="feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #111111",
                color: "#111111",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#111111" }}
            >
              Your message
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you noticed or what you'd like to ask..."
              required
              rows={5}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #111111",
                color: "#111111",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="feedback-email"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#111111" }}
            >
              Your email (optional)
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Only if you'd like a reply"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #111111",
                color: "#111111",
              }}
            />
          </div>

          {status === "error" && (
            <p style={{ fontSize: "13px", color: "#a33", margin: 0 }}>
              Something went wrong sending that — please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!message.trim() || status === "sending"}
            className="btn-primary"
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </section>
  );
}