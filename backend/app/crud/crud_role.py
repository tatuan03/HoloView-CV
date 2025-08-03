# backend/app/crud/crud_role.py
from sqlalchemy.orm import Session
from app.models import user as user_model
from app.schemas import user_schema


def get_roles(db: Session):
    return db.query(user_model.VaiTro).all()


def create_role(db: Session, role: user_schema.VaiTroCreate):
    db_role = user_model.VaiTro(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role
