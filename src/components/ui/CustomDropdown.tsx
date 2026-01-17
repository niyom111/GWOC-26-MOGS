import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
    placeholder?: string;
    className?: string; // Applied to the trigger button
    panelClassName?: string; // Applied to the dropdown panel
    triggerIcon?: React.ReactNode; // Optional icon to show on the left of trigger
    minimal?: boolean; // If true, uses a more text-focused minimal style
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select option',
    className = '',
    panelClassName = '',
    triggerIcon,
    minimal = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption) => {
        if (option.disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center justify-between text-left outline-none transition-all duration-200
          ${minimal
                        ? 'gap-2 text-xs font-sans uppercase tracking-[0.2em] text-black hover:opacity-70'
                        : `w-full bg-white border border-black/20 px-4 py-3 text-sm md:text-base font-sans ${isOpen ? 'border-black' : ''}`
                    }
          ${className}
        `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {triggerIcon && <span className="shrink-0">{triggerIcon}</span>}
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                {!minimal && (
                    <ChevronDown
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`
              absolute z-50 mt-2 w-full min-w-[200px] bg-[#F9F8F4] border border-black/10 shadow-xl overflow-hidden
              ${minimal ? 'right-0 origin-top-right rounded-xl' : 'left-0 origin-top-left rounded-none'}
              ${panelClassName}
            `}
                    >
                        <div className="max-h-[300px] overflow-y-auto py-1">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        disabled={option.disabled}
                                        className={`
                      relative w-full text-left flex items-center justify-between px-4 py-3 text-sm font-sans transition-colors
                      ${option.disabled ? 'opacity-40 cursor-not-allowed bg-black/5' : 'hover:bg-black/5 cursor-pointer'}
                      ${isSelected ? 'bg-black/5 font-medium text-black' : 'text-zinc-700'}
                    `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
