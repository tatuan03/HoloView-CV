# HoloView-CV

**HoloView-CV** là một hệ thống quản lý hồ sơ ứng viên thông minh, được thiết kế để tự động trích xuất, xử lý và lưu trữ thông tin từ CV bằng công nghệ OCR. Dự án kết hợp frontend hiện đại với backend mạnh mẽ, phù hợp cho các công ty tuyển dụng hoặc nền tảng việc làm.

---

## 📌 Mục tiêu dự án

- Tăng tốc quá trình lọc hồ sơ ứng viên.
- Hạn chế thao tác thủ công khi nhập dữ liệu từ CV.
- Hỗ trợ tìm kiếm, phân loại và hiển thị hồ sơ một cách trực quan.
- Ứng dụng công nghệ OCR để đọc thông tin từ ảnh hoặc file PDF.

---

## ⚙️ Công nghệ sử dụng

### 🔹 Frontend (`fe/`)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/) *(nếu có)*

### 🔹 Backend (`be/`)
- [FastAPI](https://fastapi.tiangolo.com/) hoặc [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/) / [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MySQL](https://www.mysql.com/) (quản lý cơ sở dữ liệu)
- [VietOCR](https://github.com/nguyenvulebinh/vietocr) hoặc [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)

---

## 🏗️ Cấu trúc dự án

HoloView-CV/
├── fe/ # Frontend source code
├── be/ # Backend source code
└── README.md # Tài liệu mô tả dự án

yaml
Sao chép
Chỉnh sửa

---

## 🚀 Hướng dẫn chạy dự án

### 1. Backend

```bash
cd be
# Nếu dùng FastAPI
uvicorn main:app --reload

# Nếu dùng Node.js
npm install
npm run dev
2. Frontend
bash
Sao chép
Chỉnh sửa
cd fe
npm install
npm run dev
💡 Tính năng chính
📁 Upload CV dưới dạng ảnh hoặc PDF

🧠 Tự động trích xuất thông tin (họ tên, email, kỹ năng, kinh nghiệm, v.v.)

📊 Giao diện quản lý ứng viên đơn giản, trực quan

🔍 Tìm kiếm, lọc và phân loại hồ sơ

💾 Lưu thông tin vào cơ sở dữ liệu MySQL

📈 Hỗ trợ mở rộng cho thống kê tuyển dụng hoặc AI phân tích ứng viên

📷 Giao diện mẫu (nếu có thể thêm ảnh)
Bạn có thể thêm ảnh màn hình bằng cách drag & drop vào đây hoặc dùng Markdown:

markdown
Sao chép
Chỉnh sửa
![Dashboard](./screenshots/dashboard.png)
📜 Giấy phép
Dự án mang tính học thuật / cá nhân, không sử dụng cho mục đích thương mại trừ khi được cho phép.

👨‍💻 Tác giả
Trịnh Anh Tuấn — GitHub: tatuan03

Feel free to fork, contribute, or reach out if you're interested in this project.

yaml
Sao chép
Chỉnh sửa

---

## 📥 Bước tiếp theo:
- Tạo file `README.md` → dán nội dung trên.
- Rồi chạy:

```bash
git add README.md
git commit -m "Add professional README"
git push origin main
