import os
import shutil
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
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


@app.put("/api/categorias/{categoria_id}", response_model=schemas.CategoriaResponse)
def editar_categoria(categoria_id: int, categoria: schemas.CategoriaUpdate, db: Session = Depends(get_db)):
    categoria_db = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    
    if not categoria_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
        
    if getattr(categoria_db, "es_sistema", False):
        raise HTTPException(status_code=403, detail="No se puede editar una categoría del sistema")

    if categoria.nombre is not None:
        categoria_db.nombre = categoria.nombre
    if categoria.icono is not None:
        categoria_db.icono = categoria.icono

    db.commit()
    db.refresh(categoria_db)
    return categoria_db


@app.delete("/api/categorias/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria_db = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    
    if not categoria_db:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
        
    if getattr(categoria_db, "es_sistema", False):
        raise HTTPException(status_code=403, detail="No se puede eliminar una categoría del sistema")

    # Explicit check for associated products
    productos_count = db.query(models.Producto).filter(models.Producto.id_categoria == categoria_id).count()
    if productos_count > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la categoría porque hay productos asociados a ella. Reasigna o elimina los productos primero."
        )

    try:
        db.delete(categoria_db)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar la categoría por restricciones de integridad."
        )

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
    print("\n====== DEBUG FASTAPI ======")
    print("1. Datos recibidos de Postman/Frontend:", producto.model_dump())
    print("2. IDs de modificadores a buscar:", producto.ids_modificadores)

    if producto.id_categoria:
        categoria_db = db.query(models.Categoria).filter(models.Categoria.id == producto.id_categoria).first()
        if getattr(categoria_db, "es_sistema", False):
            raise HTTPException(status_code=400, detail="No se pueden agregar productos a una categoría del sistema")

    nuevo_producto = models.Producto(
        **producto.model_dump(exclude={'ids_modificadores'})
    )

    if producto.ids_modificadores:
        modificadores_db = db.query(models.GrupoModificador).filter(
            models.GrupoModificador.id.in_(producto.ids_modificadores)
        ).all()
        print("3. Modificadores encontrados en PostgreSQL:", [m.nombre for m in modificadores_db])
        nuevo_producto.modificadores = modificadores_db
    else:
        print("3. No se recibieron IDs para buscar.")

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    
    print("4. Producto guardado con modificadores:", [m.nombre for m in nuevo_producto.modificadores])
    print("===========================\n")

    return schemas.ProductoResponse.model_validate(nuevo_producto)

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
        p.modificadores.sort(key=lambda m: m.orden)
        for m in p.modificadores:
            m.opciones.sort(key=lambda o: o.orden)
        prod_resp = schemas.ProductoResponse.model_validate(p)
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

    if producto.id_categoria:
        categoria_db = db.query(models.Categoria).filter(models.Categoria.id == producto.id_categoria).first()
        if getattr(categoria_db, "es_sistema", False):
            raise HTTPException(status_code=400, detail="No se pueden asignar productos a una categoría del sistema")

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


@app.put("/api/products/{producto_id}", response_model=schemas.ProductoResponse)
def editar_producto(producto_id: int, producto: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    producto_db = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.id_categoria:
        categoria_db = db.query(models.Categoria).filter(models.Categoria.id == producto.id_categoria).first()
        if getattr(categoria_db, "es_sistema", False):
            raise HTTPException(status_code=400, detail="No se pueden asignar productos a una categoría del sistema")

    update_data = producto.model_dump(exclude_unset=True, exclude={'ids_modificadores'})
    for key, value in update_data.items():
        setattr(producto_db, key, value)

    if producto.ids_modificadores is not None:
        modificadores_db = db.query(models.GrupoModificador).filter(
            models.GrupoModificador.id.in_(producto.ids_modificadores)
        ).all()
        producto_db.modificadores = modificadores_db

    db.commit()
    db.refresh(producto_db)

    return schemas.ProductoResponse.model_validate(producto_db)


# RUTAS DE LOS MODIFICADORES BABYYYY
# POST (CREATE)


@app.post("/api/modificadores/", response_model=schemas.GrupoModificadorResponse)
def crear_grupo_modificador(grupo: schemas.GrupoModificadorCreate, db: Session = Depends(get_db)):

    nuevo_grupo = models.GrupoModificador(
        nombre=grupo.nombre,
        minimo=grupo.minimo,
        maximo=grupo.maximo,
        orden=grupo.orden,
        categoria_id=grupo.categoria_id
    )
    db.add(nuevo_grupo)
    db.commit()
    db.refresh(nuevo_grupo)

    for opcion in grupo.opciones:
        nueva_opcion = models.OpcionModificador(
            grupo_id=nuevo_grupo.id,
            nombre=opcion.nombre,
            precio_extra=opcion.precio_extra,
            disponible=opcion.disponible,
            orden=opcion.orden
        )
        db.add(nueva_opcion)

    db.commit()
    db.refresh(nuevo_grupo)

    return nuevo_grupo

# GET (READ)


@app.get("/api/modificadores/", response_model=List[schemas.GrupoModificadorResponse])
def obtener_grupos_modificadores(db: Session = Depends(get_db)):
    grupos = db.query(models.GrupoModificador).order_by(models.GrupoModificador.orden.asc()).all()
    # Sort opciones locally before returning
    for g in grupos:
        g.opciones.sort(key=lambda o: o.orden)
    return grupos

@app.put("/api/modificadores/reorder")
def reordenar_modificadores(items: List[schemas.ReorderItem], db: Session = Depends(get_db)):
    for item in items:
        db.query(models.GrupoModificador).filter(models.GrupoModificador.id == item.id).update({"orden": item.orden})
    db.commit()
    return {"mensaje": "Orden actualizado"}

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


# POST de opciones_modificador
@app.post("/api/modificadores/{modificador_id}/opciones", response_model=schemas.OpcionResponse)
def crear_opcion_para_modificador(modificador_id: int, opcion: schemas.OpcionCreate, db: Session = Depends(get_db)):
    modificador_db = db.query(models.GrupoModificador).filter(models.GrupoModificador.id == modificador_id).first()
    if not modificador_db:
        raise HTTPException(status_code=404, detail="Modificador no encontrado")

    nueva_opcion = models.OpcionModificador(
        grupo_id=modificador_id,
        nombre=opcion.nombre,
        precio_extra=opcion.precio_extra,
        disponible=opcion.disponible,
        orden=opcion.orden
    )
    db.add(nueva_opcion)
    db.commit()
    db.refresh(nueva_opcion)
    return nueva_opcion

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


@app.post("/api/usuarios", response_model=schemas.UsuarioResponse)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.nombre == usuario.nombre).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")

    hashed_pwd = get_password_hash(usuario.contrasena)
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        rol=usuario.rol,
        hashed_password=hashed_pwd,
        activo=True
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.get("/api/usuarios", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).order_by(models.Usuario.id.asc()).all()

@app.put("/api/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def editar_usuario(usuario_id: int, usuario: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    usuario_db = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario.nombre is not None:
        usuario_existente = db.query(models.Usuario).filter(models.Usuario.nombre == usuario.nombre, models.Usuario.id != usuario_id).first()
        if usuario_existente:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
        usuario_db.nombre = usuario.nombre
        
    if usuario.rol is not None:
        usuario_db.rol = usuario.rol
        
    if usuario.contrasena is not None and usuario.contrasena.strip() != "":
        usuario_db.hashed_password = get_password_hash(usuario.contrasena)
        
    if usuario.activo is not None:
        usuario_db.activo = usuario.activo

    db.commit()
    db.refresh(usuario_db)
    return usuario_db

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

    usuario_db.ultimo_acceso = datetime.utcnow()
    db.commit()

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

# ENDPOINTS para Ordenes

# POST
@app.post("/api/ordenes/", response_model=schemas.OrdenResponse)
def crear_orden(orden: schemas.OrdenCreate, db: Session = Depends(get_db)):
    # 1. Crear orden inicialmente con total 0
    nueva_orden = models.Orden(
        numero_mesa=orden.numero_mesa,
        tipo_pedido=orden.tipo_pedido,
        estado="pendiente",
        total=0.0
    )
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden) 

    total_calculado_seguro = 0.0

    for det in orden.detalles:
        # 2. Consultar el producto real en la BD para evitar precios falsos
        producto = db.query(models.Producto).filter(models.Producto.id == det.id_producto).first()
        if not producto:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Producto con ID {det.id_producto} no encontrado")
            
        precio_unitario = producto.precio

        opciones_db = []
        # 3. Sumar los precios extras de los modificadores elegidos
        if det.opciones:
            opciones_db = db.query(models.OpcionModificador).filter(
                models.OpcionModificador.id.in_(det.opciones)
            ).all()
            precio_extra = sum(op.precio_extra for op in opciones_db)
            precio_unitario += precio_extra
            
        # 4. Calcular el subtotal seguro para este renglón
        subtotal_seguro = precio_unitario * det.cantidad
        total_calculado_seguro += subtotal_seguro

        # 5. Guardar el detalle con el subtotal que calculó el backend
        nuevo_detalle = models.DetalleOrden(
            id_orden=nueva_orden.id,
            id_producto=det.id_producto,
            cantidad=det.cantidad,
            subtotal=subtotal_seguro
        )
        db.add(nuevo_detalle)
        db.commit()
        db.refresh(nuevo_detalle)

        # 6. Vincular los modificadores
        if opciones_db:
            nuevo_detalle.opciones = opciones_db
            db.commit()

    # 7. Actualizar la orden con la suma final correcta
    nueva_orden.total = total_calculado_seguro
    db.commit()
    db.refresh(nueva_orden)
    
    return nueva_orden

# GET para el ID de la siguiente orden
@app.get("/api/ordenes/next-id")
def obtener_siguiente_id(db: Session = Depends(get_db)):
    from sqlalchemy import func
    max_id = db.query(func.max(models.Orden.id)).scalar()
    return {"next_id": (max_id or 0) + 1}

# GET para listado de ordenes
@app.get("/api/ordenes/", response_model=List[schemas.OrdenResponse])
def obtener_ordenes(estado: Optional[str] = None, db: Session = Depends(get_db)):
    consulta = db.query(models.Orden)

    if estado:
        consulta = consulta.filter(models.Orden.estado == estado)
        
    ordenes = consulta.all()
    return ordenes

# GET para detalles de orden
@app.get("/api/ordenes/{orden_id}", response_model=schemas.OrdenResponse)
def obtener_orden(orden_id: int, db: Session = Depends(get_db)):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
        
    return orden

# PUT 
@app.put("/api/ordenes/{orden_id}", response_model=schemas.OrdenResponse)
def actualizar_estado_orden(orden_id: int, estado_nuevo: str, db: Session = Depends(get_db)):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    orden.estado = estado_nuevo
    db.commit()
    db.refresh(orden)
    
    return orden

# DELETE
@app.delete("/api/ordenes/{orden_id}")
def cancelar_orden(orden_id: int, db: Session = Depends(get_db)):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    orden.estado = "cancelada"
    db.commit()
    
    return {"mensaje": f"La orden #{orden_id} ha sido cancelada exitosamente"}