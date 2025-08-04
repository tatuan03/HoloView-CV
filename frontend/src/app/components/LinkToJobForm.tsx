// src/app/(protected)/dashboard/candidates/[id]/components/LinkToJobForm.tsx
'use client';
import { useEffect, useState } from "react";

interface JobPosition { MaViTri: string; TenViTri: string; }
interface LinkToJobFormProps {
  cvId: string;
  onSuccess: () => void; // Callback để báo cho trang cha biết đã thành công
}

export default function LinkToJobForm({ cvId, onSuccess }: LinkToJobFormProps) {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch('http://localhost:8000/api/v1/job_positions/');
      const data = await res.json();
      setJobs(data);
      if (data.length > 0) setSelectedJob(data[0].MaViTri);
    }
    fetchJobs();
  }, []);

  const handleSubmit = async () => {
    if (!selectedJob) { alert("Vui lòng chọn vị trí tuyển dụng."); return; }
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/applications/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ MaHoSoCV: cvId, MaViTri: selectedJob })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.detail || "Gán vị trí thất bại");

      setMessage("Gán vị trí thành công!");
      onSuccess(); // Gọi callback
    } catch (error: any) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="font-semibold text-lg text-black">Gán CV vào Vị trí Tuyển dụng</h3>
      <p className="text-sm text-gray-500">
        Hồ sơ này chưa được ứng tuyển vào vị trí nào.
      </p>
      <div>
        <label htmlFor="job" className="block text-sm font-medium text-gray-700">Chọn vị trí</label>
        <select
          id="job"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-800"
        >
          {jobs.map(j => (<option key={j.MaViTri} value={j.MaViTri}>{j.TenViTri}</option>))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || jobs.length === 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
      >
        {isLoading ? "Đang xử lý..." : "Xác nhận Ứng tuyển"}
      </button>
      {message && <p className="text-sm text-center text-gray-600 mt-2">{message}</p>}
    </div>
  );
}