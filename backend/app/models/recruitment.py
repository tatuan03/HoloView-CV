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
    DECIMAL,
    Unicode,
    Table,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .department import PhongBan
from app.db.database import Base

phongvan_nguoiphongvan_association = Table(
    "PhongVan_NguoiPhongVan",
    Base.metadata,
    Column(
        "MaLichPV", BigInteger, ForeignKey("LichPhongVan.MaLichPV"), primary_key=True
    ),
    Column(
        "MaTaiKhoan",
        String(50),
        ForeignKey("TaiKhoanNguoiDung.MaTaiKhoan"),
        primary_key=True,
    ),
)


class ViTriTuyenDung(Base):
    __tablename__ = "ViTriTuyenDung"
    MaViTri = Column(String(50), primary_key=True, index=True)
    TenViTri = Column(Unicode(255), nullable=False)
    MaPhongBan = Column(String(50), ForeignKey("PhongBan.MaPhongBan"), nullable=False)
    MoTa = Column(Unicode(500), nullable=True)
    YeuCau = Column(Unicode, nullable=True)
    SoLuong = Column(Integer, nullable=False, default=1)
    NgayDang = Column(Date, nullable=False)
    NgayHetHan = Column(Date, nullable=True)
    TrangThai = Column(
        Enum("DangTuyen", "TamDung", "DaDong", name="trangthai_vitri_enum"),
        nullable=False,
        default="DangTuyen",
    )
    PhongBan = relationship("PhongBan", back_populates="ViTriTuyenDung")
    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="ViTriTuyenDung")


class QuyTrinhUngTuyen(Base):
    __tablename__ = "QuyTrinhUngTuyen"
    MaQuyTrinh = Column(String(50), primary_key=True, index=True)
    MaHoSoCV = Column(String(50), ForeignKey("HoSoCV.MaHoSoCV"), nullable=False)
    MaViTri = Column(String(50), ForeignKey("ViTriTuyenDung.MaViTri"), nullable=False)
    NgayUngTuyen = Column(DateTime, nullable=False, default=datetime.utcnow)
    TrangThaiHienTai = Column(Unicode(100), nullable=False)
    HoSoCV = relationship("HoSoCV", back_populates="QuyTrinhUngTuyen")

    DanhGiaKyThuat = relationship(
        "DanhGiaKyThuat",
        back_populates="QuyTrinhUngTuyen",
        cascade="all, delete-orphan",
    )
    BaiKiemTra = relationship(
        "BaiKiemTra", back_populates="QuyTrinhUngTuyen", cascade="all, delete-orphan"
    )
    LichPhongVan = relationship(
        "LichPhongVan", back_populates="QuyTrinhUngTuyen", cascade="all, delete-orphan"
    )
    DeXuatTuyenDung = relationship(
        "DeXuatTuyenDung",
        back_populates="QuyTrinhUngTuyen",
        cascade="all, delete-orphan",
    )
    LichSuHoatDong = relationship(
        "LichSuHoatDong",
        back_populates="QuyTrinhUngTuyen",
        cascade="all, delete-orphan",
    )
    GhiChu = relationship(
        "GhiChu", back_populates="QuyTrinhUngTuyen", cascade="all, delete-orphan"
    )
    ViTriTuyenDung = relationship(
        "ViTriTuyenDung",
        back_populates="QuyTrinhUngTuyen",
    )


class DanhGiaKyThuat(Base):
    __tablename__ = "DanhGiaKyThuat"

    MaDanhGia = Column(BigInteger, primary_key=True, index=True)
    NgayDanhGia = Column(DateTime, nullable=False, default=datetime.utcnow)
    KetQua = Column(
        Enum("Dat", "KhongDat", "CanXemXetThem", name="ketqua_danhgia_enum"),
        nullable=False,
    )
    NhanXet = Column(Unicode(500), nullable=True)

    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )
    MaNguoiDanhGia = Column(
        String(50), ForeignKey("TaiKhoanNguoiDung.MaTaiKhoan"), nullable=False
    )
    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="DanhGiaKyThuat")


class BaiKiemTra(Base):
    __tablename__ = "BaiKiemTra"

    MaBaiKiemTra = Column(BigInteger, primary_key=True, index=True)
    TenBaiKiemTra = Column(String(255), nullable=True)
    NgayGiao = Column(DateTime, nullable=True)
    HanNop = Column(DateTime, nullable=True)
    DiemSo = Column(Float, nullable=True)
    KetQua = Column(Enum("Dat", "KhongDat", name="ketqua_test_enum"), nullable=True)
    DuongDanBaiLam = Column(String(500), nullable=True)

    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )
    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="BaiKiemTra")


class LichPhongVan(Base):
    __tablename__ = "LichPhongVan"

    MaLichPV = Column(BigInteger, primary_key=True, index=True)
    VongPhongVan = Column(Unicode(100), nullable=False)
    ThoiGian = Column(DateTime, nullable=False)
    HinhThuc = Column(String(100), nullable=False)
    KetQua = Column(
        Enum("Dat", "KhongDat", "Cho", name="ketqua_phongvan_enum"),
        nullable=True,
        default="Cho",
    )
    GhiChuCuaNguoiPhongVan = Column(Unicode(500), nullable=True)
    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="LichPhongVan")

    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )

    TrangThaiXacNhan = Column(String(50), nullable=False, default="ChuaGui")
    TokenXacNhan = Column(String(255), unique=True, nullable=True)
    NguoiPhongVan = relationship(
        "TaiKhoanNguoiDung",
        secondary=phongvan_nguoiphongvan_association,
        back_populates="CacBuoiPhongVan",
    )


class DeXuatTuyenDung(Base):
    __tablename__ = "DeXuatTuyenDung"

    MaOffer = Column(BigInteger, primary_key=True, index=True)
    NgayGuiOffer = Column(Date, nullable=False)
    LuongDeXuat = Column(DECIMAL(15, 2), nullable=True)
    NgayBatDauDuKien = Column(Date, nullable=True)
    PhanHoiUngVien = Column(
        Enum(
            "ChuaPhanHoi",
            "ChapNhan",
            "TuChoi",
            "ThuongLuong",
            name="phanhoi_offer_enum",
        ),
        nullable=False,
        default="ChuaPhanHoi",
    )
    NgayPhanHoi = Column(Date, nullable=True)
    QuyTrinhUngTuyen = relationship(
        "QuyTrinhUngTuyen", back_populates="DeXuatTuyenDung"
    )

    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )


class GhiChu(Base):
    __tablename__ = "GhiChu"
    MaGhiChu = Column(BigInteger, primary_key=True, index=True)
    MaQuyTrinh = Column(
        String(50), ForeignKey("QuyTrinhUngTuyen.MaQuyTrinh"), nullable=False
    )
    MaNguoiTao = Column(
        String(50), ForeignKey("TaiKhoanNguoiDung.MaTaiKhoan"), nullable=False
    )
    NoiDung = Column(Text, nullable=False)
    ThoiGianTao = Column(DateTime, nullable=False, default=datetime.utcnow)

    QuyTrinhUngTuyen = relationship("QuyTrinhUngTuyen", back_populates="GhiChu")
    NguoiTao = relationship("TaiKhoanNguoiDung")
