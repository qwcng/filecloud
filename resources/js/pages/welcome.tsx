import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check, CheckCircle, LockKeyhole, Users, Zap, ShieldCheck, BarChart3, ChevronLeft, ChevronRight, Menu, Dot } from 'lucide-react';
import React from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Stan dla menu mobilnego
    const slides = [1, 2, 3, 4];

    // Automatyczne przewijanie
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3500); // Zwiększyłem czas, by łatwiej było czytać
        return () => clearInterval(timer);
    }, []);

    

    return (
        <>
            <Head>
                <meta name="description" content="Versec Drive – Bezpieczne i prywatne przechowywanie plików w chmurze. Wykorzystaj szyfrowanie SHA-256, aby chronić swoje dane. Zacznij za darmo z 10GB pojemności!" />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <title>Versec Drive - Keep your files safe and private</title>
                <meta name="title" content="Versec Drive - Keep your files safe and private" />
                    <meta name="description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content="https://filecloud.ct8.pl" />
                    <meta property="og:title" content="Versec Drive - Keep your files safe and private" />
                    <meta property="og:description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="og:image" content="https://filecloud.ct8.pl/versec.jpg" />
                    <meta property="twitter:card" content="summary_large_image" />
                    <meta property="twitter:url" content="https://filecloud.ct8.pl" />
                    <meta property="twitter:title" content="Versec Drive - Keep your files safe and private" />
                    <meta property="twitter:description" content="Experience the ultimate cloud storage solution with Versec Drive. Store your files securely, share them effortlessly, and collaborate seamlessly with your team." />
                    <meta property="twitter:image" content="https://filecloud.ct8.pl/versec.jpg" />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] font-sans">
                
                {/* --- HEADER --- */}
                <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#FDFDFC]/80 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/80">
                    <div className="flex h-20 items-center justify-between px-6 lg:px-10 max-w-7xl mx-auto w-full">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
                            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#2013d8] to-[#09beec] bg-clip-text text-transparent">
                                Versec Drive
                            </span>
                        </div>

                        {/* Mobile Menu Button */}
                        <button title="Menu" className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Pricing</a>
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Products</a>
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">About Us</a>
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Login</a>
                            <a className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer">
                                Get Started
                            </a>
                        </nav>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="md:hidden border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col gap-4">
                            <a className="font-medium text-lg">Pricing</a>
                            <a className="font-medium text-lg">Products</a>
                            <a className="font-medium text-lg">About Us</a>
                            <hr className="dark:border-neutral-800" />
                            <a className="font-medium text-lg">Login</a>
                            <a className="rounded-lg bg-blue-500 py-3 text-center text-white">Get Started</a>
                        </div>
                    )}
                </header>

                <main className="w-full">
                    {/* --- HERO SECTION --- */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-7xl mx-auto px-6 py-12 lg:py-32">
                        <div className="w-full lg:w-1/2 text-left order-2 lg:order-1">
                            <div className="font-medium flex items-center gap-1 bg-[#135BEC]/5 rounded-full px-3 py-1 w-max mb-6 border border-[#135BEC]/20">
                                <Dot className="h-2 w-2 text-[#135BEC]" />
                                <span className="text-sm tracking-tight text-[#135BEC] font-semibold">SHA-256 encryption</span>
                            </div>
                            <h1 className="text-[40px] md:text-[52px] lg:text-[62px] font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                                Keep your files safe and <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">private</span>
                            </h1>
                            <p className="mt-6 text-base md:text-lg leading-7 md:leading-8 text-gray-600 dark:text-gray-300">
                                Experience the ultimate cloud storage solution with <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent font-bold">Versec Drive</span>. Store your files securely, share them effortlessly, and collaborate seamlessly with your team.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <a href="#" className="w-full sm:w-auto text-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition">
                                    Start for Free →
                                </a>
                                <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-1 hover:underline">
                                    View Pricing <span aria-hidden="true">→</span>
                                </a>
                            </div>
                            <div className="mt-10">
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <CheckCircle className="h-4 w-4 inline mr-2 text-green-500" /> 
                                    Trusted by over 10,000 users worldwide
                                </span>
                            </div>
                        </div>

                        {/* Carousel Container */}
                        <div className="w-full lg:w-1/2 relative order-1 lg:order-2 flex justify-center">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-20 blur-2xl rounded-[2rem]"></div>
                            <div className="relative w-full max-w-[320px] md:max-w-[380px] h-[55vh] md:h-[65vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                <div 
                                    className="flex h-full transition-transform duration-700 ease-in-out" 
                                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                >
                                    {slides.map((num) => (
                                        <div key={num} className="min-w-full h-full">
                                            <img 
                                                src={`/carusel/${num}.webp`} 
                                                alt={`Slide ${num}`} 
                                                className="w-full h-full object-cover select-none" 
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Navigation dots always visible */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                                    {slides.map((_, i) => (
                                        <button
                                            title={`Slide ${i + 1}`}
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={`h-2 transition-all duration-300 rounded-full ${
                                                currentSlide === i ? "w-8 bg-blue-500" : "w-2 bg-white/40"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- FEATURES GRID --- */}
                    <div className="w-full bg-gray-50 dark:bg-[#0d0d0d] py-16 md:py-24">
                        <div className="max-w-7xl mx-auto px-6 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold text-[#0D121B] dark:text-white mb-4 tracking-tight">Everything you need to manage your digital life</h2>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-12 md:mb-16 max-w-2xl mx-auto">Robust features designed to give you peace of mind and improve your workflow efficiency.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex flex-col items-start bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5 hover:border-blue-500/50 transition">
                                    <div className="flex items-center justify-center w-12 h-12 bg-[#135BEC]/10 rounded-xl mb-6">
                                        <LockKeyhole className="h-6 w-6 text-[#135BEC]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0D121B] dark:text-white mb-3">Secure Storage</h3>
                                    <p className="text-left text-gray-600 dark:text-gray-400 leading-relaxed">Your files are encrypted with 256-bit AES protection both in transit and at rest.</p>
                                </div>

                                <div className="flex flex-col items-start bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5 hover:border-purple-500/50 transition">
                                    <div className="flex items-center justify-center w-12 h-12 bg-[#9333EA]/10 rounded-xl mb-6">
                                        <Users className="h-6 w-6 text-[#9333EA]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0D121B] dark:text-white mb-3 text-left">Real-time Collaboration</h3>
                                    <p className="text-left text-gray-600 dark:text-gray-400 leading-relaxed">Edit documents, comment, and assign tasks together with your team in real-time.</p>
                                </div>

                                <div className="flex flex-col items-start bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5 hover:border-indigo-500/50 transition sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-center justify-center w-12 h-12 bg-[#4F46E5]/10 rounded-xl mb-6">
                                        <Zap className="h-6 w-6 text-[#4F46E5]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0D121B] dark:text-white mb-3">Infinite Scalability</h3>
                                    <p className="text-left text-gray-600 dark:text-gray-400 leading-relaxed">Start small and grow big. Pay only for what you use and upgrade storage instantly.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- FEATURE SHOWCASE --- */}
                    <section className="bg-white dark:bg-[#0a0a0a] py-16 md:py-32">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
                                <div className="lg:pr-8">
                                    <h2 className="text-base font-semibold text-blue-500 uppercase tracking-wider">Fast & Reliable</h2>
                                    <p className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">A better workflow</p>
                                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                        Our proprietary edge-computing technology ensures your files are uploaded to the nearest server, slashing latency.
                                    </p>
                                    <dl className="mt-10 space-y-8 text-base leading-7 text-gray-600 dark:text-gray-400">
                                        <div className="relative pl-10">
                                            <dt className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <ShieldCheck className="absolute left-0 h-6 w-6 text-blue-500" />
                                                End-to-end Sync
                                            </dt>
                                            <dd className="mt-1">Automated background syncing across all your devices.</dd>
                                        </div>
                                        <div className="relative pl-10">
                                            <dt className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <BarChart3 className="absolute left-0 h-6 w-6 text-blue-500" />
                                                Usage Analytics
                                            </dt>
                                            <dd className="mt-1">Detailed insights into how your team shares and consumes data.</dd>
                                        </div>
                                        <div className="relative pl-10">
                                            <dt className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Check className="absolute left-0 h-6 w-6 text-blue-500" />
                                                99.9% Uptime Guarantee
                                            </dt>
                                            <dd className="mt-1">Our robust infrastructure ensures your files are always accessible.</dd>
                                        </div>
                                    </dl>
                                </div>
                                <div className="flex justify-center">
                                    <div className="relative w-full max-w-[440px] group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-25"></div>
                                        <img src="/carusel/1.webp" alt="Workflow" className="relative rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-white/10 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- PRICING SECTION --- */}
                    <div id="pricing" className="w-full py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-[#0D121B] dark:text-white mb-4 tracking-tight">
                                    Simple, transparent <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">pricing</span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400">Choose the plan that best fits your storage needs.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                                {/* Free Plan */}
                                <div className="flex flex-col p-8 bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 transition hover:scale-[1.02]">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free</h3>
                                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                        <span className="text-4xl font-extrabold tracking-tight">$0</span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                                    </p>
                                    <ul className="mt-8 space-y-4 flex-1">
                                        {['10GB Secure Storage', 'Standard Encryption', 'Limited Sharing', 'Web Access Only'].map((feature) => (
                                            <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <Check className="h-4 w-4 text-blue-500 mr-3 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="#" className="mt-10 block w-full py-3 px-6 text-center rounded-xl border border-blue-500 text-blue-500 font-semibold transition">Get Started</a>
                                </div>

                                {/* Small Plan (Highlighted) */}
                                <div className="relative flex flex-col p-8 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border-2 border-blue-500 lg:scale-105 z-10">
                                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Small</h3>
                                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                        <span className="text-4xl font-extrabold tracking-tight">$9</span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                                    </p>
                                    <ul className="mt-8 space-y-4 flex-1">
                                        {['100GB Secure Storage', 'AES-256 Encryption', 'Unlimited Sharing', 'Priority Support'].map((feature) => (
                                            <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <Check className="h-4 w-4 text-blue-500 mr-3 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="#" className="mt-10 block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold">Try Small Plan</a>
                                </div>

                                {/* Pro Plan */}
                                <div className="flex flex-col p-8 bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5 transition hover:scale-[1.02] md:col-span-2 lg:col-span-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pro</h3>
                                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                        <span className="text-4xl font-extrabold tracking-tight">$24</span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
                                    </p>
                                    <ul className="mt-8 space-y-4 flex-1">
                                        {['2TB Secure Storage', 'Team Collaboration', 'Admin Dashboard', '24/7 Phone Support'].map((feature) => (
                                            <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                <Check className="h-4 w-4 text-blue-500 mr-3 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="#" className="mt-10 block w-full py-3 px-6 text-center rounded-xl border border-blue-500 text-blue-500 font-semibold transition">Go Pro</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- FINAL CTA & FOOTER --- */}
                    <div className="mx-auto max-w-7xl px-4 md:px-6 py-24">
                        <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 md:pt-24 shadow-2xl rounded-3xl text-center">
                            <h2 className="mx-auto max-w-2xl text-2xl md:text-4xl font-bold tracking-tight text-white">
                                Ready to secure your digital world?
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-gray-300">
                                Join over 10,000 users and get 10GB of secure storage for free, forever.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                                <a href="#" className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-sm font-semibold text-gray-900">Get Started Now</a>
                                <a href="#" className="text-sm font-semibold text-white">Contact Sales →</a>
                            </div>

                            <div className="relative mt-16 h-64 md:h-[450px] overflow-hidden">
                                <img src="/dashboard.png" alt="App" className="mx-auto w-[1200px] rounded-t-xl shadow-2xl ring-1 ring-white/10" />
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] py-12">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="h-6 w-auto opacity-70" />
                            <span className="font-semibold text-gray-900 dark:text-white">Versec Drive</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                            <a href="#" className="hover:text-blue-500">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-500">Terms of Service</a>
                            <a href="#" className="hover:text-blue-500">Cookies</a>
                        </div>
                        <p>&copy; 2026 Versec Drive. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}