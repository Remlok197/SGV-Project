import { AuthApiResponse, UserSession } from "../models/authModel";

export const createSessionAdapter = (apiResponse: AuthApiResponse): UserSession => {
  const dateObj = new Date(apiResponse.metadata.fecha_hora_servidor);

  const formattedDate = dateObj.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = dateObj.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    token: apiResponse.token,
    userId: apiResponse.usuario.id,
    userName: apiResponse.usuario.nombre,
    userRole: apiResponse.usuario.rol,
    headerDate: formattedDate,
    headerTime: formattedTime.toUpperCase(),
  };
}