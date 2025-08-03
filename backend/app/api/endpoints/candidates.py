from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas import cv_schema
from app.crud import crud_cv

router = APIRouter()


def build_full_applicant_dict(applicant):
    """Hàm tiện ích để xây dựng dictionary chi tiết cho một ứng viên."""
    list_hoso = []
    for hoso in applicant.HoSoCVs:
        list_quytrinh = []
        for qt in hoso.QuyTrinhUngTuyen:
            list_phongvan = [
                {
                    "MaLichPV": pv.MaLichPV,
                    "MaQuyTrinh": pv.MaQuyTrinh,
                    "VongPhongVan": pv.VongPhongVan,
                    "ThoiGian": pv.ThoiGian,
                    "HinhThuc": pv.HinhThuc,
                    "NguoiPhongVan": pv.NguoiPhongVan,
                    "KetQua": pv.KetQua,
                    "GhiChuCuaNguoiPhongVan": pv.GhiChuCuaNguoiPhongVan,
                }
                for pv in qt.LichPhongVan
            ]
            list_lichsu = [
                {
                    "MaHoatDong": ls.MaHoatDong,
                    "MaQuyTrinh": ls.MaQuyTrinh,
                    "MaNguoiThucHien": ls.MaNguoiThucHien,
                    "HanhDong": ls.HanhDong,
                    "ThoiGian": ls.ThoiGian,
                }
                for ls in qt.LichSuHoatDong
            ]

            # --- THÊM LOGIC CHUYỂN ĐỔI CHO OFFER ---
            list_offers = [
                {
                    "MaOffer": offer.MaOffer,
                    "MaQuyTrinh": offer.MaQuyTrinh,
                    "NgayGuiOffer": offer.NgayGuiOffer,
                    "LuongDeXuat": offer.LuongDeXuat,
                    "NgayBatDauDuKien": offer.NgayBatDauDuKien,
                    "PhanHoiUngVien": offer.PhanHoiUngVien,
                    "NgayPhanHoi": offer.NgayPhanHoi,
                }
                for offer in qt.DeXuatTuyenDung
            ]
            # ----------------------------------------

            list_quytrinh.append(
                {
                    "MaQuyTrinh": qt.MaQuyTrinh,
                    "MaHoSoCV": qt.MaHoSoCV,
                    "MaViTri": qt.MaViTri,
                    "NgayUngTuyen": qt.NgayUngTuyen,
                    "TrangThaiHienTai": qt.TrangThaiHienTai,
                    "LichPhongVan": list_phongvan,
                    "LichSuHoatDong": list_lichsu,
                    "DeXuatTuyenDung": list_offers,  # <-- Thêm vào response
                }
            )

        hoso_dict = {
            "MaHoSoCV": hoso.MaHoSoCV,
            "MaUngVien": hoso.MaUngVien,
            "DuongDanFile": hoso.DuongDanFile,
            "NgayTaiLen": hoso.NgayTaiLen,
            "TrangThaiXuLyOCR": hoso.TrangThaiXuLyOCR,
            # Chuyển đổi đầy đủ cho KyNang, KinhNghiem, HocVan
            "KyNang": [
                {
                    "MaKyNang": kn.MaKyNang,
                    "MaHoSoCV": kn.MaHoSoCV,
                    "TenKyNang": kn.TenKyNang,
                    "LoaiKyNang": kn.LoaiKyNang,
                    "TrinhDo": kn.TrinhDo,
                }
                for kn in hoso.KyNang
            ],
            "KinhNghiem": [
                {
                    "MaKinhNghiem": knex.MaKinhNghiem,
                    "MaHoSoCV": knex.MaHoSoCV,
                    "TenCongTy": knex.TenCongTy,
                    "ViTri": knex.ViTri,
                    "ThoiGianBatDau": knex.ThoiGianBatDau,
                    "ThoiGianKetThuc": knex.ThoiGianKetThuc,
                    "MoTaCongViec": knex.MoTaCongViec,
                }
                for knex in hoso.KinhNghiem
            ],
            "HocVan": [
                {
                    "MaHocVan": hv.MaHocVan,
                    "MaHoSoCV": hv.MaHoSoCV,
                    "TenTruong": hv.TenTruong,
                    "ChuyenNganh": hv.ChuyenNganh,
                    "BangCap": hv.BangCap,
                    "NamTotNghiep": hv.NamTotNghiep,
                }
                for hv in hoso.HocVan
            ],
            "QuyTrinhUngTuyen": list_quytrinh,
        }
        list_hoso.append(hoso_dict)

    return {
        "MaUngVien": applicant.MaUngVien,
        "HoTen": applicant.HoTen,
        "Email": applicant.Email,
        "SoDienThoai": applicant.SoDienThoai,
        "DiaChi": applicant.DiaChi,
        "NgaySinh": applicant.NgaySinh,
        "ThoiGianTao": applicant.ThoiGianTao,
        "HoSoCVs": list_hoso,
    }


# app/api/endpoints/candidates.py
@router.get("/", response_model=List[cv_schema.UngVien])
def read_candidates(
    name: Optional[str] = Query(None, description="Tìm kiếm ứng viên theo tên"),
    skills: Optional[List[str]] = Query(None, description="Lọc ứng viên theo kỹ năng"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    db_applicants = crud_cv.get_applicants(
        db, name=name, skills=skills, skip=skip, limit=limit
    )
    # Xây dựng lại response cho từng ứng viên trong danh sách
    return [build_full_applicant_dict(app) for app in db_applicants]


@router.get("/{applicant_id}", response_model=cv_schema.UngVien)
def read_candidate_details(applicant_id: str, db: Session = Depends(get_db)):
    db_applicant = crud_cv.get_applicant_details_by_id(db, applicant_id=applicant_id)
    if db_applicant is None:
        raise HTTPException(status_code=404, detail="Applicant not found")
    # Sử dụng hàm tiện ích để xây dựng response chi tiết
    return build_full_applicant_dict(db_applicant)


@router.patch("/{applicant_id}", response_model=cv_schema.UngVien)
def update_candidate_info(
    applicant_id: str,
    applicant_update: cv_schema.UngVienUpdate,
    db: Session = Depends(get_db),
):
    updated_applicant = crud_cv.update_applicant(
        db=db, applicant_id=applicant_id, applicant_update=applicant_update
    )
    if updated_applicant is None:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return updated_applicant
