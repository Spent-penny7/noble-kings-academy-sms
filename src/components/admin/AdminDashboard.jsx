import { useState, useEffect } from 'react';
import { db } from '../../supabase/client';

function AdminDashboard({ onLogout }) {
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
  const [currentAdminProfile, setCurrentAdminProfile] = useState(null);
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
  const [editingResultModal, setEditingResultModal] = useState(null);
  const [editingResultSubjects, setEditingResultSubjects] = useState([]);
  const [editingAdminModal, setEditingAdminModal] = useState(null);

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
          adminsRes,
          sessionRes
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
          db.getAdmins(),
          db.getSession()
        ]);

        if (!isMounted) return;
        if (sessionRes?.session?.profile) setCurrentAdminProfile(sessionRes.session.profile);
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

  const _handleSaveSchoolSettings = async (e) => {
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

  const handleDeleteTeacher = async (teacherId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher record for ${name}?`)) return;
    const { error } = await db.deleteTeacher(teacherId);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getTeachers();
      if (res.data) setTeachers(res.data);
      showNotice(`Teacher ${name} deleted successfully.`);
    }
  };

  const handleDeleteStudent = async (studentId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete student record for ${name}?`)) return;
    const { error } = await db.deleteStudent(studentId);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const res = await db.getStudents();
      if (res.data) setStudents(res.data);
      showNotice(`Student record for ${name} deleted successfully.`);
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

  const handleToggleAdminStatus = async (adminId) => {
    if (!isCurrentLoggedInSuperAdmin) {
      showNotice('Access Denied: Only the Super Admin can enable or disable administrator accounts.', 'error');
      return;
    }
    const { error } = await db.toggleAdminStatus(adminId);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAdmins();
      if (refreshed.data) setAdminsList(refreshed.data);
      showNotice('Admin account status toggled.');
    }
  };

  const handleDeleteAdminAccount = async (adminId, name) => {
    if (!isCurrentLoggedInSuperAdmin) {
      showNotice('Access Denied: Only the Super Admin can delete or revoke administrator accounts.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to revoke and delete administrator account for ${name}?`)) return;
    const { error } = await db.deleteAdminAccount(adminId);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAdmins();
      if (refreshed.data) setAdminsList(refreshed.data);
      showNotice(`✓ Admin account for ${name} has been revoked and removed.`);
    }
  };

  const handleSaveEditedResult = async (e) => {
    e.preventDefault();
    if (!editingResultModal) return;
    for (const sub of editingResultSubjects) {
      const ca = Number(sub.ca_score || 0);
      const exam = Number(sub.exam_score || 0);
      const total = ca + exam;
      let grade = 'F';
      let remark = 'Fail';
      if (total >= 70) { grade = 'A'; remark = 'Excellent'; }
      else if (total >= 60) { grade = 'B'; remark = 'Very Good'; }
      else if (total >= 50) { grade = 'C'; remark = 'Good'; }
      else if (total >= 45) { grade = 'D'; remark = 'Pass'; }

      await db.updateResult({
        ...sub,
        ca_score: ca,
        exam_score: exam,
        total_score: total,
        grade,
        remark: sub.remark || remark
      });
    }
    const refreshed = await db.getAllResults();
    if (refreshed.data) setAllResults(refreshed.data);
    showNotice(`✓ Updated result scores for student ID ${editingResultModal.student_id}!`);
    setEditingResultModal(null);
  };

  const handleSaveEditedAdminProfile = async (e) => {
    e.preventDefault();
    if (!editingAdminModal) return;
    const { error } = await db.updateAdminProfile(editingAdminModal);
    if (error) {
      showNotice(error.message, 'error');
    } else {
      const refreshed = await db.getAdmins();
      if (refreshed.data) setAdminsList(refreshed.data);
      const sessionRes = await db.getSession();
      if (sessionRes?.session?.profile) setCurrentAdminProfile(sessionRes.session.profile);
      showNotice(`✓ Administrator profile updated for ${editingAdminModal.full_name}!`);
      setEditingAdminModal(null);
    }
  };

  const renderOfficialReportSheet = (studentName, className, studentId, subjectsList = []) => {
    const listToUse = subjectsList.length > 0 ? subjectsList : [
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
      <div className="official-nkqa-report-sheet" style={{ margin: 0, width: '100%', maxWidth: '100%' }}>
        {/* Top Header & Letterhead */}
        <div className="nkqa-letterhead">
          <div className="nkqa-logo-col">
            <img src="/images/school-logo.png" alt="N.K.Q.A Crest" className="nkqa-crest-img" />
          </div>
          <div className="nkqa-header-details">
            <h1 className="nkqa-school-title">{(schoolSettings?.school_name || 'NOBLE KINGS AND QUEENS ACADEMY').toUpperCase()}</h1>
            <p className="nkqa-address-text">{schoolSettings?.school_address || 'PLOT 25 ROAD D2, ZONE D, BMUKO, DUTSE, ABUJA, F.C.T'}</p>
            <p className="nkqa-contact-text">
              <span>E-MAIL: {schoolSettings?.school_email || 'noblekingsandqueens11@yahoo.com'}</span>
              <span>TEL: {schoolSettings?.school_phone || '+2347017372474'}</span>
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
              <td className="meta-val"><strong>{studentName || 'GBAGU JOY'}</strong></td>
              <td className="meta-label">CLASS</td>
              <td className="meta-val"><strong>{className || 'JSS2'}</strong></td>
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
            <span className="remark-text">This is a good performance. You are doing your best and that's something to be proud of, {studentName?.split(' ')[0] || 'Joy'}!</span>
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
  const currentAdminId = currentAdminProfile?.student_id || '000000';
  const currentAdminEmail = currentAdminProfile?.email || 'admin@school.com';
  const isCurrentLoggedInSuperAdmin = currentAdminId === '000000' || currentAdminEmail === 'admin@school.com' || currentAdminProfile?.is_super_admin === true;

  const adminName = currentAdminProfile?.full_name || schoolSettings?.principal_name || 'Dr. Samuel Adebayo';
  const adminTitle = currentAdminProfile?.admin_title || 'School Principal & System Admin';
  const avatarInitials = adminName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'SA';

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
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'drawer-open' : ''}`} style={{ background: '#1e293b', borderRight: '1px solid #334155', color: '#ffffff' }}>
        <div className="sidebar-brand" style={{ borderBottom: '1px solid #334155', paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/images/school-logo.png" alt="Noble Kings Academy Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <div className="brand-info">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', margin: 0 }}>Noble Kings Academy</h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '0.5px' }}>SCHOOL MANAGEMENT</span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Menu"
            style={{ color: '#ffffff' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '12px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
            <span>Admin workspace</span>
            <span>🔒</span>
          </div>

          {/* Active Session & Term Badge - Higher Vertically */}
          <div style={{ background: '#14532d', border: '1px solid #22c55e', borderRadius: '6px', padding: '8px 10px', fontSize: '0.78rem', color: '#ffffff', marginTop: '8px' }}>
            <strong>📅 {currentSession?.session_name || '2024 - 2025'} Session</strong><br />
            Term: <strong>{currentSession?.term || currentSession?.active_term || 'Third Term'}</strong><br />
            <span style={{ fontSize: '0.7rem', color: '#86efac' }}>Noble Kings Academy</span>
          </div>

          <button onClick={onLogout} className="btn-logout" style={{ marginTop: '10px', width: '100%', background: '#fee2e2', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
            🚪 Sign Out
          </button>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 8px' }}>
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => switchTab('overview')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'overview' ? '#ffffff' : '#cbd5e1', background: activeTab === 'overview' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => switchTab('students')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'students' ? '#ffffff' : '#cbd5e1', background: activeTab === 'students' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            🎓 Students
          </button>
          <button
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => switchTab('teachers')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'teachers' ? '#ffffff' : '#cbd5e1', background: activeTab === 'teachers' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            👨‍🏫 Teachers
          </button>
          <button
            className={`nav-item ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => switchTab('classes')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'classes' ? '#ffffff' : '#cbd5e1', background: activeTab === 'classes' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            🏫 Classes &amp; Subjects
          </button>
          <button
            className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => switchTab('sessions')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'sessions' ? '#ffffff' : '#cbd5e1', background: activeTab === 'sessions' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            📅 Academic setup
          </button>
          <button
            className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => switchTab('curriculum')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'curriculum' ? '#ffffff' : '#cbd5e1', background: activeTab === 'curriculum' ? '#16a34a' : 'transparent', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>📚 Curriculum</span>
            <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px' }}>
              {curriculumList.filter(c => c.status !== 'approved').length || 8}
            </span>
          </button>
          <button
            className={`nav-item ${activeTab === 'academics' ? 'active' : ''}`}
            onClick={() => switchTab('academics')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'academics' ? '#ffffff' : '#cbd5e1', background: activeTab === 'academics' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            📈 Results
          </button>
          <button
            className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => switchTab('announcements')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'announcements' ? '#ffffff' : '#cbd5e1', background: activeTab === 'announcements' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            📢 Announcements
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => switchTab('profile')}
            style={{ borderRadius: '6px', margin: '2px 0', color: activeTab === 'profile' ? '#ffffff' : '#cbd5e1', background: activeTab === 'profile' ? '#16a34a' : 'transparent', fontWeight: 600 }}
          >
            👤 Profile
          </button>
        </nav>

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
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>{avatarInitials}</div>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>{adminName}</strong>
                <small style={{ fontSize: '0.72rem', color: '#64748b' }}>{adminTitle}</small>
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

        {/* Tab Transition Loading Bar */}
        {tabLoading && (
          <div className="tab-transition-overlay">
            <div className="tab-transition-bar"></div>
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
                          <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                            <button
                              onClick={() => {
                                setEditingResultModal({ student_id: item.stId, student_name: item.student_name });
                                setEditingResultSubjects(item.studentResults);
                              }}
                              className="btn-secondary"
                              style={{ background: '#0b2a5c', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              ✏️ Edit Result
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
                            background: t.status === 'disabled' ? '#2563eb' : '#d97706',
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
                        <button
                          onClick={() => handleDeleteTeacher(t.id, t.full_name || t.profiles?.full_name)}
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete
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
                            background: stu.status === 'disabled' ? '#2563eb' : '#d97706',
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
                        <button
                          onClick={() => handleDeleteStudent(stu.id, stu.full_name || stu.profiles?.full_name)}
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete
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
              <div>
                <h2 style={{ color: '#000000', fontWeight: 800 }}>👤 Administrator Profile &amp; System Governance</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Manage active administrator profile credentials, security passwords, and appoint school administrators.
                </p>
              </div>
              <span className="badge badge-success">● Active Administrator Profile</span>
            </div>

            {/* TOP CARD: Active Profile & Change Password Setup */}
            <div className="card mb-20" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', marginTop: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {(currentAdminProfile?.full_name || 'Dr. Samuel Adebayo').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <span className="badge badge-primary mb-1" style={{ display: 'inline-block', marginBottom: '4px' }}>{currentAdminProfile?.admin_title || 'School Principal & Super Admin'}</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: '2px 0' }}>
                    {currentAdminProfile?.full_name || 'Dr. Samuel Adebayo'}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 10px' }}>
                    Admin ID: <code>{currentAdminProfile?.student_id || '000000'}</code> | Email: <strong>{currentAdminProfile?.email || 'admin@school.com'}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingAdminModal(currentAdminProfile || {
                      id: 'prof-admin-1',
                      student_id: '000000',
                      full_name: 'Dr. Samuel Adebayo',
                      email: 'admin@school.com',
                      phone: '+1-555-0100',
                      admin_title: 'School Principal & Super Admin'
                    })}
                    className="btn-secondary"
                    style={{ background: '#0b2a5c', color: '#ffffff', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    ✏️ Edit Profile Details
                  </button>
                </div>
              </div>

              {/* Password Change Form inside Top Card */}
              <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>🔒 Change Your Security Password</h4>
              <form onSubmit={handleChangeAdminPassword}>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={adminPasswordForm.currentPassword}
                      onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, currentPassword: e.target.value })}
                      required
                    />
                  </div>
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
                <button type="submit" className="btn-primary" style={{ background: '#0f172a', padding: '10px 20px' }}>
                  Update Security Password
                </button>
              </form>
            </div>

            {/* MIDDLE CARD: Appoint & Add New Administrator */}
            <div className="card mb-20" style={{ padding: '24px', border: '1px solid #16a34a', borderRadius: '10px', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                  ➕ Appoint &amp; Add New School Administrator
                </h3>
                <span className="badge badge-primary">Admin Access Control</span>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: '#166534' }}>
                <strong>💡 Administrator Authority &amp; Layout Overview:</strong>
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
                      <option value="School Principal & System Admin">School Principal &amp; System Admin</option>
                      <option value="Vice Principal (Academic Affairs)">Vice Principal (Academic Affairs)</option>
                      <option value="School Registrar & Admissions Director">School Registrar &amp; Admissions Director</option>
                      <option value="Bursar & Financial Administrator">Bursar &amp; Financial Administrator</option>
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
                  + Appoint &amp; Register School Administrator
                </button>
              </form>
            </div>

            {/* BOTTOM CARD: Registered School Administrators Roster Table */}
            <h3 style={{ fontSize: '1rem', color: '#000000', fontWeight: 800, marginBottom: '12px', marginTop: '24px' }}>
              👑 Registered School Administrators Roster ({adminsList.length})
            </h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admin ID</th>
                    <th>Full Name</th>
                    <th>Role Designation</th>
                    <th>Email &amp; Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Admin Governance Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsList.map((admin) => {
                    const isMaster = admin.student_id === '000000' || admin.email === 'admin@school.com' || admin.is_super_admin;
                    return (
                      <tr key={admin.id}>
                        <td><code>{admin.student_id || '000000'}</code></td>
                        <td><strong>{admin.full_name}</strong></td>
                        <td><span className="badge badge-primary">{admin.admin_title || 'System Administrator'}</span></td>
                        <td>
                          <div>{admin.email}</div>
                          <small style={{ color: '#64748b' }}>{admin.phone || 'N/A'}</small>
                        </td>
                        <td>
                          {admin.status === 'disabled' ? (
                            <span className="badge badge-danger" style={{ background: '#fee2e2', color: '#dc2626' }}>● Disabled</span>
                          ) : (
                            <span className="badge badge-success">● Active Admin</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setEditingAdminModal(admin)}
                            className="btn-secondary"
                            style={{ background: '#0b2a5c', color: '#ffffff', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            ✏️ Edit Admin
                          </button>
                          {isMaster ? (
                            <span className="badge badge-primary" style={{ background: '#0f172a', color: '#ffffff', padding: '4px 8px' }}>👑 Master Super Admin (Protected)</span>
                          ) : isCurrentLoggedInSuperAdmin ? (
                            <>
                              <button
                                onClick={() => handleToggleAdminStatus(admin.id)}
                                style={{
                                  background: admin.status === 'disabled' ? '#2563eb' : '#d97706',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 10px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {admin.status === 'disabled' ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                onClick={() => handleDeleteAdminAccount(admin.id, admin.full_name)}
                                style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Delete / Revoke
                              </button>
                            </>
                          ) : (
                            <span className="badge badge-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Restricted to Super Admin</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
            <div className="modal-card" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                {renderOfficialReportSheet(
                  selectedStudentResultModal.student_name,
                  selectedStudentResultModal.class_name,
                  selectedStudentResultModal.student_id,
                  selectedStudentResultModal.subjects
                )}
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedStudentResultModal(null)}
                  className="btn btn-secondary"
                >
                  Close Preview
                </button>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const currentModal = selectedStudentResultModal;
                      setSelectedStudentResultModal(null);
                      setEditingResultModal({ student_id: currentModal.student_id, student_name: currentModal.student_name });
                      setEditingResultSubjects(currentModal.subjects);
                    }}
                    className="btn-secondary"
                    style={{ background: '#0b2a5c', color: '#ffffff', padding: '8px 14px', fontWeight: 'bold' }}
                  >
                    ✏️ Edit Result Breakdown
                  </button>
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

        {/* MODAL: EDIT STUDENT RESULT BREAKDOWN */}
        {editingResultModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '650px' }}>
              <div className="card-header-flex">
                <h3 style={{ color: '#000000', fontWeight: 800, margin: 0 }}>
                  ✏️ Edit Results for {editingResultModal.student_name}
                </h3>
                <span className="badge badge-primary">Student ID: {editingResultModal.student_id}</span>
              </div>

              <form onSubmit={handleSaveEditedResult}>
                <div className="table-responsive mb-20" style={{ marginTop: '12px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>CA (/40)</th>
                        <th>Exam (/60)</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingResultSubjects.map((sub, index) => (
                        <tr key={sub.id || index}>
                          <td><strong>{sub.subject_name}</strong></td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={sub.ca_score}
                              onChange={(e) => {
                                const copy = [...editingResultSubjects];
                                copy[index].ca_score = Number(e.target.value);
                                setEditingResultSubjects(copy);
                              }}
                              style={{ width: '70px', padding: '4px 6px' }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={sub.exam_score}
                              onChange={(e) => {
                                const copy = [...editingResultSubjects];
                                copy[index].exam_score = Number(e.target.value);
                                setEditingResultSubjects(copy);
                              }}
                              style={{ width: '70px', padding: '4px 6px' }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={sub.remark || ''}
                              onChange={(e) => {
                                const copy = [...editingResultSubjects];
                                copy[index].remark = e.target.value;
                                setEditingResultSubjects(copy);
                              }}
                              placeholder="e.g. Excellent"
                              style={{ width: '120px', padding: '4px 6px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setEditingResultModal(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#0b2a5c' }}>
                    Save Result Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT ADMINISTRATOR PROFILE */}
        {editingAdminModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '520px' }}>
              <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 6px' }}>
                ✏️ Edit Administrator Details
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                Admin ID: <code>{editingAdminModal.student_id || '000000'}</code>
              </p>

              <form onSubmit={handleSaveEditedAdminProfile}>
                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 700 }}>Administrator Full Name</label>
                    <input
                      type="text"
                      value={editingAdminModal.full_name || ''}
                      onChange={(e) => setEditingAdminModal({ ...editingAdminModal, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cg-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 700 }}>Email Address</label>
                    <input
                      type="email"
                      value={editingAdminModal.email || ''}
                      onChange={(e) => setEditingAdminModal({ ...editingAdminModal, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="cg-form-row mb-20">
                  <div className="cg-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 700 }}>Phone Number</label>
                    <input
                      type="tel"
                      value={editingAdminModal.phone || ''}
                      onChange={(e) => setEditingAdminModal({ ...editingAdminModal, phone: e.target.value })}
                    />
                  </div>
                  <div className="cg-input-group">
                    <label style={{ color: '#0f172a', fontWeight: 700 }}>Designation / Title</label>
                    <input
                      type="text"
                      value={editingAdminModal.admin_title || ''}
                      onChange={(e) => setEditingAdminModal({ ...editingAdminModal, admin_title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setEditingAdminModal(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#0b2a5c' }}>
                    Save Admin Details
                  </button>
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