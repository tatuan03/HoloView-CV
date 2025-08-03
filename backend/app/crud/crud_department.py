from sqlalchemy.orm import Session
from typing import Optional, List  # <-- Chuyển Optional vào đây và thêm List

from app.models import department as department_model
from app.schemas import department_schema


def get_department(
    db: Session, department_id: str
) -> Optional[department_model.PhongBan]:
    return (
        db.query(department_model.PhongBan)
        .filter(department_model.PhongBan.MaPhongBan == department_id)
        .first()
    )


def get_departments(
    db: Session, skip: int = 0, limit: int = 100
) -> List[department_model.PhongBan]:
    # Thêm order_by để tránh lỗi phân trang trên SQL Server
    return (
        db.query(department_model.PhongBan)
        .order_by(department_model.PhongBan.MaPhongBan)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_department(
    db: Session, department: department_schema.PhongBanCreate
) -> department_model.PhongBan:
    db_department = department_model.PhongBan(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def delete_department(
    db: Session, department_id: str
) -> Optional[department_model.PhongBan]:
    db_department = get_department(db, department_id)
    if db_department:
        db.delete(db_department)
        db.commit()
    return db_department
