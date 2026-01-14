import React from 'react';

interface StyledInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    type?: 'text' | 'number' | 'email';
    autoFocus?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({
    value,
    onChange,
    placeholder,
    label,
    error,
    disabled = false,
    className = '',
    type = 'text',
    autoFocus = false,
}) => {
    const baseStyles = `
    w-full
    px-[14px] py-[10px]
    text-[14px]
    border border-black/12
    rounded-[8px]
    outline-none
    transition-all duration-150
    ${disabled ? 'bg-[#F0F0F0] cursor-not-allowed' : 'bg-white hover:bg-[#FAFAFA]'}
    ${error ? 'border-red-400' : 'focus:border-black/40 focus:shadow-sm'}
  `;

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-[11px] uppercase tracking-[0.15em] text-zinc-600 font-medium">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                className={baseStyles}
            />
            {error && (
                <p className="text-[12px] text-red-500">{error}</p>
            )}
        </div>
    );
};

export default StyledInput;
