import React, { useState } from "react";
import { Calculator } from "lucide-react";

const APS_BANDS = [
  { range: "90 - 100%", points: 8, level: "Level 8", min: 90 },
  { range: "80 - 89%", points: 7, level: "Level 7", min: 80 },
  { range: "70 - 79%", points: 6, level: "Level 6", min: 70 },
  { range: "60 - 69%", points: 5, level: "Level 5", min: 60 },
  { range: "50 - 59%", points: 4, level: "Level 4", min: 50 },
  { range: "40 - 49%", points: 3, level: "Level 3", min: 40 },
  { range: "30 - 39%", points: 2, level: "Level 2", min: 30 },
  { range: "0 - 29%", points: 1, level: "Level 1", min: 0 },
];

const EXAMPLE_SUBJECTS = [
  { subject: "Home Language", mark: 72 },
  { subject: "First Additional Language", mark: 65 },
  { subject: "Mathematics", mark: 58 },
  { subject: "Physical Sciences", mark: 61 },
  { subject: "Life Sciences", mark: 55 },
  { subject: "Geography", mark: 68 },
];

const LIFE_ORIENTATION_MARK = 80;

function markToPoints(mark) {
  const band = APS_BANDS.find((b) => mark >= b.min);
  return band ? band.points : 1;
}

export default function APSExplainer() {
  const [showExample, setShowExample] = useState(false);

  const exampleTotal = EXAMPLE_SUBJECTS.reduce(
    (sum, s) => sum + markToPoints(s.mark),
    0
  );

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
        <Calculator size={26} strokeWidth={2} />
        What is an APS score?
      </h2>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#111111" }}>
        APS stands for <strong>Admission Point Score</strong>. It is a number
        universities use to work out whether you qualify for a course. Each
        of your matric subjects earns you points based on the percentage you
        got, and those points are added together to give you one total
        score.
      </p>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#111111" }}>
        This version <strong>excludes Life Orientation</strong> from the
        calculation, since several universities do not count it toward your
        APS. Always check the specific course requirements, since this can
        vary.
      </p>

      <h3 style={{ fontSize: "20px", marginTop: "28px", marginBottom: "12px", color: "#111111" }}>
        How marks turn into points
      </h3>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "15px",
            color: "#111111",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #111111", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Percentage</th>
              <th style={{ padding: "8px 12px" }}>Achievement level</th>
              <th style={{ padding: "8px 12px" }}>APS points</th>
            </tr>
          </thead>
          <tbody>
            {APS_BANDS.map((band) => (
              <tr key={band.level} style={{ borderBottom: "1px solid #dddddd" }}>
                <td style={{ padding: "8px 12px" }}>{band.range}</td>
                <td style={{ padding: "8px 12px" }}>{band.level}</td>
                <td style={{ padding: "8px 12px" }}>{band.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: "20px", marginTop: "28px", marginBottom: "8px", color: "#111111" }}>
        See it worked out
      </h3>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#111111" }}>
        Here is what it looks like with a real set of results. Life
        Orientation is left out of the total below.
      </p>

      <p style={{ fontSize: "13px", color: "#111111", marginTop: "-6px", marginBottom: "16px" }}>
        Life Orientation: <strong>{LIFE_ORIENTATION_MARK}%</strong> — shown
        for reference, not counted in the total.
      </p>

      <button
        type="button"
        onClick={() => setShowExample((prev) => !prev)}
        className="btn-primary"
        style={{ marginBottom: "16px" }}
      >
        {showExample ? "Hide example" : "Show me an example"}
      </button>

      {showExample && (
        <div
          style={{
            border: "2px solid #111111",
            borderRadius: "10px",
            padding: "16px 20px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px", color: "#111111" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #111111", textAlign: "left" }}>
                <th style={{ padding: "6px 8px" }}>Subject</th>
                <th style={{ padding: "6px 8px" }}>Mark</th>
                <th style={{ padding: "6px 8px" }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_SUBJECTS.map((s) => (
                <tr key={s.subject} style={{ borderBottom: "1px solid #eeeeee" }}>
                  <td style={{ padding: "6px 8px" }}>{s.subject}</td>
                  <td style={{ padding: "6px 8px" }}>{s.mark}%</td>
                  <td style={{ padding: "6px 8px" }}>{markToPoints(s.mark)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "2px solid #111111",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 600,
              fontSize: "16px",
              color: "#111111",
            }}
          >
            <span>Total APS Score (excl. Life Orientation)</span>
            <span>{exampleTotal}</span>
          </div>
        </div>
      )}

      <p style={{ fontSize: "14px", color: "#111111", marginTop: "24px", lineHeight: 1.6 }}>
        Note: This is a general guide. Always check the specific admission
        requirements on each institution's own website, since APS
        calculations and minimum scores differ between universities and
        courses.
      </p>
    </section>
  );
}