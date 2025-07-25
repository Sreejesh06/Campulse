import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Home, 
  Megaphone, 
  Search, 
  Calendar, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
    { name: 'Lost & Found', href: '/lost-found', icon: Search },
    { name: 'Timetable', href: '/timetable', icon: Calendar },
    { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  ];

  const adminItems = [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CL</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CampusLink</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={sidebarCollapsed ? item.name : ''}
            >
              <Icon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200">
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon className="w-5 h-5" />
                    {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Link
            to="/profile"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? 'Profile' : ''}
          >
            <User className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Profile</span>}
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={sidebarCollapsed ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.studentId || user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
