from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Unicode
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

# from .department import PhongBan # Import model PhongBan


class VaiTro(Base):
    __tablename__ = "VaiTro"
    # ... (giữ nguyên không đổi)
    MaVaiTro = Column(String(50), primary_key=True, index=True)
    TenVaiTro = Column(String(255), nullable=False)
    MoTa = Column(String, nullable=True)

    TaiKhoanNguoiDung = relationship("TaiKhoanNguoiDung", back_populates="VaiTro")


class TaiKhoanNguoiDung(Base):
    __tablename__ = "TaiKhoanNguoiDung"

    MaTaiKhoan = Column(String(50), primary_key=True, index=True)
    TenDangNhap = Column(String(100), unique=True, nullable=False)
    MatKhauHash = Column(String(255), nullable=False)
    HoTen = Column(Unicode(255), nullable=False)
    Email = Column(String(255), unique=True, nullable=False, index=True)
    TrangThai = Column(
        Enum("HoatDong", "VoHieuHoa", name="trangthai_taikhoan_enum"),
        nullable=False,
        default="HoatDong",
    )
    ThoiGianTao = Column(DateTime, nullable=False, default=datetime.utcnow)

    MaVaiTro = Column(String(50), ForeignKey("VaiTro.MaVaiTro"))
    MaPhongBan = Column(String(50), ForeignKey("PhongBan.MaPhongBan"), nullable=True)

    # Relationships
    VaiTro = relationship("VaiTro", back_populates="TaiKhoanNguoiDung")
    PhongBan = relationship("PhongBan", back_populates="TaiKhoanNguoiDung")
    LichSuHoatDong = relationship("LichSuHoatDong", back_populates="NguoiThucHien")
    CacBuoiPhongVan = relationship(
        "LichPhongVan",
        secondary="PhongVan_NguoiPhongVan",
        back_populates="NguoiPhongVan",
    )
