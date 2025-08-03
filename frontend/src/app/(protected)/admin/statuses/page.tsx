// src/app/(protected)/admin/statuses/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Cookies from 'js-cookie';

interface Status {
  MaTrangThai: string;
  TenTrangThai: string;
  MoTa: string | null;
  MauSac: string | null;
}

export default function AdminStatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form tạo mới
  const [newStatus, setNewStatus] = useState({
    MaTrangThai: '',
    TenTrangThai: '',
    MoTa: '',
    MauSac: '#808080'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatuses = async () => {
    setIsLoading(true);
    const token = Cookies.get('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/v1/statuses/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải danh sách trạng thái.");
      const data = await response.json();
      setStatuses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStatus(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/statuses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newStatus),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Tạo trạng thái thất bại.');
      }

      alert('Tạo trạng thái thành công!');
      setNewStatus({ MaTrangThai: '', TenTrangThai: '', MoTa: '', MauSac: '#808080' }); // Reset form
      fetchStatuses(); // Tải lại danh sách
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Quản lý Trạng thái Tuyển dụng</h1>

      {/* Form tạo trạng thái mới */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-semibold text-black">Thêm Trạng thái mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="MaTrangThai" className="block text-sm font-medium text-gray-700">Mã Trạng thái (viết liền)</label>
              <input type="text" name="MaTrangThai" id="MaTrangThai" value={newStatus.MaTrangThai} onChange={handleInputChange} required className="input-style w-full mt-1 text-black" />
            </div>
            <div>
              <label htmlFor="TenTrangThai" className="block text-sm font-medium text-gray-700">Tên Trạng thái</label>
              <input type="text" name="TenTrangThai" id="TenTrangThai" value={newStatus.TenTrangThai} onChange={handleInputChange} required className="input-style w-full mt-1 text-black" />
            </div>
            <div>
              <label htmlFor="MauSac" className="block text-sm font-medium text-gray-700">Màu sắc</label>
              <input type="color" name="MauSac" id="MauSac" value={newStatus.MauSac} onChange={handleInputChange} className="mt-1 h-10 w-full" />
            </div>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 h-10">
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>

      {/* Bảng danh sách trạng thái */}
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Mã Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Tên Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Màu sắc</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-10">Đang tải...</td></tr>
            ) : statuses.map((status) => (
              <tr key={status.MaTrangThai}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-black">{status.MaTrangThai}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-bold" style={{ color: status.MauSac || '#000' }}>●</span> {status.TenTrangThai}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-black">{status.MauSac}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}