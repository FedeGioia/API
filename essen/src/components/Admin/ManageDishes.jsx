import React, { useState, useEffect } from "react";

const ManageDishes = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [alergenos, setAlergenos] = useState([]);

  const [newDish, setNewDish] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    image: "",
    categoria_id: "",
    subcategoria_id: "",
  });

  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddSubcategoryForm, setShowAddSubcategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState({ nombre: "", categoria_id: "" });

  const [dishModal, setDishModal] = useState({
    open: false,
    editing: false,
    data: {
      nombre: "",
      precio: "",
      descripcion: "",
      image: "",
      categoria_id: "",
      subcategoria_id: "",
      alergenos: [],
      disponible: true,
    },
    loading: false,
    error: null,
    success: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchDishes();
    fetchAlergenos();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error("Error fetching categories", e);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/subcategorias");
      const data = await res.json();
      setSubcategories(data);
    } catch (e) {
      console.error("Error fetching subcategories", e);
    }
  };

  const fetchDishes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/platos");
      const data = await res.json();
      setDishes(data);
    } catch (e) {
      console.error("Error fetching dishes", e);
    }
  };

  const fetchAlergenos = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/alergenos");
      const data = await res.json();
      setAlergenos(data);
    } catch (e) {
      console.error("Error fetching alergenos", e);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await fetch("http://localhost:3000/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newCategory }),
      });
      setNewCategory("");
      setShowAddCategoryForm(false);
      fetchCategories();
    } catch (e) {
      console.error("Error adding category", e);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.nombre.trim() || !newSubcategory.categoria_id) return;
    try {
      await fetch("http://localhost:3000/api/subcategorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubcategory),
      });
      setNewSubcategory({ nombre: "", categoria_id: "" });
      setShowAddSubcategoryForm(false);
      fetchSubcategories();
    } catch (e) {
      console.error("Error adding subcategory", e);
    }
  };

  const handleAddDish = async () => {
    if (!newDish.nombre.trim() || !newDish.precio || !newDish.categoria_id || !newDish.subcategoria_id) return;
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3000/api/platos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newDish),
      });
      setNewDish({ nombre: "", precio: "", descripcion: "", image: "", categoria_id: "", subcategoria_id: "" });
      fetchDishes();
      setShowAddDishModal(false); // Cierra el modal después de agregar el plato
    } catch (e) {
      console.error("Error adding dish", e);
    }
  };

  const filteredSubcategories = newDish.categoria_id
    ? subcategories.filter((s) => String(s.categoria_id) === String(newDish.categoria_id))
    : [];

  const openCreateDishModal = () => {
    setDishModal({
      open: true,
      editing: false,
      data: {
        nombre: "",
        precio: "",
        descripcion: "",
        image: "",
        categoria_id: "",
        subcategoria_id: "",
        alergenos: [],
        disponible: true,
      },
      loading: false,
      error: null,
      success: null,
    });
  };

  const openEditDishModal = (dish) => {
    setDishModal({
      open: true,
      editing: true,
      data: {
        ...dish,
        alergenos: Array.isArray(dish.alergenos)
          ? dish.alergenos.map((a) => (typeof a === "object" ? a.id : a))
          : [],
      },
      loading: false,
      error: null,
      success: null,
    });
  };

  const closeDishModal = () => {
    setDishModal((prev) => ({ ...prev, open: false, error: null, success: null }));
  };

  const isDuplicateDish = (nombre, categoria_id, subcategoria_id, id = null) => {
    return dishes.some(
      (d) =>
        d.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
        String(d.categoria_id) === String(categoria_id) &&
        String(d.subcategoria_id) === String(subcategoria_id) &&
        (id === null || d.id !== id)
    );
  };

  const handleSaveDish = async () => {
    setDishModal((prev) => ({ ...prev, loading: true, error: null, success: null }));
    const { nombre, precio, descripcion, image, categoria_id, subcategoria_id, alergenos, disponible } = dishModal.data;
    if (!nombre.trim() || !precio || !categoria_id || !subcategoria_id) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "Completa todos los campos obligatorios." }));
      return;
    }
    if (isNaN(precio) || Number(precio) <= 0) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "El precio debe ser un número positivo." }));
      return;
    }
    if (isDuplicateDish(nombre, categoria_id, subcategoria_id, dishModal.editing ? dishModal.data.id : null)) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "Ya existe un plato con ese nombre en esta categoría y subcategoría." }));
      return;
    }
    if (!Array.isArray(alergenos) || alergenos.some((a) => !alergenos.includes(a))) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "Selecciona alérgenos válidos." }));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = dishModal.editing
        ? `http://localhost:3000/api/platos/${dishModal.data.id}`
        : "http://localhost:3000/api/platos";
      const method = dishModal.editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre,
          precio,
          descripcion,
          image,
          categoria_id,
          subcategoria_id,
          alergenos,
          disponible,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar el plato");
      }
      setDishModal((prev) => ({ ...prev, loading: false, success: "Plato guardado con éxito!" }));
      fetchDishes();
      setTimeout(() => closeDishModal(), 1200);
    } catch (e) {
      setDishModal((prev) => ({ ...prev, loading: false, error: e.message || "Error al guardar el plato" }));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header moderno */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent mb-2">
              Gestión de Platos
            </h1>
            <p className="text-amber-700 text-sm md:text-base">
              Administra el menú completo de Essen Restaurant
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              onClick={openCreateDishModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Plato
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar plato */}
      {dishModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          {/* Modal principal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {dishModal.editing ? "Editar Plato" : "Crear Nuevo Plato"}
                    </h4>
                    <p className="text-amber-100 text-sm">Añade un nuevo plato al menú de Essen</p>
                  </div>
                </div>
                <button
                  onClick={closeDishModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Nombre del plato</label>
                  <input
                    type="text"
                    placeholder="Ej: Paella Valenciana"
                    value={dishModal.data.nombre}
                    onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, nombre: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="15.50"
                    value={dishModal.data.precio}
                    onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, precio: e.target.value } }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                <textarea
                  placeholder="Descripción detallada del plato..."
                  value={dishModal.data.descripcion}
                  onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, descripcion: e.target.value } }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Imagen</label>
                <input
                  type="text"
                  placeholder="nombre-imagen.jpg"
                  value={dishModal.data.image}
                  onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, image: e.target.value } }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Categorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Categoría</label>
                  <div className="flex gap-2">
                    <select
                      value={dishModal.data.categoria_id}
                      onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, categoria_id: e.target.value, subcategoria_id: "" } }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700"
                    >
                      <option value="" className="text-gray-500">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddCategoryForm((prev) => !prev)}
                      className="px-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Subcategoría</label>
                  <div className="flex gap-2">
                    <select
                      value={dishModal.data.subcategoria_id}
                      onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, subcategoria_id: e.target.value } }))}
                      disabled={!dishModal.data.categoria_id}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
                    >
                      <option value="" className="text-gray-500">Seleccionar subcategoría</option>
                      {filteredSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowAddSubcategoryForm((prev) => !prev)}
                      disabled={!dishModal.data.categoria_id}
                      className="px-3 py-3 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulario para nueva categoría */}
              {showAddCategoryForm && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h5 className="font-semibold text-gray-700 text-sm">Nueva Categoría</h5>
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre de la categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => setShowAddCategoryForm(false)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Formulario para nueva subcategoría */}
              {showAddSubcategoryForm && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h5 className="font-semibold text-gray-700 text-sm">Nueva Subcategoría</h5>
                  </div>
                  <select
                    value={newSubcategory.categoria_id}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, categoria_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="">Seleccionar categoría padre</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nombre de la subcategoría"
                    value={newSubcategory.nombre}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSubcategory}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => setShowAddSubcategoryForm(false)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Alérgenos */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Alérgenos</label>
                <div className="flex gap-2">
                  {alergenos.map((alergeno) => (
                    <button
                      key={alergeno.id}
                      onClick={() => {
                        const updatedAlergenos = dishModal.data.alergenos.includes(alergeno.id)
                          ? dishModal.data.alergenos.filter((a) => a !== alergeno.id)
                          : [...dishModal.data.alergenos, alergeno.id];
                        setDishModal((prev) => ({ ...prev, data: { ...prev.data, alergenos: updatedAlergenos } }));
                      }}
                      className={`px-3 py-2 rounded-full ${
                        dishModal.data.alergenos.includes(alergeno.id)
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {alergeno.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Disponibilidad</label>
                <select
                  value={dishModal.data.disponible ? "true" : "false"}
                  onChange={(e) => setDishModal((prev) => ({ ...prev, data: { ...prev.data, disponible: e.target.value === "true" } }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-gray-700"
                >
                  <option value="true">Disponible</option>
                  <option value="false">No disponible</option>
                </select>
              </div>

              {/* Feedback */}
              {dishModal.loading && (
                <div className="text-center text-amber-700 text-sm">
                  {dishModal.error ? (
                    <span className="text-red-600">{dishModal.error}</span>
                  ) : (
                    <span className="text-green-600">{dishModal.success}</span>
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDishModal}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDish}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {dishModal.editing ? "Actualizar Plato" : "Crear Plato"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Platos moderna */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-amber-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent mb-2">Lista de Platos</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-700 to-amber-600 rounded-2xl">
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider rounded-l-2xl">Nombre</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider">Precio</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider">Subcategoría</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider">Disponible</th>
                <th className="px-6 py-4 text-left text-white font-semibold text-sm tracking-wider rounded-r-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {dishes.map((dish, index) => {
                const categoria = dish.categoria ? categories.find((c) => String(c.id) === String(dish.categoria.id)) : null;
                const subcategoria = dish.subcategoria ? subcategories.find((s) => String(s.id) === String(dish.subcategoria.id)) : null;

                return (
                  <tr key={dish.id} className="group hover:bg-amber-50/50 transition-all duration-200">
                    <td className="px-6 py-4 border-b border-amber-100">
                      <div className="font-medium text-gray-900">{dish.nombre}</div>
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {dish.precio} €
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      <div className="text-gray-600 text-sm max-w-xs" title={dish.descripcion}>
                        {dish.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {categoria ? categoria.nombre : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {subcategoria ? subcategoria.nombre : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      {dish.disponible === true || dish.disponible === "true" ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Disponible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          No disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-amber-100">
                      <button
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                        onClick={() => openEditDishModal(dish)}
                      >
                        Modificar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageDishes;