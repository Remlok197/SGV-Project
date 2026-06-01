from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- OPCIONES DE MODIFICADORES ---


class OpcionBase(BaseModel):
    nombre: str
    precio_extra: float = 0.0
    disponible: bool = True


class OpcionCreate(OpcionBase):
    pass

class OpcionUpdate(BaseModel):
    nombre: Optional[str] = None
    precio_extra: Optional[float] = None
    disponible: Optional[bool] = None


class OpcionResponse(OpcionBase):
    id: int
    nombre: str
    precio_extra: float
    disponible: bool

    class Config:
        from_attributes = True

class OpcionBreve(BaseModel):
    id: int
    nombre: str
    precio_extra: float

    class Config:
        from_attributes = True

# --- GRUPOS DE MODIFICADORES ---


class GrupoModificadorBase(BaseModel):
    nombre: str
    minimo: int = 0
    maximo: Optional[int] = None


class GrupoModificadorCreate(GrupoModificadorBase):
    opciones: List[OpcionCreate] = []


class GrupoModificadorResponse(GrupoModificadorBase):
    id: int
    nombre: str
    minimo: int
    maximo: Optional[int]
    opciones: List[OpcionResponse] = []

    class Config:
        from_attributes = True


class GrupoModificadorUpdate(BaseModel):
    nombre: Optional[str] = None
    minimo: Optional[int] = None
    maximo: Optional[int] = None


# --- CATEGORÍAS ---


class CategoriaBase(BaseModel):
    nombre: str
    icono: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    icono: Optional[str] = None


class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attributes = True


# --- PRODUCTOS ---


class ProductoBase(BaseModel):
    nombre: str
    precio: float
    unidades: str
    activo: bool = True
    id_categoria: Optional[int] = None


class ProductoCreate(ProductoBase):
    ids_modificadores: Optional[List[int]] = []

class ProductoBreve(BaseModel):
    id: int
    nombre: str
    precio: float
    imagen_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    unidades: Optional[str] = None
    activo: Optional[bool] = None
    id_categoria: Optional[int] = None
    ids_modificadores: Optional[List[int]] = None
    imagen_url: Optional[str] = None


class ProductoResponse(ProductoBase):
    id: int
    imagen_url: Optional[str] = None
    modificadores: List[GrupoModificadorResponse] = []

    class Config:
        from_attributes = True

# --- WRAPPERS DEL CATÁLOGO ---


class DataWrapper(BaseModel):
    categorias: List[CategoriaResponse]
    productos: List[ProductoResponse]


class MetadataWrapper(BaseModel):
    total_items: int


class CatalogoResponse(BaseModel):
    data: DataWrapper
    metadata: MetadataWrapper

# --- USUARIOS Y LOGIN ---


class LoginRequest(BaseModel):
    nombre_usuario: str
    contrasena: str


class UsuarioInfo(BaseModel):
    id: int
    nombre: str
    rol: str


class MetadataInfo(BaseModel):
    fecha_hora_servidor: str
    version_sistema: str


class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioInfo
    metadata: MetadataInfo


class UsuarioCreate(BaseModel):
    nombre: str
    contrasena: str
    rol: str


# ORDENES DETALLES
class DetalleOrdenCreate(BaseModel):
    id_producto: int
    cantidad: int
    subtotal: float
    opciones: List[int] = [] # Arreglo de IDs

class DetalleOrdenResponse(BaseModel):
    id: int
    id_producto: int
    cantidad: int
    subtotal: float
    producto: ProductoBreve
    opciones: List[OpcionBreve] = []
    
    class Config:
        from_attributes = True
# ORDENES

class OrdenCreate(BaseModel):
    numero_mesa: Optional[int] = None
    tipo_pedido: str = "mostrador" # "mostrador" o "mesa"
    detalles: List[DetalleOrdenCreate]

class OrdenResponse(BaseModel):
    id: int
    serie: Optional[str]
    numero_mesa: Optional[int]
    estado: str
    fecha: datetime
    total: float 
    detalles: List[DetalleOrdenResponse]

    class Config:
        from_attributes = True
