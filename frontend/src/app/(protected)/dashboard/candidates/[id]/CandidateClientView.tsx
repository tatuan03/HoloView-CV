// src/app/(protected)/dashboard/candidates/[id]/CandidateClientView.tsx
'use client'; 

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import ActionPanel from "./components/ActionPanel";
import LinkToJobForm from '@/app/components/LinkToJobForm';
import ActivityFeed from './components/ActivityFeed';
import { CandidateDetails } from '@/types';

// --- Component chính cho giao diện ---
export default function CandidateClientView({ initialData }: { initialData: CandidateDetails | null }) {
  const [candidate, setCandidate] = useState(initialData);

  const refreshData = useCallback(async () => {
    if (!candidate) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/candidates/${candidate.MaUngVien}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  }, [candidate]);

  if (!candidate) {
    return <div className="p-8 text-center font-bold">Không tìm thấy hoặc không thể tải thông tin ứng viên.</div>;
  }
  
  const mainCV = candidate.HoSoCVs.length > 0 ? candidate.HoSoCVs[0] : null;
  const applications = mainCV ? mainCV.QuyTrinhUngTuyen : [];
  const activities = applications.length > 0 ? applications[0].LichSuHoatDong : [];
  const notes = applications.length > 0 ? applications[0].GhiChu : [];
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline font-medium">&larr; Quay lại Danh sách</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{candidate.HoTen}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Phần thông tin cá nhân */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><strong className='text-black'>Email:</strong> <span className="text-gray-700">{candidate.Email}</span></p>
              <p><strong className='text-black'>Số điện thoại:</strong> <span className="text-gray-700">{candidate.SoDienThoai || 'N/A'}</span></p>
            </div>
          </div>
          {/* Thông tin bóc tách */}
          {mainCV && (
             <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin bóc tách từ CV</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Kỹ năng:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                       {mainCV.KyNang.map(skill => (
                         <span key={skill.TenKyNang} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{skill.TenKyNang}</span>
                       ))}
                    </div>
                  </div>
                   <div>
                    <h4 className="font-semibold text-gray-700">Kinh nghiệm làm việc:</h4>
                     <ul className="mt-2 space-y-2">
                       {mainCV.KinhNghiem.map((exp, index) => (
                         <li key={index} className="text-sm border-l-2 border-indigo-200 pl-3">
                           <p className="font-bold text-gray-800">{exp.ViTri || 'N/A'}</p>
                           <p className="text-gray-600">{exp.TenCongTy || 'N/A'}</p>
                         </li>
                       ))}
                     </ul>
                  </div>
                </div>
             </div>
          )}
        </div>
        {/* Cột Hành động */}
        <div className="lg:col-span-1 space-y-6">
          {mainCV && (
              applications.length > 0 
              ? <ActionPanel 
                  key={applications[0].MaQuyTrinh} 
                  applicationId={applications[0].MaQuyTrinh}
                  currentStatus={applications[0].TrangThaiHienTai}
                  interviews={applications[0].LichPhongVan || []}
                  offers={applications[0].DeXuatTuyenDung || []}
                  onActionSuccess={refreshData} 
                />
              : <LinkToJobForm cvId={mainCV.MaHoSoCV} onSuccess={refreshData} />
          )}
          <ActivityFeed activities={activities} notes={notes} />
        </div>
      </div>
    </div>
  );
}