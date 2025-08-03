from sqlalchemy import Column, String, Text, Unicode
from sqlalchemy.orm import relationship

from app.db.database import Base


class PhongBan(Base):
    __tablename__ = "PhongBan"

    MaPhongBan = Column(String(50), primary_key=True, index=True)
    TenPhongBan = Column(Unicode(255), nullable=False)
    MoTa = Column(Unicode(500), nullable=True)

    # Relationship to other tables
    TaiKhoanNguoiDung = relationship("TaiKhoanNguoiDung", back_populates="PhongBan")
    ViTriTuyenDung = relationship("ViTriTuyenDung", back_populates="PhongBan")
