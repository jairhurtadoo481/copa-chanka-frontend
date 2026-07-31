import Cookies from "js-cookie";

export const guardarSesion = (usuario) => {
  Cookies.set("token", usuario.token, { expires: 7 });
  Cookies.set("nombre", usuario.nombre, { expires: 7 });
};

export const obtenerToken = () => {
  return Cookies.get("token");
};

export const cerrarSesion = () => {
  Cookies.remove("token");
  Cookies.remove("nombre");
};
