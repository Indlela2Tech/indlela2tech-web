import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, Plus, Pencil, Trash2, X, Check, MapPin, Upload, Image as ImageIcon } from 'lucide-react';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EMPTY_FORM = { name: '', type: 'university', province: PROVINCES[0], application_open_month: '', application_close_month: '', application_portal_link: '', image_url: '' };

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1px solid #d0d0d0', color: '#111111', background: '#ffffff' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#111111' };

export default function ManageInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [newCampusName, setNewCampusName] = useState('');
  const [uploading, setUploading] = useState(false);

  async function fetchInstitutions() {
    setLoading(true);
    const { data, error } = await supabase.from('institution').select('*, campus(*)').order('name');
    if (error) {
      console.error('Error fetching institutions:', error);
    } else {
      setInstitutions(data);
    }
    setLoading(false);
  }

  useEffect(() => { fetchInstitutions(); }, []);

  function startEdit(inst) {
    setMessage('');
    setEditingId(inst.institution_id);
    setForm({
      name: inst.name || '',
      type: inst.type || 'university',
      province: inst.province || PROVINCES[0],
      application_open_month: inst.application_open_month || '',
      application_close_month: inst.application_close_month || '',
      application_portal_link: inst.application_portal_link || '',
      image_url: inst.image_url || '',
    });
    setCampuses(inst.campus || []);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCampuses([]);
    setNewCampusName('');
    setMessage('');
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    const fileExt = file.name.split('.').pop();
    const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + fileExt;
    const { error: uploadError } = await supabase.storage.from('course-images').upload(fileName, file);
    if (uploadError) {
      setMessage('Upload error: ' + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('course-images').getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    setMessage('Image uploaded. Now click "Save Changes" below to attach it to this institution.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    const payload = {
      name: form.name,
      type: form.type,
      province: form.province,
      application_open_month: form.application_open_month || null,
      application_close_month: form.application_close_month || null,
      application_portal_link: form.application_portal_link || null,
      image_url: form.image_url || null,
    };

    console.log('Saving institution with payload:', payload);

    if (editingId) {
      const { data, error } = await supabase
        .from('institution')
        .update(payload)
        .eq('institution_id', editingId)
        .select();

      if (error) {
        setMessage('Error saving: ' + error.message);
        console.error('Update error:', error);
        return;
      }

      if (!data || data.length === 0) {
        setMessage('Warning: the update ran with no error, but no row was changed. This usually means a permissions (RLS) rule is silently blocking it. Try logging out and back in, then retry.');
        console.warn('Update returned zero rows for institution_id:', editingId);
        return;
      }

      setMessage('Institution updated. Saved image_url: ' + (data[0].image_url || '(none)'));
    } else {
      const { data, error } = await supabase.from('institution').insert([payload]).select();
      if (error) {
        setMessage('Error saving: ' + error.message);
        console.error('Insert error:', error);
        return;
      }
      setMessage('Institution added.');
    }

    cancelEdit();
    fetchInstitutions();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this institution? This cannot be undone.')) return;
    const { error } = await supabase.from('institution').delete().eq('institution_id', id);
    if (error) {
      setMessage('Error: ' + error.message);
      return;
    }
    setMessage('Institution deleted.');
    fetchInstitutions();
  }

  async function addCampus() {
    if (!newCampusName || !editingId) return;
    const { error } = await supabase.from('campus').insert([{ institution_id: editingId, name: newCampusName }]);
    if (error) { setMessage('Error: ' + error.message); return; }
    setNewCampusName('');
    const { data } = await supabase.from('campus').select('*').eq('institution_id', editingId);
    setCampuses(data || []);
    fetchInstitutions();
  }

  async function removeCampus(campusId) {
    const { error } = await supabase.from('campus').delete().eq('campus_id', campusId);
    if (error) { setMessage('Error: ' + error.message); return; }
    setCampuses((prev) => prev.filter((c) => c.campus_id !== campusId));
    fetchInstitutions();
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111' }}><Building2 size={22} strokeWidth={2} /> Manage Institutions</h2>

      <form onSubmit={handleSubmit} style={{ border: '2px solid #111111', borderTop: '6px solid #FFEE00', borderRadius: '14px', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#111111' }}>{editingId ? 'Edit Institution' : 'Add New Institution'}</h3>

        <div>
          <label style={labelStyle}>Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="university">University</option>
              <option value="tvet">TVET College</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={labelStyle}>Province</label>
            <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} style={inputStyle}>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={labelStyle}>Applications Open</label>
            <select value={form.application_open_month} onChange={(e) => setForm({ ...form, application_open_month: e.target.value })} style={inputStyle}>
              {MONTHS.map((m) => <option key={m} value={m}>{m || 'Not set'}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={labelStyle}>Applications Close</label>
            <select value={form.application_close_month} onChange={(e) => setForm({ ...form, application_close_month: e.target.value })} style={inputStyle}>
              {MONTHS.map((m) => <option key={m} value={m}>{m || 'Not set'}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Application Portal Link</label>
          <input type="url" placeholder="https://..." value={form.application_portal_link} onChange={(e) => setForm({ ...form, application_portal_link: e.target.value })} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Institution Image</label>
          {form.image_url ? (
            <div style={{ marginBottom: '10px' }}>
              <img src={form.image_url} alt="Preview" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d0d0d0' }} />
              <p style={{ fontSize: '11px', color: '#888888', wordBreak: 'break-all', marginTop: '4px' }}>{form.image_url}</p>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '8px' }}>No image set for this institution yet.</p>
          )}
          <label htmlFor="institution-image-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '2px dashed #d0d0d0', cursor: 'pointer', fontSize: '14px', color: '#111111' }}>
            {uploading ? 'Uploading…' : form.image_url ? <><ImageIcon size={16} strokeWidth={2} /> Replace image</> : <><Upload size={16} strokeWidth={2} /> Upload an image</>}
          </label>
          <input id="institution-image-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
        </div>

        {editingId && (
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111111' }}><MapPin size={16} strokeWidth={2} /> Campuses</h4>
            {campuses.map((c) => (
              <div key={c.campus_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '14px', color: '#111111' }}>
                <span>{c.name}</span>
                <button type="button" onClick={() => removeCampus(c.campus_id)} style={{ background: 'none', border: 'none', color: '#a33', cursor: 'pointer' }}><X size={14} strokeWidth={2} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input type="text" placeholder="Campus name" value={newCampusName} onChange={(e) => setNewCampusName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={addCampus} className="btn-primary" style={{ padding: '8px 14px' }}><Plus size={16} strokeWidth={2} /></button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {editingId ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />} {editingId ? 'Save Changes' : 'Add Institution'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="back-button" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><X size={16} strokeWidth={2} /> Cancel</button>}
        </div>

        {message && <p style={{ fontSize: '13px', color: '#111111', margin: 0 }}>{message}</p>}
      </form>

      <h3 style={{ color: '#111111' }}>Existing Institutions</h3>
      {loading ? <p style={{ color: '#111111' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {institutions.map((inst) => (
            <div key={inst.institution_id} style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {inst.image_url && <img src={inst.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />}
                <div>
                  <strong style={{ color: '#111111' }}>{inst.name}</strong>
                  <div style={{ fontSize: '13px', color: '#555555' }}>
                    {inst.type === 'university' ? 'University' : 'TVET College'} · {inst.province}
                    {inst.campus && inst.campus.length > 0 ? ' · ' + inst.campus.length + ' campus' + (inst.campus.length > 1 ? 'es' : '') : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => startEdit(inst)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d0d0d0', background: 'white', color: '#111111', cursor: 'pointer', fontSize: '13px' }}><Pencil size={14} strokeWidth={2} /> Edit</button>
                <button type="button" onClick={() => handleDelete(inst.institution_id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a33', background: 'white', color: '#a33', cursor: 'pointer', fontSize: '13px' }}><Trash2 size={14} strokeWidth={2} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}