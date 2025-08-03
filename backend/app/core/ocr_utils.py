# app/core/ocr_utils.py
import cv2
import numpy as np


def preprocess_image_for_ocr(image_path: str):
    """
    Tiền xử lý ảnh chuyên sâu: Chuyển sang ảnh trắng đen và xóa các dòng kẻ.
    """
    img = cv2.imread(image_path)

    # 1. Chuyển sang ảnh xám
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Áp dụng ngưỡng nhị phân (Otsu's method) để làm nổi bật chữ và các đường kẻ
    # THRESH_BINARY_INV tạo ra ảnh nền đen, chữ trắng để dễ xử lý hình thái học
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # 3. Phát hiện và xóa các đường kẻ ngang
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    detected_lines = cv2.morphologyEx(
        thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2
    )

    contours = cv2.findContours(
        detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    contours = contours[0] if len(contours) == 2 else contours[1]
    for c in contours:
        cv2.drawContours(thresh, [c], -1, (0, 0, 0), 2)

    # 4. Sửa chữa lại các ký tự có thể đã bị hỏng bởi việc xóa dòng
    # Kernel này giúp nối lại các phần của ký tự đã bị đường kẻ cắt qua
    repair_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 6))
    result = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, repair_kernel, iterations=1)

    # 5. Lật ngược lại màu (chữ đen, nền trắng) để Tesseract đọc tốt nhất
    final_image = cv2.bitwise_not(result)

    return final_image
