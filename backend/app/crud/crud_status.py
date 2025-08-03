# backend/app/crud/crud_status.py
from sqlalchemy.orm import Session
from app.models.status import TrangThaiTuyenDung
from app.schemas.status_schema import TrangThaiTuyenDungCreate, TrangThaiTuyenDungUpdate


def get_statuses(db: Session):
    return db.query(TrangThaiTuyenDung).all()


def create_status(db: Session, status: TrangThaiTuyenDungCreate):
    db_status = TrangThaiTuyenDung(**status.dict())
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status
