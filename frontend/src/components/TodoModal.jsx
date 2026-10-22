import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { createTodo, updateTodo } from '../redux/todoSlice';

export default function TodoModal({ isOpen, onClose, editingTodo }) {
  const dispatch = useDispatch();
  const { actionLoadingId } = useSelector((state) => state.todos);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');

  const isEditing = Boolean(editingTodo);
  const isSubmitting = actionLoadingId === 'creating' || actionLoadingId === editingTodo?.id;

  // Sync state when editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || '');
      setDescription(editingTodo.description || '');
      setStatus(editingTodo.status || 'pending');
      setPriority(editingTodo.priority || 'medium');
      
      const rawDue = editingTodo.dueAt || editingTodo.due_at;
      if (rawDue) {
        const d = new Date(rawDue);
        if (!isNaN(d.getTime())) {
          setDueDate(d.toISOString().split('T')[0]);
        } else {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setDueDate('');
    }
    setFormError('');
  }, [editingTodo, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title cannot be empty.');
      return;
    }
    if (title.trim().length > 160) {
      setFormError('Task title cannot exceed 160 characters.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueAt: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (isEditing) {
        await dispatch(
          updateTodo({
            id: editingTodo.id,
            updates: payload,
          })
        ).unwrap();
      } else {
        await dispatch(createTodo(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Operation failed');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Sparkles size={20} className="modal-sparkle-icon" />
            <h2 className="modal-heading">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="modal-alert-error">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title input */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="todo-title-input" className="form-label">
                Title <span className="required">*</span>
              </label>
              <span className="char-counter">{title.length}/160</span>
            </div>
            <input
              id="todo-title-input"
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={title}
              maxLength={160}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formError) setFormError('');
              }}
              autoFocus
            />
          </div>

          {/* Description input */}
          <div className="form-group">
            <label htmlFor="todo-desc-input" className="form-label">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="todo-desc-input"
              className="form-textarea"
              placeholder="Add extra context or details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Two column row: Status and Priority */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="modal-status-select" className="form-label">
                Status
              </label>
              <select
                id="modal-status-select"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modal-priority-select" className="form-label">
                Priority
              </label>
              <select
                id="modal-priority-select"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="modal-due-date-input" className="form-label">
              Due Date <span className="optional">(optional)</span>
            </label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                id="modal-due-date-input"
                type="date"
                className="form-input with-icon"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
