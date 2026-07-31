"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LigaContext = createContext(null);

export function LigaProvider({ children }) {
  const [liga, setLiga] = useState("Copa Chanka");

  useEffect(() => {
    const guardada = localStorage.getItem("ligaSeleccionada");
    if (guardada) setLiga(guardada);
  }, []);

  const cambiarLiga = (nuevaLiga) => {
    setLiga(nuevaLiga);
    localStorage.setItem("ligaSeleccionada", nuevaLiga);
  };

  return (
    <LigaContext.Provider value={{ liga, cambiarLiga }}>
      {children}
    </LigaContext.Provider>
  );
}

export function useLiga() {
  const contexto = useContext(LigaContext);
  if (!contexto) throw new Error("useLiga debe usarse dentro de LigaProvider");
  return contexto;
}
