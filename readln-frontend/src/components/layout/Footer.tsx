import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#DFDCD4] bg-[#EFECE6] py-8 text-xs text-[#5C635E]">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[#1F2421] mb-1">ReadLN - Nền tảng đọc Light Novel phong cách Warm Paper</div>
          <p>Tuân thủ tiêu chuẩn an toàn thông tin NIST CSF 1.1 và bản quyền văn học.</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#2D5A4C] transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-[#2D5A4C] transition-colors">Bảo mật</a>
          <a href="#" className="hover:text-[#2D5A4C] transition-colors">Bản quyền</a>
          <a href="#" className="hover:text-[#2D5A4C] transition-colors">Liên hệ</a>
        </div>
      </div>
    </footer>
  );
};

