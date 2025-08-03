'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Xóa cookie chứa token
    Cookies.remove('access_token');
    // Điều hướng người dùng về trang đăng nhập
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
    >
      Đăng xuất
    </button>
  );
}