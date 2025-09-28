import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export interface FileData {
    id: number;
    name: string;
    type: string;
    size: number; // size in MB
    created_at: string; // formatted date string
    [key: string]: unknown; // This allows for additional properties...
}
export interface Folder {
    id: number;
    name: string;
    parent_id: number | null; // null if it's a root folder
    created_at: string; // formatted date string
    [key: string]: unknown; // This allows for additional properties...
}

export interface Share {
    id: number;
    file_id: number;
    code: string;
    expires_at: string | null; // formatted date string or null if it doesn't expire
    created_at: string; // formatted date string
    [key: string]: unknown; // This allows for additional properties...
}

