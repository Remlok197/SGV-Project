from app import models
from sqlalchemy.orm import Session

def seed(db: Session):
    # Verificamos si ya hay productos de prueba
    if db.query(models.Producto).first():
        print("  [-] Ya existen productos en la BD. Omitiendo seed de mockup.")
        return

    # 1. Crear Categorías Mockup
    cat_tacos = models.Categoria(nombre="Tacos", icono="/iconos/taco.svg", es_sistema=False)
    cat_bebidas = models.Categoria(nombre="Bebidas", icono="/iconos/soda.svg", es_sistema=False)
    cat_postres = models.Categoria(nombre="Postres", icono="/iconos/dessert.svg", es_sistema=False)
    
    db.add_all([cat_tacos, cat_bebidas, cat_postres])
    db.commit()
    db.refresh(cat_tacos)
    db.refresh(cat_bebidas)

    # 2. Crear Grupos de Modificadores Mockup
    grupo_salsas = models.GrupoModificador(
        nombre="Salsas", minimo=1, maximo=2, categoria_id=cat_tacos.id
    )
    grupo_verdura = models.GrupoModificador(
        nombre="Verdura", minimo=0, maximo=1, categoria_id=cat_tacos.id
    )
    grupo_hielo = models.GrupoModificador(
        nombre="Hielo", minimo=1, maximo=1, categoria_id=cat_bebidas.id
    )
    
    db.add_all([grupo_salsas, grupo_verdura, grupo_hielo])
    db.commit()
    db.refresh(grupo_salsas)
    db.refresh(grupo_verdura)
    db.refresh(grupo_hielo)

    # 3. Crear Opciones para los Modificadores
    opciones = [
        models.OpcionModificador(grupo_id=grupo_salsas.id, nombre="Salsa Roja", precio_extra=0.0),
        models.OpcionModificador(grupo_id=grupo_salsas.id, nombre="Salsa Verde", precio_extra=0.0),
        models.OpcionModificador(grupo_id=grupo_salsas.id, nombre="Sin Salsa", precio_extra=0.0),
        
        models.OpcionModificador(grupo_id=grupo_verdura.id, nombre="Con Todo", precio_extra=0.0),
        models.OpcionModificador(grupo_id=grupo_verdura.id, nombre="Sin Cebolla", precio_extra=0.0),
        models.OpcionModificador(grupo_id=grupo_verdura.id, nombre="Sin Cilantro", precio_extra=0.0),

        models.OpcionModificador(grupo_id=grupo_hielo.id, nombre="Con Hielo", precio_extra=0.0),
        models.OpcionModificador(grupo_id=grupo_hielo.id, nombre="Sin Hielo", precio_extra=0.0),
    ]
    db.add_all(opciones)
    db.commit()

    # 4. Crear Productos Mockup
    prod_pastor = models.Producto(
        nombre="Taco al Pastor", precio=20.0, unidades="pieza", activo=True, 
        id_categoria=cat_tacos.id, imagen_url=None
    )
    prod_pastor.modificadores = [grupo_salsas, grupo_verdura]

    prod_asada = models.Producto(
        nombre="Taco de Asada", precio=25.0, unidades="pieza", activo=True, 
        id_categoria=cat_tacos.id, imagen_url=None
    )
    prod_asada.modificadores = [grupo_salsas, grupo_verdura]

    prod_coca = models.Producto(
        nombre="Coca Cola 600ml", precio=25.0, unidades="pieza", activo=True, 
        id_categoria=cat_bebidas.id, imagen_url=None
    )
    prod_coca.modificadores = [grupo_hielo]

    db.add_all([prod_pastor, prod_asada, prod_coca])
    db.commit()

    print("  [+] Productos de prueba (mockup), categorías y modificadores insertados con éxito.")
