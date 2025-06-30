"use client";

import { useState, useEffect, useRef } from "react";
import Dish from "./Dish";
import logo from "../img/logo.jpeg";
import "../index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Menu = ({ activeCategory, setActiveCategory, activeSubcategory, setActiveSubcategory }) => {
  const [menuData, setMenuData] = useState([]); // Estado para almacenar los datos de los platos
  const [categories, setCategories] = useState([]); // Estado para almacenar las categorías
  const [subcategories, setSubcategories] = useState([]); // Estado para almacenar las subcategorías
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar el menú lateral en móviles
  const dishesRef = useRef(null);

  // Función para obtener las categorías desde el servicio
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/categorias", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las categorías");
      }

      const data = await response.json(); // Convierte la respuesta a JSON
      setCategories(data); // Actualiza el estado con las categorías obtenidas
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función para obtener las subcategorías desde el servicio
  const fetchSubcategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/subcategorias", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las subcategorías");
      }

      const data = await response.json(); // Convierte la respuesta a JSON
      setSubcategories(data); // Actualiza el estado con las subcategorías obtenidas
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Llama a fetchCategories y fetchSubcategories cuando el componente se monta
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Función para obtener los platos desde el servicio
  const fetchPlatos = async () => {
    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibm9tYnJlX3VzdWFyaW8iOiJnb2QiLCJyb2wiOjEsImlhdCI6MTc0OTY0Nzg4MSwiZXhwIjoxNzQ5Njc2NjgxfQ.F-BqkdfU4A75Zh9x4yM7umHP2mKdFWX8Xd7cLgIze6k";

      // Construir la URL con los parámetros de filtro
      let url = "http://localhost:3000/api/platos";
      if (activeCategory !== null) {
        url += `?categoriaId=${activeCategory}`;
        if (activeSubcategory !== null) {
          url += `&subcategoriaId=${activeSubcategory}`;
        }
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos de los platos");
      }

      const data = await response.json();
      setMenuData(data); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchPlatos(); // Llama a fetchPlatos cada vez que cambien los filtros
  }, [activeCategory, activeSubcategory]);

  // Función para cambiar la categoría activa
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null); // Reinicia el filtro de subcategoría al cambiar de categoría
  };

  const resetFilters = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Botón para abrir el menú (solo visible en móviles) */}
      <button
        className="fixed bottom-4 left-4 z-50 bg-amber-500 text-white p-2 rounded-md shadow-md md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? "Cerrar Categorias" : "Ver Categorias"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed rounded-lg md:static top-0 left-0 min-h-screen bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 w-64 md:w-64 md:translate-x-0`}
      >
        <div className="p-4">
          <div className="text-center mb-4">
            <img src={logo} alt="Essen Logo" className="w-32 mx-auto" />
          </div>
          <h2 className="text-xl md:text-xl font-bold mb-4">Nuestro Menú</h2>
          <ul className="nav flex-col">
            <li className="nav-item mb-2">
              <button
                className={`sidebar-button text-sm md:text-base ${
                  activeCategory === null ? "active" : ""
                }`}
                onClick={resetFilters}
              >
                Todos
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id} className="nav-item mb-2">
                <button
                  className={`sidebar-button text-sm md:text-base ${
                    activeCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.nombre}
                </button>
                {activeCategory === category.id && (
                  <ul className="nav flex-col ml-4">
                    {subcategories
                      .filter((sub) => sub.categoria_id === category.id) // Filtrar subcategorías por categoría
                      .map((sub) => (
                        <li key={sub.id} className="nav-item mb-2">
                          <button
                            className={`sidebar-button text-sm md:text-base ${
                              activeSubcategory === sub.id ? "active" : ""
                            }`}
                            onClick={() => setActiveSubcategory(sub.id)}
                          >
                            {sub.nombre}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 ml-0 transition-all duration-300">
        <div className="bg-white rounded-lg shadow-md p-5 max-w-full">
          <h2 ref={dishesRef} className="text-2xl md:text-3xl font-serif font-bold mb-4 text-amber-800 border-b pb-2">
            {activeCategory !== null
              ? categories.find((category) => category.id === activeCategory)?.nombre || "Categoría no disponible"
              : "Todos los Platos"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
            {menuData.length > 0 ? (
              menuData.map((dish) => (
                <div key={dish.id} className="w-full h-full">
                  <Dish dish={dish} />
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-center text-sm md:text-base text-muted py-5">
                  No hay platos disponibles en esta categoría.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;