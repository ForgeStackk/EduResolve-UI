import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Filter,
  X,
} from 'lucide-react';
import './StudentDashboard.css';

export const StudentDashboard = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: 'Math Assignment Help',
      category: 'Academic',
      status: 'in-progress',
      priority: 'high',
      createdDate: '2024-04-15',
      lastUpdate: '2024-04-18',
      responses: 2,
    },
    {
      id: 2,
      title: 'Study Schedule Consultation',
      category: 'Personal',
      status: 'pending',
      priority: 'medium',
      createdDate: '2024-04-16',
      lastUpdate: '2024-04-16',
      responses: 0,
    },
    {
      id: 3,
      title: 'Grade Appeal - Biology Quiz',
      category: 'Academic',
      status: 'resolved',
      priority: 'medium',
      createdDate: '2024-04-10',
      lastUpdate: '2024-04-14',
      responses: 5,
    },
  ]);

  const stats = [
    { label: 'Active Issues', value: '2', icon: AlertCircle, color: '#f59e0b' },
    { label: 'Resolved', value: '8', icon: CheckCircle, color: '#10b981' },
    { label: 'Pending Response', value: '1', icon: Clock, color: '#3b82f6' },
    { label: 'Learning Resources', value: '24', icon: BookOpen, color: '#8b5cf6' },
  ];

  const meetings = [
    { id: 1, mentor: 'Dr. Sarah Miller', time: 'Today, 3:00 PM', type: 'Video Call' },
    { id: 2, mentor: 'Prof. James Wilson', time: 'Tomorrow, 2:00 PM', type: 'In-Person' },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge-primary',
      'in-progress': 'badge-warning',
      resolved: 'badge-success',
    };
    return statusMap[status] || 'badge-primary';
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#3b82f6',
    };
    return priorityMap[priority] || '#3b82f6';
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Navigation />

        <div className="content-area">
          <div className="container">
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-content">
                <h1>Welcome Back, Sarah!</h1>
                <p>Your personal academic support dashboard. Get help, track progress, and connect with mentors.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowReportModal(true)}
              >
                <Plus size={18} />
                Report New Issue
              </button>
            </section>

            {/* Stats Grid */}
            <section className="stats-grid grid grid-3 gap-3 mb-4">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card card">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {stat.label}
                    </p>
                    <h3>{stat.value}</h3>
                  </div>
                </div>
              ))}
            </section>

            {/* Main Content Grid */}
            <div className="content-grid">
              {/* Issues Section */}
              <section className="issues-section">
                <div className="section-header flex-between">
                  <h2>My Issues</h2>
                  <button className="btn btn-secondary btn-small">
                    <Filter size={16} /> Filter
                  </button>
                </div>

                <div className="issues-list">
                  {issues.map((issue) => (
                    <div key={issue.id} className="issue-card card">
                      <div className="issue-header flex-between">
                        <div>
                          <h3>{issue.title}</h3>
                          <p className="text-muted">{issue.category}</p>
                        </div>
                        <span
                          style={{ color: getPriorityColor(issue.priority) }}
                          className="priority-badge"
                        >
                          ●
                        </span>
                      </div>

                      <div className="issue-details mt-2 gap-2">
                        <span className={`badge ${getStatusBadge(issue.status)}`}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          Updated: {issue.lastUpdate}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {issue.responses} responses
                        </span>
                      </div>

                      <div className="issue-footer mt-3 flex-between">
                        <button className="btn btn-secondary btn-small">View Details</button>
                        <button className="btn btn-secondary btn-small">
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sidebar */}
              <aside className="sidebar">
                {/* Upcoming Meetings */}
                <div className="card mb-3">
                  <h3 className="mb-2 flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <Calendar size={18} style={{ color: 'var(--primary-green)' }} />
                    Upcoming Meetings
                  </h3>
                  <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="meeting-item">
                        <p className="text-primary" style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                          {meeting.mentor}
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {meeting.time}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary-green)' }}>
                          {meeting.type}
                        </p>
                        <button className="btn btn-primary btn-small mt-2 w-full">
                          Join Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card mb-3">
                  <h3 className="mb-2 flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <TrendingUp size={18} style={{ color: 'var(--primary-blue)' }} />
                    Your Progress
                  </h3>
                  <div className="progress-bars">
                    <div className="progress-item">
                      <div className="progress-label">
                        <span>Issues Resolved</span>
                        <span className="text-primary" style={{ fontWeight: '600' }}>
                          80%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-label">
                        <span>Response Time</span>
                        <span className="text-primary" style={{ fontWeight: '600' }}>
                          1.2 days
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Resources Preview */}
                <div className="card">
                  <h3 className="mb-2">📚 Recommended Resources</h3>
                  <ul style={{ listStyle: 'none', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                    <li>
                      <a href="#" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.95rem' }}>
                        → Effective Study Techniques
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.95rem' }}>
                        → Time Management Guide
                      </a>
                    </li>
                    <li>
                      <a href="#" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontSize: '0.95rem' }}>
                        → Mathematics Resources
                      </a>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between">
              <h2>Report New Issue</h2>
              <button
                className="close-btn"
                onClick={() => setShowReportModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form className="modal-form">
              <div className="form-group">
                <label>Issue Title *</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select required>
                  <option>Academic</option>
                  <option>Personal</option>
                  <option>Behavioral</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Provide detailed information about your issue..."></textarea>
              </div>

              <div className="form-actions flex-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
