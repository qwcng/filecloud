import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Files, Folder, LayoutGrid, PlusIcon,Share2Icon,Image,File,Headphones, Save, Heart, Trash2, Trash, Star, Bookmark} from 'lucide-react';
import AppLogo from './app-logo';
import { NavMainGallery } from './nav-gallery';
import { Input } from './ui/input';
import { useContext } from 'react';
import { useTranslation, initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18n from "i18next";
i18n
  .use(HttpApi)                  // 🔥 musisz włączyć backend
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "pl","ru","fr"],
    fallbackLng: "en",
    lng: localStorage.getItem("lang") || "pl",

    backend: {
      loadPath: "/locales/{{lng}}/translation.json"
    },

    interpolation: {
      escapeValue: false
    }
  });

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
    const {t, i18n} = useTranslation();
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
                {/* search */}
                
                <NavMain items={mainNavItems} />
                <NavMainGallery items={themeFolders} />
            </SidebarContent>
            {/* <SidebarContent>
                <NavMainGallery items={themeFolders} />
            </SidebarContent> */}

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
