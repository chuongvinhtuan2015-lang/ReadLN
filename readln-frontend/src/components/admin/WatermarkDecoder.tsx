import React, { useState } from 'react';
import { Search, KeyRound, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import api from '../../lib/api';

export const WatermarkDecoder: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{ found: boolean; userId?: string; user?: any; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/admin/decode-watermark', { text: inputText });
      setResult(res.data.data);
    } catch {
      alert('Không thể thực hiện giải mã thủy vân lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EFECE6] border border-[#DFDCD4] rounded-[2px] p-6 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="w-5 h-5 text-[#2D5A4C]" />
        <h3 className="text-base font-bold text-[#1F2421]">Truy Vết Kẻ Leak Truyện (Watermark Decoder)</h3>
      </div>
      <p className="text-xs text-[#5C635E] mb-4">
        Dán đoạn văn bản bị sao chép trái phép vào đây. Hệ thống sẽ trích xuất mã nhị phân Zero-Width Unicode ẩn để tra cứu danh tính tài khoản người dùng trực tiếp trong cơ sở dữ liệu MySQL.
      </p>

      <textarea
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          setResult(null);
        }}
        placeholder="Dán đoạn văn bản nghi vấn bị cào / trích xuất vào đây..."
        rows={4}
        className="w-full p-3 bg-[#F6F4EF] border border-[#DFDCD4] rounded-[2px] text-xs focus:outline-none focus:border-[#2D5A4C] placeholder-[#5C635E] mb-3"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={handleDecode}
          disabled={!inputText.trim() || loading}
          className="bg-[#2D5A4C] hover:bg-[#23473C] text-[#F6F4EF] px-4 py-2 rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" /> {loading ? 'Đang trích xuất & tra cứu...' : 'Giải mã tìm thủ phạm'}
        </button>

        {result && (
          <div>
            {result.found ? (
              <div className="text-xs text-red-800 bg-red-100 border border-red-300 px-3 py-2 rounded-[2px] flex flex-col gap-1">
                <div className="flex items-center gap-1 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-700" /> Phát hiện kẻ leak! User ID: {result.userId}
                </div>
                {result.user && typeof result.user === 'object' && (
                  <div className="text-[11px] text-[#1F2421] pl-5 flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-red-700" />
                    <span>Username: <strong>{result.user.username}</strong> ({result.user.email})</span>
                    <span className="bg-red-200 px-1 py-0.5 rounded-[2px] font-mono">{result.user.role}</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-green-700 bg-green-100 border border-green-300 px-3 py-1.5 rounded-[2px] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Không tìm thấy thủy vân ẩn trong đoạn text
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


