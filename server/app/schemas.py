from pydantic import BaseModel
from typing import List, Optional

# --- OPCIONES DE MODIFICADORES ---
class OpcionBase(BaseModel):
    nombre: str
    precio_extra: float = 0.0
    disponible: bool = True

class OpcionCreate(OpcionBase):
    pass

class OpcionResponse(OpcionBase):
    id: int
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
    opciones: List[OpcionResponse] = [] 
    class Config:
        from_attributes = True

# --- CATEGORIA ---
class CategoriaBase(BaseModel):
    nombre: str
    icono: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None

    class Config:
        from_attributes = True

# --- PRODUCTOS ---
class ProductoBase(BaseModel):
    nombre: str
    precio: float
    unidades: str
    activo: bool = True
    imagen_url: Optional[str] = None
    id_categoria: Optional[int] = None

class ProductoCreate(BaseModel):
    name: str
    price: float
    isAvailable: bool = True
    categoryId: Optional[int] = None
    modifierIds: Optional[List[int]] = []

class ProductoResponse(BaseModel):
    id: int
    categoryId: Optional[int]
    name: str
    price: float
    modifiers: List[str] 
    isAvailable: bool
    imageUrl: Optional[str] = None

    class Config:
        from_attributes = True

class DataWrapper(BaseModel):
    categories: List[CategoriaResponse]
    products: List[ProductoResponse]

class MetadataWrapper(BaseModel):
    totalItems: int

class ProductCatalogResponse(BaseModel):
    data: DataWrapper
    metadata: MetadataWrapper

# --- USUARIOS Y LOGIN ---

class LoginRequest(BaseModel):
    username: str
    password: str

class UsuarioInfo(BaseModel):
    id: int
    name: str
    role: str

class MetadataInfo(BaseModel):
    serverDateTime: str
    systemVersion: str

class LoginResponse(BaseModel):
    token: str
    user: UsuarioInfo
    metadata: MetadataInfo
    
class UsuarioCreate(BaseModel):
    nombre: str
    password: str
    rol: str