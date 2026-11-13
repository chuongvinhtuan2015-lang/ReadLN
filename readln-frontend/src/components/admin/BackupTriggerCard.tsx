import React, { useState } from 'react';
import { Database, Download, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export const BackupTriggerCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await api.post('/admin/backup');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      alert('Tạo sao lưu thất bại!');
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


      <div className="flex items-center gap-4">
        <button
          onClick={handleBackup}
          disabled={loading}
          className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-4 py-2 rounded-[2px] text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {loading ? 'Đang xuất bản sao lưu...' : 'Tạo Bản Sao Lưu Ngay'}
        </button>

        {success && (
          <span className="text-xs text-green-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Đã xuất bản sao lưu thành công (readln_backup_latest.sql.gz)
          </span>
        )}
      </div>
    </div>
  );
};

