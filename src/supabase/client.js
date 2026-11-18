import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'YOUR_SUPABASE_URL' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    supabaseUrl.startsWith('http')
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key'
);

// Clean Production Initial State for Handover
const INITIAL_MOCK_DATA = {
  profiles: [
    {
      id: 'prof-admin-1',
      user_id: 'u-admin-1',
      full_name: 'Dr. Samuel Adebayo',
      role: 'admin',
      admin_title: 'School Principal & System Admin',
      phone: '+1-555-0100',
      email: 'admin@school.com',
      student_id: '000000',
      status: 'approved',
      is_active: true
    }
  ],
  school_settings: {
    id: 'school-1',
    school_name: 'Noble Kings Academy',
    school_code: 'NKA001',
    school_address: '123 Education Boulevard, Knowledge City',
    school_phone: '+1-555-0199',
    school_email: 'info@noblekingsacademy.edu',
    principal_name: 'Dr. Samuel Adebayo',
    academic_year: '2024-2025'
  },
  academic_sessions: [
    {
      id: 'session-1',
      session_name: '2024-2025',
      start_date: '2024-09-01',
      end_date: '2025-07-31',
      term: 'Third Term',
      active_term: 'Third Term',
      is_current: true
    }
  ],
  terms: [
    { id: 't-1', session_id: 'session-1', term_name: 'First Term', term_number: 1, is_current: false },
    { id: 't-2', session_id: 'session-1', term_name: 'Second Term', term_number: 2, is_current: false },
    { id: 't-3', session_id: 'session-1', term_name: 'Third Term', term_number: 3, is_current: true }
  ],
  classes: [
    { id: 'c-0a', class_name: 'Creche', class_code: 'CRH', class_level: 'Early Years', capacity: 25, current_enrollment: 0 },
    { id: 'c-0b', class_name: 'Nursery 1', class_code: 'NUR1', class_level: 'Early Years', capacity: 30, current_enrollment: 0 },
    { id: 'c-0c', class_name: 'Nursery 2', class_code: 'NUR2', class_level: 'Early Years', capacity: 30, current_enrollment: 0 },
    { id: 'c-0d', class_name: 'Kindergarten', class_code: 'KG', class_level: 'Early Years', capacity: 30, current_enrollment: 0 },
    { id: 'c-1', class_name: 'Primary 1', class_code: 'PRM1', class_level: 'Primary', capacity: 35, current_enrollment: 0 },
    { id: 'c-2', class_name: 'Primary 2', class_code: 'PRM2', class_level: 'Primary', capacity: 35, current_enrollment: 0 },
    { id: 'c-3', class_name: 'Primary 3', class_code: 'PRM3', class_level: 'Primary', capacity: 35, current_enrollment: 0 },
    { id: 'c-4', class_name: 'Primary 4', class_code: 'PRM4', class_level: 'Primary', capacity: 35, current_enrollment: 0 },
    { id: 'c-5', class_name: 'Primary 5', class_code: 'PRM5', class_level: 'Primary', capacity: 35, current_enrollment: 0 },
    { id: 'c-6', class_name: 'JSS 1', class_code: 'JSS1', class_level: 'Junior Secondary', capacity: 40, current_enrollment: 0 },
    { id: 'c-7', class_name: 'JSS 2', class_code: 'JSS2', class_level: 'Junior Secondary', capacity: 40, current_enrollment: 0 },
    { id: 'c-8', class_name: 'JSS 3', class_code: 'JSS3', class_level: 'Junior Secondary', capacity: 40, current_enrollment: 0 },
    { id: 'c-9', class_name: 'SSS 1', class_code: 'SSS1', class_level: 'Senior Secondary', capacity: 40, current_enrollment: 0 },
    { id: 'c-10', class_name: 'SSS 2', class_code: 'SSS2', class_level: 'Senior Secondary', capacity: 40, current_enrollment: 0 },
    { id: 'c-11', class_name: 'SSS 3', class_code: 'SSS3', class_level: 'Senior Secondary', capacity: 40, current_enrollment: 0 }
  ],
  subjects: [
    { id: 's-1', subject_name: 'Mathematics', subject_code: 'MATH', is_core_subject: true, description: 'Core Mathematics & Arithmetic' },
    { id: 's-2', subject_name: 'English Language', subject_code: 'ENG', is_core_subject: true, description: 'Grammar, Reading & Composition' },
    { id: 's-3', subject_name: 'General Science', subject_code: 'SCI', is_core_subject: true, description: 'Nature, Physics & Science' },
    { id: 's-4', subject_name: 'Social Studies', subject_code: 'SOC', is_core_subject: false, description: 'Civic Education & Culture' },
    { id: 's-5', subject_name: 'Computer Studies', subject_code: 'ICT', is_core_subject: false, description: 'Technology & Computing' }
  ],
  teachers: [],
  students: [],
  announcements: [],
  curriculum: [],
  results: []
};

// Local storage loader helper (migrates or resets legacy demo data to fresh handover state)
const loadMockData = () => {
  const saved = localStorage.getItem('sms_mock_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const hasDemoData =
        parsed.students?.some(s => s.student_id === '849201' || s.full_name === 'Jane Smith') ||
        parsed.teachers?.some(t => t.employee_id === '200001' || t.full_name === 'Dr. John Doe');

      if (!hasDemoData) {
        if (parsed.profiles) {
          parsed.profiles.forEach(p => {
            if (!p.status) p.status = p.is_active === false ? 'disabled' : 'approved';
          });
        }
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  localStorage.setItem('sms_mock_data', JSON.stringify(INITIAL_MOCK_DATA));
  return INITIAL_MOCK_DATA;
};

const saveMockData = (data) => {
  localStorage.setItem('sms_mock_data', JSON.stringify(data));
};

export const db = {
  isConfigured: isSupabaseConfigured,

  // Curriculum Management (Teacher submit -> Admin approve -> Student view by grade)
  getCurriculumForGrade: async (gradeLevel) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('curriculum')
          .select('*')
          .ilike('grade_level', gradeLevel)
          .eq('status', 'approved')
          .order('week_number', { ascending: true });
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getCurriculumForGrade error:', err);
      }
    }
    const currentMock = loadMockData();
    // STRICT: Students can ONLY view curriculum where status === 'approved'
    const approved = (currentMock.curriculum || []).filter(
      (c) => c.grade_level?.toLowerCase() === gradeLevel?.toLowerCase() && c.status === 'approved'
    );
    return { data: approved, error: null };
  },

  getAllCurriculum: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('curriculum')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getAllCurriculum error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.curriculum || [], error: null };
  },

  submitCurriculum: async (currData) => {
    const itemToSubmit = {
      ...currData,
      status: 'pending' // STRICT: All teacher curriculum submissions start in 'pending' status
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('curriculum')
          .insert(itemToSubmit)
          .select()
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase submitCurriculum error:', err);
      }
    }
    const currentMock = loadMockData();
    const newCurr = {
      id: 'curr-' + Date.now(),
      ...itemToSubmit
    };
    currentMock.curriculum.unshift(newCurr);
    saveMockData(currentMock);
    return { data: newCurr, error: null };
  },

  approveCurriculum: async (currId, feedback = 'Approved by administrator') => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('curriculum')
          .update({ status: 'approved', feedback })
          .eq('id', currId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase approveCurriculum error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.curriculum = currentMock.curriculum.map((c) =>
      c.id === currId ? { ...c, status: 'approved', feedback: feedback || c.feedback } : c
    );
    saveMockData(currentMock);
    return { error: null };
  },

  updateCurriculum: async (currData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('curriculum')
          .update(currData)
          .eq('id', currData.id)
          .select()
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase updateCurriculum error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.curriculum = currentMock.curriculum.map((c) =>
      c.id === currData.id ? { ...c, ...currData } : c
    );
    saveMockData(currentMock);
    return { data: currData, error: null };
  },

  publishClassCurriculum: async (gradeLevel) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('curriculum')
          .update({ status: 'approved' })
          .ilike('grade_level', gradeLevel);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase publishClassCurriculum error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.curriculum = currentMock.curriculum.map((c) =>
      c.grade_level?.toLowerCase() === gradeLevel?.toLowerCase() ? { ...c, status: 'approved' } : c
    );
    saveMockData(currentMock);
    return { error: null };
  },

  // Teachers for Grade
  getTeachersForGrade: async (gradeLevel) => {
    const currentMock = loadMockData();
    const matching = (currentMock.teachers || []).filter(
      (t) => !t.assigned_grades || t.assigned_grades.length === 0 || t.assigned_grades.includes(gradeLevel)
    );
    return { data: matching, error: null };
  },

  // Results Management
  getResultsForStudent: async (studentId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('results')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'approved'); // STRICT: Students can ONLY view results once approved
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getResultsForStudent error:', err);
      }
    }
    const currentMock = loadMockData();
    // STRICT: Students only see results that have status === 'approved'
    const approved = (currentMock.results || []).filter(
      (r) => r.student_id === studentId && r.status === 'approved'
    );
    return { data: approved, error: null };
  },

  getAllResults: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('results')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getAllResults error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.results || [], error: null };
  },

  submitResult: async (resultData) => {
    const itemToSubmit = {
      ...resultData,
      status: 'pending' // STRICT: All teacher result submissions start in 'pending' status
    };
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('results')
          .insert(itemToSubmit)
          .select()
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase submitResult error:', err);
      }
    }
    const currentMock = loadMockData();
    const newResult = {
      id: 'res-' + Date.now(),
      ...itemToSubmit
    };
    currentMock.results.unshift(newResult);
    saveMockData(currentMock);
    return { data: newResult, error: null };
  },

  approveResult: async (resultId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('results')
          .update({ status: 'approved' })
          .eq('id', resultId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase approveResult error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.results = currentMock.results.map((r) =>
      r.id === resultId ? { ...r, status: 'approved' } : r
    );
    saveMockData(currentMock);
    return { error: null };
  },

  approveStudent: async (studentId) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({ status: 'approved', is_active: true })
          .or(`id.eq.${studentId},student_id.eq.${studentId}`);
      } catch (err) {
        console.warn('Supabase approveStudent error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.students = currentMock.students.map((s) =>
      s.id === studentId || s.student_id === studentId ? { ...s, status: 'approved', is_active: true } : s
    );
    currentMock.profiles = currentMock.profiles.map((p) =>
      p.id === studentId || p.student_id === studentId || p.user_id === studentId ? { ...p, status: 'approved', is_active: true } : p
    );
    saveMockData(currentMock);
    return { error: null };
  },

  toggleStudentStatus: async (studentId) => {
    const currentMock = loadMockData();
    currentMock.students = currentMock.students.map((s) => {
      if (s.id === studentId || s.student_id === studentId) {
        const nextStatus = s.status === 'disabled' ? 'approved' : 'disabled';
        return { ...s, status: nextStatus, is_active: nextStatus === 'approved' };
      }
      return s;
    });
    currentMock.profiles = currentMock.profiles.map((p) => {
      if (p.id === studentId || p.student_id === studentId || p.user_id === studentId) {
        const nextStatus = p.status === 'disabled' ? 'approved' : 'disabled';
        return { ...p, status: nextStatus, is_active: nextStatus === 'approved' };
      }
      return p;
    });
    saveMockData(currentMock);
    return { error: null };
  },

  approveTeacher: async (teacherId) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('teachers')
          .update({ status: 'approved', is_active: true })
          .or(`id.eq.${teacherId},employee_id.eq.${teacherId}`);
      } catch (err) {
        console.warn('Supabase approveTeacher error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.teachers = currentMock.teachers.map((t) =>
      t.id === teacherId || t.employee_id === teacherId ? { ...t, status: 'approved', is_active: true } : t
    );
    currentMock.profiles = currentMock.profiles.map((p) =>
      p.id === teacherId || p.student_id === teacherId || p.user_id === teacherId ? { ...p, status: 'approved', is_active: true } : p
    );
    saveMockData(currentMock);
    return { error: null };
  },

  toggleTeacherStatus: async (teacherId) => {
    const currentMock = loadMockData();
    currentMock.teachers = currentMock.teachers.map((t) => {
      if (t.id === teacherId || t.employee_id === teacherId) {
        const nextStatus = t.status === 'disabled' ? 'approved' : 'disabled';
        return { ...t, status: nextStatus, is_active: nextStatus === 'approved' };
      }
      return t;
    });
    currentMock.profiles = currentMock.profiles.map((p) => {
      if (p.id === teacherId || p.student_id === teacherId || p.user_id === teacherId) {
        const nextStatus = p.status === 'disabled' ? 'approved' : 'disabled';
        return { ...p, status: nextStatus, is_active: nextStatus === 'approved' };
      }
      return p;
    });
    saveMockData(currentMock);
    return { error: null };
  },

  isUserApproved: async (userId, role) => {
    if (!userId || role === 'admin') return true;

    if (isSupabaseConfigured()) {
      try {
        if (role === 'student') {
          const { data } = await supabase.from('students').select('status, is_active').eq('user_id', userId).single();
          return data?.status === 'approved' && data?.is_active === true;
        } else if (role === 'teacher') {
          const { data } = await supabase.from('teachers').select('status, is_active').eq('user_id', userId).single();
          return data?.status === 'approved' && data?.is_active === true;
        }
      } catch (err) {
        console.warn('Supabase isUserApproved error:', err);
      }
    }

    const currentMock = loadMockData();
    if (role === 'student') {
      const student = currentMock.students.find((s) => s.user_id === userId || s.id === userId || s.student_id === userId);
      return student ? student.status === 'approved' && student.is_active !== false : false;
    } else if (role === 'teacher') {
      const teacher = currentMock.teachers.find((t) => t.user_id === userId || t.id === userId || t.employee_id === userId);
      return teacher ? teacher.status === 'approved' && teacher.is_active !== false : false;
    }
    const profile = currentMock.profiles.find((p) => p.user_id === userId || p.id === userId || p.student_id === userId);
    return profile ? profile.status === 'approved' && profile.is_active !== false : false;
  },

  toggleResultStatus: async (resultId, newStatus) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('results')
          .update({ status: newStatus })
          .eq('id', resultId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase toggleResultStatus error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.results = currentMock.results.map((r) =>
      r.id === resultId ? { ...r, status: newStatus } : r
    );
    saveMockData(currentMock);
    return { error: null };
  },

  rejectResult: async (resultId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('results')
          .update({ status: 'rejected' })
          .eq('id', resultId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase rejectResult error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.results = currentMock.results.map((r) =>
      r.id === resultId ? { ...r, status: 'rejected' } : r
    );
    saveMockData(currentMock);
    return { error: null };
  },

  // User Role Helper
  getUserRole: async (userId) => {
    if (!userId) return null;

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single();
        if (data?.role) return data.role;
      } catch (err) {
        console.warn('Supabase getUserRole error:', err);
      }
    }

    const currentMock = loadMockData();
    const profile = currentMock.profiles.find((p) => p.user_id === userId || p.id === userId || p.student_id === userId);
    if (profile?.role) return profile.role;

    const mockSessionStr = localStorage.getItem('sms_mock_session');
    if (mockSessionStr) {
      try {
        const session = JSON.parse(mockSessionStr);
        if (session?.profile?.role) return session.profile.role;
      } catch {
        // ignore
      }
    }

    return 'student';
  },

  // Profiles
  getProfile: async (userId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase profile error:', err);
      }
    }

    const currentMock = loadMockData();
    const profile = currentMock.profiles.find((p) => p.user_id === userId || p.id === userId || p.student_id === userId);
    if (profile) return { data: profile, error: null };

    const mockSessionStr = localStorage.getItem('sms_mock_session');
    if (mockSessionStr) {
      try {
        const mockSession = JSON.parse(mockSessionStr);
        if (mockSession.profile) {
          return { data: mockSession.profile, error: null };
        }
      } catch {
        // ignore
      }
    }

    return { data: null, error: { message: 'Profile not found' } };
  },

  createProfile: async (profile) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert(profile)
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createProfile error:', err);
      }
    }

    const currentMock = loadMockData();
    const newProfile = { id: 'prof-' + Date.now(), ...profile };
    currentMock.profiles.push(newProfile);
    saveMockData(currentMock);
    return { data: newProfile, error: null };
  },

  updateProfile: async (userId, updates) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase updateProfile error:', err);
      }
    }

    const currentMock = loadMockData();
    currentMock.profiles = currentMock.profiles.map((p) =>
      p.user_id === userId || p.id === userId ? { ...p, ...updates } : p
    );
    saveMockData(currentMock);
    const updated = currentMock.profiles.find((p) => p.user_id === userId || p.id === userId);
    return { data: updated, error: null };
  },

  // School Settings
  getSchoolSettings: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('school_settings').select('*').single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getSchoolSettings error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.school_settings, error: null };
  },

  updateSchoolSettings: async (updates) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .update(updates)
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase updateSchoolSettings error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.school_settings = { ...currentMock.school_settings, ...updates };
    saveMockData(currentMock);
    return { data: currentMock.school_settings, error: null };
  },

  // Academic Sessions & Terms
  getAcademicSessions: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('academic_sessions')
          .select('*')
          .order('start_date', { ascending: false });
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getAcademicSessions error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.academic_sessions, error: null };
  },

  getCurrentSession: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('academic_sessions')
          .select('*')
          .eq('is_current', true)
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getCurrentSession error:', err);
      }
    }
    const currentMock = loadMockData();
    const current = currentMock.academic_sessions.find((s) => s.is_current) || currentMock.academic_sessions[0];
    return { data: current, error: null };
  },

  createAcademicSession: async (sessionData) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('academic_sessions').update({ is_current: false }).neq('id', '0');
        const { data, error } = await supabase
          .from('academic_sessions')
          .insert({ ...sessionData, is_current: true })
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createAcademicSession error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.academic_sessions = currentMock.academic_sessions.map((s) => ({ ...s, is_current: false }));
    const newSession = {
      id: 'session-' + Date.now(),
      is_current: true,
      active_term: sessionData.term || 'First Term',
      term: sessionData.term || 'First Term',
      ...sessionData
    };
    currentMock.academic_sessions.unshift(newSession);
    saveMockData(currentMock);
    return { data: newSession, error: null };
  },

  setActiveSession: async (sessionId) => {
    const currentMock = loadMockData();
    currentMock.academic_sessions = currentMock.academic_sessions.map((s) => ({
      ...s,
      is_current: s.id === sessionId
    }));
    saveMockData(currentMock);
    return { error: null };
  },

  setActiveTerm: async (sessionId, termName) => {
    const currentMock = loadMockData();
    currentMock.academic_sessions = currentMock.academic_sessions.map((s) => {
      if (s.id === sessionId || s.is_current) {
        return { ...s, active_term: termName, term: termName };
      }
      return s;
    });
    saveMockData(currentMock);
    return { error: null };
  },

  deleteAcademicSession: async (sessionId) => {
    const currentMock = loadMockData();
    currentMock.academic_sessions = currentMock.academic_sessions.filter((s) => s.id !== sessionId);
    saveMockData(currentMock);
    return { error: null };
  },

  // Classes
  getClasses: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('classes').select('*').order('class_name');
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getClasses error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.classes, error: null };
  },

  createClass: async (classData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('classes').insert(classData).select().single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createClass error:', err);
      }
    }
    const currentMock = loadMockData();
    const newClass = { id: 'c-' + Date.now(), current_enrollment: 0, capacity: 40, ...classData };
    currentMock.classes.push(newClass);
    saveMockData(currentMock);
    return { data: newClass, error: null };
  },

  updateClass: async (classId, updates) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .update(updates)
          .eq('id', classId)
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase updateClass error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.classes = currentMock.classes.map((c) => (c.id === classId ? { ...c, ...updates } : c));
    saveMockData(currentMock);
    return { data: currentMock.classes.find((c) => c.id === classId), error: null };
  },

  deleteClass: async (classId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', classId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteClass error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.classes = currentMock.classes.filter((c) => c.id !== classId);
    saveMockData(currentMock);
    return { error: null };
  },

  // Subjects
  getSubjects: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('subjects').select('*').order('subject_name');
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getSubjects error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.subjects, error: null };
  },

  createSubject: async (subjectData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('subjects').insert(subjectData).select().single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createSubject error:', err);
      }
    }
    const currentMock = loadMockData();
    const newSub = { id: 's-' + Date.now(), ...subjectData };
    currentMock.subjects.push(newSub);
    saveMockData(currentMock);
    return { data: newSub, error: null };
  },

  updateSubject: async (subjectId, updates) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .update(updates)
          .eq('id', subjectId)
          .select()
          .single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase updateSubject error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.subjects = currentMock.subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s));
    saveMockData(currentMock);
    return { data: currentMock.subjects.find((s) => s.id === subjectId), error: null };
  },

  deleteSubject: async (subjectId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteSubject error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.subjects = currentMock.subjects.filter((s) => s.id !== subjectId);
    saveMockData(currentMock);
    return { error: null };
  },

  // Teachers
  getTeachers: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            *,
            profiles (
              full_name,
              email,
              phone,
              profile_image_url
            )
          `)
          .eq('is_active', true)
          .order('employee_id');
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getTeachers error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.teachers, error: null };
  },

  getTeacherByUserId: async (userId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getTeacherByUserId error:', err);
      }
    }
    const currentMock = loadMockData();
    const teacher = currentMock.teachers.find((t) => t.user_id === userId || t.id === userId || t.employee_id === userId);
    return { data: teacher || null, error: null };
  },

  createTeacher: async (teacherData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('teachers').insert(teacherData).select().single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createTeacher error:', err);
      }
    }
    const currentMock = loadMockData();
    const newTeacher = {
      id: 'tch-' + Date.now(),
      employee_id: Math.floor(100000 + Math.random() * 900000).toString(),
      assigned_grades: ['Primary 1', 'JSS 1'],
      is_active: true,
      ...teacherData
    };
    currentMock.teachers.push(newTeacher);
    saveMockData(currentMock);
    return { data: newTeacher, error: null };
  },

  assignClassToTeacher: async (teacherId, assignedClasses) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('teachers')
          .update({ assigned_grades: assignedClasses })
          .eq('id', teacherId)
          .select()
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase assignClassToTeacher error:', err);
      }
    }
    const currentMock = loadMockData();
    const teacherIndex = currentMock.teachers.findIndex((t) => t.id === teacherId || t.employee_id === teacherId);
    if (teacherIndex !== -1) {
      currentMock.teachers[teacherIndex].assigned_grades = assignedClasses;
      saveMockData(currentMock);
      return { data: currentMock.teachers[teacherIndex], error: null };
    }
    return { data: null, error: { message: 'Teacher record not found' } };
  },

  // Students
  getStudents: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            profiles (
              full_name,
              email,
              phone,
              profile_image_url
            )
          `)
          .eq('is_active', true)
          .order('admission_number');
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getStudents error:', err);
      }
    }
    const currentMock = loadMockData();
    return { data: currentMock.students, error: null };
  },

  getStudentByUserId: async (userId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getStudentByUserId error:', err);
      }
    }
    const currentMock = loadMockData();
    const student = currentMock.students.find((s) => s.user_id === userId || s.id === userId || s.student_id === userId);
    return { data: student || null, error: null };
  },

  createStudent: async (studentData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('students').insert(studentData).select().single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createStudent error:', err);
      }
    }
    const currentMock = loadMockData();
    const newStudentId = Math.floor(100000 + Math.random() * 900000).toString();
    const newStudent = {
      id: 'stu-' + Date.now(),
      student_id: newStudentId,
      admission_number: 'ADM-' + new Date().getFullYear() + '-' + newStudentId.slice(-3),
      date_of_admission: new Date().toISOString().split('T')[0],
      is_active: true,
      ...studentData
    };
    currentMock.students.push(newStudent);
    saveMockData(currentMock);
    return { data: newStudent, error: null };
  },

  deleteTeacher: async (teacherId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('teachers').delete().eq('id', teacherId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteTeacher error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.teachers = currentMock.teachers.filter(t => t.id !== teacherId && t.employee_id !== teacherId);
    currentMock.profiles = currentMock.profiles.filter(p => p.id !== teacherId && p.student_id !== teacherId && p.user_id !== teacherId);
    saveMockData(currentMock);
    return { error: null };
  },

  deleteStudent: async (studentId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('students').delete().eq('id', studentId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteStudent error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.students = currentMock.students.filter(s => s.id !== studentId && s.student_id !== studentId);
    currentMock.profiles = currentMock.profiles.filter(p => p.id !== studentId && p.student_id !== studentId && p.user_id !== studentId);
    saveMockData(currentMock);
    return { error: null };
  },

  // Announcements
  getAnnouncements: async (targetAudience = 'all') => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .or(`target_audience.eq.${targetAudience},target_audience.eq.all`)
          .order('published_at', { ascending: false });
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getAnnouncements error:', err);
      }
    }
    const currentMock = loadMockData();
    const list = currentMock.announcements.filter(
      (a) => a.is_active && (targetAudience === 'all' || a.target_audience === targetAudience || a.target_audience === 'all')
    );
    return { data: list, error: null };
  },

  createAnnouncement: async (announcementData) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('announcements').insert(announcementData).select().single();
        if (!error) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createAnnouncement error:', err);
      }
    }
    const currentMock = loadMockData();
    const newAnn = {
      id: 'ann-' + Date.now(),
      is_active: true,
      published_at: new Date().toISOString(),
      ...announcementData
    };
    currentMock.announcements.unshift(newAnn);
    saveMockData(currentMock);
    return { data: newAnn, error: null };
  },

  deleteAnnouncement: async (annId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('announcements').delete().eq('id', annId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteAnnouncement error:', err);
      }
    }
    const currentMock = loadMockData();
    currentMock.announcements = currentMock.announcements.filter((a) => a.id !== annId);
    saveMockData(currentMock);
    return { error: null };
  },

  // Authentication helpers
  signUp: async (providedEmail, password, metadata = {}) => {
    const role = metadata.role || 'student';
    const fullName = metadata.full_name || 'Noble Student';
    // Generate a unique 6-digit Student / Portal ID
    const generatedSixDigitId = Math.floor(100000 + Math.random() * 900000).toString();
    const email = providedEmail && providedEmail.trim().length > 0
      ? providedEmail.trim()
      : `${generatedSixDigitId}@student.noblekingsacademy.edu`;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              student_id: generatedSixDigitId,
              ...metadata
            }
          }
        });
        if (error) return { data: null, error };

        // Create profile in profiles table
        if (data.user) {
          const profileData = {
            user_id: data.user.id,
            full_name: fullName,
            role: role,
            student_id: generatedSixDigitId,
            phone: metadata.phone || '',
            address: metadata.address || ''
          };
          await supabase.from('profiles').insert(profileData);

          if (role === 'teacher') {
            await supabase.from('teachers').insert({
              user_id: data.user.id,
              employee_id: generatedSixDigitId,
              qualification: metadata.qualification || 'B.Ed',
              specialization: metadata.specialization || 'General',
              assigned_grades: ['Primary 1'],
              is_active: true
            });
          } else if (role === 'student') {
            await supabase.from('students').insert({
              user_id: data.user.id,
              student_id: generatedSixDigitId,
              admission_number: 'ADM-' + new Date().getFullYear() + '-' + generatedSixDigitId.slice(-3),
              date_of_admission: new Date().toISOString().split('T')[0],
              parent_guardian_name: metadata.parent_name || '',
              parent_guardian_phone: metadata.parent_phone || '',
              class_name: metadata.class_name || 'Primary 1',
              is_active: true
            });
          }
        }
        return { data: { ...data, student_id: generatedSixDigitId }, error: null };
      } catch (err) {
        console.warn('Supabase signUp error, using fallback:', err);
      }
    }

    // Fallback Mock SignUp
    const currentMock = loadMockData();
    const mockUserId = 'u-' + Date.now();
    const mockProfile = {
      id: 'prof-' + Date.now(),
      user_id: mockUserId,
      full_name: fullName,
      role: role,
      email: email,
      student_id: generatedSixDigitId,
      class_name: metadata.class_name || 'Primary 1',
      parent_guardian_name: metadata.parent_name || '',
      parent_guardian_phone: metadata.parent_phone || '',
      phone: metadata.phone || '+1-555-0199'
    };
    currentMock.profiles.push(mockProfile);

    if (role === 'teacher') {
      currentMock.teachers.push({
        id: 'tch-' + Date.now(),
        user_id: mockUserId,
        employee_id: generatedSixDigitId,
        full_name: fullName,
        email: email,
        phone: metadata.phone || '+1-555-0199',
        qualification: metadata.qualification || 'B.Ed',
        specialization: metadata.specialization || 'Education',
        assigned_grades: ['Primary 1'],
        is_active: true
      });
    } else if (role === 'student') {
      currentMock.students.push({
        id: 'stu-' + Date.now(),
        user_id: mockUserId,
        student_id: generatedSixDigitId,
        admission_number: 'ADM-' + new Date().getFullYear() + '-' + generatedSixDigitId.slice(-3),
        full_name: fullName,
        email: email,
        phone: metadata.phone || '+1-555-0199',
        date_of_admission: new Date().toISOString().split('T')[0],
        class_name: metadata.class_name || 'Primary 1',
        status: 'pending',
        is_active: false
      });
    }

    saveMockData(currentMock);

    // NOTE: We deliberately DO NOT save session on registration.
    // An administrator must approve the account before the user can log in!
    return { data: { student_id: generatedSixDigitId, status: 'pending' }, error: null };
  },

  signIn: async (identifier, password, expectedRole = null) => {
    const idTrim = identifier ? identifier.trim() : '';

    const currentMock = loadMockData();
    const adminMatch = currentMock.profiles.find(
      p => p.role === 'admin' && (
        p.student_id === idTrim ||
        p.email?.toLowerCase() === idTrim.toLowerCase() ||
        p.user_id === idTrim ||
        idTrim === '000000' ||
        idTrim === 'admin@school.com'
      )
    );

    const isExplicitAdminIdentifier = idTrim === '000000' || idTrim === 'admin@school.com' || !!adminMatch;

    // 1. IF LOGIN MODE IS ADMIN LOGIN ('admin'):
    if (expectedRole === 'admin') {
      if (!isExplicitAdminIdentifier) {
        return {
          data: null,
          error: { message: 'Access Denied: This login portal is strictly reserved for Administrators. Students and Teachers must use the Student & Teacher Portal login.' }
        };
      }
      if (adminMatch && adminMatch.status === 'disabled') {
        return {
          data: null,
          error: { message: 'Your administrator account has been disabled. Please contact system support.' }
        };
      }
      const adminProfile = adminMatch || {
        id: 'prof-admin-1',
        user_id: 'u-admin-1',
        full_name: 'Dr. Samuel Adebayo',
        role: 'admin',
        admin_title: 'School Principal & System Admin',
        email: 'admin@school.com',
        student_id: '000000',
        status: 'approved',
        is_active: true
      };
      const mockSession = {
        user: { id: adminProfile.user_id || adminProfile.id, email: adminProfile.email, role: 'admin', student_id: adminProfile.student_id || '000000' },
        profile: adminProfile
      };
      localStorage.setItem('sms_mock_session', JSON.stringify(mockSession));
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }

    // 2. IF LOGIN MODE IS STANDARD PORTAL LOGIN (NOT 'admin'):
    if (isExplicitAdminIdentifier) {
      return {
        data: null,
        error: { message: 'Access Denied: Administrators must log in through the Admin Login portal. Please click "Login as Admin" below to access the Admin portal.' }
      };
    }

    const is6Digit = /^\d{6}$/.test(idTrim);
    const loginEmail = is6Digit ? `${idTrim}@student.noblekingsacademy.edu` : idTrim;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) return { data: null, error };
        if (data?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single();
          const userRole = profile?.role;
          if (userRole === 'student') {
            const { data: student } = await supabase.from('students').select('*').eq('user_id', data.user.id).single();
            if (student && (student.status === 'pending' || !student.is_active)) {
              await supabase.auth.signOut();
              return {
                data: null,
                error: { message: 'Your student account is pending administrator approval. Please wait for an administrator to approve your account before accessing the portal.' }
              };
            }
            if (student && student.status === 'disabled') {
              await supabase.auth.signOut();
              return {
                data: null,
                error: { message: 'Your student account has been disabled. Please contact the school office.' }
              };
            }
          } else if (userRole === 'teacher') {
            const { data: teacher } = await supabase.from('teachers').select('*').eq('user_id', data.user.id).single();
            if (teacher && (teacher.status === 'pending' || !teacher.is_active)) {
              await supabase.auth.signOut();
              return {
                data: null,
                error: { message: 'Your teacher account is pending administrator approval. Please wait for an administrator to verify and approve your account.' }
              };
            }
            if (teacher && teacher.status === 'disabled') {
              await supabase.auth.signOut();
              return {
                data: null,
                error: { message: 'Your teacher account has been disabled. Please contact the school office.' }
              };
            }
          }
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase signIn error, falling back to mock:', err);
      }
    }

    // Check Mock Database
    // (currentMock is already loaded above)

    // 1. Check Student Roster
    const studentMatch = currentMock.students.find(
      (s) => s.student_id === idTrim || s.admission_number === idTrim || s.email?.toLowerCase() === idTrim.toLowerCase()
    );
    if (studentMatch) {
      if (studentMatch.status === 'pending' || studentMatch.is_active === false) {
        return {
          data: null,
          error: {
            message: 'Your student account is pending administrator approval. You will be able to access your portal once an administrator approves your registration.'
          }
        };
      }
      if (studentMatch.status === 'disabled') {
        return {
          data: null,
          error: {
            message: 'Your student account is currently deactivated. Please contact the school administration office.'
          }
        };
      }
      const profile = {
        id: 'prof-' + studentMatch.id,
        user_id: studentMatch.user_id || studentMatch.id,
        full_name: studentMatch.full_name,
        role: 'student',
        student_id: studentMatch.student_id,
        email: studentMatch.email,
        class_name: studentMatch.class_name,
        status: studentMatch.status
      };
      const mockSession = { user: { id: profile.user_id, student_id: profile.student_id, role: 'student' }, profile };
      localStorage.setItem('sms_mock_session', JSON.stringify(mockSession));
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }

    // 2. Check Teacher Roster
    const teacherMatch = currentMock.teachers.find(
      (t) => t.employee_id === idTrim || t.email?.toLowerCase() === idTrim.toLowerCase()
    );
    if (teacherMatch) {
      if (teacherMatch.status === 'pending' || teacherMatch.is_active === false) {
        return {
          data: null,
          error: {
            message: 'Your teacher account is pending administrator approval. You will receive portal access once your profile has been verified and approved.'
          }
        };
      }
      if (teacherMatch.status === 'disabled') {
        return {
          data: null,
          error: {
            message: 'Your teacher account has been deactivated. Please contact school administration.'
          }
        };
      }
      const profile = {
        id: 'prof-' + teacherMatch.id,
        user_id: teacherMatch.user_id || teacherMatch.id,
        full_name: teacherMatch.full_name,
        role: 'teacher',
        employee_id: teacherMatch.employee_id,
        student_id: teacherMatch.employee_id,
        email: teacherMatch.email,
        specialization: teacherMatch.specialization,
        status: teacherMatch.status
      };
      const mockSession = { user: { id: profile.user_id, student_id: profile.student_id, role: 'teacher' }, profile };
      localStorage.setItem('sms_mock_session', JSON.stringify(mockSession));
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }

    // 3. Check Profiles
    const existing = currentMock.profiles.find(
      (p) =>
        p.student_id === idTrim ||
        p.email?.toLowerCase() === idTrim.toLowerCase() ||
        p.email?.toLowerCase() === loginEmail.toLowerCase() ||
        p.user_id === idTrim
    );
    if (existing) {
      if (existing.role !== 'admin' && (existing.status === 'pending' || existing.is_active === false)) {
        return {
          data: null,
          error: {
            message: `Your ${existing.role} account is pending administrator approval. Please wait for an administrator to approve your account.`
          }
        };
      }
      if (existing.role !== 'admin' && existing.status === 'disabled') {
        return {
          data: null,
          error: {
            message: `Your ${existing.role} account has been deactivated. Please contact the school administration.`
          }
        };
      }
      const mockSession = {
        user: { id: existing.user_id || existing.id, email: existing.email, student_id: existing.student_id, role: existing.role },
        profile: existing
      };
      localStorage.setItem('sms_mock_session', JSON.stringify(mockSession));
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }

    // If identifier is not found in mock data
    return {
      data: null,
      error: {
        message: 'Invalid Portal ID or password. Please verify your 6-digit Portal ID or contact the school administrator.'
      }
    };
  },

  getAdmins: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'admin');
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase getAdmins error:', err);
      }
    }
    const currentMock = loadMockData();
    const admins = currentMock.profiles.filter(p => p.role === 'admin');
    return { data: admins, error: null };
  },

  createAdminAccount: async (adminData) => {
    const generatedAdminId = '10' + Math.floor(1000 + Math.random() * 9000).toString();
    const newAdmin = {
      id: 'prof-admin-' + Date.now(),
      user_id: 'u-admin-' + Date.now(),
      full_name: adminData.full_name,
      email: adminData.email,
      phone: adminData.phone || '+1-555-0100',
      role: 'admin',
      admin_title: adminData.admin_title || 'System Administrator',
      student_id: generatedAdminId,
      status: 'approved',
      is_active: true,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('profiles').insert(newAdmin).select().single();
        if (!error && data) return { data, error: null };
      } catch (err) {
        console.warn('Supabase createAdminAccount error:', err);
      }
    }

    const currentMock = loadMockData();
    currentMock.profiles.push(newAdmin);
    saveMockData(currentMock);
    return { data: newAdmin, error: null };
  },

  toggleAdminStatus: async (adminId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data: profile } = await supabase.from('profiles').select('status').eq('id', adminId).single();
        const newStatus = profile?.status === 'disabled' ? 'approved' : 'disabled';
        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', adminId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase toggleAdminStatus error:', err);
      }
    }
    const currentMock = loadMockData();
    const adminIndex = currentMock.profiles.findIndex(p => p.id === adminId || p.student_id === adminId);
    if (adminIndex !== -1) {
      if (currentMock.profiles[adminIndex].student_id === '000000' || currentMock.profiles[adminIndex].is_super_admin) {
        return { error: { message: 'Super Admin account is protected and cannot be disabled.' } };
      }
      const current = currentMock.profiles[adminIndex].status;
      currentMock.profiles[adminIndex].status = current === 'disabled' ? 'approved' : 'disabled';
      saveMockData(currentMock);
      return { error: null };
    }
    return { error: { message: 'Admin account not found' } };
  },

  deleteAdminAccount: async (adminId) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', adminId);
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase deleteAdminAccount error:', err);
      }
    }
    const currentMock = loadMockData();
    const admin = currentMock.profiles.find(p => p.id === adminId || p.student_id === adminId);
    if (admin && (admin.student_id === '000000' || admin.email === 'admin@school.com' || admin.is_super_admin)) {
      return { error: { message: 'Super Admin account is protected and cannot be deleted.' } };
    }
    currentMock.profiles = currentMock.profiles.filter(p => p.id !== adminId && p.student_id !== adminId);
    saveMockData(currentMock);
    return { error: null };
  },

  requestPasswordReset: async (portalId, contactInfo) => {
    const currentMock = loadMockData();
    if (!currentMock.reset_requests) currentMock.reset_requests = [];
    const newRequest = {
      id: 'reset-' + Date.now(),
      portal_id: portalId,
      contact_info: contactInfo,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    currentMock.reset_requests.push(newRequest);
    saveMockData(currentMock);
    return { data: newRequest, error: null };
  },

  getPasswordResetRequests: async () => {
    const currentMock = loadMockData();
    return { data: currentMock.reset_requests || [], error: null };
  },

  resetUserPassword: async (identifier, newPassword) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.admin.updateUserById(identifier, { password: newPassword });
        if (!error) return { error: null };
      } catch (err) {
        console.warn('Supabase resetUserPassword error:', err);
      }
    }
    const currentMock = loadMockData();
    const profile = currentMock.profiles.find(p => p.student_id === identifier || p.user_id === identifier || p.id === identifier);
    if (profile) profile.password = newPassword;

    const student = currentMock.students.find(s => s.student_id === identifier || s.user_id === identifier || s.id === identifier);
    if (student) student.password = newPassword;

    const teacher = currentMock.teachers.find(t => t.employee_id === identifier || t.user_id === identifier || t.id === identifier);
    if (teacher) teacher.password = newPassword;

    if (currentMock.reset_requests) {
      currentMock.reset_requests = currentMock.reset_requests.map(r =>
        r.portal_id === identifier ? { ...r, status: 'resolved' } : r
      );
    }

    saveMockData(currentMock);
    return { error: null };
  },

  demoSignIn: async (role = 'admin') => {
    const currentMock = loadMockData();
    let profile = currentMock.profiles.find((p) => p.role === role);
    if (!profile) {
      profile = {
        id: 'prof-demo-' + role,
        user_id: 'u-demo-' + role,
        full_name: role.toUpperCase() + ' User',
        role: role,
        email: role + '@school.com',
        student_id: '849201'
      };
    }
    const mockSession = {
      user: { id: profile.user_id, email: profile.email, student_id: profile.student_id },
      profile: profile
    };
    localStorage.setItem('sms_mock_session', JSON.stringify(mockSession));
    return { data: { user: mockSession.user, session: mockSession }, error: null };
  },

  resetToProductionHandover: async () => {
    localStorage.setItem('sms_mock_data', JSON.stringify(INITIAL_MOCK_DATA));
    return { data: INITIAL_MOCK_DATA, error: null };
  },

  signOut: async () => {
    localStorage.removeItem('sms_mock_session');
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    return { error: null };
  },

  getSession: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return { session, error: null };
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      }
    }
    const mockSessionStr = localStorage.getItem('sms_mock_session');
    if (mockSessionStr) {
      try {
        const session = JSON.parse(mockSessionStr);
        return { session, error: null };
      } catch (err) {
        console.warn('Invalid mock session:', err);
      }
    }
    return { session: null, error: null };
  },

  getCurrentUser: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return { user, error: null };
      } catch (err) {
        console.warn('Supabase getCurrentUser error:', err);
      }
    }
    const mockSessionStr = localStorage.getItem('sms_mock_session');
    if (mockSessionStr) {
      try {
        const session = JSON.parse(mockSessionStr);
        return { user: session.user, error: null };
      } catch {
        // ignore
      }
    }
    return { user: null, error: null };
  }
};

export default db;