import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShortlist } from './useShortlist';
import { Scale } from 'lucide-react';

export default function ShortlistPage() {
  const { shortlist, removeFromShortlist, clearShortlist } = useShortlist();
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  function toggleSelect(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function handleCompare() {
    if (selected.length === 2) {
      navigate('/compare/' + selected[0] + '/' + selected[1]);
    }
  }

  if (shortlist.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#111111' }}>Your shortlist is empty</h2>
        <p style={{ color: '#555555' }}>
          Browse institutions and tap "Shortlist" to save the ones you're interested in.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '22px', margin: 0, color: '#111111' }}>
          Your Shortlist ({shortlist.length})
        </h2>
        <button type="button" onClick={clearShortlist} style={{ background: 'none', border: 'none', color: '#a33', cursor: 'pointer', fontSize: '14px' }}>
          Clear all
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#555555', marginBottom: '14px' }}>
        Select two courses below to compare them side by side.
      </p>

      {selected.length === 2 && (
        <button type="button" onClick={handleCompare} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Scale size={16} strokeWidth={2} /> Compare Selected
        </button>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {shortlist.map((institution) => (
          <li key={institution.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid #e5e5e5', borderRadius: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(institution.id)} onChange={() => toggleSelect(institution.id)} />
              <div>
                <div style={{ fontWeight: 600, color: '#111111' }}>{institution.name}</div>
                {institution.location && <div style={{ fontSize: '13px', color: '#777777' }}>{institution.location}</div>}
              </div>
            </label>
            <button
              type="button"
              onClick={() => removeFromShortlist(institution.id)}
              aria-label={'Remove ' + institution.name + ' from shortlist'}
              style={{ background: 'none', border: '1px solid #d0d0d0', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', color: '#111111' }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}