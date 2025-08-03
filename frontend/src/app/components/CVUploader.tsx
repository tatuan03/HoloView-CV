'use client';

import { useState } from 'react';

// Định nghĩa kiểu dữ liệu cho kết quả trả về
interface ExtractionResult {
  message: string;
  applicant_id: string;
  cv_id: string;
  file_path: string;
  extracted_text: string;
  structured_data: {
    email: string | null;
    phone: string | null;
    name: string | null;
    skills: string[] | null;
    experience: any[] | null;
  };
}

export default function CVUploader() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHandwritten, setIsHandwritten] = useState(false); // State cho checkbox

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const resetForm = () => {
    setFiles(null);
    setHoTen('');
    setEmail('');
    setResult(null);
    setError(null);
    setIsHandwritten(false);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Vui lòng chọn ít nhất một file CV.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    
    formData.append('ho_ten', hoTen);
    formData.append('email', email);
    formData.append('is_handwritten', String(isHandwritten)); // Gửi trạng thái của checkbox

    try {
      const response = await fetch('http://localhost:8000/api/v1/cvs/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        let errorMessage = responseData.detail || 'Upload file thất bại. Vui lòng thử lại.';
        if (typeof errorMessage !== 'string') {
          errorMessage = JSON.stringify(errorMessage);
        }
        throw new Error(errorMessage);
      }

      setResult(responseData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GIAO DIỆN ---

  if (!result) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-10">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Phân tích CV thông minh</h2>
            
            <div>
              <label htmlFor="hoTen" className="block text-sm font-medium text-gray-700 mb-1">Họ tên (Tùy chọn)</label>
              <input type="text" id="hoTen" value={hoTen} onChange={(e) => setHoTen(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nguyễn Văn A" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Tùy chọn)</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="nguyenvana@example.com" />
            </div>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Chọn file CV (có thể chọn nhiều file)</label>
              <input type="file" id="file-upload" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/heic, image/heif" multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
            </div>
            
            {/* THÊM CHECKBOX ĐỂ CHỌN LOẠI CV */}
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="isHandwritten"
                  name="isHandwritten"
                  type="checkbox"
                  checked={isHandwritten}
                  onChange={(e) => setIsHandwritten(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isHandwritten" className="font-medium text-gray-900">
                  Đây là CV viết tay?
                </label>
                <p className="text-gray-500">Chọn vào đây nếu CV là ảnh chụp chữ viết tay để có kết quả tốt nhất.</p>
              </div>
            </div>

          </div>

          {error && 
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          }

          <div className="mt-8">
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isLoading ? 'Đang xử lý...' : 'Upload và Phân tích'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Xử lý thành công!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột dữ liệu có cấu trúc */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Thông tin bóc tách</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Họ tên:</strong> {result.structured_data.name || 'N/A'}</p>
            <p><strong>Email:</strong> {result.structured_data.email || 'N/A'}</p>
            <p><strong>SĐT:</strong> {result.structured_data.phone || 'N/A'}</p>
            <div>
              <strong>Kỹ năng:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.structured_data.skills?.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">{skill}</span>
                ))}
                {!result.structured_data.skills && 'N/A'}
              </div>
            </div>
          </div>
        </div>
        {/* Cột văn bản thô */}
        <div className="bg-gray-50 p-4 rounded-lg">
           <h3 className="text-lg font-semibold mb-3 border-b pb-2">Văn bản gốc từ OCR</h3>
           <textarea 
            readOnly 
            value={result.extracted_text}
            className="w-full h-48 p-2 border border-gray-300 rounded-md bg-white text-xs"
           />
        </div>
      </div>
      <div className="mt-8">
        <button onClick={resetForm}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Tải lên CV khác
        </button>
      </div>
    </div>
  );
}