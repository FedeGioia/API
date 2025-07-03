import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ManageDishes from "./ManageDishes";
import ManageUser from "./ManageUser";
import Login from "./Login";
import "./AdminDashboard.css";
 
const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalDishes, setTotalDishes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dishesGrowthData, setDishesGrowthData] = useState([]);
  const [usersGrowthData, setUsersGrowthData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginModalOpen = location.pathname === "/admin/login";
  const prevPath = useRef();

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

  // Función para obtener estadísticas reales
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Obtener total de platos
      const dishesResponse = await fetch("http://localhost:3000/api/platos", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (dishesResponse.ok) {
        const dishesData = await dishesResponse.json();
        setTotalDishes(dishesData.length);
      }

      // Obtener total de usuarios
      const usersResponse = await fetch("http://localhost:3000/api/usuarios", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setTotalUsers(usersData.length);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      setLoading(false);
    }
  };

  // Función para obtener datos de crecimiento reales
  const fetchGrowthData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setChartsLoading(true);

      // Obtener datos de crecimiento de platos
      const dishesGrowthResponse = await fetch("http://localhost:3000/api/platos/crecimiento", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (dishesGrowthResponse.ok) {
        const dishesGrowthData = await dishesGrowthResponse.json();
        // Formatear fechas para mostrar en el gráfico
        const formattedDishesData = dishesGrowthData.map(item => ({
          ...item,
          mes: formatMonth(item.mes)
        }));
        setDishesGrowthData(formattedDishesData);
      }

      // Obtener datos de crecimiento de usuarios
      const usersGrowthResponse = await fetch("http://localhost:3000/api/usuarios/crecimiento", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (usersGrowthResponse.ok) {
        const usersGrowthData = await usersGrowthResponse.json();
        // Formatear fechas para mostrar en el gráfico
        const formattedUsersData = usersGrowthData.map(item => ({
          ...item,
          mes: formatMonth(item.mes)
        }));
        setUsersGrowthData(formattedUsersData);
      }

      setChartsLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de crecimiento:", error);
      setChartsLoading(false);
    }
  };

  // Función para formatear el mes (2024-01 -> Ene 2024)
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Obtener estadísticas cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      fetchStatistics();
      fetchGrowthData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/admin/login");
  };

  return (
    <div
      className="relative min-h-screen bg-amber-50 flex flex-col"
      style={{
        backgroundImage: "radial-gradient(rgba(245,158,11,0.15) 4px, transparent 4px)",
        backgroundSize: "30px 30px",
      }}
    >
      <header className="header bg-amber-600 shadow-md border-b-2 border-amber-700">
        <div className="container mx-auto px-4 flex flex-col items-center py-0.5 space-y-0">
          <div>
            <h1 className="text-lg md:text-xl font-serif font-semibold text-white tracking-tight">
              Essen Restaurant
            </h1>
            <div className="flex items-center justify-center space-x-1 my-0.5">
              <span className="flex-1 h-px bg-amber-200 -translate-y-1"></span>
              <p className="text-xs md:text-sm text-amber-100 italic whitespace-nowrap px-2">
                Administración
              </p>
              <span className="flex-1 h-px bg-amber-200 -translate-y-1"></span>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                {user.nombre_usuario.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs md:text-sm text-amber-100 font-medium">Hola, {user.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="bg-amber-700 text-white hover:bg-amber-800 px-3 py-1 text-xs md:text-sm font-medium rounded-full transition duration-200 flex items-center gap-1 ml-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="bg-amber-700 text-white hover:bg-amber-800 px-3 py-1 text-xs md:text-sm font-medium rounded-full transition duration-200">
              Login
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar moderno con paleta Essen oscura */}
        <nav
          className={`transition-all duration-300 bg-gradient-to-b from-amber-950 via-amber-900 to-orange-900 shadow-2xl min-h-full relative overflow-hidden border-r border-amber-800/30
            ${sidebarOpen ? "w-64 p-6" : "w-24 p-4"}`}
        >
          {/* Efecto de fondo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full transform translate-x-16 -translate-y-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Toggle button mejorado con mejor posicionamiento */}
            <button
              className={`mb-6 text-amber-200 hover:text-white focus:outline-none bg-amber-900/60 hover:bg-amber-600/80 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-lg hover:shadow-xl
                ${sidebarOpen ? "p-2.5" : "p-3 w-full flex justify-center"}`}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Navegación moderna */}
            <div className={`space-y-3 ${!sidebarOpen ? "space-y-4" : ""}`}>
              <Link
                to="/admin"
                className={`sidebar-link group relative flex items-center rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                  sidebarOpen 
                    ? "gap-3 px-4 py-3" 
                    : "p-4 justify-center"
                } ${
                  location.pathname === "/admin" 
                    ? "bg-amber-600/25 text-white backdrop-blur-sm" 
                    : "bg-amber-900/50 hover:bg-amber-600/20 text-amber-100 hover:text-white backdrop-blur-sm"
                }`}
                title={!sidebarOpen ? "Dashboard" : ""}
              >
                <div className={`rounded-xl transition-all duration-300 ${
                  sidebarOpen ? "p-2" : "p-2"
                } ${
                  location.pathname === "/admin" 
                    ? "bg-amber-600/40" 
                    : "bg-orange-800/50 group-hover:bg-amber-600/30"
                }`}>
                  <svg className={`${sidebarOpen ? "w-4 h-4" : "w-6 h-6"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                {sidebarOpen && (
                  <div className="flex-1">
                    <span className="font-semibold text-sm">Dashboard</span>
                    <p className="text-xs opacity-70">Vista general</p>
                  </div>
                )}
                {location.pathname === "/admin" && (
                  <div className={`bg-amber-400 rounded-full absolute ${sidebarOpen ? "w-1 h-8 -right-1" : "w-2 h-2 top-2 right-2"}`}></div>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-amber-900 text-amber-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Dashboard
                  </div>
                )}
              </Link>

              <Link
                to="/admin/dishes"
                className={`sidebar-link group relative flex items-center rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                  sidebarOpen 
                    ? "gap-3 px-4 py-3" 
                    : "p-4 justify-center"
                } ${
                  location.pathname === "/admin/dishes" 
                    ? "bg-amber-600/25 text-white backdrop-blur-sm" 
                    : "bg-amber-900/50 hover:bg-amber-600/20 text-amber-100 hover:text-white backdrop-blur-sm"
                }`}
                title={!sidebarOpen ? "Gestionar Platos" : ""}
              >
                <div className={`rounded-xl transition-all duration-300 ${
                  sidebarOpen ? "p-2" : "p-2"
                } ${
                  location.pathname === "/admin/dishes" 
                    ? "bg-amber-600/40" 
                    : "bg-orange-800/50 group-hover:bg-amber-600/30"
                }`}>
                  <svg className={`${sidebarOpen ? "w-4 h-4" : "w-6 h-6"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                {sidebarOpen && (
                  <div className="flex-1">
                    <span className="font-semibold text-sm">Platos</span>
                    <p className="text-xs opacity-70">Gestionar menú</p>
                  </div>
                )}
                {location.pathname === "/admin/dishes" && (
                  <div className={`bg-amber-400 rounded-full absolute ${sidebarOpen ? "w-1 h-8 -right-1" : "w-2 h-2 top-2 right-2"}`}></div>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-amber-900 text-amber-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Gestionar Platos
                  </div>
                )}
              </Link>

              <Link
                to="/admin/users"
                className={`sidebar-link group relative flex items-center rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                  sidebarOpen 
                    ? "gap-3 px-4 py-3" 
                    : "p-4 justify-center"
                } ${
                  location.pathname === "/admin/users" 
                    ? "bg-amber-600/25 text-white backdrop-blur-sm" 
                    : "bg-amber-900/50 hover:bg-amber-600/20 text-amber-100 hover:text-white backdrop-blur-sm"
                }`}
                title={!sidebarOpen ? "Gestionar Usuarios" : ""}
              >
                <div className={`rounded-xl transition-all duration-300 ${
                  sidebarOpen ? "p-2" : "p-2"
                } ${
                  location.pathname === "/admin/users" 
                    ? "bg-amber-600/40" 
                    : "bg-orange-800/50 group-hover:bg-amber-600/30"
                }`}>
                  <svg className={`${sidebarOpen ? "w-4 h-4" : "w-6 h-6"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                {sidebarOpen && (
                  <div className="flex-1">
                    <span className="font-semibold text-sm">Usuarios</span>
                    <p className="text-xs opacity-70">Gestionar acceso</p>
                  </div>
                )}
                {location.pathname === "/admin/users" && (
                  <div className={`bg-amber-400 rounded-full absolute ${sidebarOpen ? "w-1 h-8 -right-1" : "w-2 h-2 top-2 right-2"}`}></div>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-amber-900 text-amber-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Gestionar Usuarios
                  </div>
                )}
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {location.pathname === "/admin" && (
            <>
              {/* Welcome Header moderno */}
              <div className="bg-white/95 backdrop-blur-soft rounded-3xl p-6 shadow-modern border border-amber-200 card-entrance">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent mb-2">
                        ¡Bienvenido de vuelta, {user?.nombre_usuario || "Admin"}!
                      </h2>
                      <span className="text-2xl md:text-3xl">👋</span>
                    </div>
                    <p className="text-amber-700 text-sm md:text-base">
                      La administración de Essen en el mismo lugar.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs text-amber-600 font-medium">
                      {new Date().toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <div className="flex items-center justify-end mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Sistema Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de métricas modernas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card de Platos con estilo premium */}
                <div
                  className="group metric-card bg-white rounded-3xl p-6 shadow-modern border border-amber-100 cursor-pointer hover:shadow-modern-hover transition-all duration-300 card-entrance"
                  style={{ animationDelay: '0.1s' }}
                  onClick={() => navigate("/admin/dishes")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                        {loading ? (
                          <span className="pulse-loading">...</span>
                        ) : (
                          <span className="counter">{totalDishes}</span>
                        )}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                          +12%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-amber-800 font-semibold text-sm mb-1">Total Platos</h3>
                  <p className="text-amber-600 text-xs">Menú disponible</p>
                  <div className="absolute inset-0 bg-gradient-card-hover opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300"></div>
                </div>

                {/* Card de Usuarios premium */}
                <div
                  className="group metric-card bg-white rounded-3xl p-6 shadow-modern border border-amber-100 cursor-pointer hover:shadow-modern-hover transition-all duration-300 card-entrance"
                  style={{ animationDelay: '0.2s' }}
                  onClick={() => navigate("/admin/users")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                        {loading ? (
                          <span className="pulse-loading">...</span>
                        ) : (
                          <span className="counter">{totalUsers}</span>
                        )}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                          +8%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-amber-800 font-semibold text-sm mb-1">Usuarios</h3>
                  <p className="text-amber-600 text-xs">Registrados activos</p>
                  <div className="absolute inset-0 bg-gradient-card-hover opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Gráficos de crecimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico de crecimiento de platos */}
                <div className="bg-white rounded-3xl p-6 shadow-modern border border-amber-100 card-entrance" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-amber-900">Crecimiento de Platos</h3>
                  </div>
                  <div className="h-48">
                    {chartsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-amber-600">Cargando datos...</div>
                      </div>
                    ) : dishesGrowthData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-amber-500">No hay datos disponibles</div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dishesGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                          <XAxis 
                            dataKey="mes" 
                            stroke="#92400e" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#92400e" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff7ed',
                              border: '1px solid #f59e0b',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="platos" 
                            stroke="#f59e0b" 
                            strokeWidth={3}
                            dot={{ fill: '#ea580c', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#ea580c', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Gráfico de crecimiento de usuarios */}
                <div className="bg-white rounded-3xl p-6 shadow-modern border border-amber-100 card-entrance" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-amber-900">Crecimiento de Usuarios</h3>
                  </div>
                  <div className="h-48">
                    {chartsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-blue-600">Cargando datos...</div>
                      </div>
                    ) : usersGrowthData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-blue-500">No hay datos disponibles</div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usersGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3b82f620" />
                          <XAxis 
                            dataKey="mes" 
                            stroke="#1e40af" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#1e40af" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#eff6ff',
                              border: '1px solid #3b82f6',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="usuarios" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#7c3aed', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#7c3aed', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Routes>
            <Route path="dishes" element={<ManageDishes />} />
            <Route path="users" element={<ManageUser />} />
          </Routes>

          {/* Modal de login con colores coherentes de Essen */}
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 flex items-center justify-center p-4">
              {/* Patrón de fondo decorativo */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(rgba(245,158,11,0.2) 2px, transparent 2px)",
                  backgroundSize: "50px 50px",
                }}
              ></div>
              
              {/* Efectos decorativos con colores Essen */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl"></div>
              
              {/* Contenedor del login elegante */}
              <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 border border-amber-200">
                {/* Header con estilo Essen */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-amber-900 mb-1">Essen Restaurant</h2>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="flex-1 h-px bg-amber-300 max-w-12 -translate-y-2"></span>
                    <p className="text-amber-700 text-sm font-medium">Panel de Administración</p>
                    <span className="flex-1 h-px bg-amber-300 max-w-12 -translate-y-2"></span>
                  </div>
                  <p className="text-amber-600 text-xs">Accede con tus credenciales</p>
                </div>
                
                {/* Componente Login */}
                <Login />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
