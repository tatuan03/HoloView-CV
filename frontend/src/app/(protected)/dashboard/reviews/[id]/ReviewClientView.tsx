// src/app/(protected)/dashboard/reviews/[id]/ReviewClientView.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

// --- Định nghĩa các kiểu dữ liệu ---
interface Skill { TenKyNang: string; }
interface Experience { TenCongTy: string | null; ViTri: string | null; }
interface Project { TenDuAn: string | null; MoTa: string | null; CongNgheSuDung: string | null; }
interface ReviewDetails {
  MaDanhGia: number;
  UngVien: { HoTen: string; };
  HoSoCV: {
    DuongDanFile: string;
    KyNang: Skill[];
    KinhNghiem: Experience[];
    DuAn: Project[];
  };
  KetQua: string;
  NhanXet: string | null;
}

export default function ReviewClientView({ initialDetails }: { initialDetails: ReviewDetails }) {
  // State cho chế độ xem/sửa
  const [isEditing, setIsEditing] = useState(initialDetails.KetQua === 'CanXemXetThem');

  // State cho form, được khởi tạo với dữ liệu đã có
  const [ketQua, setKetQua] = useState(initialDetails.KetQua);
  const [nhanXet, setNhanXet] = useState(initialDetails.NhanXet || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // State cho slideshow CV
  const [currentPage, setCurrentPage] = useState(0);
  const cvPaths = initialDetails.HoSoCV ? initialDetails.HoSoCV.DuongDanFile.split(', ').map(path => path.trim()) : [];
  const totalPages = cvPaths.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmitReview = async () => {
    if (!ketQua || ketQua === 'CanXemXetThem') {
      alert("Vui lòng chọn kết quả 'Đạt' hoặc 'Không Đạt'.");
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    const token = Cookies.get('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/v1/technical-reviews/${initialDetails.MaDanhGia}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ KetQua: ketQua, NhanXet: nhanXet })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Gửi đánh giá thất bại");
      }
      setMessage("Cập nhật đánh giá thành công!");
      alert("Cập nhật đánh giá thành công!");
      setIsEditing(false); // Chuyển về chế độ xem sau khi thành công
    } catch (error: any) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 min-h-screen bg-gray-50">
      {/* Cột CV */}
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md flex flex-col">
        <div className="mb-4">
            <Link href="/dashboard/my-reviews" className="text-sm text-indigo-600 hover:underline">&larr; Quay lại danh sách</Link>
            <h2 className="text-2xl font-bold mt-2 text-black">CV Gốc của Ứng viên: {initialDetails.UngVien.HoTen}</h2>
        </div>
        {cvPaths.length > 0 ? (
          <div className="flex-grow flex flex-col">
            <div className="flex-grow bg-gray-200 rounded">
              <iframe
                src={`http://localhost:8000/${cvPaths[currentPage].replace(/\\/g, '/')}`}
                className="w-full h-full border-0"
                title={`CV Page ${currentPage + 1}`}
              />
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center p-2 space-x-4">
                <button onClick={handlePrevPage} disabled={currentPage === 0} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-black">
                  Trang trước
                </button>
                <span className="text-sm font-medium text-black">Trang {currentPage + 1} / {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-black">
                  Trang sau
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-grow bg-gray-200 rounded flex items-center justify-center text-black">
            <p>Không có file CV.</p>
          </div>
        )}
      </div>

      {/* Cột Đánh giá và Thông tin */}
      <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col space-y-6 overflow-y-auto">
        {/* Form Đánh giá */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-black">Form Đánh giá</h2>
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800">Đánh giá chung</h3>
                <fieldset className="mt-2">
                  <div className="space-y-2">
                    {['Dat', 'KhongDat', 'CanXemXetThem'].map((option) => (
                       <div key={option} className="flex items-center">
                           <input id={option} name="evaluation" type="radio" value={option} checked={ketQua === option} onChange={(e) => setKetQua(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                           <label htmlFor={option} className="ml-3 block text-sm font-medium text-gray-700">{option.replace(/([A-Z])/g, ' $1').trim()}</label>
                       </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Nhận xét chi tiết</label>
                <textarea id="comment" rows={5} value={nhanXet} onChange={(e) => setNhanXet(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
              </div>
              <button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
              {message && <p className="text-sm text-center text-gray-600 mt-2">{message}</p>}
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-sm">
                <div>
                    <h3 className="font-semibold text-gray-800">Kết quả đánh giá</h3>
                    <p className={`font-bold mt-1 ${ketQua === 'Dat' ? 'text-green-600' : 'text-red-600'}`}>{ketQua}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">Nhận xét</h3>
                    <p className="mt-1 text-gray-600 italic">{nhanXet || 'Không có nhận xét.'}</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="w-full btn-secondary cursor-pointer py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Sửa lại đánh giá
                </button>
            </div>
          )}
        </div>

        {/* THÔNG TIN BÓC TÁCH */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg text-black">Tóm tắt từ OCR/AI</h3>
          <div className="mt-2 space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-600">Kỹ năng:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {initialDetails.HoSoCV.KyNang.map(skill => (
                  <span key={skill.TenKyNang} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{skill.TenKyNang}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Kinh nghiệm:</h4>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                {initialDetails.HoSoCV.KinhNghiem.map((exp, i) => (
                  <li className='text-gray-800' key={i}><strong>{exp.ViTri}</strong> tại {exp.TenCongTy}</li>
                ))}
              </ul>
            </div>
             <div>
              <h4 className="font-medium text-gray-600">Dự án:</h4>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                {initialDetails.HoSoCV.DuAn.map((proj, i) => (
                  <li className='text-gray-800' key={i}><strong>{proj.TenDuAn}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}