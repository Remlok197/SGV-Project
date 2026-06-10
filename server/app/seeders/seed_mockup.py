from app import models
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
import random

def seed(db: Session):
    # Borrar datos anteriores para asegurar el nuevo mockup sin afectar la categoría Todos (ID: 1)
    db.execute(text("TRUNCATE TABLE productos, grupos_modificadores, opciones_modificadores, ordenes, detalles_orden, ventas CASCADE"))
    db.execute(text("DELETE FROM categorias WHERE id != 1"))
    db.execute(text("ALTER SEQUENCE categorias_id_seq RESTART WITH 2"))
    db.commit()

    # 1. Crear Categorías Mockup
    cat_alimentos = models.Categoria(nombre="Alimentos", icono="/iconos/cutlery_icon.svg", es_sistema=False)
    cat_bebidas = models.Categoria(nombre="Bebidas", icono="/iconos/soft_drink_1_icon.svg", es_sistema=False)
    
    db.add_all([cat_alimentos, cat_bebidas])
    db.commit()
    db.refresh(cat_alimentos)
    db.refresh(cat_bebidas)

    # 2. Crear Grupos de Modificadores Mockup
    grupo_carne = models.GrupoModificador(
        nombre="Carne", minimo=1, maximo=2, categoria_id=cat_alimentos.id
    )
    grupo_salsa = models.GrupoModificador(
        nombre="Salsa", minimo=0, maximo=0, categoria_id=cat_alimentos.id
    )
    grupo_verdura = models.GrupoModificador(
        nombre="Verdura", minimo=0, maximo=0, categoria_id=cat_alimentos.id
    )
    grupo_tortilla = models.GrupoModificador(
        nombre="Tortilla", minimo=1, maximo=1, categoria_id=cat_alimentos.id
    )
    grupo_tamano = models.GrupoModificador(
        nombre="Tamaño", minimo=1, maximo=1, categoria_id=cat_bebidas.id
    )
    
    db.add_all([grupo_carne, grupo_salsa, grupo_verdura, grupo_tortilla, grupo_tamano])
    db.commit()
    db.refresh(grupo_carne)
    db.refresh(grupo_salsa)
    db.refresh(grupo_verdura)
    db.refresh(grupo_tortilla)
    db.refresh(grupo_tamano)

    # 3. Crear Opciones para Modificadores
    opciones = [
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Pastor", precio_extra=0.0), # 0
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Asada", precio_extra=5.0), # 1
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Bistec", precio_extra=0.0), # 2
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Chorizo", precio_extra=0.0), # 3
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Costilla", precio_extra=0.0), # 4
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Cabeza", precio_extra=0.0), # 5
        models.OpcionModificador(grupo_id=grupo_carne.id, nombre="Tripa", precio_extra=2.0), # 6
        
        models.OpcionModificador(grupo_id=grupo_salsa.id, nombre="Roja", precio_extra=0.0), # 7
        models.OpcionModificador(grupo_id=grupo_salsa.id, nombre="Verde", precio_extra=0.0), # 8

        models.OpcionModificador(grupo_id=grupo_verdura.id, nombre="Cebolla", precio_extra=0.0), # 9
        models.OpcionModificador(grupo_id=grupo_verdura.id, nombre="Cilantro", precio_extra=0.0), # 10
        
        models.OpcionModificador(grupo_id=grupo_tortilla.id, nombre="Maíz", precio_extra=0.0), # 11
        models.OpcionModificador(grupo_id=grupo_tortilla.id, nombre="Harina", precio_extra=2.0), # 12
        
        models.OpcionModificador(grupo_id=grupo_tamano.id, nombre="Chico", precio_extra=0.0), # 13
        models.OpcionModificador(grupo_id=grupo_tamano.id, nombre="Grande", precio_extra=10.0), # 14
    ]
    db.add_all(opciones)
    db.commit()

    # 4. Crear Productos Mockup
    productos = [
        models.Producto(
            nombre="Taco", precio=17.0, unidades="pieza", activo=True, 
            id_categoria=cat_alimentos.id, imagen_url="/imagenes/taco.png"
        ),
        models.Producto(
            nombre="Quesadilla", precio=25.0, unidades="pieza", activo=True, 
            id_categoria=cat_alimentos.id, imagen_url="/imagenes/quesadilla_harina.png"
        ),
        models.Producto(
            nombre="Torta", precio=30.0, unidades="pieza", activo=True, 
            id_categoria=cat_alimentos.id, imagen_url="/imagenes/torta.png"
        ),
        models.Producto(
            nombre="Volcán", precio=21.0, unidades="pieza", activo=True, 
            id_categoria=cat_alimentos.id, imagen_url="/imagenes/volcán.png"
        ),
        models.Producto(
            nombre="Refresco vidrio", precio=21.0, unidades="pieza", activo=True, 
            id_categoria=cat_bebidas.id, imagen_url="/imagenes/refresco.png"
        ),
        models.Producto(
            nombre="Refresco taparrosca", precio=27.0, unidades="pieza", activo=False, 
            id_categoria=cat_bebidas.id, imagen_url="/imagenes/refresco_taparrosca.png"
        ),
        models.Producto(
            nombre="Agua de sabor", precio=27.0, unidades="pieza", activo=False, 
            id_categoria=cat_bebidas.id, imagen_url="/imagenes/agua_sabor.png"
        ),
        models.Producto(
            nombre="Taco de tripa", precio=19.0, unidades="pieza", activo=True, 
            id_categoria=cat_alimentos.id, imagen_url="/imagenes/taco_tripa.png"
        )
    ]
    
    # Asignar modificadores
    productos[0].modificadores = [grupo_carne, grupo_salsa, grupo_verdura] # Taco
    productos[1].modificadores = [grupo_carne, grupo_tortilla, grupo_salsa, grupo_verdura] # Quesadilla
    productos[2].modificadores = [grupo_carne, grupo_salsa, grupo_verdura] # Torta
    productos[3].modificadores = [grupo_carne, grupo_salsa, grupo_verdura] # Volcan
    productos[4].modificadores = [] # Refresco vidrio
    productos[5].modificadores = [] # Refresco taparrosca
    productos[6].modificadores = [grupo_tamano] # Agua de sabor
    productos[7].modificadores = [grupo_carne, grupo_salsa, grupo_verdura] # Taco de tripa
    
    db.add_all(productos)
    db.commit()

    print("  [+] Productos de prueba (mockup), categorías y modificadores insertados con éxito.")

    # 5. Crear Órdenes y Ventas Mockup para Estadísticas
    now = datetime.utcnow()
    dias_atras = [0, 0, 0, 1, 1, 2, 3, 5, 7, 10, 15, 30] # Diferentes días para probar filtros
    ordenes = []
    
    for i, dias in enumerate(dias_atras):
        fecha_orden = now - timedelta(days=dias, hours=i)
        
        # Las órdenes más recientes serán pendientes
        estado_orden = "pendiente" if dias == 0 and i < 2 else "entregada"

        orden = models.Orden(
            serie=f"A{i:03d}",
            tipo_pedido="mesa" if i % 2 == 0 else "mostrador",
            numero_mesa=i if i % 2 == 0 else None,
            fecha=fecha_orden,
            estado=estado_orden,
            total=0.0
        )
        
        detalles = []
        total = 0.0
        if i % 2 == 0:
            det = models.DetalleOrden(id_producto=productos[0].id, cantidad=3, subtotal=17.0 * 3)
            # Agregar modificadores al taco: Pastor y Salsa Verde
            det.opciones = [opciones[0], opciones[8], opciones[10]]
            detalles.append(det)

            det2 = models.DetalleOrden(id_producto=productos[4].id, cantidad=2, subtotal=21.0 * 2)
            detalles.append(det2)
            total += (17.0 * 3) + (21.0 * 2)
        else:
            det = models.DetalleOrden(id_producto=productos[1].id, cantidad=1, subtotal=25.0)
            # Quesadilla: Asada, Harina, Salsa Roja
            det.opciones = [opciones[1], opciones[12], opciones[7]]
            detalles.append(det)

            det2 = models.DetalleOrden(id_producto=productos[2].id, cantidad=1, subtotal=30.0)
            # Torta: Pastor
            det2.opciones = [opciones[0]]
            detalles.append(det2)
            
            # Sumamos precios extras de los modificadores: Asada (+5), Harina (+2)
            subtotal_quesadilla = 25.0 + 5.0 + 2.0
            det.subtotal = subtotal_quesadilla
            total += subtotal_quesadilla + 30.0
            
        if i % 3 == 0:
            det = models.DetalleOrden(id_producto=productos[3].id, cantidad=2, subtotal=21.0 * 2)
            # Volcán: Asada, Salsa Verde
            det.opciones = [opciones[1], opciones[8]]
            # Asada (+5) * 2
            det.subtotal = (21.0 + 5.0) * 2
            detalles.append(det)
            total += det.subtotal
            
        orden.detalles = detalles
        orden.total = total
        ordenes.append(orden)
        
    db.add_all(ordenes)
    db.commit()
    
    ventas = []
    for orden in ordenes:
        # Solo crear ventas para las que ya se pagaron/entregaron
        if orden.estado == "entregada":
            venta = models.Venta(
                id_orden=orden.id,
                metodo_pago="efectivo" if orden.id % 2 == 0 else "tarjeta",
                precio_total=orden.total,
                fecha=orden.fecha
            )
            ventas.append(venta)
        
    db.add_all(ventas)
    db.commit()
    
    print("  [+] Órdenes y Ventas de prueba insertadas con éxito.")
