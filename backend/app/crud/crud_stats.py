# backend/app/crud/crud_stats.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.models import cv as cv_model
from app.models import recruitment as recruitment_model


def get_overview_stats(db: Session):
    # Đếm số CV mới trong 7 ngày qua
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    new_cvs_count = (
        db.query(func.count(cv_model.HoSoCV.MaHoSoCV))
        .filter(cv_model.HoSoCV.NgayTaiLen >= one_week_ago)
        .scalar()
    )

    # Đếm số CV đang chờ đánh giá kỹ thuật
    waiting_for_review_count = (
        db.query(func.count(recruitment_model.QuyTrinhUngTuyen.MaQuyTrinh))
        .filter(
            recruitment_model.QuyTrinhUngTuyen.TrangThaiHienTai == "Chờ đánh giá KT"
        )
        .scalar()
    )

    # Đếm số phỏng vấn trong ngày hôm nay
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    interviews_today_count = (
        db.query(func.count(recruitment_model.LichPhongVan.MaLichPV))
        .filter(recruitment_model.LichPhongVan.ThoiGian >= today_start)
        .filter(recruitment_model.LichPhongVan.ThoiGian < today_end)
        .scalar()
    )

    # Đếm số ứng viên đã trúng tuyển trong tháng này
    month_start = datetime.utcnow().replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    hired_this_month_count = (
        db.query(func.count(recruitment_model.QuyTrinhUngTuyen.MaQuyTrinh))
        .filter(
            recruitment_model.QuyTrinhUngTuyen.TrangThaiHienTai
            == "Chính thức được tuyển dụng"
        )
        .filter(recruitment_model.QuyTrinhUngTuyen.NgayUngTuyen >= month_start)
        .scalar()
    )

    return {
        "new_cvs_this_week": new_cvs_count,
        "waiting_for_review": waiting_for_review_count,
        "interviews_today": interviews_today_count,
        "hired_this_month": hired_this_month_count,
    }
