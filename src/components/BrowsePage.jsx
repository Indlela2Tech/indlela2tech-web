import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import FilterSelect from './FilterSelect';
import ApsInput from './ApsInput';
import SubjectInputs from './SubjectInputs';
import './BrowsePage.css';
import { SlidersHorizontal, Search, Building2, GraduationCap, Layers, Clock, Wallet, MapPin, LayoutGrid } from 'lucide-react';

const FEE_LABELS = { true: 'Application Fee Required', false: 'No Application Fee' };
const MATHS_VARIANTS = ['Mathematics', 'Mathematical Literacy', 'Technical Mathematics'];
const MODE_LABELS = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'distance': 'Distance' };
const MODE_OPTIONS = ['Full-time', 'Part-time', 'Distance'];

function BrowsePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [qualificationTypes, setQualificationTypes] = useState([]);
  const [selectedQualificationType, setSelectedQualificationType] = useState('');
  const [nqfLevels, setNqfLevels] = useState([]);
  const [selectedNqfLevel, setSelectedNqfLevel] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [feeOptions, setFeeOptions] = useState([]);
  const [selectedFee, setSelectedFee] = useState('');
  const [apsScore, setApsScore] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('course')
        .select('*, institution(name, province, type, campus(*)), subject_requirement(subject_name, minimum_percentage), course_mode_duration(mode, duration)');

      if (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
        return;
      }

      setCourses(data);
      setLoading(false);

      setProvinces([...new Set(data.map((c) => c.institution?.province).filter(Boolean))].sort());
      setInstitutions([...new Set(data.map((c) => c.institution?.name).filter(Boolean))].sort());
      setQualificationTypes([...new Set(data.map((c) => c.qualification_type).filter(Boolean))].sort());

      const uniqueLevels = [...new Set(data.map((c) => c.nqf_level))].filter((level) => level !== null).sort((a, b) => a - b).map((level) => String(level));
      setNqfLevels(uniqueLevels);

      const uniqueFees = [...new Set(data.map((c) => String(c.has_application_fee)))];
      setFeeOptions(uniqueFees.map((val) => FEE_LABELS[val]));
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedProvince && course.institution?.province !== selectedProvince) return false;
      if (selectedInstitution && course.institution?.name !== selectedInstitution) return false;
      if (selectedQualificationType && course.qualification_type !== selectedQualificationType) return false;
      if (selectedNqfLevel && String(course.nqf_level) !== selectedNqfLevel) return false;
      if (selectedFee && FEE_LABELS[String(course.has_application_fee)] !== selectedFee) return false;

      if (selectedMode) {
        const modeDurations = course.course_mode_duration || [];
        const hasMode = modeDurations.some((m) => MODE_LABELS[m.mode] === selectedMode);
        if (!hasMode) return false;
      }

      if (apsScore && course.minimum_aps !== null) {
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
  }, [courses, selectedProvince, selectedInstitution, selectedQualificationType, selectedNqfLevel, selectedMode, selectedFee, apsScore, subjects]);

  const query = searchTerm.trim().toLowerCase();

  const directMatches = useMemo(() => {
    if (!query) return [];
    return filteredCourses.filter((c) => c.name && c.name.toLowerCase().includes(query));
  }, [filteredCourses, query]);

  const relatedMatches = useMemo(() => {
    if (!query) return [];
    const directIds = new Set(directMatches.map((c) => c.course_id));
    return filteredCourses.filter((c) => {
      if (directIds.has(c.course_id)) return false;
      const inDescription = c.description && c.description.toLowerCase().includes(query);
      const inInstitution = c.institution?.name && c.institution.name.toLowerCase().includes(query);
      const inQualType = c.qualification_type && c.qualification_type.toLowerCase().includes(query);
      return inDescription || inInstitution || inQualType;
    });
  }, [filteredCourses, directMatches, query]);

  function CourseResultCard({ course }) {
    const modes = (course.course_mode_duration || []).map((m) => MODE_LABELS[m.mode] || m.mode).join(' / ');
    return (
      <Link to={'/course/' + course.course_id} className="course-card">
        <h3>{course.name}</h3>
        <p className="institution-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={15} strokeWidth={2} /> {course.institution?.name}</p>
        <div className="course-meta">
          <span className="meta-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GraduationCap size={14} strokeWidth={2} /> {course.qualification_type}</span>
          {course.nqf_level && <span className="meta-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Layers size={14} strokeWidth={2} /> NQF {course.nqf_level}</span>}
          {modes && <span className="meta-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} strokeWidth={2} /> {modes}</span>}
          <span className={'meta-tag ' + (course.has_application_fee ? 'fee-required' : 'fee-free')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Wallet size={14} strokeWidth={2} /> {course.has_application_fee ? 'Fee required' : 'No fee'}</span>
        </div>
        {course.description && <p className="description">{course.description}</p>}
      </Link>
    );
  }

  return (
    <div className="browse-layout">
      <aside className="filters-sidebar">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SlidersHorizontal size={20} strokeWidth={2} /> Filter Courses</h2>

        <FilterSelect label="Province" value={selectedProvince} onChange={setSelectedProvince} options={provinces} icon={MapPin} />
        <FilterSelect label="Institution" value={selectedInstitution} onChange={setSelectedInstitution} options={institutions} icon={Building2} />
        <FilterSelect label="Qualification Type" value={selectedQualificationType} onChange={setSelectedQualificationType} options={qualificationTypes} icon={GraduationCap} />
        <FilterSelect label="NQF Level" value={selectedNqfLevel} onChange={setSelectedNqfLevel} options={nqfLevels} icon={LayoutGrid} />
        <FilterSelect label="Mode of Study" value={selectedMode} onChange={setSelectedMode} options={MODE_OPTIONS} icon={Clock} />
        <FilterSelect label="Application Fee" value={selectedFee} onChange={setSelectedFee} options={feeOptions} icon={Wallet} />

        <ApsInput value={apsScore} onChange={setApsScore} />
        <SubjectInputs subjects={subjects} onChange={setSubjects} />
      </aside>

      <section className="results-area">
        <div className="results-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Search size={22} strokeWidth={2} /> Browse Courses</h2>

          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={16} strokeWidth={2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#111111' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course name, institution, or keyword..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '2px solid #111111', fontSize: '15px', color: '#111111' }}
            />
          </div>

          {!query && (
            <p className="results-count">{loading ? 'Loading...' : 'Showing ' + filteredCourses.length + ' result' + (filteredCourses.length === 1 ? '' : 's')}</p>
          )}
        </div>

        {!query && (
          <div className="results-grid">
            {!loading && filteredCourses.length === 0 && <p className="no-results">No courses match your filters yet. Try adjusting them.</p>}
            {filteredCourses.map((course) => <CourseResultCard key={course.course_id} course={course} />)}
          </div>
        )}

        {query && (
          <>
            <h3 style={{ color: '#111111', marginBottom: '10px' }}>Direct Matches ({directMatches.length})</h3>
            {directMatches.length > 0 ? (
              <div className="results-grid" style={{ marginBottom: '28px' }}>
                {directMatches.map((course) => <CourseResultCard key={course.course_id} course={course} />)}
              </div>
            ) : (
              <p style={{ color: '#555555', marginBottom: '28px' }}>No course names match "{searchTerm}" directly.</p>
            )}

            <h3 style={{ color: '#111111', marginBottom: '10px' }}>You Might Also Like ({relatedMatches.length})</h3>
            {relatedMatches.length > 0 ? (
              <div className="results-grid">
                {relatedMatches.map((course) => <CourseResultCard key={course.course_id} course={course} />)}
              </div>
            ) : (
              <p style={{ color: '#555555' }}>No related results found.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default BrowsePage;