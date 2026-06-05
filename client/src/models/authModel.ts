export interface AuthUser {
    id: number;
    nombre: string;
    rol: string;
}

export interface AuthMetadata {
    fecha_hora_servidor: string;
    version_sistema: string;
}

export interface AuthApiResponse {
    token: string;
    usuario: AuthUser;
    metadata: AuthMetadata;
}

export interface UserSession {
    token: string;
    userId: number;
    userName: string;
    userRole: string;
    serverTimeOffset: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}
