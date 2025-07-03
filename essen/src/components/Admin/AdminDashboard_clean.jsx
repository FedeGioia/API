import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import ManageDishes from "./ManageDishes";
import ManageUser from "./ManageUser";
import Login from "./Login";
import "./AdminDashboard.css";
 
const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalPlatos: 0,
    totalUsuarios: 0,
    totalCategorias: 0,
    loading: true
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginModalOpen = location.pathname === "/admin/login";
  const prevPath = useRef();

  // Fetch real data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [platosRes, usuariosRes, categoriasRes] = await Promise.all([
          fetch('http://localhost:3001/api/platos', { headers }),
          fetch('http://localhost:3001/api/usuarios', { headers }),
          fetch('http://localhost:3001/api/categorias', { headers })
        ]);
        
        const platos = await platosRes.json();
        const usuarios = await usuariosRes.json();
        const categorias = await categoriasRes.json();
        
        setStats({
          totalPlatos: platos.length || 0,
          totalUsuarios: usuarios.length || 0,
          totalCategorias: categorias.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Verifica si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } else {
      setUser(null);
      navigate("/admin/login"); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  // Guarda la ruta previa
  useEffect(() => {
    prevPath.current = location.state?.from || document.referrer;
  }, [location]);

  // Refresca la pantalla solo una vez al entrar a /admin (no en cada cambio de ruta)
  useEffect(() => {
    if (
      location.state?.from === "/admin/login" &&
      sessionStorage.getItem("adminRefreshed") !== "true"
    ) {
      sessionStorage.setItem("adminRefreshed", "true");
      window.location.reload();
    }
  }, [location.state]);

  // Limpia el flag al salir del dashboard (opcional, por si navega fuera)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("adminRefreshed");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/admin/login");
  };

  // Get breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const paths = {
      '/admin': [{ name: 'Dashboard', href: '/admin' }],
      '/admin/dishes': [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Gestión de Platos', href: '/admin/dishes' }
      ],
      '/admin/users': [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Gestión de Usuarios', href: '/admin/users' }
      ]
    };
    return paths[location.pathname] || [{ name: 'Dashboard', href: '/admin' }];
  };

  return (
    <div 
      className="min-h-screen bg-amber-50"
      style={{
        backgroundImage: "radial-gradient(rgba(245,158,11,0.08) 4px, transparent 4px)",
        backgroundSize: "30px 30px",
      }}
    >
      {/* Header idéntico al Layout principal */}
      <header className="header bg-amber-600 shadow-md border-b-2 border-amber-700">
        <div className="container mx-auto px-4 py-0.5">
          <div className="flex justify-between items-center">
            {/* Grupo centrado: título + subtítulo con líneas */}
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h1 className="text-lg md:text-xl font-serif font-semibold text-white tracking-tight">
                  Essen Restaurant
                </h1>
                <div className="flex items-center justify-center space-x-1 my-0.5">
                  <span className="w-1/4 h-px bg-amber-200 -translate-y-1"></span>
                  <p className="text-xs md:text-sm text-amber-100 italic whitespace-nowrap">
                    Administración
                  </p>
                  <span className="w-1/4 h-px bg-amber-200 -translate-y-1"></span>
                </div>
              </div>
            </div>
            
            {/* Botones a la derecha */}
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <div className="hidden sm:flex sm:items-center sm:space-x-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center ring-2 ring-amber-300">
                      <span className="text-xs font-medium text-white">
                        {user.nombre_usuario.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">
                        {user.nombre_usuario}
                      </span>
                      <span className="text-xs text-amber-200">
                        Administrador
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                    </svg>
                    <span>Salir</span>
                  </button>
                </>
              )}
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-amber-100 hover:bg-amber-700 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-amber-200 transform transition-transform duration-300 ease-in-out lg:transform-none`}>
          <div className="h-full flex flex-col">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-amber-200">
              <h2 className="text-lg font-semibold text-amber-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-amber-600 hover:bg-amber-50"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-6">
              <nav className="space-y-2">
                <Link
                  to="/admin"
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === '/admin' 
                      ? 'bg-amber-100 text-amber-900 border-r-2 border-amber-600' 
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                  Dashboard
                </Link>

                <Link
                  to="/admin/dishes"
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === '/admin/dishes' 
                      ? 'bg-amber-100 text-amber-900 border-r-2 border-amber-600' 
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Gestión de Platos
                </Link>

                <Link
                  to="/admin/users"
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === '/admin/users' 
                      ? 'bg-amber-100 text-amber-900 border-r-2 border-amber-600' 
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Gestión de Usuarios
                </Link>
              </nav>

              <div className="mt-8 pt-6 border-t border-amber-200">
                <p className="px-3 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  Estadísticas Rápidas
                </p>
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-amber-700">Total Platos</p>
                      <p className="text-lg font-bold text-amber-900">
                        {stats.loading ? '...' : stats.totalPlatos}
                      </p>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-1.5 mt-1">
                      <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '74%' }}></div>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-700">Usuarios</p>
                      <p className="text-lg font-bold text-green-900">
                        {stats.loading ? '...' : stats.totalUsuarios}
                      </p>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
                      <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-700">Categorías</p>
                      <p className="text-lg font-bold text-blue-900">
                        {stats.loading ? '...' : stats.totalCategorias}
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions in Sidebar */}
              <div className="mt-6 pt-6 border-t border-amber-200">
                <p className="px-3 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  Acciones Rápidas
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/admin/dishes")}
                    className="w-full flex items-center px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition-colors duration-200"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Plato
                  </button>
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="w-full flex items-center px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition-colors duration-200"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Nuevo Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <li key={breadcrumb.href} className="inline-flex items-center">
                    {index > 0 && (
                      <svg className="w-4 h-4 text-amber-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <Link
                      to={breadcrumb.href}
                      className={`inline-flex items-center text-sm font-medium ${
                        index === getBreadcrumbs().length - 1
                          ? 'text-amber-900'
                          : 'text-amber-600 hover:text-amber-700'
                      }`}
                    >
                      {index === 0 && (
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      )}
                      {breadcrumb.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            {location.pathname === "/admin" && (
              <>
                {/* Page header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-amber-900 sm:text-3xl sm:truncate">
                      Dashboard Overview
                    </h2>
                    <p className="mt-1 text-sm text-amber-600">
                      Resumen general de tu restaurante
                    </p>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-amber-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-amber-600 truncate">Total Platos</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-amber-900">
                                {stats.loading ? '...' : stats.totalPlatos}
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <svg className="self-center flex-shrink-0 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Activos</span>
                                {!stats.loading && 'Activos'}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-3">
                      <div className="text-sm">
                        <Link to="/admin/dishes" className="font-medium text-amber-700 hover:text-amber-900 flex items-center">
                          Ver todos los platos
                          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-amber-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-amber-600 truncate">Usuarios Registrados</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-amber-900">
                                {stats.loading ? '...' : stats.totalUsuarios}
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <svg className="self-center flex-shrink-0 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Total</span>
                                {!stats.loading && 'Total'}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-3">
                      <div className="text-sm">
                        <Link to="/admin/users" className="font-medium text-amber-700 hover:text-amber-900 flex items-center">
                          Gestionar usuarios
                          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-amber-200 hover:shadow-md transition-shadow duration-200">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-amber-600 truncate">Categorías</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-amber-900">
                                {stats.loading ? '...' : stats.totalCategorias}
                              </div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-blue-600">
                                <svg className="self-center flex-shrink-0 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="sr-only">Disponibles</span>
                                {!stats.loading && 'Disponibles'}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-3">
                      <div className="text-sm">
                        <span className="font-medium text-amber-700">
                          Sistema organizado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Quick Actions Card */}
                  <div className="lg:col-span-2">
                    <div className="bg-white shadow-sm rounded-lg border border-amber-200">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-amber-900 mb-4">
                          Acciones Rápidas
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <button
                            onClick={() => navigate("/admin/dishes")}
                            className="relative bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-dashed border-amber-300 rounded-lg p-6 hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 transition-all duration-200 group"
                          >
                            <div>
                              <svg className="mx-auto h-12 w-12 text-amber-600 group-hover:text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="mt-2 block text-sm font-medium text-amber-900">
                                Agregar Nuevo Plato
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => navigate("/admin/users")}
                            className="relative bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-dashed border-amber-300 rounded-lg p-6 hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 transition-all duration-200 group"
                          >
                            <div>
                              <svg className="mx-auto h-12 w-12 text-amber-600 group-hover:text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                              <span className="mt-2 block text-sm font-medium text-amber-900">
                                Agregar Usuario
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="lg:col-span-1">
                    <div className="bg-white shadow-sm rounded-lg border border-amber-200">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-amber-900 mb-4">
                          Actividad Reciente
                        </h3>
                        <div className="flow-root">
                          <ul className="-mb-8">
                            {[
                              { action: "Plato agregado", item: "Paella Valenciana", time: "2h", icon: "plus", color: "green" },
                              { action: "Usuario registrado", item: "María García", time: "4h", icon: "user", color: "blue" },
                              { action: "Pedido completado", item: "#1234", time: "6h", icon: "check", color: "green" },
                              { action: "Menú actualizado", item: "Categoría Postres", time: "1d", icon: "edit", color: "amber" }
                            ].map((activity, index, arr) => (
                              <li key={index}>
                                <div className="relative pb-8">
                                  {index !== arr.length - 1 && (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-amber-200" aria-hidden="true"></span>
                                  )}
                                  <div className="relative flex space-x-3">
                                    <div>
                                      <span className={`h-8 w-8 rounded-full bg-${activity.color}-500 flex items-center justify-center ring-8 ring-white`}>
                                        {activity.icon === 'plus' && (
                                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                          </svg>
                                        )}
                                        {activity.icon === 'user' && (
                                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        )}
                                        {activity.icon === 'check' && (
                                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                        {activity.icon === 'edit' && (
                                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        )}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div>
                                        <p className="text-sm text-amber-900">
                                          {activity.action}: <span className="font-medium">{activity.item}</span>
                                        </p>
                                        <p className="text-xs text-amber-600">Hace {activity.time}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white shadow-sm rounded-lg border border-amber-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-amber-900">
                        Rendimiento del Mes
                      </h3>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200">
                          7 días
                        </button>
                        <button className="px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded-full">
                          30 días
                        </button>
                        <button className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200">
                          90 días
                        </button>
                      </div>
                    </div>
                    
                    {/* Simple Chart Placeholder */}
                    <div className="h-64 bg-gradient-to-t from-amber-50 to-white rounded-lg border border-amber-200 flex items-end justify-center p-4">
                      <div className="flex items-end space-x-2 h-full w-full max-w-md">
                        {[40, 70, 45, 80, 55, 90, 65].map((height, index) => (
                          <div key={index} className="flex-1 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm relative group cursor-pointer hover:from-amber-600 hover:to-amber-500 transition-all duration-200" style={{ height: `${height}%` }}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {Math.floor(height * 2.5)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between text-sm text-amber-600">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Content for other routes */}
            {location.pathname !== "/admin" && (
              <div className="bg-white shadow-sm rounded-lg border border-amber-200 p-6">
                <Routes>
                  <Route path="dishes" element={<ManageDishes />} />
                  <Route path="users" element={<ManageUser />} />
                </Routes>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <Login />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
