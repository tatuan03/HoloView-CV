# backend/app/models/activity_log.py
from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger, Text, Unicode
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class LichSuHoatDong(Base):
    __tablename__ = "LichSuHoatDong"
    MaHoatDong = Column(BigInteger, primary_key=True, index=True)
    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )
    MaNguoiThucHien = Column(
        String(50), ForeignKey("TaiKhoanNguoiDung.MaTaiKhoan"), nullable=True
    )
    HanhDong = Column(Unicode(500), nullable=False)
    ThoiGian = Column(DateTime, nullable=False, default=datetime.utcnow)

    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="LichSuHoatDong")
    NguoiThucHien = relationship("TaiKhoanNguoiDung", back_populates="LichSuHoatDong")
