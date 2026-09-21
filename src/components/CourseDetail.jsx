import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById } from '../supabaseClient';
import BackButton from './BackButton';
import BookmarkButton from './BookmarkButton';
import PrintButton from './PrintButton';
import { useTrackCourseView } from './useTrackCourseview';
import './CourseDetail.css';
import '../Print.css';
import { Building2, Clock, ClipboardCheck, Calculator, Wallet, Briefcase, ExternalLink, MapPin, ArrowRight } from 'lucide-react';

const MATHS_VARIANTS = ['Mathematics', 'Mathematical Literacy', 'Technical Mathematics'];

const pageWrap = { maxWidth: '760px', margin: '0 auto' };
const titleStyle = { color: '#111111', fontSize: '1.9rem', lineHeight: 1.3, marginBottom: '6px' };
const metaStyle = { color: '#111111', marginBottom: '14px' };
const boxStyle = { border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '18px 20px', marginBottom: '18px', background: '#ffffff' };
const headingRow = { display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', margin: '0 0 10px 0', fontSize: '1.1rem' };
const darkText = { color: '#111111', margin: 0 };

function SectionBox({ icon: Icon, title, children }) {
  return (
    <div style={boxStyle}>
      <p style={headingRow}><Icon size={20} strokeWidth={2} /> {title}</p>
      {children}
    </div>
  );
}

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      const data = await getCourseById(id);
      setCourse(data);
      setLoading(false);
    }
    loadCourse();
  }, [id]);

  useTrackCourseView(course?.course_id, course?.institution?.province);

  if (loading) {
    return <p className="course-detail-status">Loading course…</p>;
  }

  if (!course) {
    return <p className="course-detail-status">Course not found.</p>;
  }

  const institution = course.institution;
  const allRequirements = course.subject_requirement || [];
  const mathsRequirements = allRequirements.filter((r) => MATHS_VARIANTS.includes(r.subject_name));
  const otherRequirements = allRequirements.filter((r) => !MATHS_VARIANTS.includes(r.subject_name));
  const campuses = institution?.campus || [];
  const applyLink = institution?.application_portal_link;

  return (
    <div className="course-detail" style={pageWrap}>
      <BackButton />

      <header style={{ marginBottom: '20px' }}>
        <h1 style={titleStyle}>{course.name}</h1>
        <p style={metaStyle}>{course.qualification_type} &middot; NQF Level {course.nqf_level}</p>
        <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <BookmarkButton
            institution={{
              id: course.course_id,
              name: course.name,
              location: institution?.name,
              qualification_type: course.qualification_type,
              institution_id: course.institution_id,
            }}
          />
          <PrintButton />
          {institution && (
            <Link to={'/institutions/' + course.institution_id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none', color: '#111111', fontSize: '14px' }}>
              <Building2 size={15} strokeWidth={2} /> View Institution <ArrowRight size={14} strokeWidth={2} />
            </Link>
          )}
        </div>
      </header>

      <SectionBox icon={Building2} title="Institution">
        <p style={darkText}>{institution?.name}</p>
        <p style={darkText}>{institution?.province}</p>
        {campuses.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, margin: '0 0 6px 0', color: '#111111' }}><MapPin size={16} strokeWidth={2} /> Campuses</p>
            <ul style={{ margin: 0, color: '#111111' }}>
              {campuses.map((campusItem) => <li key={campusItem.campus_id}>{campusItem.name}</li>)}
            </ul>
          </div>
        )}
      </SectionBox>

      <SectionBox icon={Clock} title="Duration & Mode">
        <p style={darkText}>{course.duration}</p>
        <p style={{ ...darkText, marginTop: '4px' }}>{course.mode}</p>
      </SectionBox>

      <SectionBox icon={ClipboardCheck} title="Admission Requirements">
        {course.minimum_aps && <p style={darkText}>Minimum APS: {course.minimum_aps}</p>}
        {otherRequirements.length > 0 ? (
          <ul style={{ color: '#111111', marginTop: course.minimum_aps ? '8px' : 0 }}>
            {otherRequirements.map((requirementItem, index) => (
              <li key={index}>{requirementItem.subject_name}: minimum {requirementItem.minimum_percentage}%</li>
            ))}
          </ul>
        ) : (
          !course.minimum_aps && <p style={darkText}>No specific admission requirements listed yet. Check the official source for details.</p>
        )}
      </SectionBox>

      <SectionBox icon={Calculator} title="Mathematics Requirement">
        {mathsRequirements.length === 0 ? (
          <p style={darkText}>No specific Mathematics requirement listed. Check the official source for details.</p>
        ) : mathsRequirements.length === 1 ? (
          <p style={darkText}>{mathsRequirements[0].subject_name}: minimum {mathsRequirements[0].minimum_percentage}%</p>
        ) : (
          <>
            <p style={{ ...darkText, marginBottom: '6px' }}>This course accepts any one of the following:</p>
            <ul style={{ margin: 0, color: '#111111' }}>
              {mathsRequirements.map((req, index) => (
                <li key={index}>{req.subject_name}: minimum {req.minimum_percentage}%</li>
              ))}
            </ul>
          </>
        )}
      </SectionBox>

      <SectionBox icon={Wallet} title="Application Fee">
        <p style={darkText}>{course.has_application_fee ? ('R' + (course.application_fee_amount ?? '')).trim() : 'No application fee'}</p>
      </SectionBox>

      <div style={boxStyle}>
        <p style={headingRow}>About This Course</p>
        <p style={darkText}>{course.description}</p>
        {course.source_link && (
          <p style={{ marginTop: '8px' }}>
            <a href={course.source_link} target="_blank" rel="noopener noreferrer">View official source</a>
          </p>
        )}
      </div>

      {course.career_tags && course.career_tags.length > 0 && (
        <SectionBox icon={Briefcase} title="Related Careers">
          <div className="tag-list">
            {course.career_tags.map((tag, index) => <span key={index} className="career-tag">{tag}</span>)}
          </div>
        </SectionBox>
      )}

      {course.related_courses && course.related_courses.length > 0 && (
        <div style={boxStyle}>
          <p style={headingRow}>Similar Courses</p>
          <ul style={{ color: '#111111', margin: 0 }}>
            {course.related_courses.map((relatedCourse) => (
              <li key={relatedCourse.course_id}>
                <Link to={'/course/' + relatedCourse.course_id}>{relatedCourse.name}</Link>
                {relatedCourse.institution && relatedCourse.institution.name ? ' — ' + relatedCourse.institution.name : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {course.pathway_note && (
        <div style={boxStyle}>
          <p style={headingRow}>Qualification Pathway</p>
          <p style={darkText}>{course.pathway_note}</p>
        </div>
      )}

      {(institution?.application_open_month || institution?.application_close_month) && (
        <div style={boxStyle}>
          <p style={headingRow}>Application Window</p>
          <p style={darkText}>Opens: {institution.application_open_month} &middot; Closes: {institution.application_close_month}</p>
        </div>
      )}

      {applyLink && (
        <a href={applyLink} target="_blank" rel="noopener noreferrer" className="apply-now-button no-print" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Apply Now <ExternalLink size={16} strokeWidth={2} />
        </a>
      )}
    </div>
  );
}

export default CourseDetail;