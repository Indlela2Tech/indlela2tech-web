import { useState } from 'react';
import { Percent, X, Plus } from 'lucide-react';
import { CAPS_SUBJECTS, PERCENTAGE_OPTIONS } from './subjectsList';

const selectStyle = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d0d0d0', color: '#111111', background: '#ffffff' };

function SubjectInputs({ subjects, onChange }) {
  const [subjectName, setSubjectName] = useState(CAPS_SUBJECTS[0]);
  const [percentage, setPercentage] = useState('');

  function addSubject() {
    if (!subjectName || !percentage) return;
    onChange([...subjects, { subjectName, percentage: Number(percentage) }]);
    setPercentage('');
  }

  function removeSubject(index) {
    onChange(subjects.filter((_, i) => i !== index));
  }

  return (
    <div className="filter-group">
      <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFEE00' }}>
        <Percent size={15} strokeWidth={2} />
        Your Subject Marks
      </label>

      {subjects.map((subj, index) => (
        <div key={index} className="subject-row" style={{ color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{subj.subjectName}: {subj.percentage}%</span>
          <button type="button" className="remove-subject-btn" onClick={() => removeSubject(index)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ))}

      <div className="subject-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} style={selectStyle}>
          {CAPS_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={percentage} onChange={(e) => setPercentage(e.target.value)} style={selectStyle}>
          <option value="">Select %</option>
          {PERCENTAGE_OPTIONS.map((p) => <option key={p} value={p}>{p}%</option>)}
        </select>
      </div>

      <button type="button" className="add-subject-btn" onClick={addSubject} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
        <Plus size={15} strokeWidth={2} />
        Add Subject
      </button>
    </div>
  );
}

export default SubjectInputs;