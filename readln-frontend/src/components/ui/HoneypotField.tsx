import React from 'react';

interface HoneypotFieldProps {
  value: string;
  onChange: (val: string) => void;
}

/**
 * Ô input ẩn bẫy bot tự động điền form (NIST CSF: ANTI-BOT/DDOS)
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({ value, onChange }) => {
  return (
    <div
      style={{
        opacity: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <label htmlFor="hp_company_website">Please leave this field empty</label>
      <input
        type="text"
        id="hp_company_website"
        name="company_website"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};

