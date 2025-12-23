import { BadgeVariant } from '../components/common/Badge';

export interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    suffix?: string;
    loading?: boolean;
}

export interface QuickStatProps {
    label: string;
    value: number | string;
    suffix: string;
    color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

export function getNoticeCategoryColor(category: string): BadgeVariant {
    switch (category) {
        case '공지': return 'primary';
        case '이벤트': return 'secondary';
        case '점검': return 'danger';
        case '할인': return 'success';
        default: return 'gray';
    }
}
