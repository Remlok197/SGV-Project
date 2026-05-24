from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

detalle_modificador = Table(
    'detalle_modificador',
    Base.metadata,
    Column('id_detalle', Integer, ForeignKey('detalles_orden.id'), primary_key=True),
    Column('id_modificador', Integer, ForeignKey('modificadores.id'), primary_key=True)
)

producto_modificador = Table(
    'producto_modificador',
    Base.metadata,
    Column('id_producto', Integer, ForeignKey('productos.id'), primary_key=True),
    Column('id_modificador', Integer, ForeignKey('modificadores.id'), primary_key=True)
)

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)
    unidades = Column(String, nullable=False)
    disponibilidad = Column(Boolean, default=True)
    
    detalles = relationship("DetalleOrden", back_populates="producto")
    modificadores = relationship("Modificador", secondary=producto_modificador)

class Modificador(Base):
    __tablename__ = "modificadores"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo = Column(String) 
    minimo = Column(Integer, nullable=True)
    maximo = Column(Integer, nullable=True)
    precio_extra = Column(Float, default=0.0)
    

class Orden(Base):
    __tablename__ = "ordenes"
    id = Column(Integer, primary_key=True, index=True)
    serie = Column(String(4), nullable=True)
    numero_mesa = Column(Integer, nullable=True) 
    fecha = Column(DateTime, default=datetime.utcnow)
    estado = Column(String, default="pendiente") 

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
    modificadores = relationship("Modificador", secondary=detalle_modificador)

class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True, index=True)
    id_orden = Column(Integer, ForeignKey("ordenes.id"))
    metodo_pago = Column(String, nullable=False)
    precio_total = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    orden = relationship("Orden", back_populates="ventas")