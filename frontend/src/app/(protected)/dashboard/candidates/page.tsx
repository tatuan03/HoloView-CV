// src/app/(protected)/dashboard/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PriorityCandidates from '../components/PriorityCandidates';
import RecentActivity from '../components/RecentActivity';


interface Candidate {
  MaUngVien: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string | null;
  ThoiGianTao: string;
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState(''); 
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        // Xây dựng URL với các tham số query
        const params = new URLSearchParams();
        if (nameSearch) {
          params.append('name', nameSearch);
        }
        // Tách chuỗi kỹ năng bằng dấu phẩy và thêm vào params
        if (skillFilter) {
          const skills = skillFilter.split(',').map(skill => skill.trim()).filter(Boolean);
          skills.forEach(skill => params.append('skills', skill));
        }

        const url = `http://localhost:8000/api/v1/candidates?${params.toString()}`;
        
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch candidates');
        
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
        fetchCandidates();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [nameSearch, skillFilter]); 

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Danh sách Ứng viên</h1>

      {/* KHUNG TÌM KIẾM & LỌC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text"
            placeholder="Tìm theo tên..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 placeholder-opacity-100 text-gray-900"
          />
          <input 
            type="text"
            placeholder="Lọc theo kỹ năng (cách nhau bởi dấu phẩy)..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 placeholder-opacity-100 text-gray-900"
          />
      </div>
      
      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
         <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Họ tên</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Số điện thoại</th>
                <th className="px-5 py-3">Ngày nộp</th>
                <th className="px-5 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-black">Đang tải...</td></tr>
              ) : candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate.MaUngVien} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-900">{candidate.HoTen}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{candidate.Email}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{candidate.SoDienThoai || 'N/A'}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {new Date(candidate.ThoiGianTao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <Link href={`/dashboard/candidates/${candidate.MaUngVien}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-10 text-gray-800">Không tìm thấy ứng viên nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}