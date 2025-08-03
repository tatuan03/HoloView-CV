// src/app/(protected)/dashboard/jobs/edit/[id]/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

// --- Định nghĩa các kiểu dữ liệu ---
interface Department {
    MaPhongBan: string;
    TenPhongBan: string;
}
interface JobData {
  TenViTri: string;
  MaPhongBan: string;
  MoTa: string;
  YeuCau: string;
  SoLuong: number;
  NgayHetHan: string;
  TrangThai: string;
}

export default function EditJobPage({ jobId, initialJobData }: { jobId: string, initialJobData: JobData | null }) {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<JobData>>(initialJobData || {});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu ban đầu của vị trí và danh sách phòng ban
  useEffect(() => {
    const token = Cookies.get('access_token');
    
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [jobRes, deptsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/job_positions/${jobId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/v1/departments/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!jobRes.ok || !deptsRes.ok) {
          throw new Error("Không thể tải dữ liệu cần thiết.");
        }
        
        const jobData = await jobRes.json();
        const deptsData = await deptsRes.json();

        // Định dạng lại ngày hết hạn cho input type="date"
        if (jobData.NgayHetHan) {
            jobData.NgayHetHan = new Date(jobData.NgayHetHan).toISOString().split('T')[0];
        }

        setFormData(jobData);
        setDepartments(deptsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'SoLuong' ? parseInt(value) : value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('access_token');
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/job_positions/${jobId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Cập nhật vị trí thất bại.');
      }
      alert('Cập nhật vị trí thành công!');
      router.push('/dashboard/jobs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Chỉnh sửa Vị trí Tuyển dụng</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="TenViTri" className="block text-sm font-medium text-gray-700">Tên Vị trí</label>
              <input type="text" name="TenViTri" id="TenViTri" value={formData.TenViTri || ''} onChange={handleChange} required className="input-style w-full mt-1 text-gray-800" />
            </div>
             <div>
              <label htmlFor="MaPhongBan" className="block text-sm font-medium text-gray-700">Phòng ban (Không thể thay đổi)</label>
              <select name="MaPhongBan" id="MaPhongBan" value={formData.MaPhongBan || ''} disabled className="input-style w-full mt-1 bg-gray-100 cursor-not-allowed text-gray-800">
                {departments.map(dept => <option key={dept.MaPhongBan} value={dept.MaPhongBan}>{dept.TenPhongBan}</option>)}
              </select>
            </div>
        </div>
        <div>
          <label htmlFor="MoTa" className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea name="MoTa" id="MoTa" value={formData.MoTa || ''} onChange={handleChange} rows={4} className="input-style w-full mt-1 text-gray-800"></textarea>
        </div>
        <div>
          <label htmlFor="YeuCau" className="block text-sm font-medium text-gray-700">Yêu cầu</label>
          <textarea name="YeuCau" id="YeuCau" value={formData.YeuCau || ''} onChange={handleChange} rows={4} className="input-style w-full mt-1 text-gray-800"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="SoLuong" className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input type="number" name="SoLuong" id="SoLuong" value={formData.SoLuong || 1} onChange={handleChange} className="input-style w-full mt-1 text-gray-800" />
            </div>
            <div>
              <label htmlFor="NgayHetHan" className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
              <input type="date" name="NgayHetHan" id="NgayHetHan" value={formData.NgayHetHan || ''} onChange={handleChange} className="input-style w-full mt-1 text-gray-800" />
            </div>
            <div>
              <label htmlFor="TrangThai" className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select name="TrangThai" id="TrangThai" value={formData.TrangThai || ''} onChange={handleChange} className="input-style w-full mt-1 text-gray-800">
                  <option value="DangTuyen">Đang tuyển</option>
                  <option value="TamDung">Tạm dừng</option>
                  <option value="DaDong">Đã đóng</option>
              </select>
            </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/dashboard/jobs" className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium">Hủy</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 font-medium">
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}