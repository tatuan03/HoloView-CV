# backend/app/api/endpoints/statuses.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import status_schema
from app.crud import crud_status
from app.core.auth import role_checker

router = APIRouter()
admin_only = Depends(role_checker(["ADMIN"]))


@router.get(
    "/",
    response_model=List[status_schema.TrangThaiTuyenDung],
    dependencies=[admin_only],
)
def read_statuses(db: Session = Depends(get_db)):
    return crud_status.get_statuses(db)


@router.post(
    "/", response_model=status_schema.TrangThaiTuyenDung, dependencies=[admin_only]
)
def create_new_status(
    status: status_schema.TrangThaiTuyenDungCreate, db: Session = Depends(get_db)
):
    return crud_status.create_status(db=db, status=status)
