import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../supabaseClient';
import BackButton from './BackButton';
import { Scale } from 'lucide-react';

const MATHS_VARIANTS = ['Mathematics', 'Mathematical Literacy', 'Technical Mathematics'];

function mathsText(course) {
  const reqs = (course.subject_requirement || []).filter((r) => MATHS_VARIANTS.includes(r.subject_name));
  if (reqs.length === 0) return 'Not specified';
  return reqs.map((r) => r.subject_name + ': ' + r.minimum_percentage + '%').join(', ');
}

function Row({ label, a, b }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '10px', padding: '10px 0', borderBottom: '1px solid #eeeeee' }}>
      <strong style={{ color: '#111111', fontSize: '14px' }}>{label}</strong>
      <span style={{ color: '#111111', fontSize: '14px' }}>{a}</span>
      <span style={{ color: '#111111', fontSize: '14px' }}>{b}</span>
    </div>
  );
}

export default function ComparePage() {
  const { idA, idB } = useParams();
  const [courseA, setCourseA] = useState(null);
  const [courseB, setCourseB] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [a, b] = await Promise.all([getCourseById(idA), getCourseById(idB)]);
      setCourseA(a);
      setCourseB(b);
      setLoading(false);
    }
    load();
  }, [idA, idB]);

  if (loading) return <p style={{ padding: '20px', color: '#111111' }}>Loading comparison…</p>;
  if (!courseA || !courseB) return <p style={{ padding: '20px', color: '#111111' }}>Could not load one or both courses.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111' }}>
        <Scale size={24} strokeWidth={2} /> Compare Courses
      </h1>

      <div style={{ border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '20px', marginTop: '16px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '10px', paddingBottom: '10px', borderBottom: '2px solid #111111', marginBottom: '4px' }}>
          <span></span>
          <Link to={'/course/' + courseA.course_id} style={{ fontWeight: 700, color: '#111111', fontSize: '15px' }}>{courseA.name}</Link>
          <Link to={'/course/' + courseB.course_id} style={{ fontWeight: 700, color: '#111111', fontSize: '15px' }}>{courseB.name}</Link>
        </div>

        <Row label="Institution" a={courseA.institution ? courseA.institution.name : ''} b={courseB.institution ? courseB.institution.name : ''} />
        <Row label="Qualification" a={courseA.qualification_type} b={courseB.qualification_type} />
        <Row label="NQF Level" a={courseA.nqf_level || 'Not specified'} b={courseB.nqf_level || 'Not specified'} />
        <Row label="Duration" a={courseA.duration} b={courseB.duration} />
        <Row label="Mode" a={courseA.mode} b={courseB.mode} />
        <Row label="Minimum APS" a={courseA.minimum_aps || 'Not specified'} b={courseB.minimum_aps || 'Not specified'} />
        <Row label="Mathematics" a={mathsText(courseA)} b={mathsText(courseB)} />
        <Row
          label="Application Fee"
          a={courseA.has_application_fee ? 'R' + (courseA.application_fee_amount || '') : 'None'}
          b={courseB.has_application_fee ? 'R' + (courseB.application_fee_amount || '') : 'None'}
        />
      </div>
    </div>
  );
}