import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart3, School } from 'lucide-react';

const rowStyle = { display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px 14px' };

export default function AdminReports() {
  const [rows, setRows] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const { data: viewData, error: viewErr } = await supabase
        .from('course_view')
        .select('course_id, province, course(name, institution(name))');
      if (viewErr) console.error('Error fetching view reports:', viewErr);
      setRows(viewData || []);

      const { data: checkinData, error: checkinErr } = await supabase
        .from('school_checkin')
        .select('school_name, province, grade, is_custom_entry, created_at');
      if (checkinErr) console.error('Error fetching school check-ins:', checkinErr);
      setCheckins(checkinData || []);

      setLoading(false);
    }
    fetchAll();
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

  const bySchool = {};
  const byGrade = {};
  const byCheckinProvince = {};

  checkins.forEach((c) => {
    const schoolKey = c.school_name || 'Unknown';
    bySchool[schoolKey] = (bySchool[schoolKey] || 0) + 1;

    const gradeKey = c.grade || 'Not specified';
    byGrade[gradeKey] = (byGrade[gradeKey] || 0) + 1;

    const provKey = c.province || 'Unknown';
    byCheckinProvince[provKey] = (byCheckinProvince[provKey] || 0) + 1;
  });

  const schoolList = Object.entries(bySchool).sort((a, b) => b[1] - a[1]);
  const gradeList = Object.entries(byGrade).sort((a, b) => b[1] - a[1]);
  const checkinProvinceList = Object.entries(byCheckinProvince).sort((a, b) => b[1] - a[1]);

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
            <p style={{ color: '#111111', marginBottom: '28px' }}>No views recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {provinceList.map(([prov, count]) => (
                <div key={prov} style={rowStyle}>
                  <span style={{ color: '#111111' }}>{prov}</span>
                  <strong style={{ color: '#111111' }}>{count}</strong>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', marginTop: '10px' }}>
            <School size={22} strokeWidth={2} /> School Check-ins
          </h2>
          <p style={{ color: '#111111', fontWeight: 600, marginBottom: '20px' }}>
            Total check-ins recorded: {checkins.length}
          </p>

          <h3 style={{ color: '#111111' }}>Check-ins by School</h3>
          {schoolList.length === 0 ? (
            <p style={{ color: '#111111', marginBottom: '24px' }}>No check-ins recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {schoolList.map(([school, count], i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ color: '#111111' }}>{school}</span>
                  <strong style={{ color: '#111111' }}>{count}</strong>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: '#111111' }}>Check-ins by Grade</h3>
          {gradeList.length === 0 ? (
            <p style={{ color: '#111111', marginBottom: '28px' }}>No check-ins recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {gradeList.map(([grade, count]) => (
                <div key={grade} style={rowStyle}>
                  <span style={{ color: '#111111' }}>{grade}</span>
                  <strong style={{ color: '#111111' }}>{count}</strong>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: '#111111' }}>Check-ins by Province</h3>
          {checkinProvinceList.length === 0 ? (
            <p style={{ color: '#111111' }}>No check-ins recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checkinProvinceList.map(([prov, count]) => (
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