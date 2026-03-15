import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from 'react-i18next';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];


export default function Appearance() {
    const { i18n } = useTranslation();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                    <Select onValueChange={(e)=>{
                        localStorage.setItem("lang",e);
                        i18n.changeLanguage(e);
                        
                    }} 
                    defaultValue={localStorage.getItem("lang")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel>Language</SelectLabel>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                        <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="zh">🇨🇳 中文</SelectItem>
                        <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                        <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                        <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="he">🇮🇱 עברית</SelectItem>

                      
                        </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
