import React, { useState } from 'react';
import { AlertOctagon, Power } from 'lucide-react';
import { KillSwitchModal } from '../../components/admin/KillSwitchModal';
import { IpBlacklistTable } from '../../components/admin/IpBlacklistTable';
import { TrashRestoreTable } from '../../components/admin/TrashRestoreTable';
import { BackupTriggerCard } from '../../components/admin/BackupTriggerCard';
import { useAuth } from '../../contexts/AuthContext';

export const AdminOperationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLockdownMode } = useAuth();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#DFDCD4]">
        <h1 className="text-xl font-bold text-[#1F2421]">Vận Hành Khẩn Cấp & Phục Hồi (Respond & Recover)</h1>
       
      </div>

      {/* Thẻ Kill-Switch Khẩn Cấp */}
      <div className={`p-6 border rounded-[2px] ${
        isLockdownMode ? 'bg-red-50 border-red-300' : 'bg-[#EFECE6] border-[#DFDCD4]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className={`w-5 h-5 ${isLockdownMode ? 'text-red-700 animate-pulse' : 'text-[#5C635E]'}`} />
              <h3 className="text-base font-bold text-[#1F2421]">
                Nút Khẩn Cấp Kill-Switch (Chế độ Chỉ Đọc)
              </h3>
            </div>
            <p className="text-xs text-[#5C635E] max-w-xl">
              Khi bật, toàn bộ các request POST, PUT, DELETE sẽ bị ngắt lập tức với mã HTTP 503 
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-5 py-2.5 rounded-[2px] text-xs font-bold flex items-center gap-2 text-[#F6F4EF] transition-colors whitespace-nowrap self-start sm:self-center ${
              isLockdownMode ? 'bg-[#2D5A4C] hover:bg-[#23473C]' : 'bg-[#5C3A3A] hover:bg-[#4A2F2F]'
            }`}
          >
            <Power className="w-4 h-4" />
            {isLockdownMode ? 'Hủy Bỏ Phong Tỏa' : 'Bật Kill-Switch'}
          </button>
        </div>
      </div>

      {/* Danh sách chặn IP */}
      <IpBlacklistTable />

      {/* Khôi phục bản ghi xóa mềm is_deleted */}
      <TrashRestoreTable />

      {/* Sao lưu dữ liệu */}
      <BackupTriggerCard />

      <KillSwitchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

