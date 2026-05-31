from app import models
from sqlalchemy.orm import Session

def seed(db: Session):
    # Check if category with ID 1 (Todos) already exists
    categoria = db.query(models.Categoria).filter(models.Categoria.id == 1).first()
    
    if not categoria:
        cat_todos = models.Categoria(
            id=1,
            nombre="Todos",
            icono="/iconos/all_icon.svg",
            es_sistema=True
        )
        db.add(cat_todos)
        db.commit()
        print("  [+] Categoría 'Todos' (ID: 1) insertada.")
    else:
        print("  [-] Categoría 'Todos' ya existe. Omitiendo.")
