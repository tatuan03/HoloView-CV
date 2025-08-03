# app/api/endpoints/offers.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import recruitment_schema, user_schema
from app.core.auth import get_current_user
from app.crud import crud_recruitment

router = APIRouter()


@router.post(
    "/",
    response_model=recruitment_schema.DeXuatTuyenDung,
    status_code=status.HTTP_201_CREATED,
)
def create_new_offer(
    offer_in: recruitment_schema.DeXuatTuyenDungCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """
    API để tạo một đề xuất tuyển dụng (offer) cho ứng viên.
    """
    return crud_recruitment.create_offer(
        db=db, offer_in=offer_in, current_user_id=current_user.MaTaiKhoan
    )


@router.patch("/{offer_id}", response_model=recruitment_schema.DeXuatTuyenDung)
def update_offer(
    offer_id: int,
    offer_update: recruitment_schema.DeXuatTuyenDungUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """
    API để cập nhật phản hồi của ứng viên cho một offer.
    """
    updated_offer = crud_recruitment.update_offer_response(
        db=db,
        offer_id=offer_id,
        offer_update=offer_update,
        current_user_id=current_user.MaTaiKhoan,
    )
    if updated_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return updated_offer
