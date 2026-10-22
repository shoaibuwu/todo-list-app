import React from 'react';
import { useSelector } from 'react-redux';
import { Sparkles, Calendar, Plus, Trophy, Flame } from 'lucide-react';

export default function WelcomeBanner({ onOpenAddModal, todos = [] }) {
  const { user } = useSelector((state) => state.auth);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const total = todos.length;
  const completed = todos.filter((t) => t.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="welcome-banner">
      <div className="welcome-banner-glow"></div>
      
      <div className="welcome-content">
        <div className="welcome-header-row">
          <div className="welcome-greeting-group">
            <div className="welcome-badge">
              <Sparkles size={13} className="text-amber-400" />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="welcome-title">
              {getGreeting()}, <span className="welcome-name">{firstName}</span> 👋
            </h2>
            <p className="welcome-subtitle">
              {total === 0
                ? "You're all clear! Add your first goal to kickstart your day."
                : completed === total
                ? "Incredible job! All tasks completed today. Time to celebrate! 🎉"
                : `You've conquered ${completed} of ${total} tasks (${completionRate}%). Keep the momentum going! 🚀`}
            </p>
          </div>

          <div className="welcome-actions">
            {/* Quick Productivity Pill */}
            <div className="productivity-pill">
              <div className="productivity-icon">
                {completed === total && total > 0 ? (
                  <Trophy size={18} className="text-amber-400" />
                ) : (
                  <Flame size={18} className="text-rose-400" />
                )}
              </div>
              <div className="productivity-text">
                <span className="productivity-number">{completionRate}% Done</span>
                <span className="productivity-label">
                  {completed}/{total} Completed
                </span>
              </div>
            </div>

            {/* Quick Add Button */}
            <button
              id="btn-banner-add-task"
              className="btn-banner-add"
              onClick={onOpenAddModal}
            >
              <Plus size={16} />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        {total > 0 && (
          <div className="welcome-progress-bar">
            <div
              className="welcome-progress-fill"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
