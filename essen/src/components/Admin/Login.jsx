import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nombre_usuario, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [touched, setTouched] = useState({ usuario: false, password: false });

  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/admin");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre_usuario, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas, ingrese los datos nuevamente.");
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setError("");
      setSuccess("¡Bienvenido! Redirigiendo...");
      
      // Pequeña pausa para mostrar el mensaje antes de redirigir
      setTimeout(() => {
        navigate("/admin");
        window.location.reload();
      }, 1500);
    } catch (error) {
      setError(error.message);
      setSuccess("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeInScale">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Iniciar sesión</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">Usuario</label>
          <input
            type="text"
            value={nombre_usuario}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, usuario: true }))}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              touched.usuario && !nombre_usuario
                ? "border-red-500 bg-red-50 focus:ring-red-400"
                : "border-amber-300 bg-white focus:ring-amber-400"
            } text-gray-800 focus:outline-none focus:ring-2`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              touched.password && !password
                ? "border-red-500 bg-red-50 focus:ring-red-400"
                : "border-amber-300 bg-white focus:ring-amber-400"
            } text-gray-800 focus:outline-none focus:ring-2`}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-full mt-2 text-sm text-center text-amber-900 hover:text-amber-500 transition duration-200"
        >
          Cancelar
        </button>
      </form>

      {/* Mensaje de éxito elegante */}
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center animate-fadeIn">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
