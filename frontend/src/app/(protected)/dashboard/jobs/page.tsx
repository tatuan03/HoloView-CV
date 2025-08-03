// src/app/(protected)/dashboard/jobs/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

// --- Định nghĩa các kiểu dữ liệu ---
interface JobPosition {
  MaViTri: string;
  TenViTri: string;
  TrangThai: string;
  NgayDang: string;
  PhongBan: {
    TenPhongBan: string;
  }
}
interface Department {
    MaPhongBan: string;
    TenPhongBan: string;
}

export default function JobManagementPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form tạo mới
  const [newJob, setNewJob] = useState({
    MaViTri: '',
    TenViTri: '',
    MaPhongBan: '',
    MoTa: '',
    YeuCau: '',
    SoLuong: 1,
    NgayDang: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobsAndDepts = async () => {
    setIsLoading(true);
    const token = Cookies.get('access_token');
    try {
      const [jobsRes, deptsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/job_positions/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/v1/departments/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!jobsRes.ok || !deptsRes.ok) throw new Error("Không thể tải dữ liệu.");
      
      const jobsData = await jobsRes.json();
      const deptsData = await deptsRes.json();
      
      setJobs(jobsData);
      setDepartments(deptsData);
      if (deptsData.length > 0) {
        setNewJob(prev => ({ ...prev, MaPhongBan: deptsData[0].MaPhongBan }));
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndDepts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: name === 'SoLuong' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/job_positions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newJob),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Tạo vị trí thất bại.');
      }

      alert('Tạo vị trí thành công!');
      fetchJobsAndDepts(); // Tải lại danh sách
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (jobId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vị trí này không? Thao tác này không thể hoàn tác.')) return;

    const token = Cookies.get('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/v1/job_positions/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Xóa thất bại.');
      alert('Xóa vị trí thành công!');
      fetchJobsAndDepts(); 
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý Vị trí Tuyển dụng</h1>

      {/* Form tạo vị trí mới */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-black">Thêm Vị trí mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="MaViTri" className="block text-sm font-medium text-gray-700">Mã Vị trí (viết liền)</label>
              <input type="text" name="MaViTri" id="MaViTri" value={newJob.MaViTri} onChange={handleInputChange} required className="input-style w-full mt-1 text-gray-800" />
            </div>
            <div>
              <label htmlFor="TenViTri" className="block text-sm font-medium text-gray-700">Tên Vị trí</label>
              <input type="text" name="TenViTri" id="TenViTri" value={newJob.TenViTri} onChange={handleInputChange} required className="input-style w-full mt-1 text-gray-800" />
            </div>
             <div>
              <label htmlFor="MaPhongBan" className="block text-sm font-medium text-gray-700">Phòng ban</label>
              <select name="MaPhongBan" id="MaPhongBan" value={newJob.MaPhongBan} onChange={handleInputChange} className="input-style w-full mt-1 text-gray-800">
                {departments.map(dept => <option key={dept.MaPhongBan} value={dept.MaPhongBan}>{dept.TenPhongBan}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="MoTa" className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea name="MoTa" id="MoTa" value={newJob.MoTa} onChange={handleInputChange} rows={3} className="input-style w-full mt-1 text-gray-800"></textarea>
          </div>
           <div>
            <label htmlFor="YeuCau" className="block text-sm font-medium text-gray-700">Yêu cầu</label>
            <textarea name="YeuCau" id="YeuCau" value={newJob.YeuCau} onChange={handleInputChange} rows={3} className="input-style w-full mt-1 text-gray-800"></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>

      {/* Bảng danh sách vị trí */}
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Vị trí</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10">Đang tải...</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.MaViTri}>
                <td className="px-6 py-4 font-medium text-gray-900">{job.TenViTri}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{job.PhongBan.TenPhongBan}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    job.TrangThai === 'DangTuyen' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.TrangThai}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{new Date(job.NgayDang).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-4 text-sm font-medium space-x-4">
                  <Link href={`/dashboard/jobs/edit/${job.MaViTri}`} className="text-indigo-600 hover:text-indigo-900">
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(job.MaViTri)} className="text-red-600 hover:text-red-900">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}