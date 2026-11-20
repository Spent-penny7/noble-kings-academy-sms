import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../supabase/client';
import bgWallpaper from '../../assets/bg-wallpaper.png';

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const navigate = useNavigate();

  const triggerTransition = (callback) => {
    setIsTransitioning(true);
    callback();
    setTimeout(() => setIsTransitioning(false), 220);
  };

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotForm, setForgotForm] = useState({ portal_id: '', contact_info: '' });
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentClass, setStudentClass] = useState('Primary 1');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Dynamic Setup Data States
  const [availableClasses, setAvailableClasses] = useState([]);
  const [_activeSessionInfo, setActiveSessionInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicPortalData() {
      try {
        const [clsRes, sessRes] = await Promise.all([
          db.getClasses(),
          db.getAcademicSessions()
        ]);
        if (!isMounted) return;
        if (clsRes?.data && clsRes.data.length > 0) {
          setAvailableClasses(clsRes.data);
          setStudentClass(clsRes.data[0].class_name);
        }
        if (sessRes?.data) {
          const current = sessRes.data.find(s => s.is_current) || sessRes.data[0];
          setActiveSessionInfo(current);
        }
      } catch (err) {
        console.error('Failed to load dynamic portal setup:', err);
      }
    }
    loadDynamicPortalData();
    return () => { isMounted = false; };
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!forgotForm.portal_id) return;
    await db.requestPasswordReset(forgotForm.portal_id, forgotForm.contact_info);
    setForgotSuccess(`✓ Password reset request submitted for Portal ID ${forgotForm.portal_id}! The school administrator will update your password.`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await db.signIn(loginIdentifier, loginPassword, isAdminLoginMode ? 'admin' : null);
      if (error) throw error;

      let userRole = null;
      if (data?.session?.profile?.role) {
        userRole = data.session.profile.role;
      } else if (data?.user?.id) {
        const { data: profile } = await db.getProfile(data.user.id);
        userRole = profile?.role;
      }

      setSuccess('Login successful! Redirecting to portal...');
      window.dispatchEvent(new Event('sms_auth_change'));
      setTimeout(() => {
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'teacher') navigate('/teacher');
        else if (userRole === 'student') navigate('/student');
        else navigate('/admin');
      }, 400);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setGeneratedId('');

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const metadata = {
        full_name: fullName,
        role: role,
        class_name: role === 'student' ? studentClass : '',
        phone: phone,
        qualification: qualification,
        specialization: specialization,
        parent_name: parentName,
        parent_phone: parentPhone
      };

      const { data, error } = await db.signUp('', signupPassword, metadata);
      if (error) throw error;

      const newStudentId = data?.student_id || data?.user?.student_id || 'ID-CREATED';
      setGeneratedId(newStudentId);
      setLoginIdentifier(newStudentId);

      setSuccess(`🎉 Registration submitted successfully! Your 6-digit Portal ID is: ${newStudentId}. An administrator must approve your account before you can log in to the portal. Please save your Portal ID.`);
      setIsSignUp(false);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-centered-auth-wrapper" style={{ backgroundImage: `url(${bgWallpaper})` }}>
      <div className="cg-centered-card">
        {isTransitioning && (
          <div className="tab-transition-overlay">
            <div className="tab-transition-bar"></div>
          </div>
        )}
        <div className="cg-form-container">
          <div className="cg-pill-tag">NOBLE KINGS ACADEMY</div>

          <h1 className="cg-form-title">
            {isSignUp
              ? 'Create an Account'
              : isAdminLoginMode
              ? 'Administrator Access'
              : 'Welcome back'}
          </h1>
          <p className="cg-form-subtitle">
            {isSignUp
              ? 'Enter your details to generate your 6-digit Portal ID.'
              : isAdminLoginMode
              ? 'Restricted Portal. Only authorized administrators may sign in here.'
              : 'Enter your 6-digit Student or Teacher Portal ID to access your workspace.'}
          </p>

          {error && <div className="cg-alert cg-alert-error">{error}</div>}
          {success && <div className="cg-alert cg-alert-success">{success}</div>}

          {generatedId && (
            <div className="cg-id-banner">
              <span>Your Generated Portal ID:</span>
              <strong>{generatedId}</strong>
            </div>
          )}

          {!isSignUp ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="cg-form">
              <div className="cg-input-group">
                <label htmlFor="login-id">
                  {isAdminLoginMode ? 'Admin ID / Email' : 'Portal ID (6-digit Student / Teacher ID)'}
                </label>
                <input
                  type="text"
                  id="login-id"
                  placeholder={isAdminLoginMode ? 'Enter Admin ID or Email' : 'e.g. 849201 or 200001'}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="cg-input-group">
                <div className="cg-label-flex">
                  <label htmlFor="school-password">
                    {isAdminLoginMode ? 'Admin Password' : 'Password'}
                  </label>
                  <a href="#forgot" className="cg-forgot-link" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotSuccess(''); }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="school-password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: '2px 4px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="cg-btn-submit" disabled={loading} style={{ background: isAdminLoginMode ? '#0f172a' : '#16a34a' }}>
                {loading
                  ? 'Authenticating...'
                  : isAdminLoginMode
                  ? '🔐 Sign in as Administrator →'
                  : 'Sign in to Portal →'}
              </button>

              {/* Admin Login Mode Switcher Link */}
              <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                {!isAdminLoginMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerTransition(() => {
                        setIsAdminLoginMode(true);
                        setError('');
                        setSuccess('');
                        setLoginIdentifier('');
                        setLoginPassword('');
                      });
                    }}
                    style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    🔐 Login as Admin (Administrators Only) →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      triggerTransition(() => {
                        setIsAdminLoginMode(false);
                        setError('');
                        setSuccess('');
                        setLoginIdentifier('');
                        setLoginPassword('');
                      });
                    }}
                    style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    ← Return to Student & Teacher Portal Login
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="cg-form">
              <div className="cg-input-group">
                <label htmlFor="full-name">Full Name</label>
                <input
                  type="text"
                  id="full-name"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="cg-form-row">
                <div className="cg-input-group">
                  <label htmlFor="signup-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password"
                      placeholder="Min 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        padding: '2px 4px'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="cg-input-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        padding: '2px 4px'
                      }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="cg-input-group">
                <label htmlFor="role-select">Select Portal Role</label>
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="cg-select"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Staff</option>
                </select>
              </div>

              {role === 'student' && (
                <div className="cg-input-group">
                  <label htmlFor="student-class">Select Class / Grade</label>
                  <select
                    id="student-class"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="cg-select"
                  >
                    {availableClasses.length > 0 ? (
                      availableClasses.map((cls) => (
                        <option key={cls.id || cls.class_name} value={cls.class_name}>
                          {cls.class_name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Creche">Creche</option>
                        <option value="Nursery 1">Nursery 1</option>
                        <option value="Nursery 2">Nursery 2</option>
                        <option value="Kindergarten">Kindergarten</option>
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 2">Primary 2</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 4">Primary 4</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 2">JSS 2</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SSS 1">SSS 1 (SS 1)</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div className="cg-input-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {role === 'teacher' && (
                <div className="cg-form-row">
                  <div className="cg-input-group">
                    <label htmlFor="qualification">Qualification</label>
                    <input
                      type="text"
                      id="qualification"
                      placeholder="e.g. M.Sc Mathematics"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </div>
                  <div className="cg-input-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      placeholder="e.g. Mathematics"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {role === 'student' && (
                <div className="cg-form-row">
                  <div className="cg-input-group">
                    <label htmlFor="parent-name">Parent/Guardian Name</label>
                    <input
                      type="text"
                      id="parent-name"
                      placeholder="Parent Full Name"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                    />
                  </div>
                  <div className="cg-input-group">
                    <label htmlFor="parent-phone">Parent Phone</label>
                    <input
                      type="tel"
                      id="parent-phone"
                      placeholder="+1 555-0987"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="cg-btn-submit" disabled={loading}>
                {loading ? 'Generating Account...' : 'Generate Portal ID & Register →'}
              </button>
            </form>
          )}

          {/* Info callout box */}
          <div className="cg-info-box">
            <h4>{isAdminLoginMode ? 'Administrator Portal Access' : 'Security & Approval Safeguard'}</h4>
            <p>
              {isAdminLoginMode
                ? 'Restricted access. Only authorized school administrators can log in here.'
                : 'Only approved student and teacher accounts can log in. Pending registrations require administrator approval before access.'}
            </p>
          </div>

          {/* Toggle between login / signup */}
          <div className="cg-toggle-link">
            {!isSignUp ? (
              <p>
                New student or teacher?{' '}
                <button
                  type="button"
                  className="cg-link-button"
                  onClick={() => {
                    triggerTransition(() => {
                      setIsSignUp(true);
                      setIsAdminLoginMode(false);
                      setError('');
                      setSuccess('');
                    });
                  }}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  className="cg-link-button"
                  onClick={() => {
                    triggerTransition(() => {
                      setIsSignUp(false);
                      setIsAdminLoginMode(false);
                      setError('');
                      setSuccess('');
                    });
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="cg-panel-footer">
          <span>Privacy policy</span>
          <span>·</span>
          <span>© 2026 Noble Kings Academy</span>
          <span>·</span>
          <span>School Portal</span>
        </div>
      </div>

      {/* MODAL: FORGOT PASSWORD REQUEST */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <h3 style={{ color: '#000000', fontWeight: 800, margin: '0 0 6px' }}>
              🔒 Forgotten Portal Password?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Submit a password reset request with your 6-digit Portal ID. The school administrator will verify your account and update your password.
            </p>

            {forgotSuccess ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', color: '#166534', fontSize: '0.9rem' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700 }}>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '8px' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset}>
                <div className="cg-input-group mb-20">
                  <label style={{ color: '#0f172a', fontWeight: 700 }}>Your 6-Digit Portal ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 849201 or 200001"
                    value={forgotForm.portal_id}
                    onChange={(e) => setForgotForm({ ...forgotForm, portal_id: e.target.value })}
                    required
                  />
                </div>

                <div className="cg-input-group mb-20">
                  <label style={{ color: '#0f172a', fontWeight: 700 }}>Contact Email or Phone Number</label>
                  <input
                    type="text"
                    placeholder="Your phone number or contact email"
                    value={forgotForm.contact_info}
                    onChange={(e) => setForgotForm({ ...forgotForm, contact_info: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ background: '#0b2a5c' }}>
                    Submit Reset Request →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;