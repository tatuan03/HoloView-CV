// src/app/(protected)/admin/users/edit/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

// --- Định nghĩa các kiểu dữ liệu ---
interface Role { MaVaiTro: string; TenVaiTro: string; }
interface Department { MaPhongBan: string; TenPhongBan: string; }
interface UserData {
  HoTen: string;
  Email: string;
  MaVaiTro: string;
  MaPhongBan: string | null;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const router = useRouter();

  // State cho dữ liệu form
  const [formData, setFormData] = useState<Partial<UserData>>({});
  // State cho các dropdown
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  // State cho giao diện
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu ban đầu của user và các danh sách cần thiết
  useEffect(() => {
    const token = Cookies.get('access_token');
    
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        // Lấy đồng thời dữ liệu user, roles, và departments
        const [userRes, rolesRes, deptsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/v1/users/roles/'),
          fetch('http://localhost:8000/api/v1/departments/'),
        ]);

        if (!userRes.ok || !rolesRes.ok || !deptsRes.ok) {
          throw new Error("Không thể tải dữ liệu cần thiết.");
        }
        
        const userData = await userRes.json();
        const rolesData = await rolesRes.json();
        const deptsData = await deptsRes.json();

        // Cập nhật state
        setFormData({
            HoTen: userData.HoTen,
            Email: userData.Email,
            MaVaiTro: userData.MaVaiTro,
            MaPhongBan: userData.MaPhongBan,
        });
        setRoles(rolesData);
        setDepartments(deptsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [userId]);

  // Hàm xử lý khi thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = Cookies.get('access_token');
    
    // Chỉ gửi những trường có trong schema update
    const updatePayload = {
        HoTen: formData.HoTen,
        Email: formData.Email,
        MaPhongBan: formData.MaPhongBan
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8 ',
          'Authorization': `Bearer ${token}` ,
        },
        body: JSON.stringify(updatePayload),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Cập nhật người dùng thất bại.');
      }
      alert('Cập nhật người dùng thành công!');
      router.push('/admin/users'); // Quay lại trang danh sách
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-black">Đang tải dữ liệu người dùng...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Chỉnh sửa Người dùng</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="HoTen" className="block text-sm font-medium text-gray-700">Họ tên</label>
          <input id="HoTen" name="HoTen" value={formData.HoTen || ''} onChange={handleChange} required className="input-style w-full mt-1 text-black" />
        </div>
        <div>
          <label htmlFor="Email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="Email" name="Email" value={formData.Email || ''} onChange={handleChange} required className="input-style w-full mt-1 text-black" />
        </div>
        <div>
          <label htmlFor="MaVaiTro" className="block text-sm font-medium text-gray-700">Vai trò (Không thể thay đổi)</label>
          <select id="MaVaiTro" name="MaVaiTro" value={formData.MaVaiTro || ''} disabled className="input-style w-full mt-1 bg-gray-100 cursor-not-allowed text-black">
            {roles.map(role => <option key={role.MaVaiTro} value={role.MaVaiTro}>{role.TenVaiTro}</option>)}
          </select>
        </div>
         <div>
          <label htmlFor="MaPhongBan" className="block text-sm font-medium text-gray-700">Phòng ban</label>
          <select id="MaPhongBan" name="MaPhongBan" value={formData.MaPhongBan || ''} onChange={handleChange} className="input-style w-full mt-1 text-black">
             <option value="">Không có</option>
            {departments.map(dept => <option key={dept.MaPhongBan} value={dept.MaPhongBan}>{dept.TenPhongBan}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/admin/users" className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium">Hủy</Link>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 font-medium">
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}