import { useState } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import AddressSearchModal from './AddressSearchModal';

interface AddressSearchInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string; // Wrapper className
    inputClassName?: string;
}

export default function AddressSearchInput({
    label,
    value,
    onChange,
    placeholder = '주소를 검색해주세요',
    required,
    className,
    inputClassName
}: AddressSearchInputProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className={`relative ${className || ''}`}>
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Input
                        label={label}
                        value={value}
                        readOnly
                        onClick={() => setIsSearchOpen(true)}
                        placeholder={placeholder}
                        required={required}
                        className={`cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${inputClassName || ''}`}
                    />
                </div>
                <div className={label ? 'mb-[2px]' : ''}> {/* Align with input box if label exists */}
                    <Button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        variant="outline"
                        className="whitespace-nowrap h-[42px]"
                    >
                        <Search className="w-4 h-4 mr-1" />
                        검색
                    </Button>
                </div>
            </div>

            {isSearchOpen && (
                <AddressSearchModal
                    onClose={() => setIsSearchOpen(false)}
                    onComplete={(address) => {
                        onChange(address);
                    }}
                />
            )}
        </div>
    );
}
