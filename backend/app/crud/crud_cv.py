from sqlalchemy.orm import Session, joinedload, selectinload
import uuid
from datetime import datetime

# Import các model cần thiết
from app.models import cv as cv_model, recruitment as recruitment_model
from sqlalchemy import func, desc
from typing import List, Optional
from app.schemas import cv_schema


def get_applicant_by_email(db: Session, email: str):
    """Kiểm tra xem ứng viên đã tồn tại trong CSDL dựa trên email chưa."""
    return db.query(cv_model.UngVien).filter(cv_model.UngVien.Email == email).first()


def create_cv_and_applicant(
    db: Session,
    file_path: str,
    ho_ten: str,
    email: str,
    so_dien_thoai: Optional[str] = None,
):
    """
    Tạo bản ghi cho Ứng viên và Hồ sơ CV.
    - Nếu ứng viên chưa tồn tại, tạo mới.
    - Tạo một bản ghi HoSoCV mới liên kết với ứng viên đó.
    """
    db_applicant = get_applicant_by_email(db, email=email)

    if not db_applicant:
        # Nếu chưa có, tạo mới ứng viên
        db_applicant = cv_model.UngVien(
            MaUngVien=str(uuid.uuid4()),
            HoTen=ho_ten,
            Email=email,
            SoDienThoai=so_dien_thoai,
        )
        db.add(db_applicant)
    else:
        # Nếu đã có, cập nhật lại thông tin cho đầy đủ
        db_applicant.HoTen = ho_ten
        db_applicant.SoDienThoai = so_dien_thoai
        db.add(db_applicant)

    db.commit()
    db.refresh(db_applicant)

    # 2. Tạo bản ghi cho hồ sơ CV
    db_cv = cv_model.HoSoCV(
        MaHoSoCV=str(uuid.uuid4()),
        MaUngVien=db_applicant.MaUngVien,
        DuongDanFile=file_path,
        NgayTaiLen=datetime.utcnow(),
    )
    db.add(db_cv)
    db.commit()
    db.refresh(db_cv)

    return db_applicant, db_cv


def get_applicant_details_by_id(db: Session, applicant_id: str):
    applicant = (
        db.query(cv_model.UngVien)
        .options(
            selectinload(cv_model.UngVien.HoSoCVs)
            .selectinload(cv_model.HoSoCV.QuyTrinhUngTuyen)
            .selectinload(
                recruitment_model.QuyTrinhUngTuyen.LichSuHoatDong
            )  # <-- THÊM DÒNG NÀY
        )
        .filter(cv_model.UngVien.MaUngVien == applicant_id)
        .first()
    )
    return applicant


def save_extracted_info(db: Session, cv_id: str, structured_data: dict):
    """
    HÀM MỚI: Lưu các thông tin đã bóc tách (kỹ năng, kinh nghiệm) vào CSDL.
    """
    # 1. Lưu các kỹ năng vào bảng ThongTinKyNang
    skills = structured_data.get("skills")
    if skills and isinstance(skills, list):
        for skill_name in skills:
            db_skill = cv_model.ThongTinKyNang(MaHoSoCV=cv_id, TenKyNang=skill_name)
            db.add(db_skill)

    # 2. Lưu các kinh nghiệm vào bảng ThongTinKinhNghiem
    experience_list = structured_data.get("experience")
    if experience_list and isinstance(experience_list, list):
        for exp in experience_list:
            db_exp = cv_model.ThongTinKinhNghiem(
                MaHoSoCV=cv_id,
                TenCongTy=exp.get("company"),
                ViTri=exp.get("position"),
                # Tạm thời chưa lưu ngày tháng vì logic bóc tách chưa hoàn thiện
            )
            db.add(db_exp)

    # Commit tất cả các thay đổi về kỹ năng và kinh nghiệm
    db.commit()


def search_cvs_by_skills(db: Session, skills: List[str]):
    """
    Tìm kiếm các ứng viên sở hữu TẤT CẢ các kỹ năng được chỉ định.
    """
    if not skills:
        return []

    num_skills = len(skills)

    # Viết một truy vấn con để tìm các MaHoSoCV thỏa mãn điều kiện
    subquery = (
        db.query(cv_model.ThongTinKyNang.MaHoSoCV)
        .filter(cv_model.ThongTinKyNang.TenKyNang.in_(skills))
        .group_by(cv_model.ThongTinKyNang.MaHoSoCV)
        .having(func.count(cv_model.ThongTinKyNang.TenKyNang) == num_skills)
        .subquery()
    )

    # Từ các MaHoSoCV tìm được, truy vấn ra thông tin ứng viên đầy đủ
    # Chúng ta join các bảng UngVien, HoSoCV và subquery
    results = (
        db.query(cv_model.UngVien)
        .join(cv_model.HoSoCV, cv_model.UngVien.MaUngVien == cv_model.HoSoCV.MaUngVien)
        .join(subquery, cv_model.HoSoCV.MaHoSoCV == subquery.c.MaHoSoCV)
        .all()
    )

    return results


# app/crud/crud_cv.py
def get_applicants(
    db: Session,
    name: Optional[str] = None,
    skills: Optional[List[str]] = None,
    skip: int = 0,
    limit: int = 100,
):
    """
    Lấy danh sách ứng viên, tải trước tất cả dữ liệu lồng nhau cần thiết.
    """
    query = db.query(cv_model.UngVien).options(
        selectinload(cv_model.UngVien.HoSoCVs).selectinload(cv_model.HoSoCV.KyNang),
        selectinload(cv_model.UngVien.HoSoCVs).selectinload(cv_model.HoSoCV.KinhNghiem),
        selectinload(cv_model.UngVien.HoSoCVs).selectinload(cv_model.HoSoCV.HocVan),
        selectinload(cv_model.UngVien.HoSoCVs)
        .selectinload(cv_model.HoSoCV.QuyTrinhUngTuyen)
        .selectinload(recruitment_model.QuyTrinhUngTuyen.LichPhongVan),
        selectinload(cv_model.UngVien.HoSoCVs)
        .selectinload(cv_model.HoSoCV.QuyTrinhUngTuyen)
        .selectinload(recruitment_model.QuyTrinhUngTuyen.DeXuatTuyenDung),
    )

    if name:
        query = query.filter(cv_model.UngVien.HoTen.ilike(f"%{name}%"))

    if skills:
        num_skills = len(skills)
        subquery = (
            db.query(cv_model.ThongTinKyNang.MaHoSoCV)
            .filter(cv_model.ThongTinKyNang.TenKyNang.in_(skills))
            .group_by(cv_model.ThongTinKyNang.MaHoSoCV)
            .having(func.count(cv_model.ThongTinKyNang.TenKyNang) == num_skills)
            .subquery()
        )

        query = query.join(cv_model.HoSoCV).filter(
            cv_model.HoSoCV.MaHoSoCV.in_(subquery)
        )

    return (
        query.order_by(cv_model.UngVien.ThoiGianTao.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_applicant_details_by_id(db: Session, applicant_id: str):
    applicant = (
        db.query(cv_model.UngVien)
        .options(
            selectinload(cv_model.UngVien.HoSoCVs).selectinload(cv_model.HoSoCV.KyNang),
            selectinload(cv_model.UngVien.HoSoCVs).selectinload(
                cv_model.HoSoCV.KinhNghiem
            ),
            selectinload(cv_model.UngVien.HoSoCVs)
            .selectinload(cv_model.HoSoCV.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.LichPhongVan),
            selectinload(cv_model.UngVien.HoSoCVs)
            .selectinload(cv_model.HoSoCV.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.DeXuatTuyenDung),
        )
        .filter(cv_model.UngVien.MaUngVien == applicant_id)
        .first()
    )
    return applicant


def update_applicant(
    db: Session, applicant_id: str, applicant_update: cv_schema.UngVienUpdate
):
    """
    Cập nhật thông tin cơ bản của một ứng viên.
    """
    # Tìm ứng viên trong CSDL
    db_applicant = get_applicant_details_by_id(db, applicant_id=applicant_id)
    if not db_applicant:
        return None

    # Lấy dữ liệu từ schema, chỉ lấy những trường được người dùng gửi lên
    update_data = applicant_update.model_dump(exclude_unset=True)

    # Duyệt qua các trường và cập nhật
    for key, value in update_data.items():
        setattr(db_applicant, key, value)

    db.add(db_applicant)
    db.commit()
    db.refresh(db_applicant)
    return db_applicant
