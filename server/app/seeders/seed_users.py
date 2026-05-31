from app import models
from sqlalchemy.orm import Session
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')

def seed(db: Session):
    existing_admin = db.query(models.Usuario).filter(models.Usuario.nombre == "admin").first()
    
    if not existing_admin:
        hashed_pwd = get_password_hash("admin123")
        nuevo_usuario = models.Usuario(
            nombre="admin",
            rol="admin",
            hashed_password=hashed_pwd,
            activo=True
        )
        db.add(nuevo_usuario)
        db.commit()
        print("  [+] Usuario 'admin' insertado. Contraseña por defecto: admin123")
    else:
        print("  [-] Usuario 'admin' ya existe. Omitiendo.")
