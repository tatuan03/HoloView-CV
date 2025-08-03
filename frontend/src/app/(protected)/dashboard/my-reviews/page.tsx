'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
interface AssignedReview {
  MaDanhGia: number;
  TrangThaiHienTai: string;
  UngVien: { MaUngVien: string; HoTen: string; }
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<AssignedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // Chỉ fetch dữ liệu khi đã có thông tin user
    if (user?.MaTaiKhoan) {
      async function fetchAssignedReviews() {
        setIsLoading(true);
        try {
          const response = await fetch(`http://localhost:8000/api/v1/technical-reviews/assigned/${user.MaTaiKhoan}`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setReviews(data);
        } catch (error) { console.error(error); } 
        finally { setIsLoading(false); }
      }
      fetchAssignedReviews();
    } else if (!isAuthLoading) {
        // Nếu không loading mà vẫn không có user, dừng lại
        setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  if (isLoading) return <div className="p-8 text-center text-gray-800">Đang tải...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Hồ sơ CV được giao cho bạn</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ứng viên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.length > 0 ? reviews.map(review => (
              <tr key={review.MaDanhGia}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{review.UngVien.HoTen}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{review.TrangThaiHienTai}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                  <Link href={`/dashboard/reviews/${review.MaDanhGia}`} className="text-indigo-600 hover:text-indigo-900">
                    Xem và Đánh giá
                  </Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Không có hồ sơ nào cần review.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}