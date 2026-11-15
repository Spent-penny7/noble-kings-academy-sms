import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../../supabase/client';
import heroImage from '../../assets/hero.png';

function PublicWebsite() {
  const [announcements, setAnnouncements] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await db.getAnnouncements('all');
        if (res?.data && res.data.length > 0) {
          setAnnouncements(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load announcements for public page:', err);
      }
    }
    loadNotices();
  }, []);

  return (
    <div className="public-portal-page">
      {/* Top Notification Bar */}
      <div className="public-topbar">
        <div className="public-container topbar-flex">
          <span>✨ 2024/2025 Academic Session is Active • Admissions Open</span>
          <div className="topbar-contacts">
            <span>📞 +1-555-0199</span>
            <span>✉️ info@noblekingsacademy.edu</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="public-navbar">
        <div className="public-container nav-flex">
          <div className="school-brand">
            <span className="brand-logo">👑</span>
            <div className="brand-text">
              <span className="brand-title">NOBLE KINGS ACADEMY</span>
              <span className="brand-tagline">Excellence • Integrity • Leadership</span>
            </div>
          </div>

          <button
            type="button"
            className="public-mobile-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>

          <nav className={`nav-links ${mobileNavOpen ? 'mobile-open' : ''}`}>
            <a href="#about" onClick={() => setMobileNavOpen(false)}>About</a>
            <a href="#programs" onClick={() => setMobileNavOpen(false)}>Academics</a>
            <a href="#portals" onClick={() => setMobileNavOpen(false)}>Portals</a>
            <a href="#announcements" onClick={() => setMobileNavOpen(false)}>Notices</a>
            <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
            <Link to="/login" className="btn-portal-login" onClick={() => setMobileNavOpen(false)}>
              Portal Login →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="public-hero-section">
        <div className="public-container hero-grid">
          <div className="hero-content">
            <div className="hero-pill">ACADEMIC EXCELLENCE SINCE 2012</div>
            <h1 className="hero-title">
              Nurturing Tomorrow&apos;s Leaders with Sound Minds &amp; Character
            </h1>
            <p className="hero-description">
              Welcome to <strong>Noble Kings Academy</strong>. We provide a world-class educational experience
              from Nursery to Junior Secondary, combining rigorous academics with modern digital learning,
              certified educators, and secure student management.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-hero-primary">
                Access School Portal
              </Link>
              <a href="#programs" className="btn-hero-secondary">
                Explore Programs
              </a>
            </div>
            <div className="hero-badges">
              <div className="badge-item">
                <strong>100%</strong>
                <span>Exam Pass Rate</span>
              </div>
              <div className="badge-divider"></div>
              <div className="badge-item">
                <strong>15:1</strong>
                <span>Student-Teacher Ratio</span>
              </div>
              <div className="badge-divider"></div>
              <div className="badge-item">
                <strong>14+</strong>
                <span>Core Subjects</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img src={heroImage} alt="Noble Kings Academy Students" className="hero-banner-img" />
              <div className="hero-floating-card">
                <span className="floating-icon">🎓</span>
                <div>
                  <strong>Official Digital Portal</strong>
                  <p>Instant Result Verification &amp; Student IDs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Roles Overview */}
      <section id="portals" className="public-portals-section">
        <div className="public-container">
          <div className="section-header-center">
            <span className="section-label">CONNECTED COMMUNITY</span>
            <h2>Integrated School Portals</h2>
            <p>Our centralized academic management system empowers students, teachers, and administrators.</p>
          </div>

          <div className="portals-grid">
            <div className="portal-card">
              <div className="portal-icon-box student-icon">🎓</div>
              <h3>Student &amp; Parent Portal</h3>
              <p>View verified termly report cards, digital identity cards, approved weekly curriculum, and teacher feedback.</p>
              <ul className="portal-feature-list">
                <li>✓ Official Digital Student ID Card</li>
                <li>✓ Downloadable PDF/Print Report Sheets</li>
                <li>✓ Weekly Class Curriculum Schedules</li>
              </ul>
              <Link to="/login" className="portal-link">
                Student Sign In →
              </Link>
            </div>

            <div className="portal-card">
              <div className="portal-icon-box teacher-icon">👨‍🏫</div>
              <h3>Teacher Portal</h3>
              <p>Manage continuous assessments, record test &amp; exam scores, and submit curriculum topics for admin approval.</p>
              <ul className="portal-feature-list">
                <li>✓ Continuous Assessment (CA 1–3) &amp; Exams</li>
                <li>✓ Staged Results Approval Workflow</li>
                <li>✓ Class Student Rosters &amp; Search</li>
              </ul>
              <Link to="/login" className="portal-link">
                Faculty Sign In →
              </Link>
            </div>

            <div className="portal-card">
              <div className="portal-icon-box admin-icon">⚙️</div>
              <h3>Administrator Portal</h3>
              <p>Complete governance over academic sessions, user registrations, curriculum publishing, and official records.</p>
              <ul className="portal-feature-list">
                <li>✓ Academic Sessions &amp; Term Scheduling</li>
                <li>✓ Teacher &amp; Student Account Approvals</li>
                <li>✓ School-Wide Broadcasts &amp; Notices</li>
              </ul>
              <Link to="/login" className="portal-link">
                Admin Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs */}
      <section id="programs" className="public-programs-section">
        <div className="public-container">
          <div className="section-header-center">
            <span className="section-label">CURRICULUM LEVELS</span>
            <h2>Academic Programs</h2>
            <p>Structured learning stages carefully designed for intellectual, moral, and creative development.</p>
          </div>

          <div className="programs-grid">
            <div className="program-card">
              <div className="program-badge">Early Years</div>
              <h3>Nursery &amp; Kindergarten</h3>
              <p>Fostering curiosity, sensory discovery, early phonics, number familiarity, and foundational social skills.</p>
              <div className="program-details">
                <span>• Nursery 1 &amp; Nursery 2</span>
                <span>• Play-based interactive learning</span>
              </div>
            </div>

            <div className="program-card">
              <div className="program-badge">Elementary</div>
              <h3>Primary Education</h3>
              <p>Building strong competencies in Mathematics, English Language, Basic Science, Social Studies, and ICT.</p>
              <div className="program-details">
                <span>• Primary 1 through Primary 5</span>
                <span>• Continuous Assessments &amp; Exams</span>
              </div>
            </div>

            <div className="program-card">
              <div className="program-badge">Junior High</div>
              <h3>Junior Secondary (JSS)</h3>
              <p>Deepening critical thinking, laboratory science, computing, leadership, and preparing for senior examinations.</p>
              <div className="program-details">
                <span>• JSS 1 through JSS 3</span>
                <span>• Advanced subject specialization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Core Values */}
      <section id="about" className="public-about-section">
        <div className="public-container about-grid">
          <div>
            <span className="section-label">ABOUT NOBLE KINGS ACADEMY</span>
            <h2>Committed to Total Child Education</h2>
            <p>
              At Noble Kings Academy, we believe education extends far beyond textbook memorization.
              We emphasize character, discipline, innovative thinking, and technological readiness to equip
              our students for an ever-evolving world.
            </p>
            <div className="values-list">
              <div className="value-item">
                <span className="val-icon">🌟</span>
                <div>
                  <strong>Academic Rigor</strong>
                  <p>Standardized curriculum designed to meet national and international educational benchmarks.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="val-icon">🛡️</span>
                <div>
                  <strong>Moral Integrity &amp; Discipline</strong>
                  <p>Inculcating respect, responsibility, and civic duty within a nurturing environment.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="val-icon">💻</span>
                <div>
                  <strong>Modern Digital Infrastructure</strong>
                  <p>Transparent digital result checking, computerized attendance, and verified ID credentials.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-stats-card">
            <h3>Academy Fast Facts</h3>
            <div className="fast-facts-list">
              <div className="fact-row">
                <span>Established</span>
                <strong>2012</strong>
              </div>
              <div className="fact-row">
                <span>Current Session</span>
                <strong>2024 / 2025</strong>
              </div>
              <div className="fact-row">
                <span>School Code</span>
                <strong>NKA001</strong>
              </div>
              <div className="fact-row">
                <span>Accreditation</span>
                <strong>Ministry of Education Approved</strong>
              </div>
              <div className="fact-row">
                <span>Principal</span>
                <strong>Dr. Samuel Adebayo</strong>
              </div>
            </div>
            <div className="admissions-cta-box">
              <h4>Interested in Enrolling?</h4>
              <p>Contact our admissions office or register online to begin your child&apos;s journey.</p>
              <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '12px', textDecoration: 'none' }}>
                Online Registration →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements / Notices */}
      {announcements.length > 0 && (
        <section id="announcements" className="public-announcements-section">
          <div className="public-container">
            <div className="section-header-center">
              <span className="section-label">CAMPUS BULLETINS</span>
              <h2>Latest Announcements</h2>
              <p>Stay informed with current news, calendar updates, and administrative notices.</p>
            </div>

            <div className="public-announcements-grid">
              {announcements.map((item) => {
                const formattedDate = item.published_at
                  ? new Date(item.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent Notice';

                return (
                  <div key={item.id} className="public-ann-card">
                    <div className="ann-date">{formattedDate}</div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Footer */}
      <footer id="contact" className="public-footer">
        <div className="public-container footer-grid">
          <div className="footer-col">
            <div className="school-brand mb-12">
              <span className="brand-logo">👑</span>
              <span className="brand-title" style={{ color: '#ffffff' }}>NOBLE KINGS ACADEMY</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A premier institution dedicated to academic distinction, high moral standards, and the full development of every learner.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul className="footer-links">
              <li><a href="#about">About Our School</a></li>
              <li><a href="#programs">Academic Levels</a></li>
              <li><a href="#portals">Portal Access</a></li>
              <li><Link to="/login">Student / Faculty Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Campus Information</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 6px' }}>
              📍 123 Education Boulevard, Knowledge City
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 6px' }}>
              📞 +1-555-0199 / +1-555-0100
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 6px' }}>
              ✉️ info@noblekingsacademy.edu
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              🕒 Mon – Fri: 7:30 AM – 4:00 PM
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="public-container footer-bottom-flex">
            <p>© 2025 Noble Kings Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicWebsite;