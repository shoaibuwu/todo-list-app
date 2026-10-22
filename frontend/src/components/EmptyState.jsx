import React from 'react';
import { ClipboardList, Plus, SearchX } from 'lucide-react';

export default function EmptyState({ isFiltered, onOpenAddModal }) {
  if (isFiltered) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-circle">
          <SearchX size={32} className="empty-icon" />
        </div>
        <h3 className="empty-title">No matching tasks found</h3>
        <p className="empty-subtitle">
          Try adjusting your search query, status filters, or priority levels.
        </p>
      </div>
    );
  }

  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <ClipboardList size={32} className="empty-icon" />
      </div>
      <h3 className="empty-title">No tasks in your list</h3>
      <p className="empty-subtitle">
        Your database is clean! Get started by creating your first task.
      </p>
      <button
        id="btn-empty-add-todo"
        className="btn-primary"
        onClick={onOpenAddModal}
        style={{ marginTop: '1rem' }}
      >
        <Plus size={16} />
        <span>Create First Task</span>
      </button>
    </div>
  );
}
