import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Esto fuerza al navegador a ir a la posición 0,0
    window.scrollTo(0, 0);
  }, [pathname]); // Se ejecuta cada vez que la ruta cambia

  return null;
}