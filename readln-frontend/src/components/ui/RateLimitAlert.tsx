import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export const RateLimitAlert: React.FC = () => {
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    const handleRateLimit = (e: Event) => {
      const customEvent = e as CustomEvent<{ retryAfter: number }>;
      setCooldown(customEvent.detail?.retryAfter || 60);
    };

    window.addEventListener('app:rate-limit', handleRateLimit);
    return () => window.removeEventListener('app:rate-limit', handleRateLimit);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (cooldown <= 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#5C3A3A] text-[#F6F4EF] p-4 rounded-[2px] border border-[#BA8888] flex items-start gap-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-200 mt-0.5" />
      <div>
        <div className="text-sm font-bold">Thao tác quá nhanh (429)</div>
        <p className="text-xs text-red-100 mt-0.5">
          Bạn đang gửi quá nhiều yêu cầu. Hệ thống tạm khóa trong <span className="font-bold underline">{cooldown}s</span> nữa.
        </p>
      </div>
    </div>
  );
};

