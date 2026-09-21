import React from "react";
import { HandCoins, ArrowRight } from "lucide-react";

const NSFAS_URL = "https://www.nsfas.org.za";

const boxStyle = { border: "2px solid #111111", borderLeft: "6px solid #FFEE00", borderRadius: "8px", padding: "18px 22px", display: "flex", flexDirection: "column", gap: "10px" };
const headingStyle = { fontSize: "17px", margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#111111" };
const paragraphStyle = { fontSize: "15px", lineHeight: 1.6, color: "#111111", margin: 0 };
const linkStyle = { fontSize: "15px", fontWeight: 600, color: "#111111", textDecoration: "underline", width: "fit-content", display: "inline-flex", alignItems: "center", gap: "4px" };
const disclaimerStyle = { fontSize: "12px", color: "#111111", margin: 0 };
const sectionStyle = { maxWidth: "760px", margin: "0 auto", padding: "24px 20px" };

export default function NSFASNote() {
  return (
    <section style={sectionStyle}>
      <div style={boxStyle}>
        <h3 style={headingStyle}><HandCoins size={20} strokeWidth={2} /> Need help paying for your studies?</h3>
        <p style={paragraphStyle}>NSFAS (the National Student Financial Aid Scheme) provides funding to eligible South African students studying at public universities and TVET colleges. It is worth checking whether you qualify before assuming you cannot afford a course.</p>
        <a href={NSFAS_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>Visit the official NSFAS website <ArrowRight size={15} strokeWidth={2} /></a>
        <p style={disclaimerStyle}>This links to NSFAS's own site. This platform does not process applications or determine eligibility on their behalf.</p>
      </div>
    </section>
  );
}