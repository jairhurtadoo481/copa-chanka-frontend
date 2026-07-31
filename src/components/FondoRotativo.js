"use client";

import { useEffect, useState } from "react";

export default function FondoRotativo({ imagenes, intervaloMs = 6000, opacidad = 0.6 }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % imagenes.length);
    }, intervaloMs);
    return () => clearInterval(intervalo);
  }, [imagenes.length, intervaloMs]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {imagenes.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === indice ? opacidad : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-slate-950/40" />
    </div>
  );
}
