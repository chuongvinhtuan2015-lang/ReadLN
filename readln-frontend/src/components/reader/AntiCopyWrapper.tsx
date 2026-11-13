import React, { useEffect } from 'react';

interface AntiCopyWrapperProps {
  children: React.ReactNode;
}

/**
 * Khóa thao tác sao chép & bảo vệ nội dung:
 * - Chặn chuột phải (onContextMenu)
 * - Chặn bôi đen (user-select: none)
 * - Chặn Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I
 */
export const AntiCopyWrapper: React.FC<AntiCopyWrapperProps> = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl + (C, U, S, P, I, J)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (
          key === 'c' ||
          key === 'u' ||
          key === 's' ||
          key === 'p' ||
          (e.shiftKey && (key === 'i' || key === 'j'))
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      className="anti-copy-container"
    >
      {children}
    </div>
  );
};

