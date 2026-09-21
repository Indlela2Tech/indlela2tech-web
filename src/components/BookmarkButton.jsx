import React from 'react';
import { useShortlist } from './useShortlist';

export default function BookmarkButton({ institution }) {
  const { isShortlisted, toggleShortlist } = useShortlist();
  const bookmarked = isShortlisted(institution.id);

  return (
    <button
      type="button"
      onClick={() => toggleShortlist(institution)}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove ' + institution.name + ' from shortlist' : 'Add ' + institution.name + ' to shortlist'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: bookmarked ? '1px solid #2f6f4f' : '1px solid #d0d0d0',
        background: bookmarked ? '#eaf6ef' : '#ffffff',
        color: bookmarked ? '#2f6f4f' : '#111111',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
      {bookmarked ? 'Shortlisted' : 'Shortlist'}
    </button>
  );
}