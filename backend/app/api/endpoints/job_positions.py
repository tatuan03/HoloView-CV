from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import recruitment_schema
from app.crud import crud_recruitment

router = APIRouter()


@router.post("/", response_model=recruitment_schema.ViTriTuyenDung, status_code=201)
def create_new_job_position(
    job_position: recruitment_schema.ViTriTuyenDungCreate, db: Session = Depends(get_db)
):
    return crud_recruitment.create_job_position(db=db, job_position=job_position)


@router.get("/", response_model=List[recruitment_schema.ViTriTuyenDung])
def read_all_job_positions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    job_positions = crud_recruitment.get_job_positions(db, skip=skip, limit=limit)
    return job_positions


@router.get("/{job_id}", response_model=recruitment_schema.ViTriTuyenDung)
def read_job_position_by_id(job_id: str, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của một vị trí tuyển dụng.
    """
    db_job = crud_recruitment.get_job_position(db, job_id=job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job position not found")
    return db_job


@router.patch("/{job_id}", response_model=recruitment_schema.ViTriTuyenDung)
def update_job(
    job_id: str,
    job_update: recruitment_schema.ViTriTuyenDungUpdate,
    db: Session = Depends(get_db),
    # current_user: user_schema.TaiKhoanNguoiDung = Depends(hr_or_admin) # Bảo vệ
):
    updated_job = crud_recruitment.update_job_position(
        db=db, job_id=job_id, job_update=job_update
    )
    if updated_job is None:
        raise HTTPException(status_code=404, detail="Job position not found")
    return updated_job


@router.delete("/{job_id}", response_model=recruitment_schema.ViTriTuyenDung)
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    # current_user: user_schema.TaiKhoanNguoiDung = Depends(hr_or_admin) # Bảo vệ
):
    deleted_job = crud_recruitment.delete_job_position(db=db, job_id=job_id)
    if deleted_job is None:
        raise HTTPException(status_code=404, detail="Job position not found")
    return deleted_job
