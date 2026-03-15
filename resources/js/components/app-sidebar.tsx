import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Files, Folder, LayoutGrid, PlusIcon,Share2Icon,Image,File,Headphones, Save, Heart, Trash2, Trash, Star, Bookmark} from 'lucide-react';
import AppLogo from './app-logo';
import { NavMainGallery } from './nav-gallery';
import { Input } from './ui/input';
import { useContext, useEffect, useState } from 'react';
import { useTranslation, initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18n from "i18next";
import Axios from 'axios';




const mainNavItems: NavItem[] = [
    {
        title: 'Moje pliki',
        href: dashboard(),
        icon: Files,
    },
    {
        title:'Udostępnione Pliki',
        href : '/sharedFiles',
        icon: Share2Icon,
    },
    {
        title: 'Zapisane foldery',
        href: '/dashboard/saved',
        icon: Bookmark,
    },
    {
        title:"Ulubione pliki",
        href:"/dashboard/favorite",
        icon:Star,
    },
    {
        title: 'Dodaj pliki',
        href: 'addFile',
        icon: PlusIcon,
    },
    {
        title:"Kosz",
        href:"/trash",
        icon:Trash,
    }   
];
const themeFolders: NavItem[] = [
    {
        title: 'Galeria',
        href: '/type/images',
        icon: Image,
    },
    {
        title: 'Muzyka',
        href: '/type/music',
        icon: Headphones,
    },
    {
        title: 'Dokumenty',
        href: '/type/documents',
        icon: File,
    },
    {
        title: 'Inne',
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
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { t } = useTranslation();
    const { state } = useSidebar();
    const [capacity, setCapacity] = useState({ used: 0, total: 100 });

    useEffect(() => {
        fetchStorageCapacity();
    }, []);

    const fetchStorageCapacity = () => {
        Axios.get('/getStorageCapacity')
            .then(response => {
                setCapacity(response.data);
                localStorage.setItem('storage_capacity', JSON.stringify(response.data));
            });
    };

    // Definiujemy elementy wewnątrz, aby reagowały na zmianę języka (hook t)
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
            title: t('folder.savedFolders', 'Zapisane foldery'), // dodałem klucz dla spójności
            href: '/dashboard/saved',
            icon: Bookmark,
        },
        {
            title: t('files.favoriteFiles', 'Ulubione pliki'),
            href: "/dashboard/favorite",
            icon: Star,
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
