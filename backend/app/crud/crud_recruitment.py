from sqlalchemy.orm import Session, selectinload
from app.models import recruitment as recruitment_model
from app.models import cv as cv_model, user as user_model
from app.schemas import recruitment_schema
from app.crud import crud_activity_log
import uuid
from datetime import datetime
import secrets
from fastapi_mail import FastMail, MessageSchema
from app.core.mail_config import conf


def get_job_position(db: Session, job_id: str):
    return (
        db.query(recruitment_model.ViTriTuyenDung)
        .filter(recruitment_model.ViTriTuyenDung.MaViTri == job_id)
        .first()
    )


def get_job_positions(db: Session, skip: int = 0, limit: int = 100):
    # Thêm .order_by() vào trước .offset()
    return (
        db.query(recruitment_model.ViTriTuyenDung)
        .order_by(recruitment_model.ViTriTuyenDung.MaViTri)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_job_position(
    db: Session, job_position: recruitment_schema.ViTriTuyenDungCreate
):
    db_job_position = recruitment_model.ViTriTuyenDung(**job_position.model_dump())
    db.add(db_job_position)
    db.commit()
    db.refresh(db_job_position)
    return db_job_position


def update_job_position(
    db: Session, job_id: str, job_update: recruitment_schema.ViTriTuyenDungUpdate
):
    db_job = get_job_position(db, job_id=job_id)
    if not db_job:
        return None
    update_data = job_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def delete_job_position(db: Session, job_id: str):
    db_job = get_job_position(db, job_id=job_id)
    if not db_job:
        return None
    db.delete(db_job)
    db.commit()
    return db_job


def get_application_by_id(db: Session, application_id: str):
    return (
        db.query(recruitment_model.QuyTrinhUngTuyen)
        .filter(recruitment_model.QuyTrinhUngTuyen.MaQuyTrinh == application_id)
        .first()
    )


def update_application_status(db: Session, application_id: str, status: str):
    """
    Cập nhật trạng thái của một quy trình ứng tuyển.
    """
    db_application = get_application_by_id(db, application_id=application_id)
    if not db_application:
        return None

    db_application.TrangThaiHienTai = status
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def create_application_process(
    db: Session, application_in: recruitment_schema.QuyTrinhUngTuyenCreate
):
    """
    Tạo một quy trình ứng tuyển mới bằng cách liên kết HoSoCV và ViTriTuyenDung.
    """
    # Kiểm tra xem ứng tuyển này đã tồn tại chưa để tránh lỗi UNIQUE constraint
    existing_application = (
        db.query(recruitment_model.QuyTrinhUngTuyen)
        .filter_by(MaHoSoCV=application_in.MaHoSoCV, MaViTri=application_in.MaViTri)
        .first()
    )
    if existing_application:
        return None  # Trả về None nếu đã tồn tại

    db_application = recruitment_model.QuyTrinhUngTuyen(
        MaQuyTrinh=str(uuid.uuid4()),
        MaHoSoCV=application_in.MaHoSoCV,
        MaViTri=application_in.MaViTri,
        TrangThaiHienTai="Mới",  # Gán trạng thái ban đầu
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def create_technical_review(
    db: Session,
    review_in: recruitment_schema.DanhGiaKyThuatCreate,
    current_user_id: str,
):
    """
    Tạo một bản đánh giá kỹ thuật mới và ghi lại lịch sử.
    """
    db_review = recruitment_model.DanhGiaKyThuat(**review_in.dict())
    db.add(db_review)

    db_application = get_application_by_id(db, application_id=review_in.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = f"Chờ đánh giá KT"
        db.add(db_application)

        # GHI LOG HÀNH ĐỘNG
        crud_activity_log.create_activity_log(
            db=db,
            ma_quy_trinh=review_in.MaQuyTrinh,
            ma_nguoi_thuc_hien=current_user_id,  # Giả định ID user được truyền vào
            hanh_dong=f"đã gửi đánh giá kỹ thuật với kết quả: {review_in.KetQua}.",
        )

    db.commit()
    db.refresh(db_review)
    return db_review


def create_technical_test(db: Session, test_in: recruitment_schema.BaiKiemTraCreate):
    """
    Tạo một bản ghi bài kiểm tra mới và cập nhật trạng thái của quy trình ứng tuyển.
    """
    # 1. Tạo bản ghi bài test mới
    db_test = recruitment_model.BaiKiemTra(**test_in.dict())
    db.add(db_test)

    # 2. Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=test_in.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = "Đã giao bài test"
        db.add(db_application)

    db.commit()
    db.refresh(db_test)
    return db_test


def update_technical_test_result(
    db: Session, test_id: int, test_update: recruitment_schema.BaiKiemTraUpdate
):
    """
    Cập nhật kết quả cho một bài test và cập nhật trạng thái quy trình ứng tuyển.
    """
    # 1. Tìm và cập nhật bản ghi bài test
    db_test = (
        db.query(recruitment_model.BaiKiemTra)
        .filter(recruitment_model.BaiKiemTra.MaBaiKiemTra == test_id)
        .first()
    )
    if not db_test:
        return None

    update_data = test_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_test, key, value)

    # 2. Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=db_test.MaQuyTrinh)
    if db_application and test_update.KetQua:
        if test_update.KetQua == "Dat":
            db_application.TrangThaiHienTai = "Đạt bài test - Chờ phỏng vấn"
        else:
            db_application.TrangThaiHienTai = "Không đạt bài test"
        db.add(db_application)

    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test


async def create_interview_schedule(
    db: Session,
    interview_in: recruitment_schema.LichPhongVanCreate,
    current_user_id: str,
):
    """
    Tạo một lịch phỏng vấn mới, tạo token, gửi email và ghi lại lịch sử.
    """
    # --- KIỂM TRA LOGIC NGHIỆP VỤ (giữ nguyên) ---
    if interview_in.ThoiGian <= datetime.utcnow():
        return "PAST_DATE_ERROR"

    db_application = get_application_by_id(db, application_id=interview_in.MaQuyTrinh)
    if not db_application:
        return "APP_NOT_FOUND"

    # --- XỬ LÝ CHÍNH ---
    confirmation_token = secrets.token_urlsafe(32)

    db_interview = recruitment_model.LichPhongVan(
        MaQuyTrinh=interview_in.MaQuyTrinh,
        VongPhongVan=interview_in.VongPhongVan,
        ThoiGian=interview_in.ThoiGian,
        HinhThuc=interview_in.HinhThuc,
        TokenXacNhan=confirmation_token,
        TrangThaiXacNhan="DaGui",
    )

    interviewers = (
        db.query(user_model.TaiKhoanNguoiDung)
        .filter(
            user_model.TaiKhoanNguoiDung.MaTaiKhoan.in_(interview_in.MaNguoiPhongVan)
        )
        .all()
    )
    db_interview.NguoiPhongVan.extend(interviewers)
    db.add(db_interview)

    db_application.TrangThaiHienTai = f"Chờ phỏng vấn: {interview_in.VongPhongVan}"
    db.add(db_application)

    crud_activity_log.create_activity_log(
        db=db,
        ma_quy_trinh=interview_in.MaQuyTrinh,
        ma_nguoi_thuc_hien=current_user_id,
        hanh_dong=f"đã lên lịch phỏng vấn ({interview_in.VongPhongVan}).",
    )

    applicant_email = db_application.HoSoCV.UngVien.Email
    applicant_name = db_application.HoSoCV.UngVien.HoTen
    interviewer_emails = [interviewer.Email for interviewer in interviewers]

    email_subject = (
        f"[TechBee] Thư mời phỏng vấn - {db_application.ViTriTuyenDung.TenViTri}"
    )
    email_html_body = f"""
        <p>Chào bạn,</p>
        <p>Công ty TechBee trân trọng mời ứng viên <strong>{applicant_name}</strong> tham gia buổi phỏng vấn cho vị trí <strong>{db_application.ViTriTuyenDung.TenViTri}</strong>.</p>
        <ul>
            <li><strong>Thời gian:</strong> {interview_in.ThoiGian.strftime('%H:%M ngày %d/%m/%Y')}</li>
            <li><strong>Hình thức:</strong> {interview_in.HinhThuc}</li>
        </ul>
    """

    fm = FastMail(conf)

    applicant_html = (
        email_html_body
        + f"""
        <p>Vui lòng xác nhận sự tham gia của bạn bằng cách nhấn vào đường link dưới đây:</p>
        <p><a href="http://localhost:8000/api/v1/interviews/confirm/{db_interview.TokenXacNhan}">Xác nhận tham dự</a></p>
        <p>Trân trọng.</p>
    """
    )
    message_applicant = MessageSchema(
        subject=email_subject,
        recipients=[applicant_email],
        body=applicant_html,
        subtype="html",
    )
    await fm.send_message(message_applicant)

    if interviewer_emails:
        interviewer_html = (
            email_html_body
            + "<p>Bạn đã được chỉ định tham gia buổi phỏng vấn này. Vui lòng sắp xếp thời gian. Trân trọng.</p>"
        )
        message_interviewers = MessageSchema(
            subject=f"[LỊCH PHỎNG VẤN] {applicant_name}",
            recipients=interviewer_emails,
            body=interviewer_html,
            subtype="html",
        )
        await fm.send_message(message_interviewers)

    db.commit()
    db.refresh(db_interview)
    return db_interview


def create_offer(
    db: Session,
    offer_in: recruitment_schema.DeXuatTuyenDungCreate,
    current_user_id: str,
):
    """
    Tạo một đề xuất tuyển dụng mới và ghi lại lịch sử.
    """
    db_offer = recruitment_model.DeXuatTuyenDung(**offer_in.dict())
    db.add(db_offer)

    db_application = get_application_by_id(db, application_id=offer_in.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = "Đã gửi Offer"
        db.add(db_application)

        # GHI LOG HÀNH ĐỘNG
        crud_activity_log.create_activity_log(
            db=db,
            ma_quy_trinh=offer_in.MaQuyTrinh,
            ma_nguoi_thuc_hien=current_user_id,
            hanh_dong=f"đã tạo đề xuất tuyển dụng với mức lương {offer_in.LuongDeXuat or 'N/A'}.",
        )

    db.commit()
    db.refresh(db_offer)
    return db_offer


def update_interview_result(
    db: Session,
    interview_id: int,
    interview_update: recruitment_schema.LichPhongVanUpdate,
):
    """
    Cập nhật kết quả cho một buổi phỏng vấn.
    """
    db_interview = (
        db.query(recruitment_model.LichPhongVan)
        .filter(recruitment_model.LichPhongVan.MaLichPV == interview_id)
        .first()
    )
    if not db_interview:
        return None

    update_data = interview_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interview, key, value)

    # Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=db_interview.MaQuyTrinh)
    if db_application and interview_update.KetQua:
        if interview_update.KetQua == "Dat":
            db_application.TrangThaiHienTai = (
                f"Đạt phỏng vấn ({db_interview.VongPhongVan})"
            )
        else:
            db_application.TrangThaiHienTai = (
                f"Không đạt phỏng vấn ({db_interview.VongPhongVan})"
            )
        db.add(db_application)

    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


def update_technical_review(
    db: Session, review_id: int, review_update: recruitment_schema.DanhGiaKyThuatUpdate
):
    """
    Cập nhật kết quả cho một bản đánh giá kỹ thuật.
    """
    db_review = (
        db.query(recruitment_model.DanhGiaKyThuat)
        .filter(recruitment_model.DanhGiaKyThuat.MaDanhGia == review_id)
        .first()
    )
    if not db_review:
        return None

    # Cập nhật các trường được cung cấp
    db_review.KetQua = review_update.KetQua
    db_review.NhanXet = review_update.NhanXet

    # Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=db_review.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = f"Đã có kết quả ĐGKT: {review_update.KetQua}"
        db.add(db_application)

    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_reviews_assigned_to_user(db: Session, user_id: str):
    """
    Lấy danh sách TẤT CẢ các đánh giá đã được giao cho một user,
    kèm theo thông tin ứng viên.
    """
    # Join các bảng để lấy thông tin cần thiết
    reviews = (
        db.query(
            recruitment_model.DanhGiaKyThuat.MaDanhGia,
            recruitment_model.QuyTrinhUngTuyen.MaQuyTrinh,
            recruitment_model.QuyTrinhUngTuyen.TrangThaiHienTai,
            cv_model.UngVien,
        )
        .join(
            recruitment_model.QuyTrinhUngTuyen,
            recruitment_model.DanhGiaKyThuat.MaQuyTrinh
            == recruitment_model.QuyTrinhUngTuyen.MaQuyTrinh,
        )
        .join(
            cv_model.HoSoCV,
            recruitment_model.QuyTrinhUngTuyen.MaHoSoCV == cv_model.HoSoCV.MaHoSoCV,
        )
        .join(cv_model.UngVien, cv_model.HoSoCV.MaUngVien == cv_model.UngVien.MaUngVien)
        .filter(recruitment_model.DanhGiaKyThuat.MaNguoiDanhGia == user_id)
        .order_by(recruitment_model.DanhGiaKyThuat.NgayDanhGia.desc())
        .all()
    )

    # Chuyển đổi kết quả thành dạng schema
    response = []
    for row in reviews:
        response.append(
            {
                "MaDanhGia": row.MaDanhGia,
                "MaQuyTrinh": row.MaQuyTrinh,
                "TrangThaiHienTai": row.TrangThaiHienTai,
                "UngVien": row.UngVien,
            }
        )
    return response


def get_review_details(db: Session, review_id: int):
    """Lấy thông tin chi tiết cho một lần review, bao gồm cả thông tin bóc tách."""
    review = (
        db.query(recruitment_model.DanhGiaKyThuat)
        .options(
            selectinload(recruitment_model.DanhGiaKyThuat.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.HoSoCV)
            .selectinload(cv_model.HoSoCV.UngVien),
            # Tải thêm các thông tin bóc tách
            selectinload(recruitment_model.DanhGiaKyThuat.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.HoSoCV)
            .selectinload(cv_model.HoSoCV.KyNang),
            selectinload(recruitment_model.DanhGiaKyThuat.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.HoSoCV)
            .selectinload(cv_model.HoSoCV.KinhNghiem),
            selectinload(recruitment_model.DanhGiaKyThuat.QuyTrinhUngTuyen)
            .selectinload(recruitment_model.QuyTrinhUngTuyen.HoSoCV)
            .selectinload(cv_model.HoSoCV.DuAn),
        )
        .filter(recruitment_model.DanhGiaKyThuat.MaDanhGia == review_id)
        .first()
    )

    if not review:
        return None

    # Trả về đối tượng SQLAlchemy, để orm_mode của Pydantic tự xử lý
    return {
        "MaDanhGia": review.MaDanhGia,
        "UngVien": review.QuyTrinhUngTuyen.HoSoCV.UngVien,
        "HoSoCV": review.QuyTrinhUngTuyen.HoSoCV,
        "KetQua": review.KetQua,
        "NhanXet": review.NhanXet,
    }


def update_offer_response(
    db: Session,
    offer_id: int,
    offer_update: recruitment_schema.DeXuatTuyenDungUpdate,
    current_user_id: str,
):
    db_offer = (
        db.query(recruitment_model.DeXuatTuyenDung)
        .filter(recruitment_model.DeXuatTuyenDung.MaOffer == offer_id)
        .first()
    )
    if not db_offer:
        return None

    # Cập nhật thông tin phản hồi
    db_offer.PhanHoiUngVien = offer_update.PhanHoiUngVien
    db_offer.NgayPhanHoi = offer_update.NgayPhanHoi
    db.add(db_offer)

    # Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=db_offer.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = (
            f"Ứng viên {offer_update.PhanHoiUngVien} Offer"
        )
        db.add(db_application)

        # Ghi lại lịch sử
        crud_activity_log.create_activity_log(
            db=db,
            ma_quy_trinh=db_offer.MaQuyTrinh,
            ma_nguoi_thuc_hien=current_user_id,
            hanh_dong=f"đã cập nhật phản hồi offer là: {offer_update.PhanHoiUngVien}.",
        )

    db.commit()
    db.refresh(db_offer)
    return db_offer


def get_priority_applications(db: Session, limit: int = 5):
    """
    Lấy danh sách các quy trình ứng tuyển cần chú ý (ví dụ: đang chờ review).
    """
    # Lấy các quy trình đang ở trạng thái 'Chờ đánh giá KT'
    # và join để lấy thông tin ứng viên, vị trí tuyển dụng
    priority_apps = (
        db.query(recruitment_model.QuyTrinhUngTuyen)
        .options(
            selectinload(recruitment_model.QuyTrinhUngTuyen.HoSoCV).selectinload(
                cv_model.HoSoCV.UngVien
            ),
            selectinload(
                recruitment_model.QuyTrinhUngTuyen.ViTriTuyenDung
            ),  # Tải thông tin vị trí
        )
        .filter(
            recruitment_model.QuyTrinhUngTuyen.TrangThaiHienTai.like(
                "%Chờ%"
            )  # Lấy các trạng thái "Chờ..."
        )
        .order_by(
            recruitment_model.QuyTrinhUngTuyen.NgayUngTuyen.asc()  # Ưu tiên người cũ nhất
        )
        .limit(limit)
        .all()
    )

    return priority_apps


def confirm_interview_by_token(db: Session, token: str):
    """
    Tìm lịch phỏng vấn bằng token và cập nhật trạng thái xác nhận.
    """
    # Tìm bản ghi LichPhongVan có token khớp
    db_interview = (
        db.query(recruitment_model.LichPhongVan)
        .filter(recruitment_model.LichPhongVan.TokenXacNhan == token)
        .first()
    )

    if not db_interview:
        return None  # Không tìm thấy token

    # Cập nhật trạng thái và xóa token để không thể dùng lại
    db_interview.TrangThaiXacNhan = "DaXacNhan"
    db_interview.TokenXacNhan = None  # Vô hiệu hóa token sau khi đã dùng
    db.add(db_interview)

    # Cập nhật trạng thái của quy trình ứng tuyển chính
    db_application = get_application_by_id(db, application_id=db_interview.MaQuyTrinh)
    if db_application:
        db_application.TrangThaiHienTai = (
            f"Ứng viên đã xác nhận PV: {db_interview.VongPhongVan}"
        )
        db.add(db_application)
        # (Không cần ghi log ở đây vì đây là hành động của ứng viên)

    db.commit()
    db.refresh(db_interview)
    return db_interview
