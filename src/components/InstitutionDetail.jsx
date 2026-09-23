import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInstitutionWithCourses } from '../supabaseClient';
import BackButton from './BackButton';
import PrintButton from './PrintButton';
import '../Print.css';
import { Building2, MapPin, ExternalLink, GraduationCap, ArrowRight } from 'lucide-react';

const cardStyle = { border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '24px', maxWidth: '760px', margin: '0 auto', textAlign: 'left' };
const titleStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', fontSize: '22px', lineHeight: 1.3, margin: '0 0 8px 0', textAlign: 'left' };
const subtitleStyle = { fontWeight: 600, color: '#111111', marginBottom: '16px', fontSize: '14px', textAlign: 'left' };
const listStyle = { margin: 0, color: '#111111', textAlign: 'left', paddingLeft: '20px' };
const courseCardStyle = { border: '2px solid #111111', borderRadius: '12px', padding: '16px', display: 'block', textDecoration: 'none', color: '#111111', marginBottom: '12px', textAlign: 'left' };

export default function InstitutionDetail() {
  const { id } = useParams();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getInstitutionWithCourses(id);
      setInstitution(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p style={{ padding: '20px', color: '#111111', textAlign: 'left' }}>Loading institution…</p>;
  if (!institution) return <p style={{ padding: '20px', color: '#111111', textAlign: 'left' }}>Institution not found.</p>;

  return (
    <div style={{ padding: '10px', textAlign: 'left' }}>
      <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <BackButton />
        <PrintButton />
      </div>

      <div style={cardStyle}>
        {institution.image_url && <img src={institution.image_url} alt="" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />}

        <h1 style={titleStyle}><Building2 size={24} strokeWidth={2} /> {institution.name}</h1>
        <p style={subtitleStyle}>{institution.type === 'university' ? 'University' : 'TVET College'} · {institution.province}</p>

        {institution.campus && institution.campus.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#111111', margin: '0 0 6px 0', textAlign: 'left' }}><MapPin size={16} strokeWidth={2} /> Campuses</p>
            <ul style={listStyle}>
              {institution.campus.map((c) => <li key={c.campus_id}>{c.name}</li>)}
            </ul>
          </div>
        )}

        {(institution.application_open_month || institution.application_close_month) && (
          <p style={{ color: '#111111', marginBottom: '16px', textAlign: 'left' }}>
            <strong>Applications:</strong> Opens {institution.application_open_month || 'not set'} &middot; Closes {institution.application_close_month || 'not set'}
          </p>
        )}

        {institution.application_portal_link && (
          <a href={institution.application_portal_link} target="_blank" rel="noopener noreferrer" className="btn-primary no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginBottom: '10px' }}>
            Apply Now <ExternalLink size={15} strokeWidth={2} />
          </a>
        )}
      </div>

      <div style={{ maxWidth: '760px', margin: '30px auto 0', textAlign: 'left' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', marginBottom: '14px', textAlign: 'left' }}><GraduationCap size={22} strokeWidth={2} /> Courses at this Institution</h2>

        {institution.courses && institution.courses.length > 0 ? (
          institution.courses.map((course) => (
            <Link key={course.course_id} to={'/course/' + course.course_id} style={courseCardStyle}>
              <strong style={{ fontSize: '16px' }}>{course.name}</strong>
              <div style={{ fontSize: '13px', color: '#555555', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{course.qualification_type}{course.nqf_level ? ' · NQF ' + course.nqf_level : ''}</span>
                <ArrowRight size={16} strokeWidth={2} />
              </div>
            </Link>
          ))
        ) : (
          <p style={{ color: '#111111', textAlign: 'left' }}>No courses listed for this institution yet.</p>
        )}
      </div>
    </div>
  );
}