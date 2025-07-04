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
    eliminado: false,
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
      imageFile: null,
      imagePreview: "",
      imageUrl: "",
      categoria_id: "",
      subcategoria_id: "",
      alergenos: [],
      disponible: true
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
      // Asegurar que siempre sea un array
      const alergenosArray = Array.isArray(data) ? data : [];
      setAlergenos(alergenosArray);
      console.log('✅ Alérgenos cargados:', alergenosArray);
    } catch (e) {
      console.error("Error fetching alergenos", e);
      // En caso de error, establecer array vacío
      setAlergenos([]);
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

  // Función helper para convertir archivo a base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remover el prefijo data:image/...;base64,
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para manejar la carga de archivos de imagen
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDishModal((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            image: file.name,
            imageFile: file,
            imagePreview: e.target.result,
            imageUrl: ""
          }
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor selecciona un archivo de imagen válido');
    }
  };

  // Función para remover la imagen seleccionada
  const removeImage = () => {
    setDishModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        image: "",
        imageFile: null,
        imagePreview: "",
        imageUrl: ""
      }
    }));
    // Limpiar el input file
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
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
      setNewDish({ nombre: "", precio: "", descripcion: "", image: "", categoria_id: "", subcategoria_id: "" , eliminado: false });
      fetchDishes();
      setShowAddDishModal(false); // Cierra el modal después de agregar el plato
    } catch (e) {
      console.error("Error adding dish", e);
    }
  };

  const filteredSubcategories = dishModal.data.categoria_id
    ? subcategories.filter((s) => String(s.categoria_id) === String(dishModal.data.categoria_id))
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
        imageFile: null,
        imagePreview: "",
        imageUrl: "",
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
        imageFile: null,
        imagePreview: dish.image || "",
        imageUrl: dish.image && !dish.image.startsWith('data:') ? dish.image : "",
      },
      loading: false,
      error: null,
      success: null,
    });
  };

  const closeDishModal = () => {
    setDishModal((prev) => ({ 
      ...prev, 
      open: false, 
      error: null, 
      success: null,
      data: {
        nombre: "",
        precio: "",
        descripcion: "",
        image: "",
        imageFile: null,
        imagePreview: "",
        imageUrl: "",
        categoria_id: "",
        subcategoria_id: "",
        alergenos: [],
        disponible: true,
      }
    }));
    // Limpiar el input file
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
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
    console.log('=== INICIANDO GUARDADO DE PLATO ===');
    setDishModal((prev) => ({ ...prev, loading: true, error: null, success: null }));
    
    const { nombre, precio, descripcion, categoria_id, subcategoria_id, alergenos, disponible, imageFile, imageUrl } = dishModal.data;
    
    console.log('Datos del modal:', dishModal.data);
    
    // Validaciones básicas
    if (!nombre.trim()) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "El nombre es obligatorio." }));
      return;
    }
    if (!precio) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "El precio es obligatorio." }));
      return;
    }
    if (!categoria_id) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "Selecciona una categoría." }));
      return;
    }
    if (isNaN(precio) || Number(precio) <= 0) {
      setDishModal((prev) => ({ ...prev, loading: false, error: "El precio debe ser un número positivo." }));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log('Token:', token ? 'Existe' : 'No existe');
      
      // Preparar imagen de forma simple
      let finalImageData = "";
      if (imageFile) {
        finalImageData = imageFile.name;
      } else if (imageUrl && imageUrl.trim()) {
        finalImageData = imageUrl.trim();
      }

      const requestData = {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        descripcion: descripcion.trim() || "",
        image: finalImageData,
        categoria_id: parseInt(categoria_id),
        subcategoria_id: parseInt(subcategoria_id),
        alergenos: Array.isArray(alergenos) ? alergenos : [],
        disponible: disponible !== false,
      };

      console.log('Datos a enviar:', requestData);

      const url = dishModal.editing
        ? `http://localhost:3000/api/platos/${dishModal.data.id}`
        : "http://localhost:3000/api/platos";
      const method = dishModal.editing ? "PUT" : "POST";
      
      console.log(`Enviando ${method} a ${url}`);

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", 
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Respuesta del servidor:', res.status, res.statusText);
      
      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = await res.json();
          console.error('Error del servidor:', errorData);
          
          // Manejo específico de errores de validación
          if (errorData.errors) {
            errorMessage = errorData.errors.map(err => err.msg).join(', ');
          } else if (errorData.validationErrors) {
            errorMessage = errorData.validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
          } else if (errorData.details) {
            errorMessage = `${errorData.error}: ${errorData.details}`;
          } else {
            errorMessage = errorData.message || errorData.error || `Error ${res.status}`;
          }
        } catch {
          errorMessage = `Error del servidor: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await res.json();
      console.log('Plato guardado exitosamente:', result);
      
      setDishModal((prev) => ({ ...prev, loading: false, success: "¡Plato guardado con éxito!" }));
      fetchDishes();
      setTimeout(() => closeDishModal(), 2000);
      
    } catch (e) {
      console.error('Error completo:', e);
      setDishModal((prev) => ({ 
        ...prev, 
        loading: false, 
        error: e.message || "Error desconocido al guardar el plato" 
      }));
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este plato?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3000/api/platos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDishes();
    } catch (e) {
      console.error("Error eliminando plato", e);
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
                <div className="space-y-3">
                  {/* Input de archivo */}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Seleccionar imagen
                    </label>
                    {dishModal.data.image && dishModal.data.imageFile && (
                      <span className="text-sm text-gray-600">
                        {dishModal.data.imageFile.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Preview de la imagen */}
                  {dishModal.data.imagePreview && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <img
                          src={dishModal.data.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">Vista previa</span>
                    </div>
                  )}
                  
                  {/* Fallback: input de texto para URL */}
                  <div className="border-t pt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-2">O ingresa una URL de imagen:</label>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={dishModal.data.imageUrl || ""}
                      onChange={(e) => setDishModal((prev) => ({ 
                        ...prev, 
                        data: { 
                          ...prev.data, 
                          imageUrl: e.target.value,
                          image: e.target.value,
                          imagePreview: e.target.value
                        } 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
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
              {/* Mensajes de estado */}
              {dishModal.loading && (
                <div className="text-center text-amber-700 text-sm">
                  Guardando plato...
                </div>
              )}
              
              {dishModal.error && (
                <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {dishModal.error}
                </div>
              )}
              
              {dishModal.success && (
                <div className="text-center text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                  {dishModal.success}
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
                      <div className="flex gap-2">
                        <button
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => openEditDishModal(dish)}
                        >
                          Modificar
                        </button>
                        <button
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:scale-105"
                          onClick={() => handleDeleteDish(dish.id)}
                        >
                          Eliminar
                        </button>
                      </div>
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