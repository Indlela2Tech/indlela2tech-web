import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart3 } from 'lucide-react';

const rowStyle = { display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px 14px' };

export default function AdminReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchViews() {
      const { data, error } = await supabase
        .from('course_view')
        .select('course_id, province, course(name, institution(name))');

      if (error) {
        console.error('Error fetching view reports:', error);
        setLoading(false);
        return;
      }

      setRows(data || []);
      setLoading(false);
    }
    fetchViews();
  }, []);

  const byCourse = {};
  const byProvince = {};

  rows.forEach((r) => {
    const key = r.course_id;
    if (!byCourse[key]) {
      byCourse[key] = {
        name: r.course && r.course.name ? r.course.name : 'Unknown course',
        institution: r.course && r.course.institution && r.course.institution.name ? r.course.institution.name : '',
        count: 0,
      };
    }
    byCourse[key].count += 1;

    const prov = r.province || 'Unknown';
    byProvince[prov] = (byProvince[prov] || 0) + 1;
  });

  const courseList = Object.values(byCourse).sort((a, b) => b.count - a.count);
  const provinceList = Object.entries(byProvince).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111' }}>
        <BarChart3 size={22} strokeWidth={2} /> View Reports
      </h2>

      {loading ? (
        <p style={{ color: '#111111' }}>Loading…</p>
      ) : (
        <>
          <p style={{ color: '#111111', fontWeight: 600, marginBottom: '20px' }}>
            Total course views recorded: {rows.length}
          </p>

          <h3 style={{ color: '#111111' }}>Views by Course</h3>
          {courseList.length === 0 ? (
            <p style={{ color: '#111111', marginBottom: '24px' }}>No views recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {courseList.map((c, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ color: '#111111' }}>
                    {c.name} <span style={{ color: '#555555', fontSize: '13px' }}>({c.institution})</span>
                  </span>
                  <strong style={{ color: '#111111' }}>{c.count}</strong>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: '#111111' }}>Views by Province</h3>
          {provinceList.length === 0 ? (
            <p style={{ color: '#111111' }}>No views recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {provinceList.map(([prov, count]) => (
                <div key={prov} style={rowStyle}>
                  <span style={{ color: '#111111' }}>{prov}</span>
                  <strong style={{ color: '#111111' }}>{count}</strong>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}