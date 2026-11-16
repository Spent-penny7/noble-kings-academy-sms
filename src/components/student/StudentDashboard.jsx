import { useState, useEffect } from 'react';
import db from '../../supabase/client';

function StudentDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generationDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  );

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
          <div className="brand-icon">👑</div>
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
          <button onClick={onLogout} className="btn-logout" style={{ marginTop: '10px', width: '100%', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
            🚪 Sign Out
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => { setActiveTab('results'); setMobileMenuOpen(false); }}
          >
            📈 My results
          </button>
          <button
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => { setActiveTab('curriculum'); setMobileMenuOpen(false); }}
          >
            📚 My curriculum
          </button>
          <button
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('teachers'); setMobileMenuOpen(false); }}
          >
            👨‍🏫 My teachers
          </button>
          <button
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('announcements'); setMobileMenuOpen(false); }}
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
                <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: '#000000', fontWeight: 800 }}>My results</h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem' }}>Your published results and academic progress, privately yours.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select className="cg-select" style={{ width: 'auto', padding: '8px 12px' }}>
                  <option>2024 / 2025 session</option>
                </select>
                <select className="cg-select" style={{ width: 'auto', padding: '8px 12px' }}>
                  <option>Third term</option>
                </select>
                <button onClick={handleDownloadReport} className="btn-primary">
                  📥 Download report card
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>Only your published records appear here.</span>
              <span>Published - 24 Jul 2026</span>
            </div>

            {/* Summary Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#475569', fontWeight: 600 }}>OVERALL AVERAGE</small>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px', color: '#0f172a' }}>{averageScore.toFixed(1)}%</h3>
                <p style={{ fontSize: '0.78rem', color: '#475569' }}>Total marks across {results.length} subjects</p>
              </div>
              <div className="card" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#475569', fontWeight: 600 }}>SUBJECTS PASSED</small>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px', color: '#0f172a' }}>{results.length} of {results.length}</h3>
                <p style={{ fontSize: '0.78rem', color: '#475569' }}>All subjects passed successfully</p>
              </div>
              <div className="card" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <small style={{ color: '#475569', fontWeight: 600 }}>REPORT CLASS</small>
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px', color: '#0f172a' }}>{studentInfo?.class_name}</h3>
                <p style={{ fontSize: '0.78rem', color: '#475569' }}>{studentInfo?.full_name} • {studentInfo?.student_id}</p>
              </div>
            </div>

            <div className="dashboard-grid-responsive">
              {/* Results Table */}
              <div className="card">
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#000000', fontWeight: 800 }}>Third term report</h3>
                <div className="table-responsive">
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
                      {results.map((res) => (
                        <tr key={res.id}>
                          <td><strong>{res.subject_name}</strong></td>
                          <td>{res.ca_score}</td>
                          <td>{res.exam_score}</td>
                          <td><strong>{res.total_score}</strong></td>
                          <td>
                            <span className={`badge ${res.grade === 'A' ? 'badge-success' : 'badge-primary'}`}>
                              {res.grade}
                            </span>
                          </td>
                          <td>{res.remark}</td>
                        </tr>
                      ))}
                      {results.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center" style={{ padding: '24px', color: '#64748b' }}>
                            No approved results published yet. Results appear here once approved by the administration.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Notes & Grading Guide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#000000', fontWeight: 800 }}>A note from your teacher</h4>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                    &ldquo;{studentInfo?.full_name} has shown steady progress and a thoughtful approach to learning. Keep up the excellent work!&rdquo;
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#475569' }}>
                    <strong>Sarah Cole</strong><br />Class teacher
                  </div>
                </div>

                <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#000000', fontWeight: 800 }}>Grading guide</h4>
                  <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>A</span><span>80–100 (Excellent)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>B</span><span>70–79 (Very good)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>C</span><span>60–69 (Good)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>D</span><span>50–59 (Pass)</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>F</span><span>0–49 (Needs support)</span></div>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="print-report-header">
            <div className="print-school-crest">👑</div>
            <div className="print-school-info">
              <h1>NOBLE KINGS ACADEMY</h1>
              <p className="print-motto">Excellence • Integrity • Leadership</p>
              <p className="print-subtext">123 Education Boulevard, Knowledge City • Tel: +1-555-0199 • Email: info@noblekingsacademy.edu</p>
            </div>
          </div>

          <div className="print-report-title">
            <h2>STUDENT TERMLY ACADEMIC REPORT SHEET</h2>
            <p>Academic Session: 2024 / 2025 • Term: Third Term</p>
          </div>

          <div className="print-meta-grid">
            <div className="print-meta-cell"><span>Student Name:</span> <strong>{studentInfo?.full_name}</strong></div>
            <div className="print-meta-cell"><span>Student Portal ID:</span> <strong>{studentInfo?.student_id}</strong></div>
            <div className="print-meta-cell"><span>Admission No:</span> <strong>{studentInfo?.admission_number}</strong></div>
            <div className="print-meta-cell"><span>Class / Grade:</span> <strong>{studentInfo?.class_name}</strong></div>
            <div className="print-meta-cell"><span>Parent / Guardian:</span> <strong>{studentInfo?.parent_name}</strong></div>
            <div className="print-meta-cell"><span>Overall Average:</span> <strong>{averageScore.toFixed(1)}%</strong></div>
          </div>

          <table className="print-results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject Name</th>
                <th>Continuous Assessment (40)</th>
                <th>Examination (60)</th>
                <th>Total Score (100)</th>
                <th>Grade</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, idx) => (
                <tr key={res.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{res.subject_name}</strong></td>
                  <td>{res.ca_score}</td>
                  <td>{res.exam_score}</td>
                  <td><strong>{res.total_score}</strong></td>
                  <td><strong>{res.grade}</strong></td>
                  <td>{res.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print-summary-section">
            <div className="print-summary-box">
              <h4>Academic Performance Summary</h4>
              <div className="print-summary-row">
                <span>Total Subjects:</span> <strong>{results.length}</strong>
              </div>
              <div className="print-summary-row">
                <span>Total Marks:</span> <strong>{totalMarks} / {results.length * 100}</strong>
              </div>
              <div className="print-summary-row">
                <span>Term Average:</span> <strong>{averageScore.toFixed(1)}%</strong>
              </div>
              <div className="print-summary-row">
                <span>Academic Standing:</span> <strong>{averageScore >= 50 ? 'PASSED / PROMOTED' : 'NEEDS REPEAT'}</strong>
              </div>
            </div>

            <div className="print-grading-scale">
              <h4>Grading Scale</h4>
              <p><strong>A</strong> (80–100%) Excellent</p>
              <p><strong>B</strong> (70–79%) Very Good</p>
              <p><strong>C</strong> (60–69%) Good</p>
              <p><strong>D</strong> (50–59%) Pass</p>
              <p><strong>F</strong> (0–49%) Needs Improvement</p>
            </div>
          </div>

          <div className="print-endorsements-grid">
            <div className="print-endorsement-col">
              <span className="endorsement-label">Class Teacher&apos;s Remarks:</span>
              <p className="endorsement-text">&ldquo;{studentInfo?.full_name} has shown steady academic progress and thoughtful participation.&rdquo;</p>
              <div className="signature-line">
                <span>Sarah Cole</span>
                <small>Class Teacher Signature</small>
              </div>
            </div>

            <div className="print-endorsement-col">
              <span className="endorsement-label">Principal&apos;s Endorsement:</span>
              <p className="endorsement-text">&ldquo;Commendable performance. Approved for advancement to the next academic level.&rdquo;</p>
              <div className="signature-line">
                <span>Dr. Arthur Johnson</span>
                <small>Principal / Head of School</small>
              </div>
            </div>

            <div className="print-seal-col">
              <div className="official-stamp-circle">
                <span>OFFICIAL SEAL</span>
                <strong>NOBLE KINGS</strong>
                <small>ACADEMY</small>
              </div>
            </div>
          </div>

          <div className="print-footer-notice">
            <p>This is a computer-generated official academic document from the Noble Kings Academy Portal.</p>
            <p>Generated on {generationDate}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;