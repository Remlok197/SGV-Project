import { AuthApiResponse, UserSession } from "../models/authModel";

export const createSessionAdapter = (apiResponse: AuthApiResponse): UserSession => {
  const serverTime = new Date(apiResponse.metadata.fecha_hora_servidor).getTime();
  const clientTime = Date.now();
  const serverTimeOffset = serverTime - clientTime;

  return {
    token: apiResponse.token,
    userId: apiResponse.usuario.id,
    userName: apiResponse.usuario.nombre,
    userRole: apiResponse.usuario.rol,
    serverTimeOffset,
  };
};