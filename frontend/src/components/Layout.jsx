import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiFilm, FiBarChart2, FiStar, FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Contenuti', path: '/contents', icon: FiFilm },
    { name: 'Valutazioni', path: '/ratings', icon: FiStar },
    { name: 'Analytics', path: '/analytics', icon:  FiBarChart2 }
  ];

  const isActive = (path) => location.pathname. startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-primary-600">🎬 StreamPlatform</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}>
          <div className="h-full flex flex-col">
            {/* Logo + Toggle Desktop */}
            <div className={`p-6 border-b ${sidebarCollapsed ? 'lg:p-4' : ''}`}>
              <div className="hidden lg:flex items-center justify-between">
                {! sidebarCollapsed && (
                  <div>
                    <h1 className="text-2xl font-bold text-primary-600">🎬 StreamPlatform</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestione Contenuti</p>
                  </div>
                )}
                
                {/* Toggle Button Desktop */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
                    sidebarCollapsed ?  'mx-auto' : ''
                  }`}
                  title={sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu'}
                >
                  {sidebarCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
                </button>
              </div>

              {/* Logo Mobile */}
              <div className="lg:hidden">
                <h1 className="text-2xl font-bold text-primary-600">🎬 StreamPlatform</h1>
                <p className="text-sm text-gray-500 mt-1">Gestione Contenuti</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                    ${isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                    ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={`${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {item.name}
                  </span>

                  {/* Tooltip Desktop quando collapsed */}
                  {sidebarCollapsed && (
                    <span className="hidden lg:block absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
                    </span>
                  )}

                  {/* Active Indicator */}
                  {isActive(item.path) && !sidebarCollapsed && (
                    <div className="absolute right-2 w-1. 5 h-1.5 bg-primary-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Footer Collapsed */}
            {sidebarCollapsed && (
              <div className="hidden lg:block p-4 border-t text-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary-600 font-bold text-xs">v1</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-0' : ''
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;