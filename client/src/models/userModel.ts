export interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface UsuarioCreate {
  nombre: string;
  contrasena: string;
  rol: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  contrasena?: string;
  rol?: string;
  activo?: boolean;
}
