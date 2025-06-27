import { useState } from "react";
import { useNavigate } from "react-router-dom";
import restaurant1 from "../img/restaurant1.png"; // Imagen 1
import restaurant2 from "../img/restaurant2.png"; // Imagen 2
import restaurant3 from "../img/restaurant3.png"; // Imagen 3
import "bootstrap/dist/css/bootstrap.min.css";

const About = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada

  const openImage = (image) => {
    setSelectedImage(image); // Establece la imagen seleccionada
  };

  const closeImage = () => {
    setSelectedImage(null); // Cierra el popup
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center text-center px-4 py-8">

        <div className="bg-gradient-to-b from-amber-600 to-amber-500 shadow-lg rounded-2xl w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center my-12 p-6 md:p-16 min-h-[350px] md:min-h-[500px]">
        {/* Imagen a la izquierda */}
        <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0 md:mr-16">
          <img
            src={restaurant1}
            alt="Restaurante 1"
            className="rounded-xl shadow-xl w-full h-52 md:h-96 object-cover cursor-pointer max-w-xs md:max-w-xl"
            onClick={() => openImage(restaurant1)}
          />
        </div>
        {/* Info de reservas a la derecha */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-6xl font-serif font-extrabold mb-4 md:mb-8 text-white drop-shadow-lg">Essen</h2>
          <p className="text-lg md:text-2xl text-white mb-4 md:mb-8 font-semibold drop-shadow font-sans">
                    Bienvenidos a Essen, cocina de autor con sabores tradicionales.
        Descubrí una experiencia culinaria única donde la pasión por los ingredientes se encuentra con la creatividad.
          </p>
          <button
            className="bg-white text-amber-700 font-bold px-6 py-3 md:px-10 md:py-5 rounded-2xl shadow-xl hover:bg-amber-800 hover:text-black transition text-lg md:text-2xl border-4 border-amber-700 hover:border-black font-sans"
            onClick={() => navigate("/menu")}
          >
            Ver Menu
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-amber-600 to-amber-500 shadow-lg rounded-2xl w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center my-12 p-6 md:p-16 min-h-[350px] md:min-h-[500px]">
        {/* Info de ubicación a la izquierda */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center mb-6 md:mb-0 md:mr-16">
          <h2 className="text-3xl md:text-6xl font-serif font-extrabold mb-4 md:mb-8 text-white drop-shadow-lg">Ubicación</h2>
          <p className="text-lg md:text-2xl text-white mb-4 md:mb-8 font-semibold drop-shadow font-sans">
            Para realizar una reserva, llámanos al:
            <br />
            <span className="font-bold"> +34 123 456 789</span>
            <br />
            o envíanos un correo a:
            <span className="font-bold"> reservas@essen.com</span>
          </p>
          <button
            className="bg-white text-amber-700 font-bold px-6 py-3 md:px-10 md:py-5 rounded-2xl shadow-xl hover:bg-amber-800 hover:text-black transition text-lg md:text-2xl border-4 border-amber-700 hover:border-black mt-4 md:mt-8 font-sans"
            onClick={() =>
              (window.location.href =
                "https://www.google.com/maps/place/Pasaje+Pereyra+1730")
            }
          >
            Ver en Google Maps
          </button>
        </div>
        {/* Imagen a la derecha */}
        <div className="w-full md:w-1/2 flex justify-center mt-4 md:mt-0 md:ml-16">
          <img
            src={restaurant2}
            alt="Restaurante 3"
            className="rounded-xl shadow-xl w-full h-52 md:h-96 object-cover cursor-pointer max-w-xs md:max-w-xl"
            onClick={() => openImage(restaurant2)}
          />
        </div>
      </div>

      <div className="bg-gradient-to-b from-amber-600 to-amber-500 shadow-lg rounded-2xl w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center my-12 p-6 md:p-16 min-h-[350px] md:min-h-[500px]">
        {/* Imagen a la izquierda */}
        <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0 md:mr-16">
          <img
            src={restaurant3}
            alt="Restaurante 3"
            className="rounded-xl shadow-xl w-full h-52 md:h-96 object-cover cursor-pointer max-w-xs md:max-w-xl"
            onClick={() => openImage(restaurant3)}
          />
        </div>
        {/* Info de reservas a la derecha */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-6xl font-serif font-extrabold mb-4 md:mb-8 text-white drop-shadow-lg">Reservas</h2>
          <p className="text-lg md:text-2xl text-white mb-4 md:mb-8 font-semibold drop-shadow font-sans">
            Para realizar una reserva, llámanos al:
            <br />
            <span className="font-bold"> +34 123 456 789</span>
            <br />
            o envíanos un correo a:
            <span className="font-bold"> reservas@essen.com</span>
          </p>
          <button
            className="bg-white text-amber-700 font-bold px-6 py-3 md:px-10 md:py-5 rounded-2xl shadow-xl hover:bg-amber-800 hover:text-black transition text-lg md:text-2xl border-4 border-amber-700 hover:border-black font-sans"
            onClick={() =>
              (window.location.href =
                "https://api.whatsapp.com/send?phone=1158775695&text=Hola,%20me%20gustaría%20hacer%20una%20reserva.")
            }
          >
            Hacer una Reserva
          </button>
        </div>
      </div>


      {/* Galería de imágenes */}
      <div className="max-w-6xl w-full mt-12">
        <h2 className="text-4xl font-serif font-bold mb-4">Galería</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <img
            src={restaurant1}
            alt="Restaurante 1"
            className="rounded-lg shadow-md w-full h-64 object-cover cursor-pointer"
            onClick={() => openImage(restaurant1)}
          />
          <img
            src={restaurant2}
            alt="Restaurante 2"
            className="rounded-lg shadow-md w-full h-64 object-cover cursor-pointer"
            onClick={() => openImage(restaurant2)}
          />
          <img
            src={restaurant3}
            alt="Restaurante 3"
            className="rounded-lg shadow-md w-full h-64 object-cover cursor-pointer"
            onClick={() => openImage(restaurant3)}
          />
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
              className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full shadow-md hover:bg-gray-200"
              onClick={closeImage}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default About;
