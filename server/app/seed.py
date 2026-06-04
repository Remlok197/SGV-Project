from app.database import SessionLocal
from app.seeders import seed_categories, seed_users, seed_mockup

def run_all_seeders():
    db = SessionLocal()
    try:
        print("========================================")
        print("🌱 Iniciando Database Seeding...")
        print("========================================")
        
        # 1. Catálogos Base
        print("\n--> Sembrando Categorías...")
        seed_categories.seed(db)
        
        # 2. Entidades Principales
        print("\n--> Sembrando Usuarios...")
        seed_users.seed(db)

        # 3. Datos de Prueba (Mockup)
        print("\n--> Sembrando Datos de Prueba (Mockup)...")
        seed_mockup.seed(db)

        print("\n========================================")
        print("✅ Seeding completado con éxito.")
        print("========================================")
    except Exception as e:
        print(f"\n❌ Error durante el seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_all_seeders()
