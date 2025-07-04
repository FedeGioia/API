import React, { useState, useEffect } from "react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ nombre_usuario: "", email: "", password: "", rol_id: "" });
  const [editableUserId, setEditableUserId] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/roles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching roles");
      }

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Error adding user");
      }

      fetchUsers();
      setNewUser({ nombre_usuario: "", email: "", password: "", rol_id: "" });
      setShowAddUserModal(false); // Cierra el modal después de agregar
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditUser = (userId) => {
    setEditableUserId(userId); // Habilita la edición para el usuario seleccionado
  };

  const handleSaveUser = async (userId) => {
    try {
      if (!userId) {
        console.error("Invalid userId:", userId);
        return;
      }

      const token = localStorage.getItem("token");
      const updatedUser = users.find((user) => user.id === userId);

      if (!updatedUser) {
        console.error("User not found for userId:", userId);
        return;
      }

      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("Error editing user");
      }

      fetchUsers();
      setEditableUserId(null); // Deshabilita la edición después de guardar
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token"); // Obtén el token desde localStorage
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Usa el token dinámicamente
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting user");
      }

      fetchUsers(); // Refresh the list of users
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header moderno */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-amber-700 text-sm md:text-base">
              Administra los usuarios del sistema Essen Restaurant
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 md:transform md:-translate-y-3"
              onClick={() => setShowAddUserModal(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar usuario */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Modal principal */}
          <div className="relative bg-white shadow-2xl w-full max-w-3xl mx-4" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Crear Nuevo Usuario</h4>
                    <p className="text-amber-100 text-sm">Añade un nuevo usuario al sistema</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Información del usuario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nombre de usuario</label>
                  <input
                    type="text"
                    placeholder="Ej: juan.perez"
                    value={newUser.nombre_usuario}
                    onChange={(e) => setNewUser({ ...newUser, nombre_usuario: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="juan@restaurante.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Contraseña segura"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Rol</label>
                  <select
                    value={newUser.rol_id}
                    onChange={(e) => setNewUser({ ...newUser, rol_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700"
                  >
                    <option value="" className="text-gray-500">Seleccionar rol</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Crear Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Usuarios moderna */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-amber-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent mb-2">Lista de Usuarios</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl">
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider rounded-l-2xl border-l border-white/20 border-r border-white/20">ID</th>
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider border-r border-white/20">Nombre Usuario</th>
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider border-r border-white/20">Email</th>
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider border-r border-white/20">Rol</th>
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider border-r border-white/20">Fecha Creación</th>
                <th className="px-6 py-4 text-center text-white font-semibold text-sm tracking-wider rounded-r-2xl border-r border-white/20">Acciones</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {users.map((user, index) => (
                <tr key={user.id} className="group hover:bg-amber-50/50 transition-all duration-200">
                  <td className={`px-6 py-4 border-b border-amber-100 border-l border-gray-200 border-r border-gray-200 text-center ${index === users.length - 1 ? 'rounded-bl-2xl' : ''}`}>
                    <div className="font-medium text-gray-900">{user.id}</div>
                  </td>
                  <td className={`px-6 py-4 border-b border-amber-100 border-r border-gray-200 text-center ${index === users.length - 1 ? 'border-b' : ''}`}>
                    {editableUserId === user.id ? (
                      <input
                        type="text"
                        value={user.nombre_usuario}
                        onChange={(e) =>
                          setUsers(
                            users.map((u) =>
                              u.id === user.id ? { ...u, nombre_usuario: e.target.value } : u
                            )
                          )
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-center"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{user.nombre_usuario}</div>
                    )}
                  </td>
                  <td className={`px-6 py-4 border-b border-amber-100 border-r border-gray-200 text-center ${index === users.length - 1 ? 'border-b' : ''}`}>
                    {editableUserId === user.id ? (
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) =>
                          setUsers(
                            users.map((u) =>
                              u.id === user.id ? { ...u, email: e.target.value } : u
                            )
                          )
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-center"
                      />
                    ) : (
                      <div className="text-gray-600 text-sm">{user.email}</div>
                    )}
                  </td>
                  <td className={`px-6 py-4 border-b border-amber-100 border-r border-gray-200 text-center ${index === users.length - 1 ? 'border-b' : ''}`}>
                    {editableUserId === user.id ? (
                      <select
                        value={user.rol_id}
                        onChange={(e) =>
                          setUsers(
                            users.map((u) =>
                              u.id === user.id ? { ...u, rol_id: e.target.value } : u
                            )
                          )
                        }
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-center"
                      >
                        <option value="">Seleccionar Rol</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {roles.find(r => String(r.id) === String(user.rol_id))?.nombre || "N/A"}
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 border-b border-amber-100 border-r border-gray-200 text-center ${index === users.length - 1 ? 'border-b' : ''}`}>
                    <div className="text-gray-600 text-sm">
                      {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className={`px-6 py-4 border-b border-amber-100 border-r border-gray-200 text-center ${index === users.length - 1 ? 'rounded-br-2xl' : ''}`}>
                    <div className="flex gap-2 justify-center">
                      {editableUserId === user.id ? (
                        <button
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => handleSaveUser(user.id)}
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Modificar
                        </button>
                      )}
                      <button
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;