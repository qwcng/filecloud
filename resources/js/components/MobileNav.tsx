import { Link } from '@inertiajs/react';
import { Home, LayoutGrid, Star, Settings, Plus, Image, Files } from 'lucide-react';
import { dashboard } from '@/routes';
import { useTranslation } from 'react-i18next';

const MobileNav = () => {
    const { t } = useTranslation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 px-6 pb-2 pt-2">
            <div className="flex justify-between items-center h-14 max-w-md mx-auto">
                <Link 
                    href={dashboard().url} 
                    className="flex flex-col items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 active:scale-95 transition-transform"
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{t('navigation.dashboard', 'Home')}</span>
                </Link>

                <Link 
                    href="/type/images" 
                    className="flex flex-col items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 active:scale-95 transition-transform"
                >
                    <Image className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{t('gallery.title', 'Gallery')}</span>
                </Link>

                <Link 
                    href="/addFile" 
                    className="flex flex-col items-center justify-center -mt-10"
                >
                    <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/40 text-white active:scale-90 transition-transform">
                        <Plus className="h-6 w-6 stroke-[2.5px]" />
                    </div>
                </Link>

                <Link 
                    href="/dashboard/favorite" 
                    className="flex flex-col items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 active:scale-95 transition-transform"
                >
                    <Star className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{t('files.favoriteFiles', 'Favorites')}</span>
                </Link>

                <Link 
                    href="/settings" 
                    className="flex flex-col items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400 active:scale-95 transition-transform"
                >
                    <Settings className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{t('settings.profile', 'Settings')}</span>
                </Link>
            </div>
        </nav>
    );
};

export default MobileNav;
