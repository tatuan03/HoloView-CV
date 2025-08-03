// src/app/(protected)/layout.tsx
'use client'; // Chuyển thành Client Component để dùng hook
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook để lấy path hiện tại
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LogoutButton from './dashboard/candidates/[id]/components/LogoutButton';


// Component con để chứa logic, vì AuthProvider cần được bọc ngoài
function ProtectedLayoutContent({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    if (isLoading) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    const isAdmin = user?.MaVaiTro === 'ADMIN';
    const isHr = user?.MaVaiTro === 'HR';
    const isReviewer = user?.MaVaiTro === 'REVIEWER';
    console.log("Ma Vai Tro: ",user?.MaVaiTro);
    return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 text-2xl font-bold border-b border-gray-700">TechBee ATS</div>
            <nav className="flex-grow p-4 space-y-2">
              {/* Menu cho HR và Admin */}
              {(isHr || isAdmin) && (
                <>
                  <Link href="/dashboard" className={`block py-2 px-4 rounded ${pathname.startsWith('/dashboard') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Tổng quan
                  </Link>
                  <Link href="/dashboard/candidates" className={`block py-2 px-4 rounded ${pathname.startsWith('/dashboard/candidates') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Quản lý Ứng viên
                  </Link>
                  <Link href="/dashboard/jobs" className={`block py-2 px-4 rounded ${pathname.startsWith('/dashboard/jobs') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Vị trí Tuyển dụng
                  </Link>
                </>
              )}
              {/* Menu chỉ cho Reviewer */}
              {isReviewer && (
                <Link href="/dashboard/my-reviews" className={`block py-2 px-4 rounded ${pathname.startsWith('/my-reviews') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                  CV của tôi
                </Link>
              )}
              {/* Menu chỉ cho Admin */}
              {isAdmin && (
                <>
                  <Link href="/admin/users" className={`block py-2 px-4 rounded ${pathname.startsWith('/admin/users') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Quản lý User
                  </Link>
                  <Link href="/admin/roles" className={`block py-2 px-4 rounded ${pathname.startsWith('/admin/roles') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Quản lý Vai trò
                  </Link>
                  <Link href="/admin/statuses" className={`block py-2 px-4 rounded ${pathname.startsWith('/admin/statuses') ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    Quản lý Trạng thái
                  </Link>
                </>
              )}
            </nav>
            <div className="p-4 border-t border-gray-700">
              <p className="text-sm font-bold">{user?.HoTen}</p>
              <p className="text-xs text-gray-400">{user?.MaVaiTro}</p>
            </div>
          </aside>

          {/* Vùng nội dung chính */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-md p-4 flex justify-end items-center">
              <LogoutButton />
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
              {children}
            </main>
          </div>
        </div>
    );
}

// Component cha bọc AuthProvider
export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
        </AuthProvider>
    )
}