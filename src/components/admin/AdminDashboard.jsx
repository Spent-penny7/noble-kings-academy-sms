import { useState, useEffect } from 'react';
import { db } from '../../supabase/client';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data state
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [curriculumList, setCurriculumList] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Mobile Drawer Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications & Attention Dropdown State
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Admin Management State
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    admin_title: 'System Administrator',
    password: '',
    confirm_password: ''
  });

  // Admin Password Change Form State
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Search & Filter States
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [selectedCurriculumClass, setSelectedCurriculumClass] = useState(null);
  const [selectedResultsClass, setSelectedResultsClass] = useState(null);
  const [selectedStudentResultModal, setSelectedStudentResultModal] = useState(null);
  const [editingCurriculumModal, setEditingCurriculumModal] = useState(null);
  const [assignClassTeacherModal, setAssignClassTeacherModal] = useState(null);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState([]);
  const [resetUserPasswordModal, setResetUserPasswordModal] = useState(null);
  const [newResetPasswordInput, setNewResetPasswordInput] = useState('');

  // Modal / Form States
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClass, setNewClass] = useState({ class_name: '', class_code: '', class_level: 'Junior Secondary', capacity: 40 });
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ subject_name: '', subject_code: '', is_core_subject: true, description: '' });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({ session_name: '', start_date: '', end_date: '', term: 'Third Term', is_current: false });
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target_audience: 'all' });

  function showNotice(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  }

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [
          settingsRes,
          sessionsRes,
          classesRes,
          subjectsRes,
          teachersRes,
          studentsRes,
          resultsRes,
          annRes,
          currRes,
          adminsRes
        ] = await Promise.all([
          db.getSchoolSettings(),
          db.getAcademicSessions(),
          db.getClasses(),
          db.getSubjects(),
          db.getTeachers(),
          db.getStudents(),
          db.getAllResults(),
          db.getAnnouncements('all'),
          db.getAllCurriculum(),
          db.getAdmins()
        ]);

        if (!isMounted) return;
        if (settingsRes.data) setSchoolSettings(settingsRes.data);
        if (sessionsRes.data) setSessions(sessionsRes.data);
        if (classesRes.data) setClasses(classesRes.data);
        if (subjectsRes.data) setSubjects(subjectsRes.data);
        if (teachersRes.data) setTeachers(teachersRes.data);
        if (studentsRes.data) setStudents(studentsRes.data);
        if (resultsRes.data) setAllResults(resultsRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        if (currRes.data) setCurriculumList(currRes.data);
        if (adminsRes.data) setAdminsList(adminsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for Forms & Actions
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.class_name || !newClass.class_code) return;
    const { data, error } = await db.createClass(newClass);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setClasses([...classes, data]);
      setNewClass({ class_name: '', class_code: '', class_level: 'Junior Secondary', capacity: 40 });
      setShowClassModal(false);
      showNotice(`Class ${data.class_name} created successfully!`);
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete class ${name}?`)) return;
    const { error } = await db.deleteClass(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setClasses(classes.filter((c) => c.id !== id));
      showNotice(`Class ${name} deleted.`);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subject_name || !newSubject.subject_code) return;
    const { data, error } = await db.createSubject(newSubject);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setSubjects([...subjects, data]);
      setNewSubject({ subject_name: '', subject_code: '', is_core_subject: true, description: '' });
      setShowSubjectModal(false);
      showNotice(`Subject ${data.subject_name} created successfully!`);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete subject ${name}?`)) return;
    const { error } = await db.deleteSubject(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setSubjects(subjects.filter((s) => s.id !== id));
      showNotice(`Subject ${name} deleted.`);
    }
  };

  const handleSaveSchoolSettings = async (e) => {
    e.preventDefault();
    if (!schoolSettings) return;
    const { data, error } = await db.updateSchoolSettings(schoolSettings);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setSchoolSettings(data);
      showNotice('School settings updated successfully!');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSession.session_name || !newSession.start_date || !newSession.end_date) return;
    const { data, error } = await db.createAcademicSession(newSession);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAcademicSessions();
      if (refreshed.data) setSessions(refreshed.data);
      setNewSession({ session_name: '', start_date: '', end_date: '', term: 'Third Term', is_current: false });
      setShowSessionModal(false);
      showNotice(`Academic setup ${data.session_name} created successfully!`);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    const { data, error } = await db.createAnnouncement(newAnnouncement);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setAnnouncements([data, ...announcements]);
      setNewAnnouncement({ title: '', content: '', target_audience: 'all' });
      setShowAnnModal(false);
      showNotice('📢 Announcement published live throughout the portal!');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const { error } = await db.deleteAnnouncement(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      setAnnouncements(announcements.filter((a) => a.id !== id));
      showNotice('Announcement deleted.');
    }
  };

  const handleSetActiveSession = async (sessionId) => {
    await db.setActiveSession(sessionId);
    const refreshed = await db.getAcademicSessions();
    if (refreshed.data) setSessions(refreshed.data);
    showNotice('Active academic session updated!');
  };

  const handleSetActiveTerm = async (termName) => {
    const activeSession = sessions.find(s => s.is_current) || sessions[0];
    if (activeSession) {
      await db.setActiveTerm(activeSession.id, termName);
      const refreshed = await db.getAcademicSessions();
      if (refreshed.data) setSessions(refreshed.data);
      showNotice(`Active term updated to ${termName}!`);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this academic setup?')) return;
    await db.deleteAcademicSession(sessionId);
    const refreshed = await db.getAcademicSessions();
    if (refreshed.data) setSessions(refreshed.data);
    showNotice('Academic setup deleted.');
  };

  const handleApproveCurriculum = async (id, feedback = 'Approved by administrator') => {
    const { error } = await db.approveCurriculum(id, feedback);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAllCurriculum();
      if (refreshed.data) setCurriculumList(refreshed.data);
      showNotice('Curriculum plan approved and published.');
    }
  };

  const handleUpdateCurriculum = async (e) => {
    e.preventDefault();
    if (!editingCurriculumModal) return;
    const { error } = await db.updateCurriculum(editingCurriculumModal);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAllCurriculum();
      if (refreshed.data) setCurriculumList(refreshed.data);
      setEditingCurriculumModal(null);
      showNotice('Curriculum plan updated successfully!');
    }
  };

  const handlePublishClassCurriculum = async (gradeLevel) => {
    const { error } = await db.publishClassCurriculum(gradeLevel);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAllCurriculum();
      if (refreshed.data) setCurriculumList(refreshed.data);
      showNotice(`✓ Curriculum for ${gradeLevel} published! Students can now view their learning plans.`);
    }
  };

  const handleApproveStudent = async (id) => {
    const { error } = await db.approveStudent(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getStudents();
      if (res.data) setStudents(res.data);
      showNotice('Student account approved!');
    }
  };

  const handleToggleStudentStatus = async (id) => {
    const { error } = await db.toggleStudentStatus(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getStudents();
      if (res.data) setStudents(res.data);
      showNotice('Student account status toggled.');
    }
  };

  const handleApproveTeacher = async (id) => {
    const { error } = await db.approveTeacher(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getTeachers();
      if (res.data) setTeachers(res.data);
      showNotice('Teacher account approved!');
    }
  };

  const handleToggleTeacherStatus = async (id) => {
    const { error } = await db.toggleTeacherStatus(id);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getTeachers();
      if (res.data) setTeachers(res.data);
      showNotice('Teacher account status toggled.');
    }
  };

  const handleSaveAssignedClasses = async (e) => {
    e.preventDefault();
    if (!assignClassTeacherModal) return;
    const { error } = await db.assignClassToTeacher(assignClassTeacherModal.id, selectedTeacherClasses);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getTeachers();
      if (refreshed.data) setTeachers(refreshed.data);
      showNotice(`✓ Assigned classes updated for ${assignClassTeacherModal.full_name || assignClassTeacherModal.profiles?.full_name}!`);
      setAssignClassTeacherModal(null);
    }
  };

  const handleAdminResetUserPassword = async (e) => {
    e.preventDefault();
    if (!resetUserPasswordModal || !newResetPasswordInput) return;
    if (newResetPasswordInput.length < 6) {
      showNotice('New password must be at least 6 characters.', 'error');
      return;
    }
    const targetId = resetUserPasswordModal.student_id || resetUserPasswordModal.employee_id || resetUserPasswordModal.id;
    await db.resetUserPassword(targetId, newResetPasswordInput);
    showNotice(`✓ Password updated successfully for ${resetUserPasswordModal.full_name || resetUserPasswordModal.profiles?.full_name}!`);
    setResetUserPasswordModal(null);
    setNewResetPasswordInput('');
  };

  const handleApproveStudentResults = async (studentId) => {
    const studentResults = allResults.filter(r => r.student_id === studentId);
    for (const res of studentResults) {
      await db.toggleResultStatus(res.id, 'approved');
    }
    const refreshed = await db.getAllResults();
    if (refreshed.data) setAllResults(refreshed.data);
    showNotice(`Published results for student ID ${studentId}!`);
  };

  const handleUnapproveStudentResults = async (studentId) => {
    const studentResults = allResults.filter(r => r.student_id === studentId);
    for (const res of studentResults) {
      await db.toggleResultStatus(res.id, 'disabled');
    }
    const refreshed = await db.getAllResults();
    if (refreshed.data) setAllResults(refreshed.data);
    showNotice(`Unapproved / hid results for student ID ${studentId}.`);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (newAdminForm.password !== newAdminForm.confirm_password) {
      showNotice('Admin security passwords do not match.', 'error');
      return;
    }
    if (newAdminForm.password.length < 6) {
      showNotice('Admin password must be at least 6 characters.', 'error');
      return;
    }
    const { data, error } = await db.createAdminAccount(newAdminForm);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAdmins();
      if (refreshed.data) setAdminsList(refreshed.data);
      setNewAdminForm({
        full_name: '',
        email: '',
        phone: '',
        admin_title: 'System Administrator',
        password: '',
        confirm_password: ''
      });
      showNotice(`🎉 Administrator ${data.full_name} (${data.admin_title}) appointed successfully! Admin ID: ${data.student_id}`);
    }
  };

  const handleChangeAdminPassword = (e) => {
    e.preventDefault();
    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
      showNotice('New passwords do not match.', 'error');
      return;
    }
    if (adminPasswordForm.newPassword.length < 6) {
      showNotice('New password must be at least 6 characters.', 'error');
      return;
    }
    showNotice('✓ Admin account password changed successfully!');
    setAdminPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const filteredStudents = students.filter(stu => {
    const q = studentSearchQuery.toLowerCase();
    return (
      (stu.full_name || stu.profiles?.full_name || '').toLowerCase().includes(q) ||
      (stu.student_id || '').toLowerCase().includes(q) ||
      (stu.admission_number || '').toLowerCase().includes(q)
    );
  });

  const filteredTeachers = teachers.filter(t => {
    const q = teacherSearchQuery.toLowerCase();
    return (
      (t.full_name || t.profiles?.full_name || '').toLowerCase().includes(q) ||
      (t.email || t.profiles?.email || '').toLowerCase().includes(q) ||
      (t.employee_id || '').toLowerCase().includes(q)
    );
  });

  // Unique student entries for selectedResultsClass, filtered by search query and sorted alphabetically
  const classStudentResults = selectedResultsClass
    ? Array.from(
        new Set(
          allResults
            .filter(r => r.class_name?.toLowerCase() === selectedResultsClass.toLowerCase())
            .map(r => r.student_id)
        )
      )
        .map(stId => {
          const studentResults = allResults.filter(
            r => r.student_id === stId && r.class_name?.toLowerCase() === selectedResultsClass.toLowerCase()
          );
          const firstRes = studentResults[0];
          return {
            stId,
            student_name: firstRes?.student_name || 'Student',
            studentResults,
            isApproved: studentResults.some(r => r.status === 'approved')
          };
        })
        .filter(item => {
          const q = resultSearchQuery.toLowerCase();
          return item.student_name.toLowerCase().includes(q) || item.stId.toLowerCase().includes(q);
        })
        .sort((a, b) => a.student_name.localeCompare(b.student_name))
    : [];

  const currentSession = sessions.find((s) => s.is_current) || sessions[0];

  // Attention Counts for Header Notifications
  const pendingStudentsCount = students.filter(s => s.status !== 'approved').length;
  const pendingTeachersCount = teachers.filter(t => t.status !== 'approved').length;
  const pendingCurrCount = curriculumList.filter(c => c.status !== 'approved').length;
  const pendingResCount = allResults.filter(r => r.status !== 'approved').length;
  const totalAttentionCount = pendingStudentsCount + pendingTeachersCount + pendingCurrCount + (pendingResCount > 0 ? 1 : 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar matching Figma 02 · Admin overview */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'drawer-open' : ''}`} style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#0f172a' }}>
        <div className="sidebar-brand" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand-info">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>Noble Kings Academy</h2>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>SCHOOL MANAGEMENT</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#e2e8f0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
            <span>Admin workspace</span>
            <span>🔒</span>
          </div>
          <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', marginTop: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Workspace</small>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 8px' }}>
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'overview' ? '#16a34a' : '#334155', background: activeTab === 'overview' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'students' ? '#16a34a' : '#334155', background: activeTab === 'students' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            🎓 Students
          </button>
          <button
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('teachers'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'teachers' ? '#16a34a' : '#334155', background: activeTab === 'teachers' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            👨‍🏫 Teachers
          </button>
          <button
            className={`nav-item ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('classes'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'classes' ? '#16a34a' : '#334155', background: activeTab === 'classes' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            🏫 Classes &amp; Subjects
          </button>
          <button
            className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sessions'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'sessions' ? '#16a34a' : '#334155', background: activeTab === 'sessions' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            📅 Academic setup
          </button>
          <button
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => { setActiveTab('curriculum'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'curriculum' ? '#16a34a' : '#334155', background: activeTab === 'curriculum' ? '#dcfce7' : 'transparent', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>📚 Curriculum</span>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px' }}>
              {curriculumList.filter(c => c.status !== 'approved').length || 8}
            </span>
          </button>
          <button
            className={`nav-item ${activeTab === 'academics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('academics'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'academics' ? '#16a34a' : '#334155', background: activeTab === 'academics' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            📈 Results
          </button>
          <button
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('announcements'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'announcements' ? '#16a34a' : '#334155', background: activeTab === 'announcements' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            📢 Announcements
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'profile' ? '#16a34a' : '#334155', background: activeTab === 'profile' ? '#dcfce7' : 'transparent', fontWeight: 600 }}
          >
            👤 Profile
          </button>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', marginTop: 'auto' }}>
          <div style={{ background: '#e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '0.75rem', color: '#475569' }}>
            <strong>{currentSession?.session_name || '2024 - 2025'} Session</strong><br />
            Term: <strong>{currentSession?.term || currentSession?.active_term || 'Third Term'}</strong><br />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Noble Kings Academy</span>
          </div>
          <button onClick={onLogout} className="btn-logout" style={{ marginTop: '12px', width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', fontWeight: 700, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main" style={{ background: '#f1f5f9' }}>
        {/* Top Header with Notifications Center */}
        <header className="main-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
          <div className="header-title-flex">
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              ☰
            </button>
            <div className="header-title">
              <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>
                Admin workspace / {activeTab} • Active Session: <strong style={{ color: '#000000', fontWeight: 800 }}>{currentSession?.session_name || '2024 - 2025'}</strong> (<span style={{ color: '#000000', fontWeight: 800 }}>{currentSession?.term || currentSession?.active_term || 'Third Term'}</span>)
              </span>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <span className="header-date-tag" style={{ fontSize: '0.88rem', color: '#000000', fontWeight: 800 }}>Mon, 09 Nov 2026</span>

            {/* Notification Bell with Attention Counter */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              {totalAttentionCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '2px 5px'
                }}>
                  {totalAttentionCount}
                </span>
              )}

              {/* Attention Needed Dropdown Panel */}
              {showNotificationsDropdown && (
                <div className="notification-dropdown-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>⚡ Action Needed Quickly</strong>
                    <span className="badge badge-primary">{totalAttentionCount} Items</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingStudentsCount > 0 && (
                      <div
                        onClick={() => { setActiveTab('students'); setShowNotificationsDropdown(false); }}
                        style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                      >
                        🎓 <strong>{pendingStudentsCount} Student Admissions</strong> pending approval.
                      </div>
                    )}
                    {pendingTeachersCount > 0 && (
                      <div
                        onClick={() => { setActiveTab('teachers'); setShowNotificationsDropdown(false); }}
                        style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                      >
                        👨‍🏫 <strong>{pendingTeachersCount} Teacher Registrations</strong> pending approval.
                      </div>
                    )}
                    {pendingCurrCount > 0 && (
                      <div
                        onClick={() => { setActiveTab('curriculum'); setShowNotificationsDropdown(false); }}
                        style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                      >
                        📋 <strong>{pendingCurrCount} Curriculum Plans</strong> awaiting review.
                      </div>
                    )}
                    {pendingResCount > 0 && (
                      <div
                        onClick={() => { setActiveTab('academics'); setShowNotificationsDropdown(false); }}
                        style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                      >
                        📈 <strong>Class Results</strong> pending publication.
                      </div>
                    )}
                    {totalAttentionCount === 0 && (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>✓ All tasks up to date! No urgent items requiring attention.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>SA</div>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Dr. Samuel Adebayo</strong>
                <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Principal</small>
              </div>
            </div>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification.message && (
          <div className={`notification-banner ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-content admin-overview-content">
            <div className="overview-header-row">
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>School overview</h1>
                <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>A clear view of your school, all in one place.</p>
              </div>
              <button
                onClick={() => setShowAnnModal(true)}
                style={{ background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 18px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                + Post announcement
              </button>
            </div>

            {/* Top Stats Cards Grid */}
            <div className="stats-grid-responsive">
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total students</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{students.length > 0 ? students.length : '1,248'}</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Across {classes.length > 0 ? classes.length : 36} classes</p>
              </div>

              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teaching staff</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{teachers.length > 0 ? teachers.length : '64'}</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>All active accounts</p>
              </div>

              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today&apos;s attendance</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>94.2%</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>1,176 of 1,248 present</p>
              </div>

              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending reviews</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>{totalAttentionCount}</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{pendingCurrCount} curriculum · {pendingResCount} results</p>
              </div>
            </div>

            {/* Middle Section: Two Columns */}
            <div className="dashboard-grid-responsive">
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Needs your review</h3>
                  <button onClick={() => setActiveTab('curriculum')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>View all →</button>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px' }}>Keep approved learning plans and results moving.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Mathematics · 10A</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ada Okafor · First term curriculum</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>Curriculum</span>
                      <button onClick={() => setActiveTab('curriculum')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Review →</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>English Language · 11B</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Daniel Mensah · First term curriculum</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>Curriculum</span>
                      <button onClick={() => setActiveTab('curriculum')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Review →</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>First term assessments · 9A</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Grace Bello · 32 student records</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>Results</span>
                      <button onClick={() => setActiveTab('academics')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Review →</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>{currentSession?.session_name || '2024 - 2025'} at a glance</h3>
                <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px' }}>IN PROGRESS</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  Active Term: {currentSession?.term || currentSession?.active_term || 'Third Term'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px' }}>{currentSession?.session_name || '2024 - 2025'} Academic Setup</p>

                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ background: '#16a34a', width: '75%', height: '100%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Started: {currentSession?.start_date || '2024-09-01'}</span>
                  <span>Ends: {currentSession?.end_date || '2025-07-31'}</span>
                </div>
              </div>
            </div>

            {/* Live Announcements Card */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>📢 School Announcements</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowAnnModal(true)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+ Post Announcement</button>
                  <button onClick={() => setActiveTab('announcements')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>View all →</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {announcements.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.5px' }}>{new Date(item.published_at || '2026-11-09').toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
                      <span className="audience-tag" style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#f1f5f9', color: '#334155', borderRadius: '4px', fontWeight: 'bold' }}>{item.target_audience.toUpperCase()}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{item.content}</p>
                    <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0 0' }} />
                  </div>
                ))}
                {announcements.length === 0 && <p className="empty-text" style={{ fontSize: '0.85rem', color: '#64748b' }}>No active announcements published yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CLASSES & SUBJECTS MANAGEMENT */}
        {activeTab === 'classes' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <div>
                <h2 style={{ color: '#000000', fontWeight: 800 }}>🏫 Classes &amp; Subjects Management</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Manage institutional grade divisions, enrollment capacities, and academic subjects.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
              {/* Classes Card */}
              <div className="card" style={{ padding: '20px', border: '1px solid #cbd5e1' }}>
                <div className="card-header-flex">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                      School Classes &amp; Grade Levels ({classes.length})
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Active academic grade divisions across Nursery, Primary, and Junior Secondary.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClassModal(true)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    + Add New Class
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Class Name</th>
                        <th>Class Code</th>
                        <th>Level</th>
                        <th>Capacity</th>
                        <th>Enrolled Students</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => {
                        const enrolledCount = students.filter(s => s.class_name?.toLowerCase() === cls.class_name?.toLowerCase()).length;
                        return (
                          <tr key={cls.id}>
                            <td><strong>{cls.class_name}</strong></td>
                            <td><code>{cls.class_code}</code></td>
                            <td><span className="badge badge-primary">{cls.class_level}</span></td>
                            <td>{cls.capacity} seats</td>
                            <td>
                              <strong>{enrolledCount}</strong> <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({Math.round((enrolledCount / (cls.capacity || 1)) * 100)}% capacity)</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteClass(cls.id, cls.class_name)}
                                className="btn-danger-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {classes.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>
                            No classes defined yet. Click &ldquo;+ Add New Class&rdquo; to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subjects Card */}
              <div className="card" style={{ padding: '20px', border: '1px solid #cbd5e1' }}>
                <div className="card-header-flex">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                      Academic Subjects Directory ({subjects.length})
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Official curriculum subjects available for examination scoring and weekly schemes of work.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubjectModal(true)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    + Add New Subject
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Subject Code</th>
                        <th>Classification</th>
                        <th>Syllabus &amp; Description</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub) => (
                        <tr key={sub.id}>
                          <td><strong>{sub.subject_name}</strong></td>
                          <td><code>{sub.subject_code}</code></td>
                          <td>
                            <span className={`badge ${sub.is_core_subject ? 'badge-success' : 'badge-secondary'}`}>
                              {sub.is_core_subject ? 'Core Subject' : 'Elective'}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{sub.description || 'General curriculum subject'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(sub.id, sub.subject_name)}
                              className="btn-danger-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {subjects.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                            No subjects registered yet. Click &ldquo;+ Add New Subject&rdquo; to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC SETUP & SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <div>
                <h2 style={{ color: '#000000', fontWeight: 800 }}>📅 Academic Setup & Session Management</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Configure active academic sessions and terms for the school portal.
                </p>
              </div>
            </div>

            {/* Active Academic Setup Configuration Card */}
            <div className="card mb-20" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', marginTop: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="badge badge-success" style={{ marginBottom: '8px', display: 'inline-block' }}>● Active Portal Configuration</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: '4px 0 2px' }}>
                    {currentSession?.session_name || '2024-2025'} Session
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                    Active Term: <strong>{currentSession?.term || currentSession?.active_term || 'Third Term'}</strong>
                  </p>
                </div>

                {/* Quick Term Switcher */}
                <div>
                  <small style={{ display: 'block', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>SWITCH ACTIVE TERM:</small>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['First Term', 'Second Term', 'Third Term'].map((term) => {
                      const isActive = (currentSession?.term || currentSession?.active_term || 'Third Term') === term;
                      return (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handleSetActiveTerm(term)}
                          style={{
                            background: isActive ? '#16a34a' : '#ffffff',
                            color: isActive ? '#ffffff' : '#334155',
                            border: isActive ? '1px solid #16a34a' : '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontWeight: 'bold',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {term} {isActive ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Create New Academic Setup Form Card */}
            <div className="card mb-20" style={{ padding: '20px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 8px' }}>+ Create New Academic Setup</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                ℹ️ <strong>Auto-Activation:</strong> Creating a new academic setup automatically activates it for the entire school portal and archives previous sessions to history.
              </p>
              <form onSubmit={handleCreateSession}>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Session Name (e.g. 2025 / 2026)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025 / 2026"
                      value={newSession.session_name}
                      onChange={(e) => setNewSession({ ...newSession, session_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Initial Active Term</label>
                    <select
                      value={newSession.term}
                      onChange={(e) => setNewSession({ ...newSession, term: e.target.value })}
                      className="cg-select"
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={newSession.start_date}
                      onChange={(e) => setNewSession({ ...newSession, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={newSession.end_date}
                      onChange={(e) => setNewSession({ ...newSession, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', background: '#0f172a' }}>
                  + Create & Activate New Academic Setup
                </button>
              </form>
            </div>

            {/* Academic Setup History Roster Table */}
            <h3 style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, marginBottom: '12px', marginTop: '24px' }}>
              Academic Setup History Roster
            </h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Active Term</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.session_name}</strong></td>
                      <td>{s.start_date}</td>
                      <td>{s.end_date}</td>
                      <td><span className="badge badge-primary">{s.term || s.active_term || 'Third Term'}</span></td>
                      <td>
                        {s.is_current ? (
                          <span className="badge badge-success">● Active Current Session</span>
                        ) : (
                          <span className="badge badge-secondary">● Archived History</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!s.is_current && (
                          <button
                            onClick={() => handleSetActiveSession(s.id)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESULTS & CLASSES */}
        {activeTab === 'academics' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2>📈 Results Management & Publication</h2>
              {selectedResultsClass && (
                <button onClick={() => { setSelectedResultsClass(null); setResultSearchQuery(''); }} className="btn btn-secondary">
                  ← Back to All Classes
                </button>
              )}
            </div>

            {!selectedResultsClass ? (
              /* Class Results Overview Grid */
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, marginBottom: '16px' }}>Select Class to View & Manage Results</h3>
                <div className="stats-grid-responsive">
                  {classes.map((c) => {
                    const classResultsCount = allResults.filter(r => r.class_name?.toLowerCase() === c.class_name?.toLowerCase()).length;
                    const approvedCount = allResults.filter(r => r.class_name?.toLowerCase() === c.class_name?.toLowerCase() && r.status === 'approved').length;
                    return (
                      <div
                        key={c.id}
                        className="card"
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}
                        onClick={() => { setSelectedResultsClass(c.class_name); setResultSearchQuery(''); }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{c.class_name}</strong>
                          <span className="badge badge-primary">{classResultsCount} Records</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                          Approved: {approvedCount} of {classResultsCount}
                        </p>
                        <button
                          onClick={() => { setSelectedResultsClass(c.class_name); setResultSearchQuery(''); }}
                          className="btn-primary"
                          style={{ width: '100%', padding: '6px 12px', fontSize: '0.82rem' }}
                        >
                          View Class Results →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Class List Table of Alphabetically Sorted Unique Students with Search Bar */
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#000000', fontWeight: 800, margin: 0 }}>
                    Class List & Results Publication for {selectedResultsClass}
                  </h3>
                  <div style={{ width: '280px' }}>
                    <input
                      type="text"
                      placeholder="Search student by name or ID..."
                      value={resultSearchQuery}
                      onChange={(e) => setResultSearchQuery(e.target.value)}
                      style={{ padding: '8px 12px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Publication Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudentResults.map((item) => (
                        <tr key={item.stId}>
                          <td><code>{item.stId}</code></td>
                          <td><strong>{item.student_name}</strong></td>
                          <td>{selectedResultsClass}</td>
                          <td>
                            {item.isApproved ? (
                              <span className="badge badge-success">● Published to Student</span>
                            ) : (
                              <span className="badge badge-secondary">● Unapproved / Hidden</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedStudentResultModal({
                                student_id: item.stId,
                                student_name: item.student_name,
                                class_name: selectedResultsClass,
                                subjects: item.studentResults
                              })}
                              className="btn-secondary"
                              style={{ background: '#334155', color: '#fff', padding: '4px 10px', fontSize: '0.78rem' }}
                            >
                              👁️ View Result
                            </button>

                            {!item.isApproved ? (
                              <button
                                onClick={() => handleApproveStudentResults(item.stId)}
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              >
                                Publish Result
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnapproveStudentResults(item.stId)}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Unapprove Result
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {classStudentResults.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                            No student result entries found for {selectedResultsClass}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TEACHERS STAFF */}
        {activeTab === 'teachers' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2>👨‍🏫 Teachers & Faculty Staff</h2>
              <div style={{ width: '280px' }}>
                <input
                  type="text"
                  placeholder="Search teachers by name, email..."
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Assigned Classes</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Account Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => (
                    <tr key={t.id}>
                      <td><code>{t.employee_id}</code></td>
                      <td><strong>{t.full_name || t.profiles?.full_name}</strong></td>
                      <td>{t.email || t.profiles?.email}</td>
                      <td><span className="badge badge-primary">{t.specialization || 'General'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(t.assigned_grades || []).map(cls => (
                            <span key={cls} className="badge badge-success" style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534' }}>{cls}</span>
                          ))}
                          {(!t.assigned_grades || t.assigned_grades.length === 0) && (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {t.status === 'disabled' ? (
                          <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#dc2626' }}>● Disabled</span>
                        ) : t.status === 'approved' ? (
                          <span className="badge badge-success">● Active</span>
                        ) : (
                          <span className="badge badge-secondary">● Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setAssignClassTeacherModal(t);
                            setSelectedTeacherClasses(t.assigned_grades || []);
                          }}
                          className="btn-secondary"
                          style={{ background: '#0f172a', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          ✏️ Assign Classes
                        </button>
                        <button
                          onClick={() => {
                            setResetUserPasswordModal(t);
                            setNewResetPasswordInput('');
                          }}
                          className="btn-secondary"
                          style={{ background: '#d97706', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          🔑 Reset Password
                        </button>
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveTeacher(t.id)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleTeacherStatus(t.id)}
                          style={{
                            background: t.status === 'disabled' ? '#2563eb' : '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {t.status === 'disabled' ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center" style={{ padding: '24px', color: '#64748b' }}>No matching teachers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: STUDENTS REGISTRY */}
        {activeTab === 'students' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2>🎓 Students Registry & Admissions</h2>
              <div style={{ width: '280px' }}>
                <input
                  type="text"
                  placeholder="Search students by name, ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admission Number</th>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Account Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id}>
                      <td><code>{stu.admission_number}</code></td>
                      <td><code>{stu.student_id}</code></td>
                      <td><strong>{stu.full_name || stu.profiles?.full_name}</strong></td>
                      <td>{stu.email || stu.profiles?.email}</td>
                      <td><span className="badge badge-primary">{stu.class_name || 'JSS 1'}</span></td>
                      <td>
                        {stu.status === 'disabled' ? (
                          <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#dc2626' }}>● Disabled</span>
                        ) : stu.status === 'approved' ? (
                          <span className="badge badge-success">● Active</span>
                        ) : (
                          <span className="badge badge-secondary">● Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setResetUserPasswordModal(stu);
                            setNewResetPasswordInput('');
                          }}
                          className="btn-secondary"
                          style={{ background: '#d97706', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          🔑 Reset Password
                        </button>
                        {stu.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveStudent(stu.id)}
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStudentStatus(stu.id)}
                          style={{
                            background: stu.status === 'disabled' ? '#2563eb' : '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          {stu.status === 'disabled' ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center" style={{ padding: '24px', color: '#64748b' }}>No matching students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2>📢 School Announcements & Notices</h2>
              <button onClick={() => setShowAnnModal(true)} className="btn btn-primary">
                + Create Announcement
              </button>
            </div>

            <div className="announcements-grid">
              {announcements.map((ann) => (
                <div key={ann.id} className="announcement-card">
                  <div className="ann-card-header">
                    <h3>{ann.title}</h3>
                    <span className="audience-tag">{ann.target_audience.toUpperCase()}</span>
                  </div>
                  <p>{ann.content}</p>
                  <div className="ann-card-footer">
                    <small>Published: {new Date(ann.published_at).toLocaleString()}</small>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="btn-danger-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && <p className="empty-text">No announcements published.</p>}
            </div>
          </div>
        )}

        {/* TAB 8: PROFILE SECTION & ADD ADMIN MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2>👤 Administrator Profile & System Governance</h2>
              <span className="badge badge-success">● Active Master Administrator</span>
            </div>

            <div className="admin-profile-grid">
              {/* Left Column: Current Profile Card & Change Password Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ background: '#f8fafc', padding: '20px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 12px' }}>
                    SA
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#0f172a' }}>Dr. Samuel Adebayo</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>School Principal & Master Admin</p>
                  <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Role:</strong> System Administrator<br />
                    <strong>Email:</strong> admin@school.com
                  </div>
                </div>

                {/* Change Admin Password Card */}
                <div className="card" style={{ padding: '20px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0f172a' }}>🔒 Change Your Security Password</h3>
                  <form onSubmit={handleChangeAdminPassword}>
                    <div className="cg-input-group mb-20">
                      <label>Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={adminPasswordForm.currentPassword}
                        onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="cg-form-row mb-20">
                      <div className="cg-input-group">
                        <label>New Password (Min 6 chars)</label>
                        <input
                          type="password"
                          placeholder="New password"
                          value={adminPasswordForm.newPassword}
                          onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="cg-input-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Repeat password"
                          value={adminPasswordForm.confirmPassword}
                          onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ background: '#0f172a', width: '100%' }}>
                      Update Admin Password
                    </button>
                  </form>
                </div>

                {/* School Identity & Profile Configuration Card */}
                {schoolSettings && (
                  <div className="card" style={{ padding: '20px', border: '1px solid #cbd5e1' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0f172a' }}>🏫 School Profile &amp; Institutional Identity</h3>
                    <form onSubmit={handleSaveSchoolSettings}>
                      <div className="cg-input-group mb-20">
                        <label>School Name</label>
                        <input
                          type="text"
                          value={schoolSettings.school_name || ''}
                          onChange={(e) => setSchoolSettings({ ...schoolSettings, school_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="cg-form-row mb-20">
                        <div className="cg-input-group">
                          <label>School Code</label>
                          <input
                            type="text"
                            value={schoolSettings.school_code || ''}
                            onChange={(e) => setSchoolSettings({ ...schoolSettings, school_code: e.target.value })}
                            required
                          />
                        </div>
                        <div className="cg-input-group">
                          <label>Principal Name</label>
                          <input
                            type="text"
                            value={schoolSettings.principal_name || ''}
                            onChange={(e) => setSchoolSettings({ ...schoolSettings, principal_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="cg-input-group mb-20">
                        <label>Campus Address</label>
                        <input
                          type="text"
                          value={schoolSettings.school_address || ''}
                          onChange={(e) => setSchoolSettings({ ...schoolSettings, school_address: e.target.value })}
                        />
                      </div>
                      <div className="cg-form-row mb-20">
                        <div className="cg-input-group">
                          <label>Official Phone</label>
                          <input
                            type="tel"
                            value={schoolSettings.school_phone || ''}
                            onChange={(e) => setSchoolSettings({ ...schoolSettings, school_phone: e.target.value })}
                          />
                        </div>
                        <div className="cg-input-group">
                          <label>Official Email</label>
                          <input
                            type="email"
                            value={schoolSettings.school_email || ''}
                            onChange={(e) => setSchoolSettings({ ...schoolSettings, school_email: e.target.value })}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Save School Settings
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Add New Admin Form & Administrators Roster Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ADD NEW ADMIN CARD */}
                <div className="card" style={{ padding: '24px', border: '1px solid #16a34a', borderRadius: '10px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                      ➕ Appoint & Add New School Administrator
                    </h3>
                    <span className="badge badge-primary">Admin Access Control</span>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: '#166534' }}>
                    <strong>💡 Administrator Authority & Layout Overview:</strong>
                    <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                      <li>Registered administrators gain full access to approve pending student admissions and teacher accounts.</li>
                      <li>Admins can publish class learning plans, release official student report cards, and manage active academic setup sessions.</li>
                      <li>Newly created admins receive an automatically generated <strong>Admin Portal ID</strong> (e.g. <code>108492</code>) for direct Admin Login access.</li>
                    </ul>
                  </div>

                  <form onSubmit={handleCreateAdmin}>
                    <div className="cg-form-row mb-20">
                      <div className="cg-input-group">
                        <label>Administrator Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Mrs. Victoria Williams"
                          value={newAdminForm.full_name}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="cg-input-group">
                        <label>Official Email Address</label>
                        <input
                          type="email"
                          placeholder="vwilliams@school.com"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="cg-form-row mb-20">
                      <div className="cg-input-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1 555-0198"
                          value={newAdminForm.phone}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="cg-input-group">
                        <label>Administrative Designation / Role</label>
                        <select
                          value={newAdminForm.admin_title}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, admin_title: e.target.value })}
                          className="cg-select"
                        >
                          <option value="School Principal & System Admin">School Principal & System Admin</option>
                          <option value="Vice Principal (Academic Affairs)">Vice Principal (Academic Affairs)</option>
                          <option value="School Registrar & Admissions Director">School Registrar & Admissions Director</option>
                          <option value="Bursar & Financial Administrator">Bursar & Financial Administrator</option>
                          <option value="IT System Administrator">IT System Administrator</option>
                        </select>
                      </div>
                    </div>

                    <div className="cg-form-row mb-20">
                      <div className="cg-input-group">
                        <label>Security Access Password (Min 6 chars)</label>
                        <input
                          type="password"
                          placeholder="Assign password"
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="cg-input-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Repeat password"
                          value={newAdminForm.confirm_password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, confirm_password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                      + Appoint & Register School Administrator
                    </button>
                  </form>
                </div>

                {/* CURRENT ADMINISTRATORS ROSTER */}
                <div className="card" style={{ padding: '24px', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                    👑 Registered School Administrators Roster ({adminsList.length})
                  </h3>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Admin ID</th>
                          <th>Full Name</th>
                          <th>Role Designation</th>
                          <th>Email & Contact</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminsList.map((admin) => (
                          <tr key={admin.id}>
                            <td><code>{admin.student_id || '000000'}</code></td>
                            <td><strong>{admin.full_name}</strong></td>
                            <td><span className="badge badge-primary">{admin.admin_title || 'System Administrator'}</span></td>
                            <td>
                              <div>{admin.email}</div>
                              <small style={{ color: '#64748b' }}>{admin.phone || 'N/A'}</small>
                            </td>
                            <td><span className="badge badge-success">● Active Admin</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CURRICULUM REVIEW */}
        {activeTab === 'curriculum' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <div>
                <h2>📋 Curriculum Review & Approval Queue</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Select a class to view, edit, and publish curriculum plans for that class only.
                </p>
              </div>
              {selectedCurriculumClass && (
                <button onClick={() => setSelectedCurriculumClass(null)} className="btn btn-secondary">
                  ← Back to All Class Cards
                </button>
              )}
            </div>

            {!selectedCurriculumClass ? (
              /* Class Cards Display showing uploading teacher name */
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, marginBottom: '16px' }}>School Classes Roster</h3>
                <div className="stats-grid-responsive">
                  {classes.map((c) => {
                    const classSubmissions = curriculumList.filter(item => item.grade_level?.toLowerCase() === c.class_name?.toLowerCase());
                    const classCurrCount = classSubmissions.length;
                    const pendingCount = classSubmissions.filter(item => item.status !== 'approved').length;
                    const teacherName = classSubmissions[0]?.submitted_by || 'Dr. John Doe (Faculty)';

                    return (
                      <div
                        key={c.id}
                        className="card"
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}
                        onClick={() => setSelectedCurriculumClass(c.class_name)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{c.class_name}</strong>
                          <span className="badge badge-primary">{classCurrCount} Plans</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, margin: '4px 0 6px' }}>
                          👨‍🏫 Teacher: {teacherName}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                          {pendingCount > 0 ? `⚠️ ${pendingCount} pending review` : '✓ All plans published'}
                        </p>
                        <button
                          onClick={() => setSelectedCurriculumClass(c.class_name)}
                          className="btn-primary"
                          style={{ width: '100%', padding: '6px 12px', fontSize: '0.82rem' }}
                        >
                          View Curriculum Table →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Specific Class Curriculum Table with Edit under Actions and Publish button at bottom */
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#000000', fontWeight: 800, marginBottom: '12px' }}>
                  Curriculum Plans for {selectedCurriculumClass}
                </h3>
                <div className="table-responsive mb-20">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Term</th>
                        <th>Week</th>
                        <th>Topic & Objectives</th>
                        <th>Submitted By</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curriculumList.filter(c => c.grade_level?.toLowerCase() === selectedCurriculumClass.toLowerCase()).map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.subject_name}</strong></td>
                          <td>{c.term}</td>
                          <td>Week {c.week_number}</td>
                          <td>
                            <strong>{c.topic}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.learning_objectives}</div>
                          </td>
                          <td>{c.submitted_by || 'Teacher'}</td>
                          <td>
                            {c.status === 'approved' ? (
                              <span className="badge badge-success">● Published</span>
                            ) : (
                              <span className="badge badge-secondary">● Pending Review</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {c.status !== 'approved' && (
                              <button
                                onClick={() => handleApproveCurriculum(c.id)}
                                className="btn-primary"
                                style={{ background: '#16a34a', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, marginRight: '6px' }}
                              >
                                ✓ Approve
                              </button>
                            )}
                            <button
                              onClick={() => setEditingCurriculumModal(c)}
                              className="btn-secondary"
                              style={{ background: '#334155', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {curriculumList.filter(c => c.grade_level?.toLowerCase() === selectedCurriculumClass.toLowerCase()).length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                            No curriculum plans submitted for {selectedCurriculumClass} yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Right: Publish Curriculum for Students Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handlePublishClassCurriculum(selectedCurriculumClass)}
                    className="btn-primary"
                    style={{ padding: '12px 24px', fontSize: '1rem' }}
                  >
                    Publish Curriculum for Students ({curriculumList.filter(c => c.grade_level?.toLowerCase() === selectedCurriculumClass.toLowerCase()).length} items)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ASSIGN CLASSES TO TEACHER */}
        {assignClassTeacherModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '560px' }}>
              <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 6px' }}>
                ✏️ Assign Teaching Classes for {assignClassTeacherModal.full_name || assignClassTeacherModal.profiles?.full_name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                Employee ID: <code>{assignClassTeacherModal.employee_id}</code> | Specialization: {assignClassTeacherModal.specialization || 'General'}
              </p>

              <form onSubmit={handleSaveAssignedClasses}>
                <div className="cg-input-group mb-20">
                  <label style={{ color: '#0f172a', fontWeight: 700 }}>Select Classes Assigned to this Teacher:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '8px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {classes.map((cls) => {
                      const isChecked = selectedTeacherClasses.includes(cls.class_name);
                      return (
                        <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTeacherClasses([...selectedTeacherClasses, cls.class_name]);
                              } else {
                                setSelectedTeacherClasses(selectedTeacherClasses.filter(c => c !== cls.class_name));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          {cls.class_name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setAssignClassTeacherModal(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#16a34a' }}>
                    Save Class Assignments
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADMIN RESET USER PASSWORD */}
        {resetUserPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
              <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 6px' }}>
                🔑 Reset Password for {resetUserPasswordModal.full_name || resetUserPasswordModal.profiles?.full_name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                User Portal ID: <code>{resetUserPasswordModal.student_id || resetUserPasswordModal.employee_id}</code> | Role: {resetUserPasswordModal.role || (resetUserPasswordModal.student_id ? 'Student' : 'Teacher')}
              </p>

              <form onSubmit={handleAdminResetUserPassword}>
                <div className="cg-input-group mb-20">
                  <label style={{ color: '#0f172a', fontWeight: 700 }}>Enter New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newResetPasswordInput}
                    onChange={(e) => setNewResetPasswordInput(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setResetUserPasswordModal(null);
                      setNewResetPasswordInput('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#d97706' }}>
                    Save New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE ANNOUNCEMENT */}
        {showAnnModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3 style={{ color: '#000000', fontWeight: 800 }}>Post School Announcement</h3>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="cg-input-group mb-20">
                  <label>Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Term Progress Reviews & Open Day"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    required
                  />
                </div>
                <div className="cg-input-group mb-20">
                  <label>Target Audience</label>
                  <select
                    value={newAnnouncement.target_audience}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}
                    className="cg-select"
                  >
                    <option value="all">Everyone (All Portal Users)</option>
                    <option value="student">Students Only</option>
                    <option value="teacher">Teachers / Staff Only</option>
                  </select>
                </div>
                <div className="cg-input-group mb-20">
                  <label>Announcement Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write announcement text here..."
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAnnModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Publish Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT CURRICULUM PLAN */}
        {editingCurriculumModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3 style={{ color: '#000000', fontWeight: 800 }}>Edit Curriculum Plan</h3>
              <form onSubmit={handleUpdateCurriculum}>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Grade Level</label>
                    <input
                      type="text"
                      value={editingCurriculumModal.grade_level}
                      onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, grade_level: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Subject Name</label>
                    <input
                      type="text"
                      value={editingCurriculumModal.subject_name}
                      onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, subject_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Term</label>
                    <input
                      type="text"
                      value={editingCurriculumModal.term}
                      onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, term: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Week Number</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editingCurriculumModal.week_number}
                      onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, week_number: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="cg-input-group mb-20">
                  <label>Topic</label>
                  <input
                    type="text"
                    value={editingCurriculumModal.topic}
                    onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="cg-input-group mb-20">
                  <label>Learning Objectives</label>
                  <textarea
                    rows={3}
                    value={editingCurriculumModal.learning_objectives}
                    onChange={(e) => setEditingCurriculumModal({ ...editingCurriculumModal, learning_objectives: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setEditingCurriculumModal(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Curriculum Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW STUDENT DETAILED RESULT BREAKDOWN */}
        {selectedStudentResultModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '650px' }}>
              <div className="card-header-flex">
                <h3 style={{ color: '#000000', fontWeight: 800, margin: 0 }}>
                  Official Report Card Preview for {selectedStudentResultModal.student_name}
                </h3>
                <span className="badge badge-primary">{selectedStudentResultModal.class_name}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                Student ID: <code>{selectedStudentResultModal.student_id}</code>
              </p>

              <div className="table-responsive mb-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>CA / 40</th>
                      <th>Exam / 60</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentResultModal.subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td><strong>{sub.subject_name}</strong></td>
                        <td>{sub.ca_score}</td>
                        <td>{sub.exam_score}</td>
                        <td><strong>{sub.total_score}</strong></td>
                        <td><span className="badge badge-primary">{sub.grade}</span></td>
                        <td>{sub.remark || 'Pass'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setSelectedStudentResultModal(null)}
                  className="btn btn-secondary"
                >
                  Close Preview
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveStudentResults(selectedStudentResultModal.student_id);
                      setSelectedStudentResultModal(null);
                    }}
                    className="btn-primary"
                  >
                    Publish All Results
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUnapproveStudentResults(selectedStudentResultModal.student_id);
                      setSelectedStudentResultModal(null);
                    }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Unapprove / Hide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Class Modal */}
        {showClassModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add New Class</h3>
              <form onSubmit={handleCreateClass}>
                <div className="cg-input-group mb-20">
                  <label>Class Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Primary 3"
                    value={newClass.class_name}
                    onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                    required
                  />
                </div>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Class Code</label>
                    <input
                      type="text"
                      placeholder="e.g. PRM3"
                      value={newClass.class_code}
                      onChange={(e) => setNewClass({ ...newClass, class_code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Grade Level</label>
                    <select
                      value={newClass.class_level}
                      onChange={(e) => setNewClass({ ...newClass, class_level: e.target.value })}
                      className="cg-select"
                    >
                      <option value="Nursery">Nursery</option>
                      <option value="Primary">Primary</option>
                      <option value="Junior Secondary">Junior Secondary</option>
                    </select>
                  </div>
                </div>
                <div className="cg-input-group mb-20">
                  <label>Classroom Capacity (Seats)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: Number(e.target.value) || 35 })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowClassModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Class</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Subject Modal */}
        {showSubjectModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add New Subject</h3>
              <form onSubmit={handleCreateSubject}>
                <div className="cg-input-group mb-20">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Agricultural Science"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                    required
                  />
                </div>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g. AGRIC"
                      value={newSubject.subject_code}
                      onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Classification</label>
                    <select
                      value={newSubject.is_core_subject ? 'core' : 'elective'}
                      onChange={(e) => setNewSubject({ ...newSubject, is_core_subject: e.target.value === 'core' })}
                      className="cg-select"
                    >
                      <option value="core">Core Subject (Compulsory)</option>
                      <option value="elective">Elective Subject</option>
                    </select>
                  </div>
                </div>
                <div className="cg-input-group mb-20">
                  <label>Description &amp; Syllabus Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of subject scope..."
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Subject</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Academic Setup Modal */}
        {showSessionModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add New Academic Setup</h3>
              <form onSubmit={handleCreateSession}>
                <div className="form-group">
                  <label>Session Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 / 2027"
                    value={newSession.session_name}
                    onChange={(e) => setNewSession({ ...newSession, session_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newSession.start_date}
                    onChange={(e) => setNewSession({ ...newSession, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newSession.end_date}
                    onChange={(e) => setNewSession({ ...newSession, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowSessionModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Setup</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;