import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const DEDUPE_KEY = 'viewed_today';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function alreadyViewedToday(dedupeId) {
  try {
    const raw = sessionStorage.getItem(DEDUPE_KEY);
    const seen = raw ? JSON.parse(raw) : {};
    return seen[dedupeId] === todayString();
  } catch {
    return false;
  }
}

function markViewedToday(dedupeId) {
  try {
    const raw = sessionStorage.getItem(DEDUPE_KEY);
    const seen = raw ? JSON.parse(raw) : {};
    seen[dedupeId] = todayString();
    sessionStorage.setItem(DEDUPE_KEY, JSON.stringify(seen));
  } catch (err) {
    console.error('Could not record view de-duplication:', err);
  }
}

export function useTrackCourseView(courseId, province) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!courseId || hasTracked.current) return;

    const dedupeId = courseId + '__' + (province || 'unknown');
    if (alreadyViewedToday(dedupeId)) return;

    hasTracked.current = true;
    markViewedToday(dedupeId);

    supabase.from('course_view').insert([{ course_id: courseId, province: province || null }]).then(({ error }) => {
      if (error) console.error('Could not log course view:', error);
    });
  }, [courseId, province]);
}