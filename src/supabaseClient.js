import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from('course')
    .select('*, institution(name, province, type, image_url, application_open_month, application_close_month, application_portal_link, campus(*)), subject_requirement(subject_name, minimum_percentage), course_mode_duration(mode, duration)')
    .eq('course_id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
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
    return null;
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