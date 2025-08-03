# backend/app/crud/crud_user.py
from sqlalchemy.orm import Session, selectinload
import uuid
from sqlalchemy import desc
from typing import List, Optional

from app.models import user as user_model
from app.schemas import user_schema
from app.core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str):
    return (
        db.query(user_model.TaiKhoanNguoiDung)
        .filter(user_model.TaiKhoanNguoiDung.Email == email)
        .first()
    )


def get_user_by_username(db: Session, username: str):
    """Lấy người dùng theo tên đăng nhập, tải kèm vai trò và phòng ban."""
    return (
        db.query(user_model.TaiKhoanNguoiDung)
        .options(
            selectinload(user_model.TaiKhoanNguoiDung.VaiTro),
            selectinload(user_model.TaiKhoanNguoiDung.PhongBan),
        )
        .filter(user_model.TaiKhoanNguoiDung.TenDangNhap == username)
        .first()
    )


def get_user_by_id(db: Session, user_id: str):
    """Lấy người dùng theo ID, tải kèm vai trò và phòng ban."""
    return (
        db.query(user_model.TaiKhoanNguoiDung)
        .options(
            selectinload(user_model.TaiKhoanNguoiDung.VaiTro),
            selectinload(user_model.TaiKhoanNguoiDung.PhongBan),
        )
        .filter(user_model.TaiKhoanNguoiDung.MaTaiKhoan == user_id)
        .first()
    )


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách người dùng, tải kèm vai trò và phòng ban."""
    return (
        db.query(user_model.TaiKhoanNguoiDung)
        .options(
            selectinload(user_model.TaiKhoanNguoiDung.VaiTro),
            selectinload(user_model.TaiKhoanNguoiDung.PhongBan),
        )
        .order_by(user_model.TaiKhoanNguoiDung.ThoiGianTao.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user(db: Session, user: user_schema.TaiKhoanNguoiDungCreate):
    hashed_password = get_password_hash(user.MatKhau)
    new_user_id = str(uuid.uuid4())
    db_user = user_model.TaiKhoanNguoiDung(
        MaTaiKhoan=new_user_id,
        Email=user.Email,
        HoTen=user.HoTen,
        TenDangNhap=user.TenDangNhap,
        MatKhauHash=hashed_password,
        MaVaiTro=user.MaVaiTro,
        MaPhongBan=user.MaPhongBan,
    )
    db.add(db_user)
    db.commit()
    # Lấy lại user đầy đủ sau khi tạo để trả về
    return get_user_by_id(db, user_id=new_user_id)


def update_user(
    db: Session, user_id: str, user_update: user_schema.TaiKhoanNguoiDungUpdate
):
    db_user_to_update = (
        db.query(user_model.TaiKhoanNguoiDung)
        .filter(user_model.TaiKhoanNguoiDung.MaTaiKhoan == user_id)
        .first()
    )
    if not db_user_to_update:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user_to_update, key, value)
    db.add(db_user_to_update)
    db.commit()
    # Lấy lại user đầy đủ sau khi cập nhật
    return get_user_by_id(db, user_id=user_id)


def delete_user(db: Session, user_id: str):
    db_user = get_user_by_id(db, user_id=user_id)
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return db_user


def get_roles(db: Session):
    return db.query(user_model.VaiTro).all()


def get_reviewers(db: Session):
    return (
        db.query(user_model.TaiKhoanNguoiDung)
        .options(
            selectinload(user_model.TaiKhoanNguoiDung.VaiTro),
            selectinload(user_model.TaiKhoanNguoiDung.PhongBan),
        )
        .filter(user_model.TaiKhoanNguoiDung.MaVaiTro == "REVIEWER")
        .order_by(user_model.TaiKhoanNguoiDung.HoTen)
        .all()
    )


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username=username)
    if not user or not verify_password(password, user.MatKhauHash):
        return False
    return user
