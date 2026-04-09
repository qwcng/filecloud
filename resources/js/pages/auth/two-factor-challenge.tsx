import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck, Key } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const toggleRecovery = () => {
        setRecovery(!recovery);
        reset('code', 'recovery_code');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/two-factor-challenge', {
            onFinish: () => reset('code', 'recovery_code'),
        });
    };

    return (
        <AuthLayout
            title={recovery ? 'Recovery Code' : 'Two-Factor Authentication'}
            description={
                recovery
                    ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                    : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'
            }
        >
            <Head title="Two-factor Confirmation" />

            <div className="mb-8 flex justify-center text-primary">
                {recovery ? <Key className="h-12 w-12" /> : <ShieldCheck className="h-12 w-12" />}
            </div>

            <form onSubmit={submit} className="space-y-6">
                {!recovery ? (
                    <div className="grid gap-2">
                        <Label htmlFor="code">Authentication Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            name="code"
                            autoFocus
                            autoComplete="one-time-code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="000000"
                        />
                        <InputError message={errors.code} />
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="recovery_code">Recovery Code</Label>
                        <Input
                            id="recovery_code"
                            type="text"
                            name="recovery_code"
                            autoComplete="one-time-code"
                            value={data.recovery_code}
                            onChange={(e) => setData('recovery_code', e.target.value)}
                            placeholder="abcdef-123456"
                        />
                        <InputError message={errors.recovery_code} />
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <Button className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Confirm Access
                    </Button>

                    <button
                        type="button"
                        onClick={toggleRecovery}
                        className="text-center text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                        {recovery ? 'Use an authentication code' : 'Use a recovery code'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
}
