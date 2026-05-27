from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')

def main():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(models.Usuario).filter(models.Usuario.nombre == "admin").first()
        if existing:
            print("El usuario admin ya existe.")
        else:
            hashed_pwd = get_password_hash("admin123")
            nuevo_usuario = models.Usuario(
                nombre="admin",
                rol="admin",
                hashed_password=hashed_pwd,
                activo=True
            )
            db.add(nuevo_usuario)
            db.commit()
            print("Usuario admin creado con éxito. Usuario: admin, Contraseña: admin123")
    except Exception as e:
        print(f"Error al crear el usuario admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
