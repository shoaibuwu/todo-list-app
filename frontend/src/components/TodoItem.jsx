import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { updateTodo, deleteTodo } from '../redux/todoSlice';

export default function TodoItem({ todo, onEdit }) {
  const dispatch = useDispatch();
  const { actionLoadingId } = useSelector((state) => state.todos);

  const isCurrentActionLoading = actionLoadingId === todo.id;
  const isCompleted = todo.status === 'completed';

  const handleToggleCompletion = () => {
    const nextStatus = isCompleted ? 'pending' : 'completed';
    dispatch(
      updateTodo({
        id: todo.id,
        updates: { status: nextStatus },
      })
    );
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === todo.status) return;
    dispatch(
      updateTodo({
        id: todo.id,
        updates: { status: newStatus },
      })
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      dispatch(deleteTodo(todo.id));
    }
  };

  // Format Due Date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const isOverdue = !isCompleted && date < new Date();
    const formatted = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });

    return { formatted, isOverdue };
  };

  const dueDateInfo = formatDueDate(todo.dueAt || todo.due_at);

  return (
    <article className={`todo-item-card ${isCompleted ? 'is-completed' : ''}`}>
      {/* Checkbox / Toggle */}
      <div className="todo-check-wrapper">
        <button
          id={`toggle-todo-${todo.id}`}
          className={`todo-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={handleToggleCompletion}
          disabled={isCurrentActionLoading}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="todo-body">
        <div className="todo-title-row">
          <h3 className={`todo-title ${isCompleted ? 'completed-text' : ''}`}>
            {todo.title}
          </h3>

          <div className="todo-badges">
            {/* Priority Badge */}
            <span className={`priority-pill priority-${todo.priority || 'medium'}`}>
              {todo.priority || 'medium'}
            </span>

            {/* Inline Status Dropdown */}
            <div className="status-dropdown-wrapper">
              <select
                id={`status-select-${todo.id}`}
                className={`status-pill status-${todo.status}`}
                value={todo.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isCurrentActionLoading}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={11} className="select-arrow" />
            </div>
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <p className={`todo-desc ${isCompleted ? 'completed-text' : ''}`}>
            {todo.description}
          </p>
        )}

        {/* Meta Row: Due date & ID */}
        <div className="todo-meta-row">
          {dueDateInfo && (
            <div
              className={`meta-badge ${
                dueDateInfo.isOverdue ? 'overdue' : 'normal'
              }`}
            >
              <Calendar size={13} />
              <span>
                {dueDateInfo.isOverdue ? 'Overdue: ' : 'Due: '}
                {dueDateInfo.formatted}
              </span>
            </div>
          )}

          <div className="meta-badge task-id">
            <span>#{todo.id}</span>
          </div>

          {todo.createdAt && (
            <div className="meta-badge date-created">
              <Clock size={12} />
              <span>
                {new Date(todo.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="todo-actions">
        {isCurrentActionLoading ? (
          <Loader2 size={18} className="animate-spin text-muted" />
        ) : (
          <>
            <button
              id={`edit-todo-${todo.id}`}
              className="action-icon-btn edit"
              onClick={() => onEdit(todo)}
              title="Edit Task"
            >
              <Edit3 size={16} />
            </button>
            <button
              id={`delete-todo-${todo.id}`}
              className="action-icon-btn delete"
              onClick={handleDelete}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
