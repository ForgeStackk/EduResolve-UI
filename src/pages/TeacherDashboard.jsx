import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import {
  AlertCircle,
  MessageSquare,
  Video,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Send,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import './TeacherDashboard.css';

export const TeacherDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah Johnson', message: 'Can we discuss my math assignment?', time: '10:30 AM' },
    { id: 2, sender: 'You', message: 'Of course! Let\'s schedule a time.', time: '10:35 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const studentIssues = [
    {
      id: 1,
      studentName: 'Sarah Johnson',
      studentId: 'SJ-2024-001',
      issue: 'Math Assignment Help',
      category: 'Academic',
      status: 'in-progress',
      priority: 'high',
      submittedDate: '2024-04-15',
      responses: 2,
      lastResponse: '2024-04-18',
    },
    {
      id: 2,
      studentName: 'Marcus Chen',
      studentId: 'MC-2024-002',
      issue: 'Stress Management',
      category: 'Personal',
      status: 'pending',
      priority: 'high',
      submittedDate: '2024-04-17',
      responses: 0,
      lastResponse: null,
    },
    {
      id: 3,
      studentName: 'Emma Davis',
      studentId: 'ED-2024-003',
      issue: 'Grade Appeal',
      category: 'Academic',
      status: 'resolved',
      priority: 'medium',
      submittedDate: '2024-04-10',
      responses: 5,
      lastResponse: '2024-04-14',
    },
  ];

  const analytics = [
    { label: 'Total Issues', value: '24', trend: '+12%', icon: AlertCircle },
    { label: 'Avg Response Time', value: '2.4h', trend: '-5%', icon: Clock },
    { label: 'Resolution Rate', value: '85%', trend: '+8%', icon: CheckCircle },
    { label: 'Student Satisfaction', value: '4.6/5', trend: '+0.3', icon: TrendingUp },
  ];

  const commonConcerns = [
    { concern: 'Time Management', percentage: 35, count: 8 },
    { concern: 'Test Anxiety', percentage: 28, count: 7 },
    { concern: 'Subject-Specific Help', percentage: 22, count: 5 },
    { concern: 'Social Issues', percentage: 15, count: 4 },
  ];

  const filteredIssues =
    activeTab === 'all'
      ? studentIssues
      : studentIssues.filter((issue) => issue.status === activeTab);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge-primary',
      'in-progress': 'badge-warning',
      resolved: 'badge-success',
    };
    return statusMap[status] || 'badge-primary';
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          message: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Navigation />

        <div className="content-area">
          <div className="container">
            {/* Hero Section */}
            <section className="hero-section teacher-hero">
              <div className="hero-content">
                <h1>Teacher Dashboard</h1>
                <p>Manage student issues, track analytics, and provide support across your class.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary">
                  <Download size={18} /> Export Report
                </button>
              </div>
            </section>

            {/* Analytics Cards */}
            <section className="analytics-grid grid grid-3 gap-3 mb-4">
              {analytics.map((item) => (
                <div key={item.label} className="card analytics-card">
                  <div className="analytics-header flex-between">
                    <div>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {item.label}
                      </p>
                      <h3 style={{ marginTop: '0.25rem' }}>{item.value}</h3>
                    </div>
                    <item.icon size={20} style={{ color: 'var(--neutral-400)' }} />
                  </div>
                  <div className="analytics-trend">
                    <TrendingUp size={14} style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '500' }}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* Main Content Grid */}
            <div className="teacher-grid">
              {/* Issues Management */}
              <section className="issues-management">
                <div className="section-header flex-between">
                  <h2>Student Issues</h2>
                  <div className="header-actions" style={{ gap: '0.5rem', display: 'flex' }}>
                    <button className="btn btn-secondary btn-small">
                      <Search size={16} />
                    </button>
                    <button className="btn btn-secondary btn-small">
                      <Filter size={16} />
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="tab-navigation">
                  {['all', 'pending', 'in-progress', 'resolved'].map((tab) => (
                    <button
                      key={tab}
                      className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="tab-count">
                        {tab === 'all'
                          ? studentIssues.length
                          : studentIssues.filter((i) => i.status === tab).length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Issues Table */}
                <div className="issues-table">
                  <div className="table-header">
                    <div className="col-student">Student</div>
                    <div className="col-issue">Issue</div>
                    <div className="col-category">Category</div>
                    <div className="col-status">Status</div>
                    <div className="col-actions">Actions</div>
                  </div>

                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="table-row"
                      onClick={() => setSelectedStudent(issue)}
                    >
                      <div className="col-student">
                        <div className="student-cell">
                          <span className="avatar">👤</span>
                          <div>
                            <p style={{ fontWeight: '600', margin: '0 0 0.25rem' }}>
                              {issue.studentName}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', margin: 0 }}>
                              {issue.studentId}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-issue">{issue.issue}</div>
                      <div className="col-category">
                        <span className="category-badge">{issue.category}</span>
                      </div>
                      <div className="col-status">
                        <span className={`badge ${getStatusBadge(issue.status)}`}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-actions">
                        <button className="action-btn" title="Chat">
                          <MessageSquare size={16} />
                        </button>
                        <button className="action-btn" title="Video Call">
                          <Video size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Side Panel */}
              <aside className="teacher-sidebar">
                {/* Common Concerns */}
                <div className="card mb-3">
                  <h3 className="mb-2">📊 Common Concerns</h3>
                  <div className="concerns-list">
                    {commonConcerns.map((item) => (
                      <div key={item.concern} className="concern-item">
                        <div className="concern-header flex-between">
                          <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                            {item.concern}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: '600' }}>
                            {item.count}
                          </span>
                        </div>
                        <div className="concern-bar">
                          <div className="concern-fill" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', margin: '0.25rem 0 0' }}>
                          {item.percentage}% of issues
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <h3 className="mb-2">⚡ Quick Actions</h3>
                  <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                      <Users size={16} /> Schedule Group Session
                    </button>
                    <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                      <AlertCircle size={16} /> Create Announcement
                    </button>
                    <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                      <BarChart3 size={16} /> View Full Analytics
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Communication Panel */}
        {selectedStudent && (
          <div className="communication-panel card">
            <div className="panel-header flex-between">
              <div>
                <h3 style={{ margin: 0 }}>{selectedStudent.studentName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', margin: '0.25rem 0 0' }}>
                  {selectedStudent.issue}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'transparent', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <p>{msg.message}</p>
                  </div>
                  <p className="message-time">{msg.time}</p>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
