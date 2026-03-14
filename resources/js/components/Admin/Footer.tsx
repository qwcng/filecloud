export default function Footer() {
    return (
<footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] py-12">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-6 w-auto opacity-70" />
                            <span className="font-semibold text-gray-900 dark:text-white">Versec Drive</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                            <a href="/privacy" className="hover:text-blue-500">Privacy Policy</a>
                            <a href="/privacy" className="hover:text-blue-500">Terms of Service</a>
                            <a href="/privacy" className="hover:text-blue-500">Cookies</a>
                        </div>
                        <p>&copy; 2026 Versec Drive. All rights reserved.</p>
                    </div>
                </footer>
    );
}