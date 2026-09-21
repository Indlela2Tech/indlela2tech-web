import React from "react";
import { Lightbulb } from "lucide-react";

const MISCONCEPTIONS = [
  {
    myth: "\"If I don't have pure Mathematics, I can't study anything tech-related.\"",
    fact: "Not true for every course. Some Information Systems, IT support, and business-computing qualifications accept Mathematical Literacy — it depends on the specific course, not the whole field. Always check the individual course's requirements rather than ruling out tech entirely.",
  },
  {
    myth: "\"TVET colleges are only for students who couldn't get into university.\"",
    fact: "TVET colleges offer practical, career-focused qualifications that lead directly into the workplace, and many have clear pathways into diplomas and degrees later (this is called articulation). For hands-on tech fields, a TVET qualification can be just as valuable a starting point as a university degree.",
  },
  {
    myth: "\"If my APS is too low, I have no options left.\"",
    fact: "A lower APS usually means fewer direct options, not zero options. Higher certificates, TVET programmes, and foundation/extended programmes often have lower entry requirements and can articulate into a diploma or degree later once you've built up your results.",
  },
  {
    myth: "\"I can't afford to study, so there's no point applying.\"",
    fact: "Funding options like NSFAS exist specifically to help qualifying students cover tuition and living costs at public institutions. It's worth applying for both your course and any funding you may qualify for, rather than assuming cost rules it out before you've checked.",
  },
  {
    myth: "\"I should only apply to one institution.\"",
    fact: "Applying to more than one institution and course increases your chances of getting an offer, and it's common practice — it doesn't commit you to accepting every offer you receive.",
  },
];

export default function MisconceptionNotes() {
  return (
    <section style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
      <h2 style={{ fontSize: "26px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", color: "#111111" }}>
        <Lightbulb size={26} strokeWidth={2} />
        Common Misconceptions
      </h2>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#111111", marginBottom: "24px" }}>
        A lot of students rule themselves out of options based on things
        that aren't actually true. Here are a few worth double-checking.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {MISCONCEPTIONS.map((item, i) => (
          <div
            key={i}
            style={{
              border: "2px solid #111111",
              borderRadius: "10px",
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                fontStyle: "italic",
                color: "#a33",
                margin: "0 0 8px 0",
              }}
            >
              Myth: {item.myth}
            </p>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#111111", margin: 0 }}>
              <strong>Fact: </strong>
              {item.fact}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}