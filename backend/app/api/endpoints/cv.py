# app/api/endpoints/cv.py
import shutil
import uuid
from pathlib import Path
from typing import List
import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from PIL import Image

# Import các thư viện cần thiết
import google.generativeai as genai
import os
from dotenv import load_dotenv
import pytesseract

# Import các thành phần của dự án
from app.db.database import get_db
from app.crud import crud_cv
from app.core.text_extractor import extract_all_info

# --- Cấu hình ---
load_dotenv()
router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Cấu hình Tesseract
pytesseract.pytesseract.tesseract_cmd = r"D:\\Tesseract-OCR\\tesseract.exe"

# Cấu hình Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# --- Các hàm xử lý lõi OCR ---


def process_cv_with_tesseract(image_paths: List[Path]) -> tuple[str, dict]:
    """
    SỬA LẠI: Dùng Tesseract để xử lý một danh sách file ảnh.
    """
    print(f"Processing {len(image_paths)} images with Tesseract...")

    # Lặp qua từng file ảnh, OCR và ghép nối kết quả
    full_extracted_text = []
    for image_path in image_paths:
        try:
            image = Image.open(image_path)
            # PSM 3 là chế độ tự động mạnh mẽ nhất cho CV đa dạng
            custom_config = r"--oem 3 --psm 3"
            text_per_page = pytesseract.image_to_string(
                image, lang="vie+eng", config=custom_config
            )
            full_extracted_text.append(text_per_page)
        except Exception as e:
            print(f"Lỗi khi xử lý file {image_path} bằng Tesseract: {e}")
            continue  # Bỏ qua file bị lỗi và tiếp tục

    # Ghép nối văn bản từ tất cả các trang bằng một dấu ngắt trang
    extracted_text = "\n--- Trang mới ---\n".join(full_extracted_text)

    # Dùng lại bộ bóc tách thông tin của chúng ta cho toàn bộ văn bản
    structured_data = extract_all_info(extracted_text)
    return extracted_text, structured_data


def process_cv_with_gemini(image_paths: List[Path]) -> tuple[str, dict]:
    """Sử dụng Gemini để OCR và bóc tách thông tin."""
    if not GEMINI_API_KEY:
        raise ValueError("Lỗi cấu hình: Gemini API Key chưa được thiết lập.")

    print(f"Processing {len(image_paths)} images with Gemini Pro Vision...")
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = """
        Hãy hành động như một công cụ trích xuất dữ liệu thông minh và chính xác.
        Phân tích kỹ lưỡng tất cả các trang của Sơ yếu lý lịch (CV) được cung cấp trong các ảnh.
        ĐẦU RA DUY NHẤT của bạn phải là một đối tượng JSON thô, không chứa bất kỳ văn bản giới thiệu, giải thích hay định dạng markdown (```json) nào.

        Đọc kỹ và tổng hợp thông tin từ TẤT CẢ các ảnh để trích xuất:
        1.  `name`: Họ và tên đầy đủ của ứng viên (string).
        2.  `email`: Địa chỉ email chính (string).
        3.  `phone`: Số điện thoại liên lạc (string).
        4.  `address`: Địa chỉ liên hệ (string).
        5.  `objective`: Đoạn văn bản mô tả mục tiêu nghề nghiệp hoặc giới thiệu bản thân (string).
        6.  `education`: Một mảng (array) chứa các quá trình học vấn. Mỗi phần tử là một object có các key: `school` (tên trường), `major` (chuyên ngành), `study_time` (thời gian học, ví dụ: "2021 - 2025"), và `gpa` (điểm trung bình, nếu có).
        7.  `experience`: Một mảng (array) chứa danh sách kinh nghiệm làm việc. Mỗi phần tử là một object có các key: `company` (tên công ty), `position` (vị trí), `dates` (thời gian làm việc), và `overview` (mô tả ngắn về công việc).
        8.  `skills`: Một mảng (array) chứa danh sách tất cả các kỹ năng được liệt kê (ví dụ: ["Python", "React", "SQL", "Kỹ năng giao tiếp"]).
        9.  `projects`: Một mảng (array) các dự án đã làm. Mỗi dự án là một object có các key: `name` (tên dự án), `description` (mô tả dự án), và `technologies` (các công nghệ đã sử dụng).

        Nếu không tìm thấy thông tin cho một trường nào đó, hãy để giá trị của nó là null.
        Kết quả cuối cùng phải là một chuỗi JSON hợp lệ.
    """

    prompt_parts = [prompt]
    for path in image_paths:
        prompt_parts.append(Image.open(path))

    response = model.generate_content(prompt_parts)
    clean_json_string = response.text.strip().replace("```json", "").replace("```", "")
    structured_data = json.loads(clean_json_string)

    # Tạo văn bản tóm tắt từ dữ liệu có cấu trúc
    text_parts = []
    if structured_data.get("name"):
        text_parts.append(f"Họ và tên: {structured_data.get('name')}")
    if structured_data.get("email"):
        text_parts.append(f"Email: {structured_data.get('email')}")
    if structured_data.get("phone"):
        text_parts.append(f"SĐT: {structured_data.get('phone')}")
    if structured_data.get("skills"):
        text_parts.append("Kỹ năng: " + ", ".join(structured_data.get("skills", [])))
    extracted_text = "\n".join(text_parts)

    return extracted_text, structured_data


# --- API Endpoint chính ---


@router.post("/upload", status_code=201)
def upload_cv(
    files: List[UploadFile] = File(...),
    is_handwritten: bool = Form(False),
    email: str = Form(None),
    ho_ten: str = Form(None),
    db: Session = Depends(get_db),
):

    saved_paths = []
    # === BƯỚC XỬ LÝ FILE NÂNG CẤP ===
    for file in files:
        temp_save_path = UPLOAD_DIR / f"temp_{uuid.uuid4()}{Path(file.filename).suffix}"

        # 1. Lưu file tạm thời
        with open(temp_save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Mở bằng Pillow và chuyển đổi sang định dạng JPEG chuẩn
        try:
            with Image.open(temp_save_path) as img:
                # Tạo một tên file mới với đuôi .jpeg
                final_save_path = UPLOAD_DIR / f"{uuid.uuid4()}.jpeg"
                # Chuyển sang chế độ RGB (quan trọng) và lưu lại dưới dạng JPEG
                img.convert("RGB").save(final_save_path, "jpeg")
                saved_paths.append(final_save_path)
        except Exception as e:
            # Nếu Pillow không thể mở file, đó mới thực sự là file không hợp lệ
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' không phải là một định dạng ảnh hợp lệ hoặc đã bị lỗi. Chi tiết: {e}",
            )
        finally:
            # Xóa file tạm
            os.remove(temp_save_path)

    # Từ đây, tất cả các file trong `saved_paths` đều là file JPEG sạch
    try:
        if is_handwritten:
            extracted_text, structured_data = process_cv_with_gemini(saved_paths)
            message = "Xử lý CV viết tay thành công bằng Gemini!"
        else:
            extracted_text, structured_data = process_cv_with_tesseract(saved_paths)
            message = "Xử lý CV chữ in thành công bằng Tesseract!"

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý CV: {e}")

    # ... (phần lưu CSDL và trả về response giữ nguyên) ...
    file_paths_str = ", ".join(str(p) for p in saved_paths)
    final_ho_ten = ho_ten or structured_data.get("name")
    final_email = email or structured_data.get("email")
    final_phone = structured_data.get("phone")
    try:
        applicant, cv_record = crud_cv.create_cv_and_applicant(
            db=db,
            file_path=file_paths_str,
            ho_ten=final_ho_ten,
            email=final_email,
            so_dien_thoai=final_phone,
        )
        if structured_data:
            crud_cv.save_extracted_info(
                db=db, cv_id=cv_record.MaHoSoCV, structured_data=structured_data
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {e}")

    return {
        "message": message,
        "applicant_id": applicant.MaUngVien,
        "cv_id": cv_record.MaHoSoCV,
        "file_path": file_paths_str,
        "extracted_text": extracted_text,
        "structured_data": structured_data,
    }
