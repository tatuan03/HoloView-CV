// src/app/(protected)/admin/users/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

// Định nghĩa kiểu dữ liệu
interface User {
  MaTaiKhoan: string;
  HoTen: string;
  Email: string;
  VaiTro: { TenVaiTro: string; };
  PhongBan: { TenPhongBan: string; } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = Cookies.get('access_token');
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      return;
    }

    // Lấy token từ cookie
    const token = Cookies.get('access_token');

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: 'DELETE',
        // Thêm header Authorization
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });

      if (response.status === 204) { // Kiểm tra status 204 cho lệnh DELETE
        alert('Xóa người dùng thành công!');
        fetchUsers(); // Tải lại danh sách
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || 'Xóa thất bại.');
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Quản lý Người dùng</h1>
        <Link href="/admin/users/new" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          + Thêm mới
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Phòng ban</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10">Đang tải...</td></tr>
            ) : users.map((user) => (
              <tr key={user.MaTaiKhoan}>
                <td className="px-6 py-4 whitespace-nowrap text-black">{user.HoTen}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{user.Email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{user.VaiTro.TenVaiTro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{user.PhongBan?.TenPhongBan || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <Link href={`/admin/users/edit/${user.MaTaiKhoan}`} className="text-indigo-600 hover:text-indigo-900">
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(user.MaTaiKhoan)} className="text-red-600 hover:text-red-900">
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