# backend/app/crud/crud_activity_log.py
from sqlalchemy.orm import Session, selectinload
from app.models import activity_log as activity_log_model


def create_activity_log(
    db: Session, ma_quy_trinh: str, ma_nguoi_thuc_hien: str, hanh_dong: str
):
    """Tạo một bản ghi lịch sử hoạt động mới."""
    db_log = activity_log_model.LichSuHoatDong(
        MaQuyTrinh=ma_quy_trinh, MaNguoiThucHien=ma_nguoi_thuc_hien, HanhDong=hanh_dong
    )
    db.add(db_log)
    # Lưu ý: Chúng ta sẽ không commit ở đây.
    # Hàm gọi đến sẽ thực hiện commit chung cho cả hành động chính và hành động ghi log.
    return db_log


def get_recent_activities(db: Session, limit: int = 5):
    return (
        db.query(activity_log_model.LichSuHoatDong)
        .options(selectinload(activity_log_model.LichSuHoatDong.NguoiThucHien))
        .order_by(activity_log_model.LichSuHoatDong.ThoiGian.desc())
        .limit(limit)
        .all()
    )
