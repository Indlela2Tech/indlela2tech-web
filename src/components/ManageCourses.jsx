import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { GraduationCap, Plus, Pencil, Trash2, X, Check, Undo2 } from 'lucide-react';
import { CAPS_SUBJECTS, PERCENTAGE_OPTIONS } from './subjectsList';
import { QUALIFICATION_TYPES, NQF_LEVELS, DURATIONS, MODES, APS_OPTIONS } from './courseOptions';

const EMPTY_FORM = {
  institution_id: '',
  name: '',
  qualification_type: QUALIFICATION_TYPES[0],
  nqf_level: '',
  requirement_type: 'APS-only',
  minimum_aps: '',
  has_application_fee: false,
  application_fee_amount: '',
  description: '',
  source_link: '',
};

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d0d0d0', color: '#111111', background: '#ffffff' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#111111' };

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const [newSubjectName, setNewSubjectName] = useState(CAPS_SUBJECTS[0]);
  const [newSubjectPct, setNewSubjectPct] = useState('');
  const [pendingSubjects, setPendingSubjects] = useState([]);

  const [newMode, setNewMode] = useState(MODES[0].value);
  const [newDuration, setNewDuration] = useState(DURATIONS[0]);
  const [pendingModeDurations, setPendingModeDurations] = useState([]);

  const [lastDeleted, setLastDeleted] = useState(null);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    setLoading(true);
    const { data: courseData } = await supabase
      .from('course')
      .select('*, institution(name), subject_requirement(*), course_mode_duration(*)')
      .order('name');
    const { data: instData } = await supabase.from('institution').select('institution_id, name').order('name');
    setCourses(courseData || []);
    setInstitutions(instData || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function startEdit(course) {
    setMessage('');
    setEditingId(course.course_id);
    setForm({
      institution_id: course.institution_id || '',
      name: course.name || '',
      qualification_type: course.qualification_type || QUALIFICATION_TYPES[0],
      nqf_level: course.nqf_level ?? '',
      requirement_type: course.requirement_type || 'APS-only',
      minimum_aps: course.minimum_aps ?? '',
      has_application_fee: !!course.has_application_fee,
      application_fee_amount: course.application_fee_amount ?? '',
      description: course.description || '',
      source_link: course.source_link || '',
    });
    setPendingSubjects((course.subject_requirement || []).map((s) => ({ subject_name: s.subject_name, minimum_percentage: s.minimum_percentage })));
    setPendingModeDurations((course.course_mode_duration || []).map((m) => ({ mode: m.mode, duration: m.duration })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPendingSubjects([]);
    setPendingModeDurations([]);
    setMessage('');
  }

  function addPendingSubject() {
    if (!newSubjectName || newSubjectPct === '') return;
    if (pendingSubjects.some((s) => s.subject_name === newSubjectName)) {
      setMessage('That subject is already in the list below.');
      return;
    }
    setPendingSubjects((prev) => [...prev, { subject_name: newSubjectName, minimum_percentage: Number(newSubjectPct) }]);
    setNewSubjectPct('');
  }

  function removePendingSubject(index) {
    setPendingSubjects((prev) => prev.filter((_, i) => i !== index));
  }

  function addPendingModeDuration() {
    if (!newMode || !newDuration) return;
    if (pendingModeDurations.some((m) => m.mode === newMode)) {
      setMessage('That mode of study is already in the list below. Remove it first if you want to change its duration.');
      return;
    }
    setPendingModeDurations((prev) => [...prev, { mode: newMode, duration: newDuration }]);
  }

  function removePendingModeDuration(index) {
    setPendingModeDurations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    const payload = {
      institution_id: form.institution_id,
      name: form.name,
      qualification_type: form.qualification_type,
      nqf_level: form.nqf_level === '' ? null : Number(form.nqf_level),
      requirement_type: form.requirement_type,
      minimum_aps: form.minimum_aps === '' ? null : Number(form.minimum_aps),
      has_application_fee: form.has_application_fee,
      application_fee_amount: form.application_fee_amount ? Number(form.application_fee_amount) : null,
      description: form.description,
      source_link: form.source_link,
    };

    let courseId = editingId;

    if (editingId) {
      const { error } = await supabase.from('course').update(payload).eq('course_id', editingId);
      if (error) { setMessage('Error saving course: ' + error.message); setSaving(false); return; }
    } else {
      const { data: inserted, error } = await supabase.from('course').insert([payload]).select('course_id').single();
      if (error) { setMessage('Error saving course: ' + error.message); setSaving(false); return; }
      courseId = inserted.course_id;
    }

    const { error: deleteSubjErr } = await supabase.from('subject_requirement').delete().eq('course_id', courseId);
    if (deleteSubjErr) { setMessage('Course saved, but error updating subjects: ' + deleteSubjErr.message); setSaving(false); fetchData(); return; }
    if (pendingSubjects.length > 0) {
      const rows = pendingSubjects.map((s) => ({ course_id: courseId, subject_name: s.subject_name, minimum_percentage: s.minimum_percentage }));
      const { error } = await supabase.from('subject_requirement').insert(rows);
      if (error) { setMessage('Course saved, but error saving subjects: ' + error.message); setSaving(false); fetchData(); return; }
    }

    const { error: deleteModeErr } = await supabase.from('course_mode_duration').delete().eq('course_id', courseId);
    if (deleteModeErr) { setMessage('Course saved, but error updating mode/duration: ' + deleteModeErr.message); setSaving(false); fetchData(); return; }
    if (pendingModeDurations.length > 0) {
      const rows = pendingModeDurations.map((m) => ({ course_id: courseId, mode: m.mode, duration: m.duration }));
      const { error } = await supabase.from('course_mode_duration').insert(rows);
      if (error) { setMessage('Course saved, but error saving mode/duration: ' + error.message); setSaving(false); fetchData(); return; }
    }

    setMessage(editingId ? 'Course updated.' : 'Course added.');
    setSaving(false);
    cancelEdit();
    fetchData();
  }

  async function handleDelete(course) {
    if (!window.confirm('Delete "' + course.name + '"? You can undo this for a few seconds after.')) return;
    const { error } = await supabase.from('course').delete().eq('course_id', course.course_id);
    if (error) { setMessage('Error: ' + error.message); return; }
    setLastDeleted(course);
    setMessage('Course deleted.');
    fetchData();
    setTimeout(() => setLastDeleted((current) => (current && current.course_id === course.course_id ? null : current)), 8000);
  }

  async function handleUndo() {
    if (!lastDeleted) return;
    const { course_id, institution, subject_requirement, course_mode_duration, ...restorable } = lastDeleted;
    const { error } = await supabase.from('course').insert([{ course_id, ...restorable }]);
    if (error) { setMessage('Could not undo: ' + error.message); return; }
    if (subject_requirement && subject_requirement.length > 0) {
      await supabase.from('subject_requirement').insert(subject_requirement.map((s) => ({ course_id, subject_name: s.subject_name, minimum_percentage: s.minimum_percentage })));
    }
    if (course_mode_duration && course_mode_duration.length > 0) {
      await supabase.from('course_mode_duration').insert(course_mode_duration.map((m) => ({ course_id, mode: m.mode, duration: m.duration })));
    }
    setMessage('Course restored.');
    setLastDeleted(null);
    fetchData();
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111' }}><GraduationCap size={22} strokeWidth={2} /> Manage Courses & Subjects</h2>

      {lastDeleted && (
        <div style={{ background: '#FFF3D1', border: '1px solid #FFEE00', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#111111' }}>Deleted "{lastDeleted.name}".</span>
          <button onClick={handleUndo} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#111111', color: '#FFEE00', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}><Undo2 size={14} strokeWidth={2} /> Undo</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#111111' }}>{editingId ? 'Edit Course' : 'Add New Course'}</h3>

        <div>
          <label style={labelStyle}>Institution</label>
          <select required value={form.institution_id} onChange={(e) => setForm({ ...form, institution_id: e.target.value })} style={inputStyle}>
            <option value="">Select an institution</option>
            {institutions.map((i) => <option key={i.institution_id} value={i.institution_id}>{i.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Course Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Qualification Type</label>
            <select value={form.qualification_type} onChange={(e) => setForm({ ...form, qualification_type: e.target.value })} style={inputStyle}>
              {QUALIFICATION_TYPES.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={labelStyle}>NQF Level</label>
            <select value={form.nqf_level} onChange={(e) => setForm({ ...form, nqf_level: e.target.value })} style={inputStyle}>
              <option value="">Not specified</option>
              {NQF_LEVELS.map((n) => <option key={n} value={n}>Level {n}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Requirement Type</label>
            <select value={form.requirement_type} onChange={(e) => setForm({ ...form, requirement_type: e.target.value })} style={inputStyle}>
              <option value="APS-only">APS only</option>
              <option value="APS and subject-based">APS + specific subjects</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={labelStyle}>Minimum APS</label>
            <select value={form.minimum_aps} onChange={(e) => setForm({ ...form, minimum_aps: e.target.value })} style={inputStyle}>
              <option value="">Not specified</option>
              {APS_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#111111' }}>
            <input type="checkbox" checked={form.has_application_fee} onChange={(e) => setForm({ ...form, has_application_fee: e.target.checked })} />
            Has an application fee
          </label>
          {form.has_application_fee && (
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={labelStyle}>Fee Amount (R)</label>
              <input type="number" value={form.application_fee_amount} onChange={(e) => setForm({ ...form, application_fee_amount: e.target.value })} style={inputStyle} />
            </div>
          )}
        </div>

        <div style={{ border: '2px solid #FFEE00', borderRadius: '10px', padding: '14px', background: '#FFFBEB' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#111111' }}>Mode of Study & Duration</h4>
          <p style={{ fontSize: '12px', color: '#555555', margin: '0 0 10px 0' }}>
            Add every mode this course is offered in, with that mode's own duration.
          </p>

          {pendingModeDurations.length === 0 && (
            <p style={{ fontSize: '13px', color: '#888888', margin: '0 0 8px 0' }}>No modes added yet.</p>
          )}

          {pendingModeDurations.map((m, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '14px', color: '#111111' }}>
              <span>{MODES.find((x) => x.value === m.mode)?.label || m.mode}: {m.duration}</span>
              <button type="button" onClick={() => removePendingModeDuration(index)} style={{ background: 'none', border: 'none', color: '#a33', cursor: 'pointer' }}><X size={14} strokeWidth={2} /></button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <select value={newMode} onChange={(e) => setNewMode(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '140px' }}>
              {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={newDuration} onChange={(e) => setNewDuration(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '140px' }}>
              {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="button" onClick={addPendingModeDuration} className="btn-primary" style={{ padding: '8px 14px' }}><Plus size={16} strokeWidth={2} /></button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', minHeight: '100px' }} />
        </div>

        <div>
          <label style={labelStyle}>Official Source Link</label>
          <input type="url" placeholder="https://..." value={form.source_link} onChange={(e) => setForm({ ...form, source_link: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#111111' }}>Specific Subject Requirements</h4>
          <p style={{ fontSize: '12px', color: '#555555', margin: '0 0 10px 0' }}>
            Add every subject this course requires, with its exact minimum percentage.
          </p>

          {pendingSubjects.length === 0 && (
            <p style={{ fontSize: '13px', color: '#888888', margin: '0 0 8px 0' }}>No specific subjects added yet.</p>
          )}

          {pendingSubjects.map((s, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '14px', color: '#111111' }}>
              <span>{s.subject_name}: minimum {s.minimum_percentage}%</span>
              <button type="button" onClick={() => removePendingSubject(index)} style={{ background: 'none', border: 'none', color: '#a33', cursor: 'pointer' }}><X size={14} strokeWidth={2} /></button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <select value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} style={{ ...inputStyle, flex: 2, minWidth: '160px' }}>
              {CAPS_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={newSubjectPct} onChange={(e) => setNewSubjectPct(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '100px' }}>
              <option value="">Select %</option>
              {PERCENTAGE_OPTIONS.map((p) => <option key={p} value={p}>{p}%</option>)}
            </select>
            <button type="button" onClick={addPendingSubject} className="btn-primary" style={{ padding: '8px 14px' }}><Plus size={16} strokeWidth={2} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {editingId ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Course'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="back-button" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><X size={16} strokeWidth={2} /> Cancel</button>}
        </div>

        {message && <p style={{ fontSize: '13px', color: '#111111', margin: 0 }}>{message}</p>}
      </form>

      <h3 style={{ color: '#111111' }}>Existing Courses</h3>
      {loading ? <p style={{ color: '#111111' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {courses.map((course) => (
            <div key={course.course_id} style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: '#111111' }}>{course.name}</strong>
                <div style={{ fontSize: '13px', color: '#555555' }}>{course.institution?.name} · {course.qualification_type}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => startEdit(course)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', background: 'white', color: '#111111', cursor: 'pointer', fontSize: '13px' }}><Pencil size={14} strokeWidth={2} /> Edit</button>
                <button type="button" onClick={() => handleDelete(course)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a33', background: 'white', color: '#a33', cursor: 'pointer', fontSize: '13px' }}><Trash2 size={14} strokeWidth={2} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}