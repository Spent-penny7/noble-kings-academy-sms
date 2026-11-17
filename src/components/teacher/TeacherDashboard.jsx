import { useState, useEffect } from 'react';
import db from '../../supabase/client';

function TeacherDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tabLoading, setTabLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const switchTab = (tabName) => {
    if (activeTab === tabName) return;
    setTabLoading(true);
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    setTimeout(() => setTabLoading(false), 220);
  };
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [allCurriculum, setAllCurriculum] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Class Result Entry State
  const [selectedClass, setSelectedClass] = useState('Primary 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Subject Score Entry Rows for the selected student (+ Add Subject & row delete support)
  const [subjectRows, setSubjectRows] = useState([
    { subject_name: 'Mathematics', ca_1: 8, ca_2: 9, ca_3: 9, exam: 55 },
    { subject_name: 'English Language', ca_1: 7, ca_2: 8, ca_3: 9, exam: 52 },
    { subject_name: 'General Science', ca_1: 8, ca_2: 8, ca_3: 8, exam: 50 }
  ]);
  const [activeSubjectMenuIndex, setActiveSubjectMenuIndex] = useState(null);

  // Staged class results ready to upload for approval (One row per student, sorted alphabetically)
  const [stagedResults, setStagedResults] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Curriculum Form & Staged Submission State
  const [newCurr, setNewCurr] = useState({
    grade_level: 'Primary 1',
    subject_name: 'Mathematics',
    term: 'Third term',
    week_number: 1,
    topic: '',
    learning_objectives: ''
  });
  const [stagedCurriculum, setStagedCurriculum] = useState([]);
  const [activeCurrMenuId, setActiveCurrMenuId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTeacher() {
      try {
        const { user } = await db.getCurrentUser();
        if (user) {
          const [
            profileRes,
            teacherRes,
            classesRes,
            studentsRes,
            resultsRes,
            currRes,
            annRes,
            sessionRes,
            subjectsRes
          ] = await Promise.all([
            db.getProfile(user.id),
            db.getTeacherByUserId(user.id),
            db.getClasses(),
            db.getStudents(),
            db.getAllResults(),
            db.getAllCurriculum(),
            db.getAnnouncements('teacher'),
            db.getCurrentSession(),
            db.getSubjects()
          ]);

          if (!isMounted) return;
          if (sessionRes?.data) setCurrentSession(sessionRes.data);
          if (subjectsRes?.data) {
            setAvailableSubjects(subjectsRes.data);
            if (subjectsRes.data.length > 0) {
              setNewCurr(prev => ({ ...prev, subject_name: subjectsRes.data[0].subject_name }));
            }
          }

          const assignedGrades = Array.isArray(teacherRes?.data?.assigned_grades)
            ? teacherRes.data.assigned_grades
            : ['Primary 1', 'Primary 2'];

          setTeacherInfo({
            full_name: profileRes?.data?.full_name || teacherRes?.data?.full_name || 'Dr. John Doe',
            employee_id: teacherRes?.data?.employee_id || '200001',
            qualification: teacherRes?.data?.qualification || 'M.Sc Mathematics',
            specialization: teacherRes?.data?.specialization || 'Mathematics',
            assigned_grades: assignedGrades
          });

          if (classesRes.data) {
            const teacherClasses = classesRes.data.filter(c => assignedGrades.includes(c.class_name));
            setClasses(teacherClasses);
            if (teacherClasses.length > 0) {
              setSelectedClass(teacherClasses[0].class_name);
              setNewCurr(prev => ({ ...prev, grade_level: teacherClasses[0].class_name }));
            } else {
              setSelectedClass('');
              setNewCurr(prev => ({ ...prev, grade_level: '' }));
            }
          }
          if (studentsRes.data) setStudentsList(studentsRes.data);
          if (resultsRes.data) setAllResults(resultsRes.data);
          if (currRes.data) setAllCurriculum(currRes.data);
          if (annRes.data) setAnnouncements(annRes.data);
        }
      } catch (err) {
        console.error('Error loading teacher dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTeacher();
    return () => {
      isMounted = false;
    };
  }, []);

  const showNotice = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  // Filter students strictly by selected class and search query
  const filteredStudents = studentsList.filter((st) => {
    const stClass = st.class_name || 'Primary 1';
    const matchesClass = stClass.toLowerCase() === selectedClass.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (st.full_name || st.profiles?.full_name || '').toLowerCase().includes(query) ||
      (st.student_id || '').toLowerCase().includes(query);
    return matchesClass && matchesSearch;
  });

  const handleUpdateSubjectRow = (index, field, value) => {
    const updated = [...subjectRows];
    updated[index][field] = value;
    setSubjectRows(updated);
  };

  const handleAddSubjectRow = () => {
    const defaultSubject = availableSubjects.length > 0 ? availableSubjects[0].subject_name : 'General Subject';
    setSubjectRows([...subjectRows, { subject_name: defaultSubject, ca_1: 5, ca_2: 5, ca_3: 5, exam: 40 }]);
    showNotice('New subject row added.');
  };

  const handleDeleteSubjectRow = (index) => {
    if (subjectRows.length <= 1) {
      showNotice('You must have at least one subject entry row.', 'error');
      return;
    }
    setSubjectRows(subjectRows.filter((_, idx) => idx !== index));
    setActiveSubjectMenuIndex(null);
    showNotice('Subject row deleted.');
  };

  const handleAddStudentResultToStage = () => {
    if (!selectedStudent) {
      showNotice('Please search and select a student from your class roster first.', 'error');
      return;
    }

    const studentId = selectedStudent.student_id || selectedStudent.id;
    const studentName = selectedStudent.full_name || selectedStudent.profiles?.full_name || 'Student';

    const studentEntry = {
      id: `staged-${studentId}`,
      student_id: studentId,
      student_name: studentName,
      class_name: selectedClass,
      subjects: subjectRows.map(row => {
        const ca1 = Number(row.ca_1) || 0;
        const ca2 = Number(row.ca_2) || 0;
        const ca3 = Number(row.ca_3) || 0;
        const exam = Number(row.exam) || 0;
        const total = ca1 + ca2 + ca3 + exam;
        let grade = 'F';
        if (total >= 80) grade = 'A';
        else if (total >= 70) grade = 'B';
        else if (total >= 60) grade = 'C';
        else if (total >= 50) grade = 'D';

        return {
          subject_name: row.subject_name || 'General Subject',
          ca_score: ca1 + ca2 + ca3,
          exam_score: exam,
          total_score: total,
          grade,
          status: total >= 50 ? 'Pass' : 'Fail'
        };
      })
    };

    const filteredExisting = stagedResults.filter((existing) => existing.student_id !== studentId);
    const combined = [...filteredExisting, studentEntry].sort((a, b) =>
      a.student_name.localeCompare(b.student_name)
    );

    setStagedResults(combined);
    showNotice(`Added result entry for ${studentName}`);
    setSelectedStudent(null);
    setSearchQuery('');
  };

  const handleRemoveStagedItem = (id) => {
    setStagedResults(stagedResults.filter(r => r.id !== id));
    setActiveMenuId(null);
    showNotice('Student result entry removed from queue.');
  };

  const handleEditStagedItem = (item) => {
    setSelectedStudent({
      student_id: item.student_id,
      full_name: item.student_name,
      class_name: item.class_name
    });
    setSelectedClass(item.class_name);
    if (item.subjects && item.subjects.length > 0) {
      setSubjectRows(item.subjects.map(s => ({
        subject_name: s.subject_name,
        ca_1: s.ca_score,
        ca_2: 0,
        ca_3: 0,
        exam: s.exam_score
      })));
    }
    setStagedResults(stagedResults.filter(r => r.id !== item.id));
    setActiveMenuId(null);
    showNotice(`Loaded ${item.student_name} back to entry table for editing.`);
  };

  const handleUploadClassResultForApproval = async () => {
    if (stagedResults.length === 0) {
      showNotice('No student results added to queue for approval.', 'error');
      return;
    }

    try {
      for (const item of stagedResults) {
        for (const sub of item.subjects) {
          await db.submitResult({
            student_id: item.student_id,
            student_name: item.student_name,
            class_name: item.class_name,
            subject_name: sub.subject_name,
            ca_score: sub.ca_score,
            exam_score: sub.exam_score,
            total_score: sub.total_score,
            grade: sub.grade,
            remark: sub.total_score >= 50 ? 'Pass' : 'Fail',
            status: 'pending'
          });
        }
      }
      const refreshed = await db.getAllResults();
      if (refreshed.data) setAllResults(refreshed.data);
      setStagedResults([]);
      showNotice('✓ Class results submitted to Admin queue. They will appear on student portals after administrative approval.', 'success');
      setActiveTab('overview');
    } catch (err) {
      showNotice('Failed to upload class results: ' + err.message, 'error');
    }
  };

  // Curriculum Staging & Submission Handlers
  const handleAddCurriculumToStage = (e) => {
    e.preventDefault();
    if (!newCurr.topic || !newCurr.subject_name) {
      showNotice('Please fill in the subject and topic.', 'error');
      return;
    }

    const currItem = {
      id: 'curr-staged-' + Date.now(),
      ...newCurr,
      submitted_by: teacherInfo?.full_name,
      status: 'pending'
    };

    setStagedCurriculum([...stagedCurriculum, currItem]);
    showNotice('Curriculum plan added to submission queue.');
    setNewCurr({
      grade_level: classes[0]?.class_name || 'Primary 1',
      subject_name: 'Mathematics',
      term: 'Third term',
      week_number: (newCurr.week_number || 1) + 1,
      topic: '',
      learning_objectives: ''
    });
  };

  const handleRemoveStagedCurriculum = (id) => {
    setStagedCurriculum(stagedCurriculum.filter(c => c.id !== id));
    setActiveCurrMenuId(null);
    showNotice('Curriculum plan removed from queue.');
  };

  const handleUploadCurriculumForApproval = async () => {
    if (stagedCurriculum.length === 0) {
      showNotice('No curriculum plans in queue for approval.', 'error');
      return;
    }

    try {
      for (const item of stagedCurriculum) {
        await db.submitCurriculum(item);
      }
      const refreshed = await db.getAllCurriculum();
      if (refreshed.data) setAllCurriculum(refreshed.data);
      setStagedCurriculum([]);
      showNotice('✓ Curriculum plans submitted to Admin queue. They will appear on student portals after administrative approval.', 'success');
      setActiveTab('overview');
    } catch (err) {
      showNotice('Failed to submit curriculum: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Teacher Workspace...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Drawer */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <img src="/images/school-logo.png" alt="Noble Kings Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="brand-info">
            <h2>Noble Kings</h2>
            <span className="role-badge" style={{ background: '#2563eb', color: '#fff' }}>
              Teacher workspace
            </span>
          </div>
          <button className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
            ✕
          </button>
        </div>

        <div style={{ padding: '8px 16px 12px' }}>
          {/* Active Session & Term Badge - Higher Vertically */}
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 10px', fontSize: '0.78rem', color: '#166534', marginBottom: '8px' }}>
            <strong>📅 {currentSession?.session_name || '2024 - 2025'} Session</strong><br />
            Term: <strong>{currentSession?.term || currentSession?.active_term || 'Third Term'}</strong><br />
            <span style={{ fontSize: '0.7rem', color: '#15803d' }}>Noble Kings Academy</span>
          </div>

          <button onClick={onLogout} className="btn-logout" style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
            🚪 Sign Out
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => switchTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => switchTab('results')}
          >
            📈 Student Results
          </button>
          <button
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => switchTab('curriculum')}
          >
            📚 Curriculum
          </button>
          <button
            className={`nav-item ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => switchTab('classes')}
          >
            👨‍🏫 My classes
          </button>
          <button
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => switchTab('announcements')}
          >
            📢 Announcements
          </button>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="main-header">
          <div className="header-title-flex">
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open Menu">
              ☰
            </button>
            <div>
              <span className="workspace-breadcrumb">Teacher workspace / {activeTab}</span>
              <h1 style={{ color: '#000000', fontWeight: 800 }}>
                {activeTab === 'results' ? 'Student Results Management' : activeTab === 'curriculum' ? 'Curriculum Management' : `Good morning, ${teacherInfo?.full_name.split(' ')[0]}`}
              </h1>
              <p className="session-indicator">Noble Kings Academy • Academic Session: {currentSession?.session_name || '2024 - 2025'}</p>
            </div>
          </div>
          <div className="header-actions">
            <span className="user-greeting" style={{ border: '2px solid #cbd5e1', background: '#f8fafc', color: '#000000' }}>
              👤 {teacherInfo?.full_name} | {teacherInfo?.specialization}
            </span>
            <button
              onClick={onLogout}
              className="btn-logout-header"
              title="Sign Out of Portal"
            >
              🚪 Sign Out
            </button>
          </div>
        </header>

        {notification.message && (
          <div className={`notification-banner ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Tab Transition Loading Bar */}
        {tabLoading && (
          <div className="tab-transition-overlay">
            <div className="tab-transition-bar"></div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">📚</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{classes.length}</h3>
                  <p style={{ color: '#475569' }}>Assigned classes</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">🎓</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{studentsList.length}</h3>
                  <p style={{ color: '#475569' }}>Registered Students</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">📋</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{allCurriculum.length}</h3>
                  <p style={{ color: '#475569' }}>Curriculum Plans</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">✍️</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{allResults.length}</h3>
                  <p style={{ color: '#475569' }}>Submitted Results</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-grid mb-20">
              <div className="card">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Manage Student Results</h2>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: '8px 0 16px' }}>
                  Search students in your assigned class and enter subject CA & exam scores.
                </p>
                <button onClick={() => setActiveTab('results')} className="btn-primary">
                  Go to Result Management →
                </button>
              </div>

              <div className="card">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Submit Curriculum Plan</h2>
                <p style={{ color: '#475569', fontSize: '0.9rem', margin: '8px 0 16px' }}>
                  Propose lesson plans and learning objectives for admin review.
                </p>
                <button onClick={() => setActiveTab('curriculum')} className="btn-primary">
                  Go to Curriculum →
                </button>
              </div>
            </div>

            {/* My Classes Cards */}
            <div className="card mb-20">
              <div className="card-header-flex">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>My classes</h2>
                <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Assigned Roster →</span>
              </div>
              <div className="stats-grid" style={{ margin: 0 }}>
                {classes.map((cls) => (
                  <div key={cls.id} className="card" style={{ background: '#f8fafc', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{cls.class_name}</strong>
                      <span className="badge badge-primary">{cls.capacity} students</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
                      {teacherInfo?.specialization} • Level: {cls.class_level}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>● Assigned Class</span>
                      <button onClick={() => { setSelectedClass(cls.class_name); setActiveTab('results'); }} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Enter Scores
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESULTS MANAGEMENT */}
        {activeTab === 'results' && (
          <div className="tab-content">
            <div className="card mb-20" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div className="card-header-flex">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Student Result Entry & Gradebook</h2>
                <span className="badge badge-success">Assigned Class Roster</span>
              </div>

              {/* Class Selector & Search Bar */}
              <div className="cg-form-row mb-20" style={{ alignItems: 'flex-end' }}>
                <div className="cg-input-group">
                  <label>Select Assigned Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedStudent(null);
                      setSearchQuery('');
                    }}
                    className="cg-select"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.class_name}>
                        {c.class_name} ({c.class_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cg-input-group">
                  <label>Search Student in {selectedClass} Only</label>
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Student Search Suggestions */}
              {searchQuery && (
                <div className="card mb-20" style={{ background: '#ffffff', maxHeight: '180px', overflowY: 'auto', padding: '10px' }}>
                  <small style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Students in {selectedClass}:</small>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSelectedStudent(st);
                          setSearchQuery('');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          background: selectedStudent?.id === st.id ? '#eff6ff' : '#f8fafc',
                          border: '1px solid #e2e8f0',
                          marginBottom: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong>{st.full_name || st.profiles?.full_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '10px' }}>ID: {st.student_id}</span>
                        </div>
                        <span className="badge badge-primary">Select Student</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No students found matching &ldquo;{searchQuery}&rdquo; in {selectedClass}.</p>
                  )}
                </div>
              )}

              {selectedStudent && (
                <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Active Student Selected: <strong>{selectedStudent.full_name || selectedStudent.profiles?.full_name}</strong> (ID: {selectedStudent.student_id})</span>
                  <button type="button" onClick={() => setSelectedStudent(null)} className="btn-danger-sm">Change</button>
                </div>
              )}

              {/* Subject Score Entry Table */}
              <div className="card-header-flex" style={{ marginTop: '16px', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, margin: 0 }}>
                  Subject Score Entry Table {selectedStudent ? `for ${selectedStudent.full_name || selectedStudent.profiles?.full_name}` : '(Select a student above)'}
                </h3>
                <button
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="btn-secondary"
                  style={{ background: '#2563eb', color: '#ffffff', fontWeight: 600, padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  + Add Subject
                </button>
              </div>

              <div className="table-responsive mb-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>1st CA (10)</th>
                      <th>2nd CA (10)</th>
                      <th>3rd CA (10)</th>
                      <th>Exam (70)</th>
                      <th>Total (100)</th>
                      <th>Grade</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRows.map((row, idx) => {
                      const ca1 = Number(row.ca_1) || 0;
                      const ca2 = Number(row.ca_2) || 0;
                      const ca3 = Number(row.ca_3) || 0;
                      const exam = Number(row.exam) || 0;
                      const total = ca1 + ca2 + ca3 + exam;
                      let grade = 'F';
                      if (total >= 80) grade = 'A';
                      else if (total >= 70) grade = 'B';
                      else if (total >= 60) grade = 'C';
                      else if (total >= 50) grade = 'D';

                      return (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              list="teacher-subjects-datalist"
                              value={row.subject_name}
                              onChange={(e) => handleUpdateSubjectRow(idx, 'subject_name', e.target.value)}
                              style={{ padding: '6px 10px', width: '150px' }}
                            />
                            <datalist id="teacher-subjects-datalist">
                              {availableSubjects.map((s) => (
                                <option key={s.id} value={s.subject_name} />
                              ))}
                            </datalist>
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.ca_1}
                              onChange={(e) => handleUpdateSubjectRow(idx, 'ca_1', e.target.value)}
                              style={{ padding: '6px 10px', width: '70px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.ca_2}
                              onChange={(e) => handleUpdateSubjectRow(idx, 'ca_2', e.target.value)}
                              style={{ padding: '6px 10px', width: '70px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.ca_3}
                              onChange={(e) => handleUpdateSubjectRow(idx, 'ca_3', e.target.value)}
                              style={{ padding: '6px 10px', width: '70px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={70}
                              value={row.exam}
                              onChange={(e) => handleUpdateSubjectRow(idx, 'exam', e.target.value)}
                              style={{ padding: '6px 10px', width: '80px' }}
                            />
                          </td>
                          <td><strong>{total}</strong></td>
                          <td><span className="badge badge-primary">{grade}</span></td>
                          <td style={{ textAlign: 'right', position: 'relative' }}>
                            <button
                              type="button"
                              onClick={() => setActiveSubjectMenuIndex(activeSubjectMenuIndex === idx ? null : idx)}
                              style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '2px 8px', color: '#000000', fontWeight: '900' }}
                              title="Actions"
                            >
                              ⋮
                            </button>
                            {activeSubjectMenuIndex === idx && (
                              <div style={{
                                position: 'absolute',
                                right: '10px',
                                top: '36px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                width: '110px',
                                textAlign: 'left'
                              }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubjectRow(idx)}
                                  style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left', fontWeight: 600 }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Student Button */}
              <button
                type="button"
                onClick={handleAddStudentResultToStage}
                className="btn-secondary"
                style={{ background: '#1e293b', color: '#ffffff', fontWeight: 600, padding: '10px 20px' }}
              >
                + Add Student Result to Queue
              </button>
            </div>

            {/* Student Result Submissions Queue */}
            <div className="card mb-20">
              <div className="card-header-flex">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Student Result Submissions Queue ({stagedResults.length} students ready)</h2>
              </div>

              <div className="table-responsive mb-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedResults.map((sr) => (
                      <tr key={sr.id}>
                        <td><code>{sr.student_id}</code></td>
                        <td><strong>{sr.student_name}</strong></td>
                        <td>{sr.class_name}</td>
                        <td style={{ textAlign: 'right', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === sr.id ? null : sr.id)}
                            style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '2px 8px', color: '#000000', fontWeight: '900' }}
                            title="Actions"
                          >
                            ⋮
                          </button>
                          {activeMenuId === sr.id && (
                            <div style={{
                              position: 'absolute',
                              right: '10px',
                              top: '36px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              zIndex: 50,
                              width: '110px',
                              textAlign: 'left'
                            }}>
                              <button
                                type="button"
                                onClick={() => handleEditStagedItem(sr)}
                                style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left', color: '#000000' }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedItem(sr.id)}
                                style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {stagedResults.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center" style={{ padding: '20px', color: '#64748b' }}>
                          No students in submission queue yet. Add student results using the table above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Upload Class Result for Approval Button */}
              <button
                type="button"
                onClick={handleUploadClassResultForApproval}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '1rem' }}
                disabled={stagedResults.length === 0}
              >
                Upload Class Result for Approval ({stagedResults.length} students)
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CURRICULUM MANAGEMENT (Table above with three-dots delete and Submit for Approval at bottom right, and Entry form below with + Add Curriculum at bottom left) */}
        {activeTab === 'curriculum' && (
          <div className="tab-content">
            {/* Table Above: Curriculum Management and Submission Queue */}
            <div className="card mb-20" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div className="card-header-flex">
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Curriculum Management & Submission Queue ({stagedCurriculum.length} ready)</h2>
                <span className="badge badge-success">Staging Area</span>
              </div>

              <div className="table-responsive mb-20">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Grade Level</th>
                      <th>Subject</th>
                      <th>Term</th>
                      <th>Week</th>
                      <th>Topic</th>
                      <th>Objectives</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedCurriculum.map((sc) => (
                      <tr key={sc.id}>
                        <td><strong>{sc.grade_level}</strong></td>
                        <td>{sc.subject_name}</td>
                        <td>{sc.term}</td>
                        <td>Week {sc.week_number}</td>
                        <td><strong>{sc.topic}</strong></td>
                        <td style={{ color: '#475569' }}>{sc.learning_objectives}</td>
                        <td><span className="badge badge-secondary">Ready to Submit</span></td>
                        <td style={{ textAlign: 'right', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setActiveCurrMenuId(activeCurrMenuId === sc.id ? null : sc.id)}
                            style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '2px 8px', color: '#000000', fontWeight: '900' }}
                            title="Actions"
                          >
                            ⋮
                          </button>
                          {activeCurrMenuId === sc.id && (
                            <div style={{
                              position: 'absolute',
                              right: '10px',
                              top: '36px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              zIndex: 50,
                              width: '110px',
                              textAlign: 'left'
                            }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveStagedCurriculum(sc.id)}
                                style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left', fontWeight: 600 }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {stagedCurriculum.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                          No curriculum plans added to queue yet. Use the form below to add curriculum.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Right: Submit for Approval Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleUploadCurriculumForApproval}
                  className="btn-primary"
                  style={{ padding: '12px 24px', fontSize: '1rem' }}
                  disabled={stagedCurriculum.length === 0}
                >
                  Submit for Approval ({stagedCurriculum.length} items)
                </button>
              </div>
            </div>

            {/* Curriculum Plan Entry Form Below (+ Add Curriculum at bottom left) */}
            <div className="card mb-20">
              <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 16px' }}>Create Curriculum Plan Entry</h3>
              <form onSubmit={handleAddCurriculumToStage}>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Grade Level</label>
                    <select
                      value={newCurr.grade_level}
                      onChange={(e) => setNewCurr({ ...newCurr, grade_level: e.target.value })}
                      className="cg-select"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.class_name}>{c.class_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cg-input-group">
                    <label>Subject Name</label>
                    {availableSubjects.length > 0 ? (
                      <select
                        value={newCurr.subject_name}
                        onChange={(e) => setNewCurr({ ...newCurr, subject_name: e.target.value })}
                        className="cg-select"
                      >
                        {availableSubjects.map((s) => (
                          <option key={s.id} value={s.subject_name}>{s.subject_name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newCurr.subject_name}
                        onChange={(e) => setNewCurr({ ...newCurr, subject_name: e.target.value })}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Term</label>
                    <input
                      type="text"
                      value={newCurr.term}
                      onChange={(e) => setNewCurr({ ...newCurr, term: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label>Week Number</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newCurr.week_number}
                      onChange={(e) => setNewCurr({ ...newCurr, week_number: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="cg-input-group mb-20">
                  <label>Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Introduction to Fractions"
                    value={newCurr.topic}
                    onChange={(e) => setNewCurr({ ...newCurr, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="cg-input-group mb-20">
                  <label>Learning Objectives</label>
                  <textarea
                    rows={3}
                    placeholder="Students will be able to..."
                    value={newCurr.learning_objectives}
                    onChange={(e) => setNewCurr({ ...newCurr, learning_objectives: e.target.value })}
                    required
                  />
                </div>

                {/* Bottom Left: + Add Curriculum Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    type="submit"
                    className="btn-secondary"
                    style={{ background: '#1e293b', color: '#ffffff', fontWeight: 600, padding: '10px 24px' }}
                  >
                    + Add Curriculum
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSES */}
        {activeTab === 'classes' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <h2 style={{ color: '#000000', fontWeight: 800 }}>My Assigned Classes</h2>
            </div>
            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Class Code</th>
                    <th>Level</th>
                    <th>Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id}>
                      <td><strong>{cls.class_name}</strong></td>
                      <td><code>{cls.class_code}</code></td>
                      <td>{cls.class_level}</td>
                      <td>{cls.capacity} students</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="tab-content card">
            <h2 style={{ color: '#000000', fontWeight: 800 }}>📢 School Announcements</h2>
            <div className="announcements-list" style={{ marginTop: '20px' }}>
              {announcements.map((ann) => (
                <div key={ann.id} className="announcement-item" style={{ borderLeftColor: '#2563eb' }}>
                  <div className="ann-header">
                    <h4>{ann.title}</h4>
                    <span className="audience-tag">NOTICE</span>
                  </div>
                  <p>{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;