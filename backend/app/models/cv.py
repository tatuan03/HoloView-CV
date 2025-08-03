from sqlalchemy import (
    Column,
    String,
    DateTime,
    Date,
    Enum,
    ForeignKey,
    BigInteger,
    Integer,
    Float,
    Text,
    Unicode,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class UngVien(Base):
    __tablename__ = "UngVien"

    MaUngVien = Column(String(50), primary_key=True, index=True)
    HoTen = Column(Unicode(255), nullable=False)
    NgaySinh = Column(Date, nullable=True)
    Email = Column(String(255), unique=True, nullable=False, index=True)
    SoDienThoai = Column(String(20), unique=True, nullable=True)
    DiaChi = Column(Text, nullable=True)
    ThoiGianTao = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship to HoSoCV
    HoSoCVs = relationship("HoSoCV", back_populates="UngVien")


class HoSoCV(Base):
    __tablename__ = "HoSoCV"

    MaHoSoCV = Column(String(50), primary_key=True, index=True)
    DuongDanFile = Column(String(500), nullable=False)
    NgayTaiLen = Column(DateTime, nullable=False)
    TrangThaiXuLyOCR = Column(
        Enum("ChuaXuLy", "DaXuLy", "LoiXuLy", name="trangthai_ocr_enum"),
        nullable=False,
        default="ChuaXuLy",
    )

    MaUngVien = Column(String(50), ForeignKey("UngVien.MaUngVien"), nullable=False)

    # Relationships
    UngVien = relationship("UngVien", back_populates="HoSoCVs")
    HocVan = relationship("ThongTinHocVan", back_populates="HoSoCV")
    KinhNghiem = relationship("ThongTinKinhNghiem", back_populates="HoSoCV")
    KyNang = relationship("ThongTinKyNang", back_populates="HoSoCV")
    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="HoSoCV")
    DuAn = relationship(
        "ThongTinDuAn", back_populates="HoSoCV", cascade="all, delete-orphan"
    )


class ThongTinHocVan(Base):
    __tablename__ = "ThongTinHocVan"

    MaHocVan = Column(BigInteger, primary_key=True, index=True)
    TenTruong = Column(Unicode(255), nullable=True)
    ChuyenNganh = Column(Unicode(255), nullable=True)
    BangCap = Column(String(255), nullable=True)
    NamTotNghiep = Column(Integer, nullable=True)

    MaHoSoCV = Column(String(50), ForeignKey("HoSoCV.MaHoSoCV"), nullable=False)
    HoSoCV = relationship("HoSoCV", back_populates="HocVan")


class ThongTinKinhNghiem(Base):
    __tablename__ = "ThongTinKinhNghiem"

    MaKinhNghiem = Column(BigInteger, primary_key=True, index=True)
    TenCongTy = Column(Unicode(255), nullable=True)
    ViTri = Column(Unicode(255), nullable=True)
    ThoiGianBatDau = Column(Date, nullable=True)
    ThoiGianKetThuc = Column(Date, nullable=True)
    MoTaCongViec = Column(Unicode(500), nullable=True)

    MaHoSoCV = Column(String(50), ForeignKey("HoSoCV.MaHoSoCV"), nullable=False)
    HoSoCV = relationship("HoSoCV", back_populates="KinhNghiem")


class ThongTinKyNang(Base):
    __tablename__ = "ThongTinKyNang"

    MaKyNang = Column(BigInteger, primary_key=True, index=True)
    TenKyNang = Column(Unicode(255), nullable=False)
    LoaiKyNang = Column(Unicode(100), nullable=True)
    TrinhDo = Column(Unicode(100), nullable=True)

    MaHoSoCV = Column(String(50), ForeignKey("HoSoCV.MaHoSoCV"), nullable=False)
    HoSoCV = relationship("HoSoCV", back_populates="KyNang")


class ThongTinDuAn(Base):
    __tablename__ = "ThongTinDuAn"
    MaDuAn = Column(BigInteger, primary_key=True, index=True)
    MaHoSoCV = Column(String(50), ForeignKey("HoSoCV.MaHoSoCV"), nullable=False)
    TenDuAn = Column(String(255), nullable=True)
    MoTa = Column(Text, nullable=True)
    CongNgheSuDung = Column(Text, nullable=True)

    HoSoCV = relationship("HoSoCV", back_populates="DuAn")
