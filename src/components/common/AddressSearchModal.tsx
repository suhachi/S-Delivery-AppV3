import DaumPostcodeEmbed from 'react-daum-postcode';
import { X } from 'lucide-react';

interface AddressSearchModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

export default function AddressSearchModal({ onComplete, onClose }: AddressSearchModalProps) {
    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        onComplete(fullAddress);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ height: '550px', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">주소 검색</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 w-full relative">
                    <DaumPostcodeEmbed
                        onComplete={handleComplete}
                        style={{ width: '100%', height: '100%' }}
                        autoClose={false}
                    />
                </div>
            </div>
        </div>
    );
}
