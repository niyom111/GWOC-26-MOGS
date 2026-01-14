import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

interface Option {
    id: string;
    name: string;
}

interface StyledSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    allowCreate?: boolean;
    onCreateNew?: (name: string) => Promise<Option | null>;
    createLabel?: string;
}

const StyledSelect: React.FC<StyledSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    label,
    error,
    disabled = false,
    className = '',
    allowCreate = false,
    onCreateNew,
    createLabel = 'Create new',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showCreateOption = allowCreate &&
        searchQuery.trim() &&
        !options.some(opt => opt.name.toLowerCase() === searchQuery.trim().toLowerCase());

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleCreate = async () => {
        if (!onCreateNew || !searchQuery.trim()) return;
        setIsCreating(true);
        try {
            const newOption = await onCreateNew(searchQuery.trim());
            if (newOption) {
                onChange(newOption.id);
            }
        } finally {
            setIsCreating(false);
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    const baseStyles = `
    w-full
    px-[14px] py-[10px]
    text-[14px]
    border border-black/12
    rounded-[8px]
    outline-none
    transition-all duration-150
    cursor-pointer
    flex items-center justify-between
    ${disabled ? 'bg-[#F0F0F0] cursor-not-allowed' : 'bg-white hover:bg-[#FAFAFA]'}
    ${error ? 'border-red-400' : isOpen ? 'border-black/40 shadow-sm' : ''}
  `;

    return (
        <div className={`space-y-1 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[11px] uppercase tracking-[0.15em] text-zinc-600 font-medium">
                    {label}
                </label>
            )}

            <div
                className={baseStyles}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? 'text-black' : 'text-zinc-400'}>
                    {selectedOption?.name || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-black/10 rounded-[8px] shadow-lg overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-black/5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-[13px] bg-[#FAFAFA] border border-black/8 rounded-[6px] outline-none focus:border-black/20"
                            autoFocus
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-[200px] overflow-y-auto">
                        {filteredOptions.length === 0 && !showCreateOption && (
                            <div className="px-3 py-3 text-[13px] text-zinc-400 text-center">
                                No options found
                            </div>
                        )}

                        {filteredOptions.map(option => (
                            <div
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`
                  px-3 py-2.5 text-[13px] cursor-pointer
                  hover:bg-[#FAFAFA] transition-colors
                  ${value === option.id ? 'bg-black/5 font-medium' : ''}
                `}
                            >
                                {option.name}
                            </div>
                        ))}

                        {/* Create new option */}
                        {showCreateOption && (
                            <div
                                onClick={handleCreate}
                                className="px-3 py-2.5 text-[13px] cursor-pointer hover:bg-[#FAFAFA] transition-colors text-blue-600 flex items-center gap-2 border-t border-black/5"
                            >
                                <Plus className="w-4 h-4" />
                                {isCreating ? 'Creating...' : `${createLabel} "${searchQuery.trim()}"`}
                            </div>
                        )}
                    </div>

                    {/* Clear selection */}
                    {selectedOption && (
                        <div
                            onClick={() => handleSelect('')}
                            className="px-3 py-2 text-[12px] text-zinc-400 cursor-pointer hover:bg-[#FAFAFA] border-t border-black/5 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear selection
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-[12px] text-red-500">{error}</p>
            )}
        </div>
    );
};

export default StyledSelect;
