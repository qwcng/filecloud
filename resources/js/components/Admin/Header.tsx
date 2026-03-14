import React,{useState} from "react";
import { Menu } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { SharedData } from "@/types";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
     const { auth } = usePage<SharedData>().props;  

    return (
                <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#FDFDFC]/80 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/80">
                    <div className="flex h-20 items-center justify-between px-6 lg:px-10 max-w-7xl mx-auto w-full">
                        <a className="flex items-center gap-2" href="/">
                            <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
                            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#2013d8] to-[#09beec] bg-clip-text text-transparent">
                                Versec Drive
                            </span>
                        </a>

                        {/* Mobile Menu Button */}
                        <button title="Menu" className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Pricing</a>
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Products</a>
                            <a className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">About Us</a>
                            {auth.user ? (
                                <a href='/dashboard' className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer">
                                    Dashboard
                                </a>
                            ) : (
                                <>
                            <a href='/login' className="text-neutral-700 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer">Login</a>
                            <a href='/register' className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-white shadow-sm hover:shadow-md hover:scale-[1.02] transition cursor-pointer">
                                Get Started
                            </a>
                            </>
                            )}
                        </nav>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="md:hidden border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col gap-4">
                            <a className="font-medium text-lg">Pricing</a>
                            <a className="font-medium text-lg">Products</a>
                            <a className="font-medium text-lg">About Us</a>
                            <hr className="dark:border-neutral-800" />
                            {auth.user ? (
                                <a href='/dashboard' className="font-medium text-lg">Dashboard</a>
                            ) : (
                                <a href='/login' className="font-medium text-lg">Login</a>
                            )}
                            <a href='/register' className="rounded-lg bg-blue-500 py-3 text-center text-white">Get Started</a>
                        </div>
                    )}
                </header>
    );
}