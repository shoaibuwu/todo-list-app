import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Download, FileSpreadsheet, FileText, Check, ChevronDown } from 'lucide-react';

export default function ExportTasks() {
  const { items: todos } = useSelector((state) => state.todos);
  const [isOpen, setIsOpen] = useState(false);
  const [exportedFormat, setExportedFormat] = useState(null); // 'csv' | 'json' | null
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalTasks = todos.length;

  // 1. Export as CSV
  const handleExportCSV = () => {
    if (totalTasks === 0) return;

    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At'];
    const rows = todos.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status || 'pending',
      t.priority || 'medium',
      t.dueAt ? new Date(t.dueAt).toISOString().split('T')[0] : 'None',
      t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : 'None',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute(
      'download',
      `taskflow_tasks_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    triggerExportSuccess('csv');
  };

  // 2. Export as JSON
  const handleExportJSON = () => {
    if (totalTasks === 0) return;

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(todos, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `taskflow_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    triggerExportSuccess('json');
  };

  const triggerExportSuccess = (format) => {
    setExportedFormat(format);
    setTimeout(() => {
      setExportedFormat(null);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <div className="export-tasks-wrapper" ref={menuRef}>
      <button
        id="btn-export-tasks"
        className="btn-export-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={totalTasks === 0}
        title={
          totalTasks === 0
            ? 'Add some tasks before exporting'
            : `Export ${totalTasks} task${totalTasks === 1 ? '' : 's'}`
        }
      >
        <Download size={14} className="export-icon" />
        <span>Export</span>
        <ChevronDown
          size={12}
          className={`export-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="export-dropdown-menu animate-fade-in">
          <div className="export-menu-header">
            <span className="export-menu-title">Export Tasks ({totalTasks})</span>
            <span className="export-menu-desc">Choose your preferred format</span>
          </div>

          <div className="export-menu-options">
            <button
              id="btn-export-csv"
              className="export-option-item"
              onClick={handleExportCSV}
            >
              <div className="export-option-icon csv">
                {exportedFormat === 'csv' ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <FileSpreadsheet size={16} />
                )}
              </div>
              <div className="export-option-text">
                <span className="export-option-name">
                  {exportedFormat === 'csv' ? 'Downloaded CSV!' : 'Excel CSV Spreadsheet'}
                </span>
                <span className="export-option-sub">.csv format for Excel or Google Sheets</span>
              </div>
            </button>

            <button
              id="btn-export-json"
              className="export-option-item"
              onClick={handleExportJSON}
            >
              <div className="export-option-icon json">
                {exportedFormat === 'json' ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <FileText size={16} />
                )}
              </div>
              <div className="export-option-text">
                <span className="export-option-name">
                  {exportedFormat === 'json' ? 'Downloaded JSON!' : 'JSON Data Backup'}
                </span>
                <span className="export-option-sub">Full raw task data structure</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
