import React, { useState } from 'react';
import { Database, Download, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export const BackupTriggerCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState('');

  const handleBackup = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      // Gọi API xuất backup và nhận stream nhị phân (blob)
      const response = await api.post('/admin/backup', {}, {
        responseType: 'blob',
      });

      // Tạo liên kết tải về trực tiếp trên trình duyệt
      const blob = new Blob([response.data], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      const fileName = `readln_mysql_backup_${today}.sql.gz`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadFileName(fileName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 8000);
    } catch {
      alert('Tạo sao lưu thất bại! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-[#2D5A4C]" />
        <h3 className="text-base font-bold text-[#1F2421]">Sao Lưu Cơ Sở Dữ Liệu MySQL (NIST CSF: Recover)</h3>
      </div>
      <p className="text-xs text-[#5C635E] mb-4">
        Hệ thống tự động kết xuất toàn bộ bảng (schema & dữ liệu) MySQL thành file SQL nén Gzip (.sql.gz) và tải thẳng về máy tính của quản trị viên.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={handleBackup}
          disabled={loading}
          className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-4 py-2 rounded-[2px] text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          {loading ? 'Đang xuất bản sao lưu...' : 'Tạo & Tải Bản Sao Lưu Ngay'}
        </button>

        {success && (
          <span className="text-xs text-green-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Đã tải xuống thành công ({downloadFileName})!
          </span>
        )}
      </div>
    </div>
  );
};

