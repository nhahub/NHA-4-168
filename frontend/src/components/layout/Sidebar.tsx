import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavLink from './NavLink';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-primary text-on-primary transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-primary-container">
          <h1 className={`font-bold text-display-lg ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'SM' : 'Student Mgmt'}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/dashboard"
            icon="🏠"
            label="Dashboard"
            collapsed={isCollapsed}
          />
          <NavLink
            to="/students"
            icon="👥"
            label="Students"
            collapsed={isCollapsed}
          />
          <NavLink
            to="/courses"
            icon="📚"
            label="Courses"
            collapsed={isCollapsed}
          />
        </nav>

        {/* Collapse/Expand Button */}
        <div className="p-4 border-t border-primary-container">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-2 text-center rounded hover:bg-primary-container transition"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary-container">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-error text-on-error rounded-lg hover:opacity-90 transition text-body-sm"
          >
            {isCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger Menu (placeholder) */}
      <div className="md:hidden w-full fixed bottom-0 left-0 bg-primary text-on-primary p-2 flex justify-around">
        <button onClick={() => navigate('/dashboard')}>🏠</button>
        <button onClick={() => navigate('/students')}>👥</button>
        <button onClick={() => navigate('/courses')}>📚</button>
        <button onClick={handleLogout}>🚪</button>
      </div>
    </>
  );
}
