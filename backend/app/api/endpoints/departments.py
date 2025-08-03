from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import department_schema
from app.crud import crud_department

router = APIRouter()


@router.post("/", response_model=department_schema.PhongBan, status_code=201)
def create_new_department(
    department: department_schema.PhongBanCreate, db: Session = Depends(get_db)
):
    return crud_department.create_department(db=db, department=department)


@router.get("/", response_model=List[department_schema.PhongBan])
def read_all_departments(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    departments = crud_department.get_departments(db, skip=skip, limit=limit)
    return departments
