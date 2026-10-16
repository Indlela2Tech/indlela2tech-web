import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* ---------- Offline storage (IndexedDB) ---------- */

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('i2t-offline', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('responses');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const query = db.transaction('responses').objectStore('responses').get(key);
      query.onsuccess = () => resolve(query.result ?? null);
      query.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function idbSet(key, value) {
  try {
    const db = await openDb();
    await new Promise((resolve) => {
      const tx = db.transaction('responses', 'readwrite');
      tx.objectStore('responses').put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
      tx.onabort = resolve;
    });
  } catch (e) {
    /* storage unavailable: the site still works online */
  }
}

/* ---------- Network first, saved copy as fallback ---------- */

const NETWORK_TIMEOUT_MS = 6000;

function requestInfo(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  const method = String((init && init.method) || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
  let accept = '';
  try {
    accept = new Headers((init && init.headers) || (typeof input !== 'string' ? input.headers : undefined)).get('Accept') || '';
  } catch (e) {
    /* ignore */
  }
  return { url, method, key: url + '|' + accept };
}

async function offlineFirstFetch(input, init) {
  const { url, method, key } = requestInfo(input, init);

  // Only database reads are saved. Logins, uploads and writes pass straight through.
  if (method !== 'GET' || !url.includes('/rest/v1/')) return fetch(input, init);

  const fromStore = async () => {
    const saved = await idbGet(key);
    return saved === null ? null : new Response(saved, { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const offlineResponse = await fromStore();
    if (offlineResponse) return offlineResponse;
  }

  try {
    const response = await Promise.race([
      fetch(input, init),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT_MS)),
    ]);
    if (response.ok) {
      response.clone().text().then((body) => idbSet(key, body)).catch(() => {});
    }
    return response;
  } catch (err) {
    const fallback = await fromStore();
    if (fallback) return fallback;
    throw err;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: offlineFirstFetch },
});

/* ---------- Full lists, used to fill the site's offline data ---------- */

const COURSE_SNAPSHOT =
  '*, institution(*, campus(*)), subject_requirement(subject_name, minimum_percentage), course_mode_duration(mode, duration)';

async function getCourseSnapshot() {
  const { data, error } = await supabase.from('course').select(COURSE_SNAPSHOT);
  return error ? [] : data || [];
}

async function getInstitutionSnapshot() {
  const { data, error } = await supabase.from('institution').select('*, campus(*)');
  return error ? [] : data || [];
}

async function getCourseFromSnapshot(courseId) {
  const all = await getCourseSnapshot();
  const course = all.find((c) => String(c.course_id) === String(courseId));
  if (!course) return null;

  const copy = { ...course };
  const toRelated = (c) => ({
    course_id: c.course_id,
    name: c.name,
    qualification_type: c.qualification_type,
    institution_id: c.institution_id,
    institution: { name: c.institution ? c.institution.name : '' },
  });

  if (copy.related_course_ids && copy.related_course_ids.length > 0) {
    const ids = copy.related_course_ids.map(String);
    copy.related_courses = all.filter((c) => ids.includes(String(c.course_id))).map(toRelated);
  } else {
    copy.related_courses = all
      .filter(
        (c) =>
          String(c.course_id) !== String(courseId) &&
          (c.qualification_type === copy.qualification_type || c.institution_id === copy.institution_id)
      )
      .slice(0, 4)
      .map(toRelated);
  }
  return copy;
}

async function getInstitutionFromSnapshot(institutionId) {
  const institutions = await getInstitutionSnapshot();
  const institution = institutions.find((i) => String(i.institution_id) === String(institutionId));
  if (!institution) return null;

  const courses = await getCourseSnapshot();
  return {
    ...institution,
    courses: courses
      .filter((c) => String(c.institution_id) === String(institutionId))
      .map((c) => ({
        course_id: c.course_id,
        name: c.name,
        qualification_type: c.qualification_type,
        nqf_level: c.nqf_level,
        has_application_fee: c.has_application_fee,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
  };
}

/* ---------- Public helpers used by the pages ---------- */

export async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from('course')
    .select('*, institution(name, province, type, image_url, application_open_month, application_close_month, application_portal_link, campus(*)), subject_requirement(subject_name, minimum_percentage), course_mode_duration(mode, duration)')
    .eq('course_id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return await getCourseFromSnapshot(courseId);
  }

  if (data.related_course_ids && data.related_course_ids.length > 0) {
    const { data: relatedCourses } = await supabase
      .from('course')
      .select('course_id, name, institution(name)')
      .in('course_id', data.related_course_ids);
    data.related_courses = relatedCourses || [];
  } else {
    const { data: candidates, error: candidatesErr } = await supabase
      .from('course')
      .select('course_id, name, qualification_type, institution_id, institution(name)')
      .neq('course_id', courseId);

    if (candidatesErr) {
      console.error('Error fetching auto-related courses:', candidatesErr);
      data.related_courses = [];
    } else {
      const matches = (candidates || []).filter((c) => c.qualification_type === data.qualification_type || c.institution_id === data.institution_id);
      data.related_courses = matches.slice(0, 4);
    }
  }

  return data;
}

export async function getInstitutionWithCourses(institutionId) {
  const { data: institution, error: instError } = await supabase
    .from('institution')
    .select('*, campus(*)')
    .eq('institution_id', institutionId)
    .single();

  if (instError) {
    console.error('Error fetching institution:', instError);
    return await getInstitutionFromSnapshot(institutionId);
  }

  const { data: courses, error: courseError } = await supabase
    .from('course')
    .select('course_id, name, qualification_type, nqf_level, has_application_fee')
    .eq('institution_id', institutionId)
    .order('name');

  if (courseError) {
    console.error('Error fetching institution courses:', courseError);
  }

  institution.courses = courses || [];
  return institution;
}

/* ---------- Background download so everything works offline ---------- */

// These repeat the pages' own queries so each page finds its data saved.
// If a page's query changes later, that page still saves itself when opened online.
const WARM_QUERIES = [
  () => supabase.from('course').select('*, institution(name, province, type, campus(*)), subject_requirement(subject_name, minimum_percentage), course_mode_duration(mode, duration)'),
  () => supabase.from('course').select('*, institution(name, province), subject_requirement(subject_name, minimum_percentage)'),
  () => supabase.from('institution').select('*, campus(*), course(course_id)').order('name'),
  () => supabase.from('course').select('course_id, name, qualification_type, institution_id, mode, nqf_level, institution(name)'),
  () => supabase.from('course').select(COURSE_SNAPSHOT),
  () => supabase.from('institution').select('*, campus(*)'),
];

const WARM_KEY = 'i2t-last-warm';
const WARM_EVERY_MS = 12 * 60 * 60 * 1000;

export function warmOfflineData() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    if (navigator.connection && navigator.connection.saveData) return;
    const last = Number(localStorage.getItem(WARM_KEY) || 0);
    if (Date.now() - last < WARM_EVERY_MS) return;
    localStorage.setItem(WARM_KEY, String(Date.now()));
  } catch (e) {
    /* storage blocked: skip the throttle and carry on */
  }
  Promise.allSettled(WARM_QUERIES.map((run) => run())).catch(() => {});
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    setTimeout(warmOfflineData, 1500);
  } else {
    window.addEventListener('load', () => setTimeout(warmOfflineData, 1500));
  }
}