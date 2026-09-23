import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Building2, MapPin, ExternalLink, ArrowRight, Search } from 'lucide-react';

const pageWrap = { maxWidth: '900px', margin: '0 auto', padding: '20px', textAlign: 'left' };
const cardStyle = { border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '20px', textAlign: 'left' };
const titleStyle = { margin: '0 0 8px 0', fontSize: '19px', lineHeight: 1.3, color: '#111111', textAlign: 'left' };
const subtitleStyle = { margin: '0 0 12px 0', fontSize: '14px', color: '#111111', fontWeight: 600, textAlign: 'left' };
const campusLabelStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, margin: '0 0 6px 0', color: '#111111', textAlign: 'left' };
const listStyle = { margin: 0, color: '#111111', textAlign: 'left', paddingLeft: '20px' };
const applyButtonStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '14px', padding: '8px 14px', marginRight: '10px' };
const viewCoursesStyle = { display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '14px', padding: '8px 14px', border: '2px solid #111111', borderRadius: '10px', color: '#111111', fontWeight: 700 };

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInstitutions() {
      const { data, error } = await supabase.from('institution').select('*, campus(*)').order('name');
      if (error) {
        console.error('Error fetching institutions:', error);
      } else {
        setInstitutions(data || []);
      }
      setLoading(false);
    }
    fetchInstitutions();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter((inst) => {
      const inName = inst.name && inst.name.toLowerCase().includes(q);
      const inProvince = inst.province && inst.province.toLowerCase().includes(q);
      const inCampus = inst.campus && inst.campus.some((c) => c.name.toLowerCase().includes(q));
      return inName || inProvince || inCampus;
    });
  }, [institutions, searchTerm]);

  return (
    <div style={pageWrap}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', textAlign: 'left' }}><Building2 size={26} strokeWidth={2} /> Institutions</h1>
      <p style={{ color: '#111111', fontSize: '15px', marginBottom: '16px', textAlign: 'left' }}>Public universities and TVET colleges featured on Indlela2Tech. Tap an institution to see its campuses and courses.</p>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} strokeWidth={2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#111111' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by institution name, province, or campus..."
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '2px solid #111111', fontSize: '15px', color: '#111111', textAlign: 'left' }}
        />
      </div>

      {loading && <p style={{ color: '#111111', textAlign: 'left' }}>Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ color: '#555555', textAlign: 'left' }}>No institutions match "{searchTerm}".</p>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((inst) => (
            <div key={inst.institution_id} style={cardStyle}>
              {inst.image_url && <img src={inst.image_url} alt="" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}

              <Link to={'/institutions/' + inst.institution_id} style={{ textDecoration: 'none' }}>
                <h2 style={titleStyle}>{inst.name}</h2>
              </Link>
              <p style={subtitleStyle}>{inst.type === 'university' ? 'University' : 'TVET College'} · {inst.province}</p>

              {inst.campus && inst.campus.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={campusLabelStyle}><MapPin size={16} strokeWidth={2} /> Campuses</p>
                  <ul style={listStyle}>
                    {inst.campus.map((c) => <li key={c.campus_id}>{c.name}</li>)}
                  </ul>
                </div>
              )}

              {(inst.application_open_month || inst.application_close_month) && (
                <p style={{ margin: '0 0 12px 0', color: '#111111', fontSize: '14px', textAlign: 'left' }}>
                  <strong>Applications:</strong> Opens {inst.application_open_month || 'not set'} &middot; Closes {inst.application_close_month || 'not set'}
                </p>
              )}

              <div>
                {inst.application_portal_link && (
                  <a href={inst.application_portal_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={applyButtonStyle}>
                    Apply Now <ExternalLink size={15} strokeWidth={2} />
                  </a>
                )}
                <Link to={'/institutions/' + inst.institution_id} style={viewCoursesStyle}>
                  View Courses <ArrowRight size={15} strokeWidth={2} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}