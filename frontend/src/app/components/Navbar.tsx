// src/app/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              TechBee ATS
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Thêm các link menu khác ở đây nếu cần */}
              <a href="#upload-section" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Ứng tuyển</a>
            </div>
          </div>
          <div className="ml-4">
            <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Đăng nhập nhân viên
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}