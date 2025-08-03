# backend/app/api/endpoints/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.crud import crud_stats
from app.core.auth import get_current_user  # Bảo vệ endpoint

router = APIRouter()


@router.get("/overview", dependencies=[Depends(get_current_user)])
def get_stats_overview(db: Session = Depends(get_db)):
    """
    API để lấy các số liệu thống kê tổng quan cho trang Dashboard.
    """
    stats = crud_stats.get_overview_stats(db)
    return stats
