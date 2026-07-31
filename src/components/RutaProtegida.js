"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken } from "@/lib/auth";

export default function RutaProtegida({ children }) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push("/admin/login");
    } else {
      setVerificado(true);
    }
  }, [router]);

  if (!verificado) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Verificando sesion...</p>
      </main>
    );
  }

  return children;
}
