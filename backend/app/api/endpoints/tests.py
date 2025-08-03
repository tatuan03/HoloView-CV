# app/api/endpoints/tests.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import recruitment_schema
from app.crud import crud_recruitment

router = APIRouter()


@router.post(
    "/",
    response_model=recruitment_schema.BaiKiemTra,
    status_code=status.HTTP_201_CREATED,
)
def assign_technical_test(
    test_in: recruitment_schema.BaiKiemTraCreate, db: Session = Depends(get_db)
):
    """
    API để giao một bài kiểm tra kỹ năng cho một quy trình ứng tuyển.
    """
    return crud_recruitment.create_technical_test(db=db, test_in=test_in)


@router.patch("/{test_id}", response_model=recruitment_schema.BaiKiemTra)
def update_test_result(
    test_id: int,
    test_update: recruitment_schema.BaiKiemTraUpdate,
    db: Session = Depends(get_db),
):
    """
    API để cập nhật kết quả (điểm, đạt/không đạt) cho một bài test.
    """
    updated_test = crud_recruitment.update_technical_test_result(
        db=db, test_id=test_id, test_update=test_update
    )
    if updated_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    return updated_test
