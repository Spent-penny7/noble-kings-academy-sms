import React from 'react';

/**
 * Standardized, responsive Announcement Card component
 * Used across Admin, Teacher, and Student portals for 100% visual and structural consistency.
 */
function AnnouncementCard({ announcement, isAdmin = false, onDelete = null }) {
  if (!announcement) return null;

  const category = (announcement.category || announcement.announcement_type || announcement.priority || 'notice').toLowerCase();
  const audience = (announcement.target_audience || 'all').toLowerCase();

  // Category visual badge configuration
  const categoryConfig = {
    urgent: {
      label: '🚨 Urgent Alert',
      className: 'ann-badge-urgent',
      cardClass: 'ann-type-urgent'
    },
    academic: {
      label: '🎓 Academic Notice',
      className: 'ann-badge-academic',
      cardClass: 'ann-type-academic'
    },
    event: {
      label: '🏆 Event & Sports',
      className: 'ann-badge-event',
      cardClass: 'ann-type-event'
    },
    administrative: {
      label: '💼 Administrative',
      className: 'ann-badge-admin',
      cardClass: 'ann-type-admin'
    },
    notice: {
      label: '📢 General Notice',
      className: 'ann-badge-notice',
      cardClass: 'ann-type-notice'
    }
  };

  const currentCategory = categoryConfig[category] || categoryConfig.notice;

  // Audience visual badge configuration
  const audienceConfig = {
    all: {
      label: '👥 All School (Staff & Students)',
      className: 'ann-audience-all'
    },
    student: {
      label: '🎓 Students Only',
      className: 'ann-audience-student'
    },
    students: {
      label: '🎓 Students Only',
      className: 'ann-audience-student'
    },
    teacher: {
      label: '👨‍🏫 Faculty & Teachers',
      className: 'ann-audience-teacher'
    },
    teachers: {
      label: '👨‍🏫 Faculty & Teachers',
      className: 'ann-audience-teacher'
    }
  };

  const currentAudience = audienceConfig[audience] || audienceConfig.all;

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article className={`announcement-unified-card ${currentCategory.cardClass}`}>
      {/* Top Metadata Row: Category Badge + Audience Badge + Publication Date */}
      <div className="ann-unified-top">
        <div className="ann-badges-group">
          <span className={`ann-badge ${currentCategory.className}`}>
            {currentCategory.label}
          </span>
          <span className={`ann-badge ${currentAudience.className}`}>
            {currentAudience.label}
          </span>
        </div>
        <div className="ann-timestamp" title="Published timestamp">
          <span>📅</span> {formatDate(announcement.published_at || announcement.created_at)}
        </div>
      </div>

      {/* Main Title */}
      <h3 className="ann-unified-title">{announcement.title}</h3>

      {/* Main Content Body */}
      <div className="ann-unified-body">
        {announcement.content}
      </div>

      {/* Footer: Official Issuer Stamp + Admin Actions */}
      <div className="ann-unified-footer">
        <div className="ann-issuer">
          <span className="ann-issuer-crest">🏛️</span>
          <span>
            {announcement.author || 'Office of the Principal • Noble Kings Academy'}
          </span>
        </div>

        {isAdmin && onDelete && (
          <div className="ann-admin-actions">
            <button
              type="button"
              onClick={() => onDelete(announcement.id)}
              className="btn-delete-ann"
              title="Delete this announcement"
            >
              🗑️ Delete Notice
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default AnnouncementCard;
