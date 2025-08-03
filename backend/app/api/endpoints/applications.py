from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import recruitment_schema, user_schema
from app.core.auth import get_current_user
from app.crud import crud_recruitment

router = APIRouter()


@router.patch(
    "/{application_id}/status", response_model=recruitment_schema.QuyTrinhUngTuyen
)
def update_status_for_application(
    application_id: str,
    status_update: recruitment_schema.QuyTrinhUngTuyenUpdateStatus,
    db: Session = Depends(get_db),
):
    """
    Cập nhật trạng thái cho một quy trình ứng tuyển (ví dụ: "Đã xem xét", "Mời phỏng vấn").
    """
    updated_application = crud_recruitment.update_application_status(
        db=db, application_id=application_id, status=status_update.TrangThaiHienTai
    )
    if updated_application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated_application


@router.post(
    "/",
    response_model=recruitment_schema.QuyTrinhUngTuyen,
    status_code=status.HTTP_201_CREATED,
)
def create_new_application(
    application_in: recruitment_schema.QuyTrinhUngTuyenCreate,
    db: Session = Depends(get_db),
):
    """
    Tạo một quy trình ứng tuyển mới: liên kết một hồ sơ CV với một vị trí tuyển dụng.
    """
    db_application = crud_recruitment.create_application_process(
        db=db, application_in=application_in
    )
    if db_application is None:
        raise HTTPException(
            status_code=400, detail="Ứng viên đã ứng tuyển vào vị trí này rồi."
        )
    return db_application


@router.get("/priority", response_model=List[recruitment_schema.QuyTrinhUngTuyen])
def read_priority_applications(
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """
    API để lấy danh sách các ứng viên cần chú ý cho dashboard.
    """
    return crud_recruitment.get_priority_applications(db)
