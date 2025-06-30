import { Outlet } from "react-router-dom";
import "../index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-custom-background">
      <header className="header py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Essen Restaurant</h1>
          <p className="text-sm">Cocina de autor con sabores tradicionales</p>
          <nav className="mt-4 flex justify-center">
            <div className="flex gap-4">
              {/* Botones de navegación comentados */}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="footer py-4 bg-amber-800 mt-0 text-center text-sm text-gray-600 border-t">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Essen Restaurant. Todos los derechos reservados.</p>
          <p className="contact">Calle Principal 123, Ciudad | Tel: +34 123 456 789</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
