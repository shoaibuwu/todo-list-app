import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ExportTasks from './ExportTasks';
import {
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setSortBy,
} from '../redux/todoSlice';

export default function FilterControls() {
  const dispatch = useDispatch();
  const { searchQuery, statusFilter, priorityFilter, sortBy } = useSelector(
    (state) => state.todos
  );

  const statusTabs = [
    { key: 'all', label: 'All Tasks' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="filter-controls-container">
      {/* Search and Secondary Selects */}
      <div className="filter-top-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            id="search-todos-input"
            type="text"
            placeholder="Search tasks by title or details..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => dispatch(setSearchQuery(''))}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filter-selects-group">
          {/* Priority filter */}
          <div className="custom-select-wrapper">
            <SlidersHorizontal size={14} className="select-icon" />
            <select
              id="filter-priority-select"
              value={priorityFilter}
              onChange={(e) => dispatch(setPriorityFilter(e.target.value))}
              className="custom-select"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="custom-select-wrapper">
            <ArrowUpDown size={14} className="select-icon" />
            <select
              id="sort-todos-select"
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
              className="custom-select"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>

          {/* Export Tasks Button & Dropdown */}
          <ExportTasks />
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="status-tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            className={`status-tab ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => dispatch(setStatusFilter(tab.key))}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
