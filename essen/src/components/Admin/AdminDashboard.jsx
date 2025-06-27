import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import ManageDishes from "./ManageDishes";
import ManageUser from "./ManageUser";
import Login from "./Login";


const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginModalOpen = location.pathname === "/admin/login";
  const prevPath = useRef();

  // Guarda la ruta previa
  useEffect(() => {
    prevPath.current = location.state?.from || document.referrer;
  }, [location]);

  // Refresca la pantalla solo una vez al entrar a /admin (no en cada cambio de ruta)
  useEffect(() => {
    // Solo refresca si venís del login y no refrescaste aún
    if (
      location.state?.from === "/admin/login" &&
      sessionStorage.getItem("adminRefreshed") !== "true"
    ) {
      sessionStorage.setItem("adminRefreshed", "true");
      window.location.reload();
    }
    // eslint-disable-next-line
  }, [location.state]);

  // Limpia el flag al salir del dashboard (opcional, por si navega fuera)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("adminRefreshed");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <header className="flex justify-between items-center p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-lg font-medium">Hola, {user.nombre_usuario}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Sidebar collapsable */}
        <nav
          className={`transition-all duration-300 bg-gray-900 border-r border-gray-700 min-h-screen
            ${sidebarOpen
              ? "md:col-span-2 p-6 w-full md:w-56"
              : "md:col-span-1 p-2 w-full md:w-16"
            } overflow-hidden`}
        >
          <button
            className="mb-6 text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? "⏪" : "⏩"}
          </button>
          <div className="space-y-4">
            <div className={`text-gray-400 text-xs uppercase tracking-widest mb-2 ${!sidebarOpen && "hidden md:block"}`}>Panel</div>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin"
                className="no-underline flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition shadow-sm"
              >
                🏠
                {sidebarOpen && <span className="font-semibold text-sm">Home</span>}
              </Link>
              <Link
                to="/admin/dishes"
                className="no-underline flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition shadow-sm pr-8"
              >
                🍽️   
                {sidebarOpen && <span className="font-semibold text-sm">Comidas</span>}
              </Link>
              <Link
                to="/admin/users"
                className="no-underline flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition shadow-sm"
              >
                👤
                {sidebarOpen && <span className="font-semibold text-sm">Usuarios</span>}
              </Link>
            </div>
          </div>
        </nav>

        <main
          className={`transition-all duration-300 ${
            sidebarOpen
              ? "md:col-span-10"
              : "md:col-span-11"
          } p-2 md:p-8 space-y-6`}
        >
          {location.pathname === "/admin" && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-yellow-400 text-black p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-semibold mb-2">Platos</h3>
                <p className="text-3xl font-bold">+700</p>
                <p className="text-sm mt-1">Creados en 2023</p>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-semibold mb-2">Usuarios</h3>
                <p className="text-3xl font-bold text-white">350</p>
                <p className="text-sm mt-1 text-white">Activos este mes</p>
              </div>
              <div className="bg-gradient-to-tr from-gray-700 via-gray-600 to-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-sm font-semibold mb-2 text-white">Explora más</h3>
                <Link to="/admin/dishes">
                  <button className="mt-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition">
                    Ir a Platos
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white text-black p-2 md:p-6 rounded-xl shadow-lg">
            <Routes>
              <Route
                path="dishes"
                element={<ManageDishes />}
              />
              <Route
                path="users"
                element={<ManageUser />}
              />
            </Routes>
          </div>
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="animate-fadeInScale bg-white text-black p-8 rounded-xl shadow-xl w-full max-w-md">
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
