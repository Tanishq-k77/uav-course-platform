import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { decodeToken, getToken } from '@/utils/auth.js';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = getToken();
    const payload = decodeToken(token);
    setUserRole(payload?.role || null);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Home', href: '#home' },
    { name: 'Courses', href: '#courses' },
    { name: 'Instructors', href: '#instructors' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('adminToken');
    setUserRole(null);
    navigate('/', { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg shadow-cyan-500/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="#home"
            onClick={(e) => scrollToSection(e, '#home')}
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            Propellex
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-gray-300 hover:text-cyan-400 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}

            {/* Auth links */}
            {!userRole && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all"
                >
                  Register
                </button>
              </>
            )}

            {userRole === 'Student' && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  My Courses
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {userRole === 'Admin' && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Admin Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-cyan-500/20"
          >
            <div className="px-4 py-4 space-y-3">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block text-gray-300 hover:text-cyan-400 transition-colors py-2"
                >
                  {item.name}
                </motion.a>
              ))}

              {/* Mobile auth links */}
              {!userRole && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-cyan-400 transition-colors py-2"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/register');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-cyan-400 transition-colors py-2"
                  >
                    Register
                  </button>
                </>
              )}

              {userRole === 'Student' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-cyan-400 transition-colors py-2"
                  >
                    My Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-red-400 transition-colors py-2"
                  >
                    Logout
                  </button>
                </>
              )}

              {userRole === 'Admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin');
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-cyan-400 transition-colors py-2"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-red-400 transition-colors py-2"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;