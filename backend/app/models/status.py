# backend/app/models/status.py
from sqlalchemy import Column, String, Text
from app.db.database import Base


class TrangThaiTuyenDung(Base):
    __tablename__ = "TrangThaiTuyenDung"
    MaTrangThai = Column(String(50), primary_key=True, index=True)
    TenTrangThai = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    MauSac = Column(String(20), nullable=True)
