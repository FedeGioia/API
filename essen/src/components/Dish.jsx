"use client";

import { useState } from "react";
import "../index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Dish = ({ dish }) => {
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada
  
  const imagePath = dish.image ? require(`../img/${dish.image}`) : require("../img/logo.jpeg");

  const openImage = (image) => {
    setSelectedImage(image); // Establece la imagen seleccionada
  };

  const closeImage = () => {
    setSelectedImage(null); // Cierra el popup
  };

  return (
    <>
      <div className="card dish-card h-full flex flex-col justify-between">
        {/* Imagen del plato */}
        <img
          src={imagePath} 
          alt={dish.nombre || "Plato"}
          className="card-img-top cursor-pointer"
          onClick={() => openImage(imagePath)}
        />

        <div className="card-body flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="dish-title text-md md:text-xl flex-1 break-words whitespace-normal">
                {dish.nombre || "Nombre no disponible"}
              </h3>
              <span className="dish-price text-xs md:text-lg whitespace-nowrap">
                {dish.precio ? `${parseFloat(dish.precio).toFixed(2)} €` : "Precio no disponible"}
              </span>
            </div>

            <p className="dish-description text-xs md:text-sm">
              {dish.descripcion || "Descripción no disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* Popup para la imagen seleccionada */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Imagen seleccionada"
              className="max-w-full max-h-screen rounded-lg"
            />
            <button
              className="absolute top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-amber-700 transition duration-200 font-medium"
              onClick={closeImage}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dish;