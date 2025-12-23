import { Plus } from 'lucide-react';
import { Menu } from '../../types/menu';
import Button from '../common/Button';

interface CartUpsellProps {
    items: Menu[];
    onAdd: (menu: Menu) => void;
}

export default function CartUpsell({ items, onAdd }: CartUpsellProps) {
    if (items.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
                함께 드시면 더 맛있어요! 😋
            </h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="h-24 bg-gray-100 relative">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                                    🍽️
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                {item.price.toLocaleString()}원
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                fullWidth
                                onClick={() => onAdd(item)}
                                className="h-8 text-xs"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                담기
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
