import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Bell, LogOut, Settings, 
  Activity, Home, LogIn, UserPlus, ChevronDown
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    const role = user.role?.toUpperCase();
    switch (role) {
      case 'PATIENT': return '/patient/dashboard';
      case 'DOCTOR': return '/doctor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  const getRoleColor = () => {
    if (!user) return 'from-blue-600 to-indigo-600';
    const role = user.role?.toLowerCase();
    if (role === 'admin') return 'from-admin-600 to-admin-500';
    if (role === 'doctor') return 'from-doctor-600 to-doctor-500';
    if (role === 'patient') return 'from-patient-600 to-patient-500';
    return 'from-blue-600 to-indigo-600';
  };

  const navItems = [
    { name: 'Home', href: '/', section: 'hero' },
    { name: 'Features', href: '/', section: 'features' },
    { name: 'Testimonials', href: '/', section: 'testimonials' },
  ];

  const handleNavClick = (sectionId, e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${getRoleColor()} transition-all duration-300 group-hover:scale-105`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold font-heading bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
              MedVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.section, e)}
                  className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ))
            ) : (
              <div className="flex items-center space-x-6">
                <button
                  className="flex items-center space-x-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer"
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      // Optionally, trigger a state reset or reload here if needed
                    }
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Home size={18} />
                  <span>Home</span>
                </button>
                <Link to={getDashboardLink()} className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" role="neutral">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    aria-label="Show notifications"
                  >
                    <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 glass-card p-3 z-50 shadow-xl border border-neutral-200 dark:border-neutral-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-neutral-900 dark:text-white">Notifications</span>
                          <button className="text-xs text-blue-600 hover:underline" onClick={() => setIsNotifOpen(false)}>Close</button>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                          {loading ? (
                            <div className="py-4 text-center text-neutral-500">Loading...</div>
                          ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-neutral-500">
                              <Bell size={32} className="mx-auto mb-2 opacity-50" />
                              <p>No notifications</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => { markAsRead(notification.id); setIsNotifOpen(false); }}
                                className={`py-2 flex items-start gap-3 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                              >
                                <span className={`inline-block w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <div>
                                  <p className="text-sm text-neutral-900 dark:text-white">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-neutral-500">{formatDistanceToNow(notification.createdAt)}</span>
                                  {/* Role-based content example */}
                                  {user?.role === 'ADMIN' && notification.type === 'DOCTOR_REGISTRATION' && (
                                    <span className="ml-2 text-xs text-blue-600">Doctor registration request</span>
                                  )}
                                  {user?.role === 'PATIENT' && notification.type === 'APPOINTMENT' && (
                                    <span className="ml-2 text-xs text-green-600">Appointment update</span>
                                  )}
                                  {user?.role === 'DOCTOR' && notification.type === 'APPOINTMENT' && (
                                    <span className="ml-2 text-xs text-purple-600">New appointment</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 p-1 pr-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name} 
                      role={user.role?.toLowerCase()} 
                      size="sm"
                      status="online"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white leading-none">
                        {user.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-neutral-500 capitalize leading-none mt-1">
                        {user.role?.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-neutral-400" />
                  </button>
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 glass-card p-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                          <p className="font-semibold text-neutral-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <Link 
                          to={`/${user.role?.toLowerCase()}/profile`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings size={16} />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors mt-1"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="md:hidden fixed inset-0 z-40 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Logo and Close Button */}
              <div className="flex items-center justify-between h-16 px-4">
                <Link to="/" className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${getRoleColor()}`}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-2xl font-bold font-heading bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
                    MedVault
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className="flex flex-col gap-4">
                  {!user ? (
                    navItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleNavClick(item.section, e)}
                        className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home size={18} />
                        <span>Home</span>
                      </Link>
                      <Link
                        to={getDashboardLink()}
                        className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800">
                {!user ? (
                  <div className="flex flex-col gap-2">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" block>
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="primary" size="sm" role="neutral" block>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        onClick={() => setIsNotifOpen((v) => !v)}
                        aria-label="Show notifications"
                      >
                        <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <AnimatePresence>
                        {isNotifOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 glass-card p-3 z-50 shadow-xl border border-neutral-200 dark:border-neutral-800"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">Notifications</span>
                              <button className="text-xs text-blue-600 hover:underline" onClick={() => setIsNotifOpen(false)}>Close</button>
                            </div>
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                              {loading ? (
                                <div className="py-4 text-center text-neutral-500">Loading...</div>
                              ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-neutral-500">
                                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                  <p>No notifications</p>
                                </div>
                              ) : (
                                notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    onClick={() => { markAsRead(notification.id); setIsNotifOpen(false); }}
                                    className={`py-2 flex items-start gap-3 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                  >
                                    <span className={`inline-block w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                    <div>
                                      <p className="text-sm text-neutral-900 dark:text-white">
                                        {notification.message}
                                      </p>
                                      <span className="text-xs text-neutral-500">{formatDistanceToNow(notification.createdAt)}</span>
                                      {/* Role-based content example */}
                                      {user?.role === 'ADMIN' && notification.type === 'DOCTOR_REGISTRATION' && (
                                        <span className="ml-2 text-xs text-blue-600">Doctor registration request</span>
                                      )}
                                      {user?.role === 'PATIENT' && notification.type === 'APPOINTMENT' && (
                                        <span className="ml-2 text-xs text-green-600">Appointment update</span>
                                      )}
                                      {user?.role === 'DOCTOR' && notification.type === 'APPOINTMENT' && (
                                        <span className="ml-2 text-xs text-purple-600">New appointment</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center space-x-3 p-1 pr-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      >
                        <Avatar 
                          src={user.avatar} 
                          alt={user.name} 
                          role={user.role?.toLowerCase()} 
                          size="sm"
                          status="online"
                        />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white leading-none">
                            {user.name?.split(' ')[0]}
                          </span>
                          <span className="text-xs text-neutral-500 capitalize leading-none mt-1">
                            {user.role?.toLowerCase()}
                          </span>
                        </div>
                        <ChevronDown size={16} className="text-neutral-400" />
                      </button>
                      <AnimatePresence>
                        {isProfileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 glass-card p-2 z-50"
                          >
                            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                              <p className="font-semibold text-neutral-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                            </div>
                            <Link 
                              to={`/${user.role?.toLowerCase()}/profile`}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Settings size={16} />
                              Profile Settings
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors mt-1"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
