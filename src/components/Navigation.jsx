import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  CheckCircle,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Search,
} from 'lucide-react';
import './Navigation.css';

export const Navigation = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const studentNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issues', label: 'My Issues', icon: AlertCircle },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'forums', label: 'Peer Forum', icon: Users },
  ];

  const teacherNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issues', label: 'Student Issues', icon: AlertCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'scheduling', label: 'Schedule', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: CheckCircle },
  ];

  const navigation = role === 'student' ? studentNavigation : teacherNavigation;

  return (
    <nav className="navigation">
      <div className="nav-search">
        <Search size={18} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="nav-menu">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            title={label}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <button className="nav-item" title="Settings">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
};
