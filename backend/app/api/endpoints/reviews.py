# app/api/endpoints/reviews.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import recruitment_schema, user_schema
from app.crud import crud_recruitment
from app.core.auth import get_current_user

router = APIRouter()


@router.get(
    "/assigned/{user_id}", response_model=List[recruitment_schema.AssignedReview]
)
def get_assigned_reviews(user_id: str, db: Session = Depends(get_db)):
    reviews = crud_recruitment.get_reviews_assigned_to_user(db, user_id=user_id)
    return reviews


@router.get("/{review_id}", response_model=recruitment_schema.ReviewDetails)
def get_review_for_evaluation(review_id: int, db: Session = Depends(get_db)):
    review_details = crud_recruitment.get_review_details(db, review_id=review_id)
    if review_details is None:
        raise HTTPException(status_code=404, detail="Review assignment not found")
    return review_details


@router.patch("/{review_id}", response_model=recruitment_schema.DanhGiaKyThuat)
def update_review_by_id(
    review_id: int,
    review_update: recruitment_schema.DanhGiaKyThuatUpdate,
    db: Session = Depends(get_db),
):
    updated_review = crud_recruitment.update_technical_review(
        db=db, review_id=review_id, review_update=review_update
    )
    if updated_review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return updated_review


@router.post(
    "/",
    response_model=recruitment_schema.DanhGiaKyThuat,
    status_code=status.HTTP_201_CREATED,
)
def submit_technical_review(
    review_in: recruitment_schema.DanhGiaKyThuatCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.TaiKhoanNguoiDung = Depends(get_current_user),
):
    """
    API cho Technical Reviewer gửi kết quả đánh giá một hồ sơ.
    """
    return crud_recruitment.create_technical_review(
        db=db, review_in=review_in, current_user_id=current_user.MaTaiKhoan
    )
