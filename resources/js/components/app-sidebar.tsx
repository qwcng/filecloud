import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem, 
    useSidebar 
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import Axios from 'axios';
import { 
    BookOpen, 
    Bookmark, 
    EyeOff, 
    File, 
    Files, 
    Folder, 
    Headphones, 
    Image, 
    LayoutGrid, 
    PlusIcon, 
    Share2Icon, 
    Star, 
    Trash 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import AppLogo from './app-logo';
import { NavMainGallery } from './nav-gallery';

const appsList = [
    {
        name: 'Versec Drive',
        href: 'https://filecloud.ct8.pl',
        icon: '/versec-s.jpg',
    },
    {
        name: 'Versec Weather',
        href: 'https://weather.filecloud.ct8.pl',
        icon: '/versecweather.jpg',
    },
];

export function AppSidebar() {
    const { t } = useTranslation();
    const { state } = useSidebar();
    const [capacity, setCapacity] = useState(() => {
        const cached = localStorage.getItem('storage_capacity');
        return cached ? JSON.parse(cached) : { used: 0, total: 100 };
    });

    useEffect(() => {
        const cachedAt = localStorage.getItem('storage_capacity_timestamp');
        const now = Date.now();
        if (!cachedAt || now - parseInt(cachedAt) > 30000) {
            fetchStorageCapacity();
        }
    }, []);

    const fetchStorageCapacity = () => {
        Axios.get('/getStorageCapacity')
            .then(response => {
                setCapacity(response.data);
                localStorage.setItem('storage_capacity', JSON.stringify(response.data));
                localStorage.setItem('storage_capacity_timestamp', Date.now().toString());
            });
    };

    const mainNavItems: NavItem[] = [
        {
            title: t('sidebarmyFiles'),
            href: dashboard(),
            icon: Files,
        },
        {
            title: t('sharedFiles.title'),
            href: '/sharedFiles',
            icon: Share2Icon,
        },
        {
            title: t('folder.savedFolders', 'Zapisane foldery'),
            href: '/dashboard/saved',
            icon: Bookmark,
        },
        {
            title: t('files.favoriteFiles', 'Ulubione pliki'),
            href: "/dashboard/favorite",
            icon: Star,
        },
        {
            title: t('folder.hiddenFolders', 'Hidden Folders'),
            href: "/dashboard/hidden",
            icon: EyeOff,
        },
        {
            title: t('navigation.uploadFiles'),
            href: 'addFile',
            icon: PlusIcon,
        },
        {
            title: t('trash.title'),
            href: "/trash",
            icon: Trash,
        }
    ];

    const themeFolders: NavItem[] = [
        {
            title: t('gallery.title'),
            href: '/type/images',
            icon: Image,
        },
        {
            title: t('music.title', 'Muzyka'),
            href: '/type/music',
            icon: Headphones,
        },
        {
            title: t('documents.title', 'Dokumenty'),
            href: '/type/documents',
            icon: File,
        },
        {
            title: t('other.title', 'Inne'),
            href: '/type/other',
            icon: Folder,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Support',
            href: 'https://filecloud.ct8.pl/',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="w-full justify-start cursor-pointer">
                                    <div className="flex aspect-square size-6 items-center justify-center">
                                        <LayoutGrid className="size-6 text-black dark:text-white" />
                                    </div>
                                    <div className="ml-1 grid flex-1 text-left text-sm">
                                        <span className="mb-0.5 truncate leading-tight font-bold font-poppins">Apps</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                side={state === 'collapsed' ? 'right' : 'bottom'} 
                                align="start" 
                                className="w-48 p-1"
                            >
                                {appsList.map((app, index) => (
                                    <DropdownMenuItem key={index} asChild>
                                        <a 
                                            href={app.href} 
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer w-full hover:bg-accent rounded-md transition-colors"
                                        >
                                            <img 
                                                src={app.icon} 
                                                alt={app.name} 
                                                className="size-5 object-contain rounded-sm" 
                                            />
                                            <span className="text-sm font-medium">{app.name}</span>
                                        </a>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="h-92">
                <NavMain items={mainNavItems} />
                <NavMainGallery items={themeFolders} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                
                {state !== 'collapsed' && (
                    <div className="px-4 py-4 border-t border-sidebar-border/50">
                        <span className="text-sm text-sidebar-foreground/70">
                            {t('storage.usage', 'Storage usage')}: {capacity.used}GB / {capacity.total}GB
                        </span>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mt-2">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min((capacity.used / capacity.total * 100), 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}