import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SubjectInputs from './SubjectInputs';
import { Compass, Search, ExternalLink, Building2, GraduationCap } from 'lucide-react';

const PROVINCES = ['', 'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];
const MATHS_VARIANTS = ['Mathematics', 'Mathematical Literacy', 'Technical Mathematics'];

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '2px solid #111111', color: '#111111', background: '#ffffff', fontSize: '15px' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#111111' };
const sectionStyle = { border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '20px', marginBottom: '20px', maxWidth: '700px', margin: '0 auto 20px' };

export default function FindMyFit() {
  const [interests, setInterests] = useState('');
  const [province, setProvince] = useState('');
  const [apsScore, setApsScore] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bestMatches, setBestMatches] = useState([]);
  const [otherMatches, setOtherMatches] = useState([]);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from('course')
      .select('*, institution(name, province), subject_requirement(subject_name, minimum_percentage)');

    if (error) {
      console.error('Error searching courses:', error);
      setLoading(false);
      return;
    }

    const keywords = interests.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const passingHardFilters = (data || []).filter((course) => {
      if (province && course.institution?.province !== province) return false;

      if (apsScore && course.minimum_aps !== null && course.minimum_aps !== undefined) {
        if (Number(apsScore) < course.minimum_aps) return false;
      }

      if (subjects.length > 0 && course.subject_requirement && course.subject_requirement.length > 0) {
        const mathsReqs = course.subject_requirement.filter((r) => MATHS_VARIANTS.includes(r.subject_name));
        const otherReqs = course.subject_requirement.filter((r) => !MATHS_VARIANTS.includes(r.subject_name));

        const meetsOthers = otherReqs.every((req) => {
          const studentSubject = subjects.find((s) => s.subjectName.toLowerCase() === req.subject_name.toLowerCase());
          return studentSubject && studentSubject.percentage >= req.minimum_percentage;
        });
        if (!meetsOthers) return false;

        if (mathsReqs.length > 0) {
          const meetsAnyMaths = mathsReqs.some((req) => {
            const studentSubject = subjects.find((s) => s.subjectName.toLowerCase() === req.subject_name.toLowerCase());
            return studentSubject && studentSubject.percentage >= req.minimum_percentage;
          });
          if (!meetsAnyMaths) return false;
        }
      }

      return true;
    });

    function scoreCourse(course) {
      if (keywords.length === 0) return 0;
      const searchableText = [
        course.name,
        course.description,
        course.qualification_type,
        course.pathway_note,
        course.institution?.name,
        ...(course.career_tags || []),
      ].filter(Boolean).join(' ').toLowerCase();

      let score = 0;
      keywords.forEach((kw) => {
        if (searchableText.includes(kw)) score += 1;
      });
      return score;
    }

    const scored = passingHardFilters.map((c) => ({ course: c, score: scoreCourse(c) }));

    let best = [];
    let other = [];

    if (keywords.length > 0) {
      best = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.course);
      other = scored.filter((s) => s.score === 0).map((s) => s.course);
    } else {
      best = scored.map((s) => s.course);
      other = [];
    }

    setBestMatches(best);
    setOtherMatches(other);
    setLoading(false);
  }

  function CourseResultCard({ course }) {
    return (
      <div style={{ border: '2px solid #111111', borderRadius: '12px', padding: '16px', marginBottom: '12px', background: '#ffffff' }}>
        <Link to={'/course/' + course.course_id} style={{ textDecoration: 'none' }}>
          <h3 style={{ margin: '0 0 4px 0', color: '#111111', fontSize: '17px' }}>{course.name}</h3>
        </Link>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555555', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} strokeWidth={2} /> {course.institution?.name}
          <span>&middot;</span>
          <GraduationCap size={14} strokeWidth={2} /> {course.qualification_type}
        </p>
        {course.description && <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333333' }}>{course.description}</p>}
        <p style={{ margin: 0, fontSize: '12px', color: '#888888', fontStyle: 'italic' }}>
          This is based only on the information entered on this site.{' '}
          {course.source_link ? (
            <a href={course.source_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1a4dbf' }}>
              Always confirm on the official source <ExternalLink size={11} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </a>
          ) : (
            'Always confirm details directly with the institution.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', justifyContent: 'center' }}>
        <Compass size={26} strokeWidth={2} /> Find My Fit
      </h1>
      <p style={{ textAlign: 'center', color: '#111111', marginBottom: '24px' }}>
        Tell us a bit about yourself, and we'll match you against every course entered on this site — based only on real, admin-verified information, never a guess.
      </p>

      <form onSubmit={handleSearch}>
        <div style={sectionStyle}>
          <label style={labelStyle}>What are you interested in?</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. coding, networks, business, engineering, design..."
            style={inputStyle}
          />
          <p style={{ fontSize: '12px', color: '#555555', marginTop: '6px' }}>
            This searches every course's description, career tags, qualification type, and pathway notes — not just its name.
          </p>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Which province? (optional)</label>
          <select value={province} onChange={(e) => setProvince(e.target.value)} style={inputStyle}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p || 'Any province'}</option>)}
          </select>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Your overall APS score (optional)</label>
          <input
            type="number"
            min="0"
            max="49"
            value={apsScore}
            onChange={(e) => setApsScore(e.target.value)}
            placeholder="e.g. 32"
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <SubjectInputs subjects={subjects} onChange={setSubjects} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} strokeWidth={2} /> {loading ? 'Searching...' : 'Find My Matches'}
          </button>
        </div>
      </form>

      {searched && !loading && (
        <div>
          {bestMatches.length === 0 && otherMatches.length === 0 && (
            <div style={{ border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#111111', fontWeight: 700, marginBottom: '8px' }}>
                We couldn't find a course on this site matching what you entered.
              </p>
              <p style={{ color: '#555555', fontSize: '14px', marginBottom: '16px' }}>
                This doesn't mean nothing exists for you — it just means we don't have it entered yet. Try broadening your search, browsing everything manually, or checking each institution's own website directly.
              </p>
              <Link to="/browse" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Browse All Courses
              </Link>
            </div>
          )}

          {bestMatches.length > 0 && (
            <>
              <h2 style={{ color: '#111111', fontSize: '20px' }}>
                {interests.trim() ? 'Best Matches for Your Interests' : 'Courses You May Qualify For'} ({bestMatches.length})
              </h2>
              {bestMatches.map((c) => <CourseResultCard key={c.course_id} course={c} />)}
            </>
          )}

          {otherMatches.length > 0 && (
            <>
              <h2 style={{ color: '#111111', fontSize: '20px', marginTop: '24px' }}>
                Other Courses You May Qualify For ({otherMatches.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#555555', marginBottom: '10px' }}>
                These meet your marks but didn't match your interest keywords directly.
              </p>
              {otherMatches.map((c) => <CourseResultCard key={c.course_id} course={c} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}