import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useShortlist } from './useShortlist';
import { Sparkles, Building2, GraduationCap } from 'lucide-react';

export default function RecommendedCourses() {
  const { shortlist } = useShortlist();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buildRecommendations() {
      if (!shortlist || shortlist.length === 0) {
        setLoading(false);
        return;
      }

      const bookmarkedIds = new Set(shortlist.map((s) => s.id));
      const qualTypes = new Set(shortlist.map((s) => s.qualification_type).filter(Boolean));
      const institutionIds = new Set(shortlist.map((s) => s.institution_id).filter(Boolean));

      if (qualTypes.size === 0 && institutionIds.size === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('course')
        .select('course_id, name, qualification_type, institution_id, mode, nqf_level, institution(name)');

      if (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
        return;
      }

      const matches = (data || []).filter((c) => {
        if (bookmarkedIds.has(c.course_id)) return false;
        const sameQual = c.qualification_type && qualTypes.has(c.qualification_type);
        const sameInstitution = c.institution_id && institutionIds.has(c.institution_id);
        return sameQual || sameInstitution;
      });

      setRecommendations(matches.slice(0, 4));
      setLoading(false);
    }

    buildRecommendations();
  }, [shortlist]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111111', fontSize: '24px', marginBottom: '6px' }}>
        <Sparkles size={24} strokeWidth={2} /> Recommended For You
      </h2>
      <p style={{ color: '#555555', fontSize: '14px', marginBottom: '18px' }}>
        Based on the courses you've shortlisted.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {recommendations.map((course) => (
          <Link
            key={course.course_id}
            to={'/course/' + course.course_id}
            style={{ display: 'block', border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: '#111111' }}
          >
            <strong style={{ fontSize: '15px' }}>{course.name}</strong>
            <div style={{ fontSize: '13px', color: '#555555', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} strokeWidth={2} /> {course.institution?.name}
            </div>
            <div style={{ fontSize: '13px', color: '#555555', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={13} strokeWidth={2} /> {course.qualification_type}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}