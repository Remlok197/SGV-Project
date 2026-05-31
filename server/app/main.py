import os
import shutil
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from sqlalchemy.exc import IntegrityError

import jwt
import bcrypt
from datetime import datetime, timedelta, timezone

from .database import engine, Base, get_db
from . import models, schemas

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

from . import seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed.run_all_seeders()
    yield

app = FastAPI(title="API Taquería Delgado", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # Para desarrollo local permitimos todo. En producción se restringe.
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGENES_DIR = "imagenes_productos"
os.makedirs(IMAGENES_DIR, exist_ok=True)

# Carpeta publica
# Si buscas http://127.0.0.1:8000/imagenes/taco.jpg, FastAPI te devuelve la foto jeje
app.mount("/imagenes", StaticFiles(directory=IMAGENES_DIR), name="imagenes")

ICONOS_CATEGORIAS_DIR = "iconos_categorias"
os.makedirs(ICONOS_CATEGORIAS_DIR, exist_ok=True)
app.mount("/iconos", StaticFiles(directory=ICONOS_CATEGORIAS_DIR), name="iconos")

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


@app.post("/api/categorias/", response_model=schemas.CategoriaResponse)
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


@app.get("/api/categorias/", response_model=List[schemas.CategoriaResponse])
def obtener_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()

# PUT (UPDATE)
@app.put("/api/categorias/{categoria_id}", response_model=schemas.CategoriaResponse)
def editar_categoria(categoria_id: int, categoria: schemas.CategoriaUpdate, db: Session = Depends(get_db)):
    categoria_db = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    if not categoria_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    update_data = categoria.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(categoria_db, key, value)

    db.commit()
    db.refresh(categoria_db)
    return categoria_db

# DELETE
@app.delete("/api/categorias/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria_db = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    if not categoria_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    productos_vinculados = db.query(models.Producto).filter(models.Producto.id_categoria == categoria_id).first()
    if productos_vinculados:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar esta categoría porque ya tiene productos asignados. Reasigna los productos primero."
        )

    db.delete(categoria_db)
    db.commit()
    return {"mensaje": "Categoría eliminada exitosamente"}
@app.get("/api/iconos_categorias", response_model=List[str])
def obtener_iconos_disponibles():
    """Devuelve la lista de rutas públicas de los íconos .svg disponibles."""
    if not os.path.exists(ICONOS_CATEGORIAS_DIR):
        return []
    
    iconos = []
    for archivo in os.listdir(ICONOS_CATEGORIAS_DIR):
        if archivo.lower().endswith(".svg"):
            iconos.append(f"/iconos/{archivo}")
            
    return iconos

# RUTAS DE LOS PRODUCTOS BABYYYY
# POST ENDPOINT (CREATE)


@app.post("/api/products", response_model=schemas.ProductoResponse)
def crear_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    nuevo_producto = models.Producto(
        **producto.model_dump(exclude={'ids_modificadores'}))

    if producto.ids_modificadores:
        modificadores_db = db.query(models.GrupoModificador).filter(
            models.GrupoModificador.id.in_(producto.ids_modificadores)
        ).all()
        nuevo_producto.modificadores = modificadores_db

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    respuesta = schemas.ProductoResponse.model_validate(nuevo_producto)
    respuesta.modificadores = [m.nombre.lower()
                               for m in nuevo_producto.modificadores]

    return respuesta

# IMAGE POST ENDPOINT (CREATE)


@app.post("/api/products/{producto_id}/imagen")
def subir_imagen_producto(producto_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    producto_db = db.query(models.Producto).filter(
        models.Producto.id == producto_id).first()
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


@app.get("/api/products", response_model=schemas.CatalogoResponse)
def obtener_catalogo_completo(db: Session = Depends(get_db)):
    categorias_db = db.query(models.Categoria).all()
    productos_db = db.query(models.Producto).all()

    productos_response = []
    for p in productos_db:
        prod_resp = schemas.ProductoResponse.model_validate(p)
        prod_resp.modificadores = [m.nombre.lower() for m in p.modificadores]
        productos_response.append(prod_resp)

    return schemas.CatalogoResponse(
        data=schemas.DataWrapper(
            categorias=categorias_db,
            productos=productos_response
        ),
        metadata=schemas.MetadataWrapper(
            total_items=len(productos_response)
        )
    )


@app.put("/api/products/{producto_id}", response_model=schemas.ProductoResponse)
def editar_producto(producto_id: int, producto: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    producto_db = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Update basic fields if provided
    update_data = producto.model_dump(exclude_unset=True, exclude={'ids_modificadores'})
    for key, value in update_data.items():
        setattr(producto_db, key, value)

    # Sync modifiers if provided
    if producto.ids_modificadores is not None:
        modificadores_db = db.query(models.GrupoModificador).filter(
            models.GrupoModificador.id.in_(producto.ids_modificadores)
        ).all()
        producto_db.modificadores = modificadores_db

    db.commit()
    db.refresh(producto_db)

    respuesta = schemas.ProductoResponse.model_validate(producto_db)
    respuesta.modificadores = [m.nombre.lower() for m in producto_db.modificadores]
    return respuesta


@app.delete("/api/products/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto_db = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        db.delete(producto_db)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el producto porque está asociado a órdenes o registros existentes. Se sugiere desactivar el producto."
        )

    return {"mensaje": "Producto eliminado exitosamente"}


# RUTAS DE LOS MODIFICADORES BABYYYY
# POST (CREATE)


@app.post("/api/modificadores/", response_model=schemas.GrupoModificadorResponse)
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


@app.get("/api/modificadores/", response_model=List[schemas.GrupoModificadorResponse])
def obtener_grupos_modificadores(db: Session = Depends(get_db)):
    return db.query(models.GrupoModificador).all()

# PUT (UPDATE)
@app.put("/api/modificadores/{modificador_id}", response_model=schemas.GrupoModificadorResponse)
def editar_modificador(modificador_id: int, modificador: schemas.GrupoModificadorUpdate, db: Session = Depends(get_db)):
    modificador_db = db.query(models.GrupoModificador).filter(models.GrupoModificador.id == modificador_id).first()
    if not modificador_db:
        raise HTTPException(status_code=404, detail="Modificador no encontrado")

    update_data = modificador.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(modificador_db, key, value)

    db.commit()
    db.refresh(modificador_db)
    return modificador_db

# DELETE
@app.delete("/api/modificadores/{modificador_id}")
def eliminar_modificador(modificador_id: int, db: Session = Depends(get_db)):
    modificador_db = db.query(models.GrupoModificador).filter(models.GrupoModificador.id == modificador_id).first()
    if not modificador_db:
        raise HTTPException(status_code=404, detail="Modificador no encontrado")

    try:
        db.delete(modificador_db)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar este grupo de modificadores porque está siendo utilizado por productos del catálogo."
        )

    return {"mensaje": "Modificador eliminado exitosamente"}


#  UPDATE de opciones_modificador
@app.put("/api/opciones/{opcion_id}", response_model=schemas.OpcionResponse)
def editar_opcion(opcion_id: int, opcion: schemas.OpcionUpdate, db: Session = Depends(get_db)):
    opcion_db = db.query(models.OpcionModificador).filter(models.OpcionModificador.id == opcion_id).first()
    if not opcion_db:
        raise HTTPException(status_code=404, detail="Opción no encontrada")

    update_data = opcion.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(opcion_db, key, value)

    db.commit()
    db.refresh(opcion_db)
    return opcion_db


# DELETE de opciones_modificador
@app.delete("/api/opciones/{opcion_id}")
def eliminar_opcion(opcion_id: int, db: Session = Depends(get_db)):
    opcion_db = db.query(models.OpcionModificador).filter(models.OpcionModificador.id == opcion_id).first()
    if not opcion_db:
        raise HTTPException(status_code=404, detail="Opción no encontrada")

    detalles_vinculados = db.query(models.detalle_opcion).filter(models.detalle_opcion.c.id_opcion == opcion_id).first()
    if detalles_vinculados:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar esta opción porque ya está registrada en tickets de venta."
        )

    db.delete(opcion_db)
    db.commit()
    return {"mensaje": "Opción eliminada exitosamente"}


# RUTAS DE LOS USUARIOS Y AUTENTICACION BABYYY


@app.post("/api/usuarios")
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    hashed_pwd = get_password_hash(usuario.contrasena)
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
    usuario_db = db.query(models.Usuario).filter(
        models.Usuario.nombre == credenciales.nombre_usuario
    ).first()

    if not usuario_db or not verify_password(credenciales.contrasena, usuario_db.hashed_password):
        raise HTTPException(
            status_code=401, detail="Usuario o contraseña incorrectos"
        )

    access_token = create_access_token(
        data={"sub": usuario_db.nombre, "rol": usuario_db.rol}
    )

    return schemas.LoginResponse(
        token=access_token,
        usuario=schemas.UsuarioInfo(
            id=usuario_db.id,
            nombre=usuario_db.nombre,
            rol=usuario_db.rol
        ),
        metadata=schemas.MetadataInfo(
            fecha_hora_servidor=datetime.utcnow().isoformat() + "Z",
            version_sistema="1.0.0"
        )
    )
