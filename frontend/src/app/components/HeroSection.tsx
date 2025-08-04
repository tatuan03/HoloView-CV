import Link from "next/link";

// src/app/components/HeroSection.tsx
export default function HeroSection() {
    return (
        <>
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
                {/* <div className="ml-4">
                    <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                    Đăng nhập nhân viên
                    </Link>
                </div> */}
                </div>
            </div>
        </nav>
        <section className="bg-indigo-50">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Cơ hội nghề nghiệp tại</span>
                    <span className="block text-indigo-600">TechBee Solution</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
                    Chúng tôi luôn tìm kiếm những tài năng để cùng nhau phát triển và tạo ra những sản phẩm công nghệ đột phá.
                </p>
            </div>
        </section>
        </>
    );
}