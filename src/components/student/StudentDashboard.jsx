import { useState, useEffect } from 'react';
import db from '../../supabase/client';

function StudentDashboard({ onLogout }) {
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
  const [studentInfo, setStudentInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      try {
        const currentUserRes = await db.getCurrentUser();
        const user = currentUserRes?.user;

        if (user) {
          const profileRes = await db.getProfile(user.id);
          const studentRes = await db.getStudentByUserId(user.id);
          const annRes = await db.getAnnouncements('student');

          if (!isMounted) return;

          const studentId = profileRes?.data?.student_id || user.student_id || studentRes?.data?.student_id || '849201';
          const gradeLevel = profileRes?.data?.class_name || studentRes?.data?.class_name || 'Primary 1';

          // Fetch grade-filtered and admin-approved data
          const [resultsRes, currRes, teachersRes] = await Promise.all([
            db.getResultsForStudent(studentId),
            db.getCurriculumForGrade(gradeLevel),
            db.getTeachersForGrade(gradeLevel)
          ]);

          const mergedInfo = {
            id: user.id,
            full_name: profileRes?.data?.full_name || user.email?.split('@')[0] || 'Jane Smith',
            student_id: studentId,
            admission_number: studentRes?.data?.admission_number || 'ADM-2024-801',
            class_name: gradeLevel,
            email: profileRes?.data?.email || user.email || 'student@noblekingsacademy.edu',
            parent_name: profileRes?.data?.parent_guardian_name || studentRes?.data?.parent_guardian_name || 'Robert Smith',
            parent_phone: profileRes?.data?.parent_guardian_phone || studentRes?.data?.parent_guardian_phone || '+1 555-0987'
          };

          const sessionRes = await db.getCurrentSession();

          setStudentInfo(mergedInfo);
          if (resultsRes.data) setResults(resultsRes.data);
          if (currRes.data) setCurriculum(currRes.data);
          if (teachersRes.data) setTeachers(teachersRes.data);
          if (annRes.data) setAnnouncements(annRes.data);
          if (sessionRes?.data) setCurrentSession(sessionRes.data);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStudentData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownloadReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Student Portal...</p>
      </div>
    );
  }

  const totalMarks = results.reduce((acc, r) => acc + (r.total_score || 0), 0);
  const averageScore = results.length > 0 ? (totalMarks / (results.length * 100)) * 100 : 80.5;

  const renderOfficialReportSheet = (resultsList = results) => {
    const listToUse = resultsList.length > 0 ? resultsList : [
      { id: 1, subject_name: 'Agric Science', ca_1: 5, ca_2: 6, ca_3: 5, ca_4: 10, ca_score: 26, exam_score: 22, total_score: 48, class_max: 90, grade: 'D' },
      { id: 2, subject_name: 'Basic Technology', ca_1: 6, ca_2: 7, ca_3: 7, ca_4: 6, ca_score: 26, exam_score: 26, total_score: 52, class_max: 86, grade: 'C' },
      { id: 3, subject_name: 'Basic Science', ca_1: 5, ca_2: 5, ca_3: 5, ca_4: 10, ca_score: 25, exam_score: 18, total_score: 43, class_max: 90, grade: 'D' },
      { id: 4, subject_name: 'Business Studies', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 9, ca_score: 18, exam_score: 42, total_score: 60, class_max: 96, grade: 'B' },
      { id: 5, subject_name: 'Civic Education', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 9, ca_score: 18, exam_score: 25, total_score: 43, class_max: 99, grade: 'D' },
      { id: 6, subject_name: 'Computer Studies', ca_1: 6, ca_2: 6, ca_3: 5, ca_4: 7, ca_score: 24, exam_score: 20, total_score: 44, class_max: 88, grade: 'D' },
      { id: 7, subject_name: 'Cultural And Creative Art', ca_1: 4, ca_2: 4, ca_3: 4, ca_4: 9, ca_score: 21, exam_score: 30, total_score: 51, class_max: 99, grade: 'C' },
      { id: 8, subject_name: 'English Studies', ca_1: 6, ca_2: 6, ca_3: 6, ca_4: 10, ca_score: 28, exam_score: 28, total_score: 56, class_max: 92, grade: 'C' },
      { id: 9, subject_name: 'French', ca_1: 5, ca_2: 5, ca_3: 6, ca_4: 8, ca_score: 24, exam_score: 31, total_score: 55, class_max: 87, grade: 'C' },
      { id: 10, subject_name: 'History', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 5, ca_score: 14, exam_score: 14, total_score: 28, class_max: 90, grade: 'F' },
      { id: 11, subject_name: 'Home Economics', ca_1: 3, ca_2: 7, ca_3: 6, ca_4: 9, ca_score: 25, exam_score: 51, total_score: 76, class_max: 100, grade: 'B+' },
      { id: 12, subject_name: 'Mathematics', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 5, ca_score: 14, exam_score: 24, total_score: 38, class_max: 85, grade: 'F' },
      { id: 13, subject_name: 'Phonics', ca_1: 6, ca_2: 7, ca_3: 7, ca_4: 7, ca_score: 27, exam_score: 56, total_score: 83, class_max: 99, grade: 'A' },
      { id: 14, subject_name: 'Physical And Health Education', ca_1: 8, ca_2: 10, ca_3: 10, ca_4: 10, ca_score: 38, exam_score: 31, total_score: 69, class_max: 100, grade: 'B' },
      { id: 15, subject_name: 'Religious Studies', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 10, ca_score: 19, exam_score: 21, total_score: 40, class_max: 99, grade: 'D' },
      { id: 16, subject_name: 'Security Education', ca_1: 6, ca_2: 7, ca_3: 7, ca_4: 9, ca_score: 29, exam_score: 38, total_score: 67, class_max: 98, grade: 'B' },
      { id: 17, subject_name: 'Social Studies', ca_1: 3, ca_2: 3, ca_3: 3, ca_4: 7, ca_score: 16, exam_score: 48, total_score: 64, class_max: 95, grade: 'B' }
    ];

    const sumTotal = listToUse.reduce((acc, r) => acc + (r.total_score || 0), 0);
    const avgScore = listToUse.length > 0 ? sumTotal / listToUse.length : 53.94;

    return (
      <div className="official-nkqa-report-sheet">
        {/* Top Header & Letterhead */}
        <div className="nkqa-letterhead">
          <div className="nkqa-logo-col">
            <img src="/images/school-logo.png" alt="N.K.Q.A Crest" className="nkqa-crest-img" />
          </div>
          <div className="nkqa-header-details">
            <h1 className="nkqa-school-title">NOBLE KINGS AND QUEENS ACADEMY</h1>
            <p className="nkqa-address-text">PLOT 25 ROAD D2, ZONE D, BMUKO, DUTSE, ABUJA, F.C.T</p>
            <p className="nkqa-contact-text">
              <span>E-MAIL: noblekingsandqueens11@yahoo.com</span>
              <span>TEL: +2347017372474</span>
            </p>
          </div>
        </div>

        {/* Session & Performance Title Bar */}
        <div className="nkqa-banner-bar">
          <div className="nkqa-session-title">
            {(currentSession?.term || 'SECOND TERM').toUpperCase()} {(currentSession?.session_name || '2025/2026').toUpperCase()} ACADEMIC SESSION
          </div>
          <div className="nkqa-sheet-title">PERFORMANCE RESULT SHEET</div>
        </div>

        {/* Student Metadata Table */}
        <table className="nkqa-meta-table">
          <tbody>
            <tr>
              <td className="meta-label">NAME OF STUDENT</td>
              <td className="meta-val"><strong>{studentInfo?.full_name || 'GBAGU JOY'}</strong></td>
              <td className="meta-label">CLASS</td>
              <td className="meta-val"><strong>{studentInfo?.class_name || 'JSS2'}</strong></td>
              <td className="meta-label">NO. IN CLASS</td>
              <td className="meta-val"><strong>26</strong></td>
              <td className="meta-label">POSITION</td>
              <td className="meta-val"><strong>C</strong></td>
            </tr>
            <tr>
              <td className="meta-label">No of Days School Opened</td>
              <td className="meta-val"><strong>112</strong></td>
              <td className="meta-label">Days Present</td>
              <td className="meta-val"><strong>108</strong></td>
              <td className="meta-label" colSpan={2}>Days Absent</td>
              <td className="meta-val" colSpan={2}><strong>4</strong></td>
            </tr>
          </tbody>
        </table>

        {/* MARKS OBTAINED Main Data Table */}
        <table className="nkqa-marks-table">
          <thead>
            <tr>
              <th rowSpan={2} className="th-subjects">SUBJECTS</th>
              <th colSpan={8} className="th-marks-header">MARKS OBTAINED</th>
              <th rowSpan={2} className="th-grade">GRADE</th>
            </tr>
            <tr>
              <th>1st C.A<br/>10%</th>
              <th>2nd C.A<br/>10%</th>
              <th>3rd C.A<br/>10%</th>
              <th>4th C.A<br/>10%</th>
              <th>C.A<br/>TOTAL</th>
              <th>EXAM<br/>60%</th>
              <th>TOTAL<br/>100%</th>
              <th>CLASS<br/>MAX</th>
            </tr>
          </thead>
          <tbody>
            {listToUse.map((sub, idx) => {
              const ca1 = sub.ca_1 !== undefined ? sub.ca_1 : Math.round((sub.ca_score || 20) * 0.25);
              const ca2 = sub.ca_2 !== undefined ? sub.ca_2 : Math.round((sub.ca_score || 20) * 0.25);
              const ca3 = sub.ca_3 !== undefined ? sub.ca_3 : Math.round((sub.ca_score || 20) * 0.25);
              const ca4 = sub.ca_4 !== undefined ? sub.ca_4 : Math.round((sub.ca_score || 20) * 0.25);
              const caTotal = sub.ca_score !== undefined ? sub.ca_score : (ca1 + ca2 + ca3 + ca4);
              const exam = sub.exam_score || 50;
              const total = sub.total_score || (caTotal + exam);
              const classMax = sub.class_max || 95;
              const grade = sub.grade || (total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'D' : 'F');

              return (
                <tr key={sub.id || idx}>
                  <td className="td-subject-name"><strong>{sub.subject_name}</strong></td>
                  <td>{ca1}</td>
                  <td>{ca2}</td>
                  <td>{ca3}</td>
                  <td>{ca4}</td>
                  <td><strong>{caTotal}</strong></td>
                  <td>{exam}</td>
                  <td><strong>{total}</strong></td>
                  <td>{classMax}</td>
                  <td><strong className="grade-badge">{grade}</strong></td>
                </tr>
              );
            })}

            {/* Summary Footer Rows */}
            <tr className="tr-summary">
              <td colSpan={7} className="text-right"><strong>TOTAL</strong></td>
              <td colSpan={3}><strong>{sumTotal || 917}</strong></td>
            </tr>
            <tr className="tr-summary">
              <td colSpan={7} className="text-right"><strong>AVERAGE</strong></td>
              <td colSpan={3}><strong>{avgScore.toFixed(2)}</strong></td>
            </tr>
            <tr className="tr-summary">
              <td colSpan={7} className="text-right"><strong>CLASS AVG</strong></td>
              <td colSpan={3}><strong>67.96</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Remarks & Signatures Section */}
        <div className="nkqa-remarks-block">
          <div className="remark-row">
            <span className="remark-label">Class Teacher Remark:</span>
            <span className="remark-text">A good result. Keep pushing for greater success!</span>
          </div>
          <div className="signature-flex-row">
            <span>Signature: <span className="sig-line">____________________</span></span>
            <span>Date: <span className="sig-line">____________________</span></span>
          </div>

          <div className="remark-row" style={{ marginTop: '10px' }}>
            <span className="remark-label">Head Teacher's Remark:</span>
            <span className="remark-text">This is a good performance. You are doing your best and that's something to be proud of, {studentInfo?.full_name?.split(' ')[0] || 'Joy'}!</span>
          </div>

          <div className="signature-flex-row">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>signature: <span className="sig-line">____________________</span> Date: <span className="sig-line">____________________</span></span>

              {/* Official Blue Ink Stamp Box */}
              <div className="official-blue-stamp">
                <div className="stamp-title">NOBLE KINGS INT&apos;L ACADEMY</div>
                <div className="stamp-date">DATE: 28/8/26</div>
                <div className="stamp-sign">SIGN: <span className="stamp-sig-line">~~~~~~~~~~~~</span></div>
              </div>
            </div>

            <div className="resumption-box">
              <strong>Resumption Date:</strong> 20th April, 2026
            </div>
          </div>
        </div>

        {/* Grading System Key Line */}
        <div className="nkqa-grading-key">
          GRADING SYSTEM: 90-100=A+, 80-89=A, 70-79=B+, 60-69=B, 50-59=C, 40-49=D, BELOW 40=F
        </div>

        {/* Affective & Psychomotor Evaluation Grid */}
        <div className="nkqa-eval-grid">
          <table className="eval-table">
            <thead>
              <tr>
                <th>AFFECTIVE ABILITY</th>
                <th>GRADE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Punctuality</td><td>5</td></tr>
              <tr><td>Neatness</td><td>4</td></tr>
              <tr><td>Diligence</td><td>4</td></tr>
              <tr><td>Honesty</td><td>4</td></tr>
              <tr><td>Politeness/Respect</td><td>4</td></tr>
              <tr><td>Attentiveness</td><td>3</td></tr>
              <tr><td>Class Participation</td><td>3</td></tr>
              <tr><td>Homework</td><td>3</td></tr>
            </tbody>
          </table>

          <table className="eval-table">
            <thead>
              <tr>
                <th>PSYCHOMOTOR ABILITY</th>
                <th>GRADE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Legibility</td><td>4</td></tr>
              <tr><td>Accuracy</td><td>4</td></tr>
              <tr><td>Dexterity</td><td>4</td></tr>
              <tr><td>Games/Sports</td><td>5</td></tr>
              <tr><td>Handling Of Tools</td><td>4</td></tr>
              <tr><td>Physical Activities</td><td>4</td></tr>
              <tr><td>Drawing/Painting</td><td>4</td></tr>
              <tr><td>MusicSkills</td><td>5</td></tr>
            </tbody>
          </table>
        </div>
        <div className="eval-key-line">
          KEY: EXCELLENT = 5, VERY GOOD = 4, GOOD = 3, FAIR = 2
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
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
              Student workspace
            </span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>
        </div>

        {/* Student ID Highlight in Sidebar */}
        <div className="sidebar-id-card">
          <small>STUDENT ID / CODE</small>
          <strong>{studentInfo?.student_id}</strong>

          {/* Active Session & Term Badge - Higher Vertically */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 8px', fontSize: '0.75rem', color: '#ffffff', marginTop: '8px' }}>
            <strong>📅 {currentSession?.session_name || '2024 - 2025'} Session</strong><br />
            Term: <strong>{currentSession?.term || currentSession?.active_term || 'Third Term'}</strong>
          </div>

          <button onClick={onLogout} className="btn-logout" style={{ marginTop: '10px', width: '100%', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
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
            📈 My results
          </button>
          <button
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => switchTab('curriculum')}
          >
            📚 My curriculum
          </button>
          <button
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => switchTab('teachers')}
          >
            👨‍🏫 My teachers
          </button>
          <button
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => switchTab('announcements')}
          >
            📢 Announcements
          </button>
        </nav>

      </aside>

      {/* Main Container */}
      <main className="admin-main">
        {/* Header */}
        <header className="main-header">
          <div className="header-title-flex">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              ☰
            </button>
            <div>
              <span className="workspace-breadcrumb">Student workspace / {activeTab}</span>
              <h1 style={{ color: '#000000', fontWeight: 800 }}>
                {activeTab === 'results' ? 'My results' : activeTab === 'curriculum' ? 'My curriculum' : activeTab === 'teachers' ? 'My teachers' : `Hello, ${studentInfo?.full_name.split(' ')[0]}`}
              </h1>
              <p className="session-indicator" style={{ color: '#000000', fontWeight: 600 }}>
                Noble Kings Academy • Grade: {studentInfo?.class_name} • Session: {currentSession?.session_name || '2024 - 2025'}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <span className="user-greeting" style={{ border: '2px solid #cbd5e1', background: '#f8fafc', color: '#000000' }}>
              🆔 {studentInfo?.class_name} • ID: {studentInfo?.student_id}
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

        {/* Tab Transition Loading Bar */}
        {tabLoading && (
          <div className="tab-transition-overlay">
            <div className="tab-transition-bar"></div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Digital Identity Card Widget (Ash theme, crown & school name removed, format kept) */}
            <div className="digital-id-card">
              <div className="id-card-header">
                <div className="id-card-logo">STUDENT IDENTIFICATION</div>
                <div className="id-card-badge">OFFICIAL STUDENT ID</div>
              </div>

              <div className="id-card-body">
                <div className="id-avatar">🎓</div>
                <div className="id-details">
                  <span className="id-label">STUDENT ID NUMBER</span>
                  <h2 className="id-number-large">{studentInfo?.student_id}</h2>
                  <h3 className="id-student-name">{studentInfo?.full_name}</h3>
                  <div className="id-pills">
                    <span className="id-pill">Class: {studentInfo?.class_name}</span>
                    <span className="id-pill">Adm No: {studentInfo?.admission_number}</span>
                    <span className="id-pill status-active">● Active Student</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))' }}>
              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">📚</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{results.length}</h3>
                  <p style={{ color: '#475569' }}>Published Subjects</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <div className="stat-icon">🎓</div>
                <div className="stat-details">
                  <h3 style={{ color: '#0f172a' }}>{curriculum.length}</h3>
                  <p style={{ color: '#475569' }}>Approved Curriculum</p>
                </div>
              </div>
            </div>

            {/* Quick access cards */}
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header-flex">
                  <h2 style={{ color: '#000000', fontWeight: 800 }}>Approved Curriculum Plans</h2>
                  <button onClick={() => setActiveTab('curriculum')} className="link-btn">View all →</button>
                </div>
                <p style={{ color: '#475569', marginBottom: '16px', fontSize: '0.9rem' }}>
                  Showing admin-approved learning plans for <strong>{studentInfo?.class_name}</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className="btn-primary"
                >
                  View Curriculum →
                </button>
              </div>

              <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                <div className="card-header-flex">
                  <h2 style={{ color: '#000000', fontWeight: 800 }}>YOUR LATEST REPORT</h2>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0', color: '#0f172a' }}>A strong finish.</h3>
                <p style={{ fontSize: '1.2rem', color: '#334155', fontWeight: 700, margin: '0 0 16px' }}>{averageScore.toFixed(1)}% <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>overall average</span></p>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>Third term - 2024 / 2025<br />Status: Approved & Published</p>
                <button
                  onClick={() => setActiveTab('results')}
                  className="btn-primary"
                >
                  Open Report Card →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY RESULTS */}
        {activeTab === 'results' && (
          <div className="tab-content">
            <div className="card mb-20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: '#000000', fontWeight: 800 }}>Official Report Sheet</h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem' }}>Verified academic performance result sheet for {studentInfo?.full_name || 'Student'}.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleDownloadReport} className="btn-primary" style={{ background: '#0b2a5c' }}>
                  📥 Download / Print Report Sheet
                </button>
              </div>
            </div>

            {/* Render Official Physical Report Sheet matching Photograph */}
            {renderOfficialReportSheet()}
          </div>
        )}

        {/* TAB 3: MY CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <div>
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Approved Curriculum Plans</h2>
                <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.88rem' }}>
                  Showing officially approved learning plans for grade: <strong>{studentInfo?.class_name}</strong>
                </p>
              </div>
              <span className="badge badge-success">● Admin Approved</span>
            </div>

            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Subject</th>
                    <th>Term</th>
                    <th>Topic</th>
                    <th>Learning Objectives</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculum.map((curr) => (
                    <tr key={curr.id}>
                      <td><strong>Week {curr.week_number}</strong></td>
                      <td>{curr.subject_name}</td>
                      <td>{curr.term}</td>
                      <td><strong>{curr.topic}</strong></td>
                      <td style={{ color: '#334155' }}>{curr.learning_objectives}</td>
                      <td>
                        <span className="badge badge-success">Approved</span>
                      </td>
                    </tr>
                  ))}
                  {curriculum.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                        No approved curriculum plans available for {studentInfo?.class_name} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MY TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="tab-content card">
            <div className="card-header-flex">
              <div>
                <h2 style={{ color: '#000000', fontWeight: 800 }}>Assigned Teachers for {studentInfo?.class_name}</h2>
                <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.88rem' }}>
                  Faculty members teaching your grade level.
                </p>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Subject Specialization</th>
                    <th>Qualification</th>
                    <th>Email Contact</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((tch) => (
                    <tr key={tch.id}>
                      <td><strong>{tch.full_name}</strong></td>
                      <td><span className="badge badge-primary">{tch.specialization}</span></td>
                      <td>{tch.qualification}</td>
                      <td>{tch.email}</td>
                      <td>{tch.phone}</td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                        No teachers currently assigned to {studentInfo?.class_name}.
                      </td>
                    </tr>
                  )}
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
              {announcements.map((item) => (
                <div key={item.id} className="announcement-item" style={{ borderLeftColor: '#2563eb' }}>
                  <div className="ann-header">
                    <h4>{item.title}</h4>
                    <span className="audience-tag">NOTICE</span>
                  </div>
                  <p>{item.content}</p>
                  <small>{new Date(item.published_at).toLocaleDateString()}</small>
                </div>
              ))}
              {announcements.length === 0 && <p className="empty-text">No announcements at this time.</p>}
            </div>
          </div>
        )}

        {/* Official Printable Report Card Sheet (Displayed ONLY when printing / saving as PDF) */}
        <div className="printable-report-card">
          {renderOfficialReportSheet()}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;