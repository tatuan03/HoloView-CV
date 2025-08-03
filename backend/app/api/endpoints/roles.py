# backend/app/api/endpoints/roles.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import user_schema
from app.crud import crud_role
from app.core.auth import role_checker

router = APIRouter()
admin_only = Depends(role_checker(["ADMIN"]))


@router.get("/", response_model=List[user_schema.VaiTro], dependencies=[admin_only])
def read_roles(db: Session = Depends(get_db)):
    return crud_role.get_roles(db)


@router.post("/", response_model=user_schema.VaiTro, dependencies=[admin_only])
def create_new_role(role: user_schema.VaiTroCreate, db: Session = Depends(get_db)):
    return crud_role.create_role(db=db, role=role)
