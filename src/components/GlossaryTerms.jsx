import React, { useState } from "react";
import { BookOpen } from "lucide-react";

const GLOSSARY = [
  {
    term: "APS",
    fullName: "Admission Point Score",
    definition:
      "A number that shows how well you did in matric, used by universities to decide if you qualify for a course. Each subject's percentage is converted into points, and the points are added together to give you one total score.",
  },
  {
    term: "NQF",
    fullName: "National Qualifications Framework",
    definition:
      "A system that ranks every qualification in South Africa on a scale from Level 1 to Level 10, so people can compare them. For example, a matric certificate sits at NQF Level 4, a diploma is usually Level 6, and a bachelor's degree is Level 7.",
  },
  {
    term: "Articulation",
    fullName: null,
    definition:
      "The ability to move from one qualification or institution to another and have your previous studies count toward the new one. For example, finishing a diploma and then \"articulating\" into the second or third year of a related degree, instead of starting from scratch.",
  },
  {
    term: "Prospectus",
    fullName: null,
    definition:
      "An official booklet or PDF published by a university or college each year. It lists the courses they offer, what you need to get in (like APS scores), how much it costs, and how to apply.",
  },
];

export default function GlossaryTerms() {
  const [query, setQuery] = useState("");

  const filteredTerms = GLOSSARY.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.term.toLowerCase().includes(q) ||
      (item.fullName && item.fullName.toLowerCase().includes(q)) ||
      item.definition.toLowerCase().includes(q)
    );
  });

  return (
    <section
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "inherit",
      }}
    >
      <h2 style={{ fontSize: "26px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", color: "#111111" }}>
        <BookOpen size={26} strokeWidth={2} />
        Glossary of Terms
      </h2>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#111111" }}>
        Tertiary education comes with its own vocabulary. Here's what the
        most common terms actually mean, explained in plain language.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a term (e.g. APS, NQF)..."
        aria-label="Search glossary terms"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 14px",
          fontSize: "15px",
          borderRadius: "8px",
          border: "1px solid #111111",
          color: "#111111",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      />

      {filteredTerms.length === 0 ? (
        <p style={{ fontSize: "15px", color: "#111111" }}>
          No terms match "{query}".
        </p>
      ) : (
        <dl style={{ margin: 0 }}>
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              style={{
                borderBottom: "1px solid #dddddd",
                padding: "16px 0",
              }}
            >
              <dt
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                {item.term}
                {item.fullName && (
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#111111",
                      marginLeft: "8px",
                    }}
                  >
                    ({item.fullName})
                  </span>
                )}
              </dt>
              <dd
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#111111",
                }}
              >
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}