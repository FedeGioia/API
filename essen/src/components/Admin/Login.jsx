import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nombre_usuario, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setError("");
      alert("Login exitoso");
      navigate("/admin");
      window.location.reload(); // Recarga la página después de navegar
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeInScale">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            value={nombre_usuario}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, usuario: true }))}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              touched.usuario && !nombre_usuario
                ? "border-red-500 bg-red-50 focus:ring-red-400"
                : "border-gray-300 bg-gray-100 focus:ring-blue-400"
            } text-gray-800 focus:outline-none focus:ring-2`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              touched.password && !password
                ? "border-red-500 bg-red-50 focus:ring-red-400"
                : "border-gray-300 bg-gray-100 focus:ring-blue-400"
            } text-gray-800 focus:outline-none focus:ring-2`}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-full mt-2 text-sm text-center text-blue-600 hover:underline"
        >
          Cancelar
        </button>
      </form>

      {error && (
        <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default Login;
