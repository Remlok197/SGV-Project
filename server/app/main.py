import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

import jwt
import bcrypt
from datetime import datetime, timedelta, timezone

from .database import engine, Base, get_db
from . import models, schemas

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Taquería Delgado", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Para desarrollo local permitimos todo. En producción se restringe.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGENES_DIR = "imagenes_productos"
os.makedirs(IMAGENES_DIR, exist_ok=True)

# Carpeta publica
# Si buscas http://127.0.0.1:8000/imagenes/taco.jpg, FastAPI te devuelve la foto jeje
app.mount("/imagenes", StaticFiles(directory=IMAGENES_DIR), name="imagenes")

# --- Config de seguridad ---
SECRET_KEY = "SecurityQwertyz.." 
ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=8)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.get("/")
def read_root():
    return {"mensaje": "Revivan el server"}

# RUTAS DE LAS CATEGORIAS BABYYYY
# POST (CREATE)
@app.post("/categorias/", response_model=schemas.CategoriaResponse)
def crear_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    nueva_categoria = models.Categoria(
        nombre=categoria.nombre,
        icono=categoria.icono
    )
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria

# GET (READ)
@app.get("/categorias/", response_model=List[schemas.CategoriaResponse])
def obtener_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()

# RUTAS DE LOS PRODUCTOS BABYYYY
# POST ENDPOINT (CREATE)
@app.post("/api/products", response_model=schemas.ProductoResponse)
def crear_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    nuevo_producto = models.Producto(
        nombre=producto.name, 
        precio=producto.price, 
        activo=producto.isAvailable,
        id_categoria=producto.categoryId
    )
    
    if producto.modifierIds:
        modificadores_db = db.query(models.GrupoModificador).filter(
            models.GrupoModificador.id.in_(producto.modifierIds)
        ).all()
        nuevo_producto.modificadores = modificadores_db

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    
    lista_modificadores = [m.nombre.lower() for m in nuevo_producto.modificadores]
    
    return schemas.ProductoResponse(
        id=nuevo_producto.id,
        categoryId=nuevo_producto.id_categoria,
        name=nuevo_producto.nombre,
        price=nuevo_producto.precio,
        modifiers=lista_modificadores,
        isAvailable=nuevo_producto.activo,
        imageUrl=nuevo_producto.imagen_url
    )

# IMAGE POST ENDPOINT (CREATE)
@app.post("/products/{producto_id}/imagen")
def subir_imagen_producto(producto_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    producto_db = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    nombre_seguro = file.filename.replace(" ", "_")
    file_path = os.path.join(IMAGENES_DIR, f"{producto_id}_{nombre_seguro}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url_publica = f"/imagenes/{producto_id}_{nombre_seguro}"
    producto_db.imagen_url = url_publica
    
    db.commit()
    db.refresh(producto_db)
    
    return {"mensaje": "Imagen subida exitosamente", "imagen_url": url_publica}

# GET ENDPOINT (READ)
@app.get("/api/products", response_model=schemas.ProductCatalogResponse)
def obtener_catalogo_completo(db: Session = Depends(get_db)):
    categorias_db = db.query(models.Categoria).all()
    categories_response = [
        schemas.CategoriaResponse(
            id=c.id,
            name=c.nombre,
            icon=c.icono
        ) for c in categorias_db
    ]

    productos_db = db.query(models.Producto).all()
    products_response = []
    
    for p in productos_db:
        lista_modificadores = [m.nombre.lower() for m in p.modificadores]
        
        products_response.append(
            schemas.ProductoResponse(
                id=p.id,
                categoryId=p.id_categoria,
                name=p.nombre,
                price=p.precio,
                modifiers=lista_modificadores,
                isAvailable=p.activo,
                imageUrl=p.imagen_url
            )
        )

    return schemas.ProductCatalogResponse(
        data=schemas.DataWrapper(
            categories=categories_response,
            products=products_response
        ),
        metadata=schemas.MetadataWrapper(
            totalItems=len(products_response)
        )
    )

# RUTAS DE LOS MODIFICADORES BABYYYY
# POST (CREATE)
@app.post("/modificadores/", response_model=schemas.GrupoModificadorResponse)
def crear_grupo_modificador(grupo: schemas.GrupoModificadorCreate, db: Session = Depends(get_db)):
    
    nuevo_grupo = models.GrupoModificador(
        nombre=grupo.nombre,
        minimo=grupo.minimo,
        maximo=grupo.maximo
    )
    db.add(nuevo_grupo)
    db.commit()
    db.refresh(nuevo_grupo) 
    
    for opcion in grupo.opciones:
        nueva_opcion = models.OpcionModificador(
            grupo_id=nuevo_grupo.id,
            nombre=opcion.nombre,
            precio_extra=opcion.precio_extra,
            disponible=opcion.disponible
        )
        db.add(nueva_opcion)
    
    db.commit()
    db.refresh(nuevo_grupo) 
    
    return nuevo_grupo

# GET (READ)
@app.get("/modificadores/", response_model=List[schemas.GrupoModificadorResponse])
def obtener_grupos_modificadores(db: Session = Depends(get_db)):
    return db.query(models.GrupoModificador).all()

# DELETE
@app.delete("/modificadores/{modificador_id}")
def eliminar_modificador(modificador_id: int, db: Session = Depends(get_db)):
    modificador_db = db.query(models.Modificador).filter(models.Modificador.id == modificador_id).first()
    
    if not modificador_db:
        raise HTTPException(status_code=404, detail="Modificador no encontrado")
        
    db.delete(modificador_db)
    db.commit()
    return {"mensaje": "Modificador eliminado correctamente"}

#RUTAS DE LOS USUARIOS Y AUTENTICACION BABYYY
# Auxiliar Endpoint First User
@app.post("/api/usuarios")
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    hashed_pwd = get_password_hash(usuario.password)
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        rol=usuario.rol,
        hashed_password=hashed_pwd
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"mensaje": f"Usuario {nuevo_usuario.nombre} creado con éxito"}

# Official Endpoint
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(models.Usuario).filter(models.Usuario.nombre == credenciales.username).first()
    
    if not usuario_db or not verify_password(credenciales.password, usuario_db.hashed_password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    access_token = create_access_token(data={"sub": usuario_db.nombre, "rol": usuario_db.rol})
    
    return schemas.LoginResponse(
        token=access_token,
        user=schemas.UsuarioInfo(
            id=usuario_db.id,
            name=usuario_db.nombre,
            role=usuario_db.rol
        ),
        metadata=schemas.MetadataInfo(
            serverDateTime=datetime.utcnow().isoformat() + "Z",
            systemVersion="1.0.0"
        )
    )