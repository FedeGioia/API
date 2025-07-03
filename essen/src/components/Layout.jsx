import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../index.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div
      className="relative min-h-screen bg-amber-50 flex flex-col"
      style={{
        backgroundImage:
          "radial-gradient(rgba(245,158,11,0.15) 4px, transparent 4px)",
        backgroundSize: "30px 30px",
      }}
    >
      <header className="header bg-amber-600 shadow-md border-b-2 border-amber-700">
        <div className="container mx-auto px-4 flex flex-col items-center py-0.5 space-y-0">
          <div>
            <h1 className="text-lg md:text-xl font-serif font-semibold text-white tracking-tight">
              Essen Restaurant
            </h1>
            <div className="flex items-center justify-center space-x-1 my-0.5">
              <span className="flex-1 h-px bg-amber-200 -translate-y-1"></span>
              <p className="text-xs md:text-sm text-amber-100 italic whitespace-nowrap px-2">
                Cocina de autor con sabores tradicionales
              </p>
              <span className="flex-1 h-px bg-amber-200 -translate-y-1"></span>
            </div>
          </div>
          <button
            className="bg-amber-700 text-white hover:bg-amber-800 px-3 py-1 text-xs md:text-sm font-medium rounded-full transition duration-200"
            onClick={() => navigate(location.pathname === "/" ? "/menu" : "/")}
          >
            {location.pathname === "/" ? "Menú" : "Home"}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="footer bg-amber-600 shadow-md border-t-2 border-amber-700 text-center text-sm text-amber-100 py-4">
        <div className="container mx-auto px-4 flex flex-col items-center space-y-2">
          <p>
            © {new Date().getFullYear()} Essen Restaurant. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center justify-center space-x-2 w-full">
            <span className="flex-1 h-px bg-amber-200" />
            <p className="text-sm italic px-4 text-amber-100">
              Calle Principal 123, Ciudad | Tel: +34 123 456 789
            </p>
            <span className="flex-1 h-px bg-amber-200" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
