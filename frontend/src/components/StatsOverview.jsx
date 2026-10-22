import React from 'react';
import { ListTodo, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function StatsOverview({ todos }) {
  const total = todos.length;
  const pending = todos.filter((t) => t.status === 'pending').length;
  const inProgress = todos.filter((t) => t.status === 'in_progress').length;
  const completed = todos.filter((t) => t.status === 'completed').length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-section">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-icon-box total">
            <ListTodo size={18} />
          </div>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-footer">Live from MySQL database</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">In Progress</span>
          <div className="stat-icon-box in-progress">
            <PlayCircle size={18} />
          </div>
        </div>
        <div className="stat-value">{inProgress}</div>
        <div className="stat-footer">Currently being worked on</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Pending</span>
          <div className="stat-icon-box pending">
            <Clock size={18} />
          </div>
        </div>
        <div className="stat-value">{pending}</div>
        <div className="stat-footer">Waiting to start</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Completed</span>
          <div className="stat-icon-box completed">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="stat-value">
          {completed}
          <span className="stat-percentage">({completionRate}%)</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
}
