import React, { useState, useEffect } from "react";

const ManageDishes = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [dishes, setDishes] = useState([]);

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

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchDishes();
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Platos</h1>

      {/* Botón para abrir el modal */}
      <button
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
        onClick={() => setShowAddDishModal(true)}
      >
        Agregar Plato
      </button>

      {/* Modal para agregar plato */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Plato</h4>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Nombre del plato"
                value={newDish.nombre}
                onChange={(e) => setNewDish({ ...newDish, nombre: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Precio"
                value={newDish.precio}
                onChange={(e) => setNewDish({ ...newDish, precio: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={newDish.descripcion}
                onChange={(e) => setNewDish({ ...newDish, descripcion: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Imagen (filename)"
                value={newDish.image}
                onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 w-full">
                <select
                  value={newDish.categoria_id}
                  onChange={(e) => setNewDish({ ...newDish, categoria_id: e.target.value, subcategoria_id: "" })}
                  className="border border-gray-300 rounded px-4 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddCategoryForm((prev) => !prev)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition duration-200"
                >
                  +
                </button>
              </div>
              {showAddCategoryForm && (
                <div className="w-full bg-gray-100 p-4 rounded-lg shadow-md mb-4">
                  <input
                    type="text"
                    placeholder="Nueva Categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm mt-2 w-full shadow-md transition duration-200"
                  >
                    Crear Categoría
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <select
                  value={newDish.subcategoria_id}
                  onChange={(e) => setNewDish({ ...newDish, subcategoria_id: e.target.value })}
                  className="border border-gray-300 rounded px-4 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!newDish.categoria_id}
                >
                  <option value="">Subcategoría</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddSubcategoryForm((prev) => !prev)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition duration-200"
                >
                  +
                </button>
              </div>
              {showAddSubcategoryForm && (
                <div className="w-full bg-gray-100 p-4 rounded-lg shadow-md mb-4">
                  <select
                    value={newSubcategory.categoria_id}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, categoria_id: e.target.value })}
                    className="border border-gray-300 rounded px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nueva Subcategoría"
                    value={newSubcategory.nombre}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, nombre: e.target.value })}
                    className="border border-gray-300 rounded px-4 py-2 text-sm w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddSubcategory}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm mt-2 w-full shadow-md transition duration-200"
                  >
                    Crear Subcategoría
                  </button>
                </div>
              )}
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleAddDish}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full shadow-md transition duration-200"
                >
                  Crear
                </button>
                <button
                  onClick={() => setShowAddDishModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm w-full shadow-md transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listar Platos */}
      <h4 className="text-xl font-semibold mb-4 mt-6 text-gray-800">Lista de Platos</h4>
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Precio</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Categoría</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Subcategoría</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Disponible</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish, index) => {
            const categoria = dish.categoria ? categories.find((c) => String(c.id) === String(dish.categoria.id)) : null;
            const subcategoria = dish.subcategoria ? subcategories.find((s) => String(s.id) === String(dish.subcategoria.id)) : null;

            return (
              <tr key={dish.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="border border-gray-300 px-4 py-2">{dish.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">{dish.precio} €</td>
                <td className="border border-gray-300 px-4 py-2">{dish.descripcion}</td>
                <td className="border border-gray-300 px-4 py-2">{categoria ? categoria.nombre : ""}</td>
                <td className="border border-gray-300 px-4 py-2">{subcategoria ? subcategoria.nombre : ""}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {dish.disponible === true || dish.disponible === "true" ? "Sí" : "No"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm shadow-md transition duration-200"
                    onClick={() => console.log("Modificar plato", dish)}
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
  );
};

export default ManageDishes;