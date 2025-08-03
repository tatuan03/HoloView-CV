// src/app/(protected)/admin/users/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
interface Role { MaVaiTro: string; TenVaiTro: string; }
interface Department { MaPhongBan: string; TenPhongBan: string; }

export default function NewUserPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    HoTen: '',
    TenDangNhap: '',
    Email: '',
    MatKhau: '',
    MaVaiTro: '',
    MaPhongBan: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Lấy danh sách Vai trò và Phòng ban từ API
    async function fetchData() {
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/users/roles/'),
          fetch('http://localhost:8000/api/v1/departments/'),
        ]);

        const rolesData = await rolesRes.json();
        const deptsData = await deptsRes.json();

        setRoles(rolesData);
        setDepartments(deptsData);

        // Gán giá trị mặc định cho dropdown
        if (rolesData.length > 0) {
          setFormData(prev => ({ ...prev, MaVaiTro: rolesData[0].MaVaiTro }));
        }
        if (deptsData.length > 0) {
          setFormData(prev => ({ ...prev, MaPhongBan: deptsData[0].MaPhongBan }));
        }
      } catch (err) {
        console.error("Failed to fetch roles or departments", err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Lấy token từ cookie
    const token = Cookies.get('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        // Thêm header Authorization
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Tạo người dùng thất bại.');
      }
      alert('Tạo người dùng thành công!');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Tạo Người dùng mới</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Các trường input */}
        <div>
          <label className='text-black'>Họ tên</label>
          <input name="HoTen" onChange={handleChange} required className="input-style w-full text-black" />
        </div>
        <div>
          <label className='text-black'>Tên đăng nhập</label>
          <input name="TenDangNhap" onChange={handleChange} required className="input-style w-full text-black" />
        </div>
        <div>
          <label className='text-black'>Email</label>
          <input type="email" name="Email" onChange={handleChange} required className="input-style w-full text-black" />
        </div>
        <div>
          <label className='text-black'>Mật khẩu</label>
          <input type="password" name="MatKhau" onChange={handleChange} required className="input-style w-full text-black" />
        </div>
        {/* Dropdown cho Vai trò và Phòng ban */}
        <div>
          <label className='text-black'>Vai trò</label>
          <select name="MaVaiTro" value={formData.MaVaiTro} onChange={handleChange} className="input-style w-full text-black">
            {roles.map(role => <option key={role.MaVaiTro} value={role.MaVaiTro}>{role.TenVaiTro}</option>)}
          </select>
        </div>
         <div>
          <label className='text-black'>Phòng ban</label>
          <select name="MaPhongBan" value={formData.MaPhongBan} onChange={handleChange} className="input-style w-full text-black">
            {departments.map(dept => <option key={dept.MaPhongBan} value={dept.MaPhongBan}>{dept.TenPhongBan}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/admin/users" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black">Hủy</Link>
          <button type="submit" disabled={isLoading} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400">
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}