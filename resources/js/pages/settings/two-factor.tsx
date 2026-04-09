import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Shield, ShieldAlert, ShieldCheck, Key, RefreshCw } from 'lucide-react';

import settings from '@/routes/settings';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-factor authentication',
        href: '#',
    },
];

export default function TwoFactor() {
    const { auth } = usePage<SharedData>().props;
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmationCode, setConfirmationCode] = useState('');

    const twoFactorEnabled = (auth.user as any).two_factor_enabled;

    useEffect(() => {
        if (twoFactorEnabled) {
            showRecoveryCodes();
        }
    }, [twoFactorEnabled]);

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        router.post('/user/two-factor-authentication', {}, {
            preserveScroll: true,
            onSuccess: () => {
                showQrCode();
                showRecoveryCodes();
                setConfirming(true);
            },
            onFinish: () => setEnabling(false),
        });
    };

    const confirmTwoFactorAuthentication = () => {
        router.post('/user/confirmed-two-factor-authentication', {
            code: confirmationCode,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                setConfirmationCode('');
                toast.success('Two-factor authentication confirmed.');
            },
            onError: () => {
                toast.error('Invalid confirmation code.');
            }
        });
    };

    const showQrCode = () => {
        axios.get('/user/two-factor-qr-code').then(response => {
            setQrCode(response.data.svg);
        });
    };

    const showRecoveryCodes = () => {
        axios.get('/user/two-factor-recovery-codes').then(response => {
            setRecoveryCodes(response.data);
        });
    };

    const regenerateRecoveryCodes = () => {
        router.post('/user/two-factor-recovery-codes', {}, {
            onSuccess: () => showRecoveryCodes(),
        });
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                toast.info('Two-factor authentication disabled.');
            },
            onFinish: () => setDisabling(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-factor authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Two-Factor Authentication" 
                        description="Add additional security to your account using two-factor authentication." 
                    />

                    <div className="p-4 rounded-lg border dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-start gap-4">
                        {twoFactorEnabled ? (
                            <ShieldCheck className="h-6 w-6 text-green-500 mt-1" />
                        ) : (
                            <ShieldAlert className="h-6 w-6 text-yellow-500 mt-1" />
                        )}
                        <div>
                            <h3 className="font-semibold text-sm">
                                {twoFactorEnabled 
                                    ? 'Two-factor authentication is enabled.' 
                                    : 'You have not enabled two-factor authentication.'
                                }
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2 md:line-clamp-none">
                                When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
                            </p>
                        </div>
                    </div>

                    {!twoFactorEnabled && !confirming && (
                        <Button onClick={enableTwoFactorAuthentication} disabled={enabling}>
                            {enabling ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Enable 2FA
                        </Button>
                    )}

                    {confirming && (
                        <div className="space-y-6 border-l-2 border-blue-500 pl-6 py-2">
                            <div className="space-y-2">
                                <Label>Scan this QR Code</Label>
                                <div className="p-2 bg-white rounded-md w-fit" dangerouslySetInnerHTML={{ __html: qrCode || '' }} />
                                <p className="text-xs text-muted-foreground">
                                    To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application and provide the generated TOTP code.
                                </p>
                            </div>

                            <div className="max-w-xs space-y-3">
                                <Label htmlFor="code">Confirmation Code</Label>
                                <Input 
                                    id="code" 
                                    value={confirmationCode} 
                                    onChange={e => setConfirmationCode(e.target.value)} 
                                    placeholder="000000"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={confirmTwoFactorAuthentication}>Confirm</Button>
                                    <Button variant="ghost" onClick={disableTwoFactorAuthentication}>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {twoFactorEnabled && (
                        <div className="space-y-8">
                            {recoveryCodes.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4 text-blue-500" />
                                            <Label>Recovery Codes</Label>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={regenerateRecoveryCodes}>
                                            <RefreshCw className="mr-2 h-3 w-3" />
                                            Regenerate
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-xs">
                                        {recoveryCodes.map(code => (
                                            <div key={code}>{code}</div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t dark:border-neutral-800">
                                <Button variant="destructive" onClick={disableTwoFactorAuthentication} disabled={disabling}>
                                    {disabling ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Disable 2FA
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
