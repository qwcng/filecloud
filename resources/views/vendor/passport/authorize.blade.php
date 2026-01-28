<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autoryzacja Versec</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">

    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            
            <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white text-center">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <span class="text-2xl font-bold italic">V</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight">Versec Identity</h1>
                <p class="text-indigo-100 text-sm mt-1">Bezpieczne logowanie SSO</p>
            </div>

            <div class="p-8">
                <div class="text-center mb-8">
                    <p class="text-slate-600">
                        Aplikacja <span class="font-semibold text-slate-900">{{ $client->name }}</span> 
                        prosi o dostęp do Twojego profilu.
                    </p>
                </div>

                <div class="space-y-3">
                    <form method="post" action="{{ route('passport.authorizations.approve') }}">
                        @csrf
                        <input type="hidden" name="state" value="{{ $request->state }}">
                        <input type="hidden" name="client_id" value="{{ $client->id }}">
                        <input type="hidden" name="auth_token" value="{{ $authToken }}">
                        
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 transform active:scale-[0.98] shadow-lg shadow-indigo-200">
                            Zezwól i kontynuuj
                        </button>
                    </form>

                    <form method="post" action="{{ route('passport.authorizations.deny') }}">
                        @csrf
                        @method('delete')
                        <input type="hidden" name="state" value="{{ $request->state }}">
                        <input type="hidden" name="client_id" value="{{ $client->id }}">
                        
                        <button type="submit" class="w-full bg-white hover:bg-slate-50 text-slate-500 font-medium py-3 px-4 rounded-xl border border-slate-200 transition duration-200">
                            Anuluj dostęp
                        </button>
                    </form>
                </div>
            </div>

            <div class="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                <p class="text-xs text-slate-400 uppercase tracking-widest font-medium">
                    &copy; 2026 Versec Cloud Service
                </p>
            </div>
        </div>

        <p class="text-center text-slate-400 text-sm mt-6">
            Zostaniesz przekierowany do: <br>
            <span class="text-slate-500 break-all font-mono text-xs">{{ $client->redirect }}</span>
        </p>
    </div>

</body>
</html>