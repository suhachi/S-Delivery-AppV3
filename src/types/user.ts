export interface User {
    id: string;
    email: string;
    displayName?: string;
    phone?: string;
    photoURL?: string;
    role?: 'user' | 'admin';
    createdAt?: any;
}
