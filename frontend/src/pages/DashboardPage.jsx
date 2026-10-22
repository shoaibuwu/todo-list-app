import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTodos, clearError } from '../redux/todoSlice';
import { logout } from '../redux/authSlice';
import { useIdleTimer } from '../hooks/useIdleTimer';
import Header from '../components/Header';
import StatsOverview from '../components/StatsOverview';
import FilterControls from '../components/FilterControls';
import TodoItem from '../components/TodoItem';
import TodoModal from '../components/TodoModal';
import EmptyState from '../components/EmptyState';
import IdleWarningModal from '../components/IdleWarningModal';
import WelcomeBanner from '../components/WelcomeBanner';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Todos state
  const {
    items: todos,
    loading,
    error,
    statusFilter,
    priorityFilter,
    searchQuery,
    sortBy,
  } = useSelector((state) => state.todos);

  // Auth state
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Hook for 7-minute inactivity auto-logout and 6.5-minute auto token refresh
  const { resetActivity } = useIdleTimer();

  // Modals state
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // If not authenticated, redirect to /login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch todos on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTodos());
    }
  }, [dispatch, isAuthenticated]);

  const handleOpenAddModal = () => {
    setEditingTodo(null);
    setIsTodoModalOpen(true);
  };

  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  };

  const handleCloseTodoModal = () => {
    setIsTodoModalOpen(false);
    setEditingTodo(null);
  };

  const handleLogout = () => {
    dispatch(logout('You have logged out successfully.'));
    navigate('/login', { replace: true });
  };

  // Filter and sort todos
  const filteredTodos = useMemo(() => {
    const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };

    return todos
      .filter((todo) => {
        // Status filter
        if (statusFilter !== 'all' && todo.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && todo.priority !== priorityFilter) {
          return false;
        }

        // Search query filter (title or description)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = todo.title?.toLowerCase().includes(query);
          const matchesDesc = todo.description?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created_desc') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'created_asc') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'priority') {
          const weightA = priorityWeights[a.priority] || 0;
          const weightB = priorityWeights[b.priority] || 0;
          return weightB - weightA;
        }
        if (sortBy === 'due_date') {
          if (!a.dueAt && !b.dueAt) return 0;
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt) - new Date(b.dueAt);
        }
        return 0;
      });
  }, [todos, statusFilter, priorityFilter, searchQuery, sortBy]);

  const isFiltered =
    statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim().length > 0;

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="app-layout">
      <div className="app-container">
        {/* Global Header with user info, session chip, idle countdown, and logout */}
        <Header
          onOpenAddModal={handleOpenAddModal}
          onLogout={handleLogout}
        />

        {/* Global Error Notification */}
        {error && (
          <div className="error-banner">
            <div className="error-banner-content">
              <AlertCircle size={18} className="error-icon" />
              <span>{error}</span>
            </div>
            <div className="error-banner-actions">
              <button
                className="btn-retry"
                onClick={() => {
                  dispatch(clearError());
                  dispatch(fetchTodos());
                }}
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Welcome & Productivity Banner */}
        <WelcomeBanner
          onOpenAddModal={handleOpenAddModal}
          todos={todos}
        />

        {/* Statistics Dashboard */}
        <StatsOverview todos={todos} />

        {/* Search, Filter & Tab Controls */}
        <FilterControls />

        {/* Todo List Area */}
        <main className="todo-content-area">
          {loading && todos.length === 0 ? (
            <div className="loading-state-container">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="loading-text">Fetching tasks from MySQL database...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <EmptyState
              isFiltered={isFiltered}
              onOpenAddModal={handleOpenAddModal}
            />
          ) : (
            <div className="todo-cards-grid">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>
          )}
        </main>

        {/* Create / Edit Todo Modal */}
        <TodoModal
          isOpen={isTodoModalOpen}
          onClose={handleCloseTodoModal}
          editingTodo={editingTodo}
        />

        {/* Inactivity Warning Modal (Appears after 6m idle with live countdown to 7m logout) */}
        <IdleWarningModal
          onStayActive={resetActivity}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
