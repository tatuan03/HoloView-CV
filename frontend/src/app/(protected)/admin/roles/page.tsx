// src/app/(protected)/admin/roles/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Cookies from 'js-cookie';

interface Role {
  MaVaiTro: string;
  TenVaiTro: string;
  MoTa: string | null;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form tạo mới
  const [newRole, setNewRole] = useState({
    MaVaiTro: '',
    TenVaiTro: '',
    MoTa: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    const token = Cookies.get('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/v1/roles/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải danh sách vai trò.");
      const data = await response.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRole(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/roles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newRole),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Tạo vai trò thất bại.');
      }

      alert('Tạo vai trò thành công!');
      setNewRole({ MaVaiTro: '', TenVaiTro: '', MoTa: '' }); // Reset form
      fetchRoles(); // Tải lại danh sách
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Quản lý Vai trò</h1>

      {/* Form tạo vai trò mới */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-semibold text-black">Thêm Vai trò mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="MaVaiTro" className="block text-sm font-medium text-gray-700">Mã Vai trò</label>
              <input type="text" name="MaVaiTro" id="MaVaiTro" value={newRole.MaVaiTro} onChange={handleInputChange} required className="input-style w-full mt-1 text-black" />
            </div>
            <div>
              <label htmlFor="TenVaiTro" className="block text-sm font-medium text-gray-700">Tên Vai trò</label>
              <input type="text" name="TenVaiTro" id="TenVaiTro" value={newRole.TenVaiTro} onChange={handleInputChange} required className="input-style w-full mt-1 text-black" />
            </div>
            <div>
              <label htmlFor="MoTa" className="block text-sm font-medium text-gray-700">Mô tả</label>
              <input type="text" name="MoTa" id="MoTa" value={newRole.MoTa} onChange={handleInputChange} className="input-style w-full mt-1 text-black" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Đang lưu...' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>

      {/* Bảng danh sách vai trò */}
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-10">Đang tải...</td></tr>
            ) : roles.map((role) => (
              <tr key={role.MaVaiTro}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-black">{role.MaVaiTro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.TenVaiTro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-black">{role.MoTa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}