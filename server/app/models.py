from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

detalle_opcion = Table(
    'detalle_opcion',
    Base.metadata,
    Column('id_detalle', Integer, ForeignKey('detalles_orden.id'), primary_key=True),
    Column('id_opcion', Integer, ForeignKey('opciones_modificadores.id'), primary_key=True)
)

producto_grupo_modificador = Table(
    'producto_grupo_modificador',
    Base.metadata,
    Column('id_producto', Integer, ForeignKey('productos.id'), primary_key=True),
    Column('id_grupo', Integer, ForeignKey('grupos_modificadores.id'), primary_key=True)
)

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    icono = Column(String, nullable=True)
    es_sistema = Column(Boolean, default=False)

    productos = relationship("Producto", back_populates="categoria")
    grupos_modificadores = relationship("GrupoModificador", back_populates="categoria")

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
    unidades = Column(String, nullable=False)
    activo = Column(Boolean, default=True)
    imagen_url = Column(String, nullable=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    
    categoria = relationship("Categoria", back_populates="productos")
    detalles = relationship("DetalleOrden", back_populates="producto")
    modificadores = relationship("GrupoModificador", secondary=producto_grupo_modificador, lazy="joined")

class GrupoModificador(Base):
    __tablename__ = "grupos_modificadores"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False) 
    minimo = Column(Integer, default=0)     
    maximo = Column(Integer, nullable=True)
    orden = Column(Integer, default=0)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)

    categoria = relationship("Categoria", back_populates="grupos_modificadores")
    opciones = relationship("OpcionModificador", back_populates="grupo", cascade="all, delete-orphan")

class OpcionModificador(Base):
    __tablename__ = "opciones_modificadores"
    id = Column(Integer, primary_key=True, index=True)
    grupo_id = Column(Integer, ForeignKey("grupos_modificadores.id"))
    nombre = Column(String, nullable=False)
    precio_extra = Column(Float, default=0.0)
    disponible = Column(Boolean, default=True)
    orden = Column(Integer, default=0)

    grupo = relationship("GrupoModificador", back_populates="opciones")
    

class Orden(Base):
    __tablename__ = "ordenes"
    id = Column(Integer, primary_key=True, index=True)
    serie = Column(String(4), nullable=True)
    tipo_pedido = Column(String, nullable=False)
    numero_mesa = Column(Integer, nullable=True) 
    fecha = Column(DateTime, default=datetime.utcnow)
    estado = Column(String, default="pendiente") 
    total = Column(Float, nullable=True)

    detalles = relationship("DetalleOrden", back_populates="orden")
    ventas = relationship("Venta", back_populates="orden")

class DetalleOrden(Base):
    __tablename__ = "detalles_orden"
    id = Column(Integer, primary_key=True, index=True)
    id_orden = Column(Integer, ForeignKey("ordenes.id"))
    id_producto = Column(Integer, ForeignKey("productos.id"))
    cantidad = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    orden = relationship("Orden", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles")
    opciones = relationship("OpcionModificador", secondary=detalle_opcion)

class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True, index=True)
    id_orden = Column(Integer, ForeignKey("ordenes.id"))
    metodo_pago = Column(String, nullable=False)
    precio_total = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    orden = relationship("Orden", back_populates="ventas")

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    rol = Column(String, nullable=False) 
    hashed_password = Column(String, nullable=False)
    activo = Column(Boolean, default=True)
    ultimo_acceso = Column(DateTime, nullable=True)