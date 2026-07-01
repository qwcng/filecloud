import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
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

import settings from '@/routes/settings';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sessions settings',
        href: settings.sessions.edit().url,
    },
];


export default function Sessions() {
    const { i18n } = useTranslation();
    const [activeSessions, setActiveSessions] = useState([]);

    async function getActiveSessions() {
        const response = await axios.get('/auth/getActiveSessions');
        setActiveSessions(response.data);
        console.log(response.data);
    }
    useEffect(() => {
        getActiveSessions();
    }, []);
    async function deleteSession(id: number) {
        const response = await axios.delete(`/auth/deleteSession/${id}`);
        getActiveSessions();
        toast.success('Session deleted');
        
        console.log(response.data);
    }
    function DeviceCard({ session }: { session: any }) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/30">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold leading-none mb-1.5 truncate">
                            {session.ip_address}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1 truncate" title={session.user_agent}>
                            {session.user_agent}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            Ostatnia aktywność: {new Date(session.last_activity * 1000).toLocaleString()}
                        </p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" type="button" className="w-full sm:w-auto shrink-0" onClick={() => deleteSession(session.id)}>
                    Wyloguj
                </Button>
            </div>
        );
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="top-center" richColors />
            <Head title="Sessions settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Sessions settings" description="Check out devices where you are logged in." />
                    {activeSessions.map((session) => (
                        <DeviceCard key={session.id} session={session} />
                    ))}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
