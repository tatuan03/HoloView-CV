# backend/app/api/endpoints/users.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import user_schema
from app.crud import crud_user
from app.core.auth import role_checker, get_current_user
from app.models import user as user_model

router = APIRouter()
admin_only = Depends(role_checker(["ADMIN"]))
s2 = Depends(role_checker(["HR", "ADMIN"]))


@router.get("/me", response_model=user_schema.TaiKhoanNguoiDung)
def read_users_me(
    current_user: user_model.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """Lấy thông tin của người dùng hiện tại đang đăng nhập."""
    # Trả về trực tiếp đối tượng SQLAlchemy đã được tải đầy đủ
    return current_user


@router.post(
    "/", response_model=user_schema.TaiKhoanNguoiDung, dependencies=[admin_only]
)
def create_user(
    user: user_schema.TaiKhoanNguoiDungCreate, db: Session = Depends(get_db)
):
    db_user = crud_user.get_user_by_email(db, email=user.Email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)


@router.get("/", response_model=List[user_schema.TaiKhoanNguoiDung], dependencies=[s2])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_user.get_users(db, skip=skip, limit=limit)


@router.get("/roles/", response_model=List[user_schema.VaiTro])
def read_roles(db: Session = Depends(get_db)):
    return crud_user.get_roles(db)


@router.get("/reviewers/", response_model=List[user_schema.TaiKhoanNguoiDung])
def read_reviewers(db: Session = Depends(get_db)):
    return crud_user.get_reviewers(db)


@router.get(
    "/{user_id}",
    response_model=user_schema.TaiKhoanNguoiDung,
    dependencies=[admin_only],
)
def read_user_by_id(user_id: str, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.patch(
    "/{user_id}",
    response_model=user_schema.TaiKhoanNguoiDung,
    dependencies=[admin_only],
)
def update_user_info(
    user_id: str,
    user_update: user_schema.TaiKhoanNguoiDungUpdate,
    db: Session = Depends(get_db),
):
    updated_user = crud_user.update_user(
        db=db, user_id=user_id, user_update=user_update
    )
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.delete(
    "/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[admin_only]
)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    deleted_user = crud_user.delete_user(db=db, user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return
