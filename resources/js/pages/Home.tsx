// CloudVaultLandingPage.tsx

import React from 'react';
import {
  Cloud,
  CheckCircle,
  Lock,
  Users,
  UploadCloud,
  ArrowRight,
  Diamond,
  Rocket,
  Bolt,
  Globe,
  Feather,
  Twitter,
  Github,
  Linkedin,
  Quote,
  Check,
} from 'lucide-react';

// --- Konfiguracja Tailwind (dla referencji, kolory powinny być w tailwind.config.js) ---
const COLORS = {
  primary: "#135bec",
  backgroundLight: "#f6f6f8",
  backgroundDark: "#101622",
  textLight: "#0d121b",
  textDark: "white",
};

// --- Komponenty Wtórne ---

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'ghost' | 'ctaLight' | 'ctaTransparent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant, size = 'md', className = '', onClick }) => {
  const baseClasses = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg leading-normal transition-all font-bold";
  let variantClasses = '';
  let sizeClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = `bg-[${COLORS.primary}] hover:bg-[${COLORS.primary}/90] text-white shadow-lg shadow-[${COLORS.primary}/25]`;
      break;
    case 'secondary':
      variantClasses = "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-textLight dark:text-textDark hover:bg-gray-50 dark:hover:bg-gray-700";
      break;
    case 'ghost':
      variantClasses = "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-textLight dark:text-textDark";
      break;
    case 'ctaLight':
      variantClasses = `bg-white text-[${COLORS.primary}] hover:bg-gray-100 shadow-lg`;
      break;
    case 'ctaTransparent':
      variantClasses = "bg-transparent border border-white/30 text-white hover:bg-white/10";
      break;
  }

  switch (size) {
    case 'sm':
      sizeClasses = 'h-10 px-4 text-sm min-w-[84px]';
      break;
    case 'md':
      sizeClasses = 'h-12 px-6 text-base min-w-[160px]';
      break;
    case 'lg':
        sizeClasses = 'h-14 px-8 text-lg min-w-[200px]';
        break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} onClick={onClick}>
      <span className="truncate">{children}</span>
    </button>
  );
};

// --- Sekcje Strony ---

const Header: React.FC = () => (
  <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid  dark:bg-black/10  bg-white/80 dark:bg-background-dark backdrop-blur-md px-10 py-3">
    <div className={`flex items-center gap-4 text-[${COLORS.textLight}] dark:text-white `}>
      <div className={`size-8 text-[${COLORS.primary}]`}>
        {/* Zastąpienie material-symbols-outlined: cloud_circle */}
        {/* <Cloud className="w-8 h-8" /> */}
        <img src='logo.png' className='w-8 h-8'/>
      </div>
      <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">VersecDrive</h2>
    </div>
    <div className="flex flex-1 justify-end gap-8">
      <div className="hidden md:flex items-center gap-9">
        <a className={`text-sm font-medium hover:text-[${COLORS.primary}] transition-colors`} href="#">Product</a>
        <a className={`text-sm font-medium hover:text-[${COLORS.primary}] transition-colors`} href="#">Solutions</a>
        <a className={`text-sm font-medium hover:text-[${COLORS.primary}] transition-colors`} href="#">Pricing</a>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={()=>{ window.location.href= "/login"}}>Log In</Button>
        <Button variant="primary" size="sm" onClick={()=>{ window.location.href= "/register"}}>Get Started</Button>
      </div>
    </div>
  </header>
);

const HeroSection: React.FC = () => (
  <div className="font-inter relative flex w-full flex-col justify-center py-10 lg:py-20 bg-background-light dark:bg-background-dark overflow-hidden">
    {/* Dekoracyjne elementy tła */}
    <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
    
    <div className="layout-container flex h-full grow flex-col z-10">
      <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          <div className="@container">
            <div className="flex flex-col gap-10 lg:gap-16 lg:flex-row items-center">
              
              <div className="flex flex-col gap-6 lg:w-1/2 text-left">
                <div className="flex flex-col gap-4">
                  <div className={`inline-flex w-fit items-center gap-2 rounded-full border border-[${COLORS.primary}/20] bg-[${COLORS.primary}/5] px-3 py-1 text-xs font-medium text-[${COLORS.primary}]`}>
                    <span className="relative flex h-2 w-2">

                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[${COLORS.primary}] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[${COLORS.primary}]"></span>
                    </span>
                    New: Team Collaboration Features
                  </div>
                  <h1 className={`text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl text-[${COLORS.textLight}] dark:text-white`}>
                    Secure Your Data.<br/>
                    <span className={` text-blue-500`}>Unleash Collaboration.</span>
                  </h1>
                  <h2 className="text-base font-normal leading-relaxed text-gray-600 dark:text-gray-300 md:text-lg max-w-[540px]">
                    Store, share, and access your files from anywhere. The secure cloud storage solution built for modern teams who need speed and reliability.
                  </h2>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="primary" size="md">Start for Free</Button>
                  <Button variant="secondary" size="md">View Pricing</Button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex -space-x-2">
                    {/* Zastąpienie data-alt i style inline w React */}
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark bg-gray-200"
                            style={{ backgroundImage: `url("http://googleusercontent.com/profile/picture/${i}")`, backgroundSize: 'cover' }}
                            data-alt={`Portrait of user ${i}`}
                        />
                    ))}
                  </div>
                  <p>Trusted by 10,000+ teams</p>
                </div>
              </div>

              {/* Obrazek Hero */}
              <div className="w-full lg:w-1/2">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-2">
                  <div className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl"
                      data-alt="Abstract 3D illustration of cloud servers and data nodes in purple and blue"
                      style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0YiXL6TJWP58MgBoN2k4FSMj2gd72mTEQdyFgMENZ-8AFv_-PCUkqQnTl86u49nYhJZ3JwJrIXfimiZ0PjO_p6gEUEj77MZWpFvWiQwNglctbfT-wHmvE8qFSowhobI3eGgfHzMLzVhjAPSOP2DPh-1_uG6oq47S9L4sJLBZEVMKmn0fOlVgFKt_gv-rIZHqus24S4TynObl_ZxRA-qxsG-1wCudws5hjhJKCCD5rqkkoAe0GQsWyK9TG9y-nayg3PgCiz-hgmmQ")` }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-purple-600/40 mix-blend-multiply"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LogosSection: React.FC = () => {
    const logos = [
        { icon: Diamond, name: "Acme Corp" },
        { icon: Rocket, name: "StarTech" },
        { icon: Bolt, name: "FastNet" },
        { icon: Globe, name: "GlobalSys" },
        { icon: Feather, name: "EcoVibe" },
    ];

    return (
        <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-black/10 border-y border-gray-100 dark:border-gray-800">
            <div className="px-4 text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Powering data for world-class companies</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200">
                            <logo.icon className="w-6 h-6" />
                            {logo.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Lock,
      color: "blue",
      title: "Bank-Grade Security",
      description: "Your files are encrypted with 256-bit AES protection both in transit and at rest.",
    },
    {
      icon: Users,
      color: "purple",
      title: "Real-time Collaboration",
      description: "Edit documents, comment, and assign tasks together with your team in real-time.",
    },
    {
      icon: UploadCloud,
      color: "indigo",
      title: "Infinite Scalability",
      description: "Start small and grow big. Pay only for what you use and upgrade storage instantly.",
    },
  ];

  return (
    <div className="relative flex w-full flex-col bg-background-light dark:bg-background-dark py-20">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-4 text-center items-center">
                <h2 className={`text-[${COLORS.textLight}] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] max-w-[720px]`}>
                  Everything you need to manage your digital life
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-normal leading-normal max-w-[600px]">
                  Robust features designed to give you peace of mind and improve your workflow efficiency.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                    const iconColor = feature.color === 'blue' ? COLORS.primary : feature.color === 'purple' ? 'text-purple-600' : 'text-indigo-600';
                    const hoverBgColor = feature.color === 'blue' ? COLORS.primary : feature.color === 'purple' ? 'bg-purple-600' : 'bg-indigo-600';
                    const bgColor = feature.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' : feature.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20';

                    return (
                        <div key={index} className={`group flex flex-col gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-8 shadow-sm hover:shadow-xl hover:border-[${COLORS.primary}/30] transition-all duration-300`}>
                            <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center ${iconColor} group-hover:${hoverBgColor} group-hover:text-white transition-colors duration-300`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className={`text-[${COLORS.textLight}] dark:text-white text-xl font-bold leading-tight`}>{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SplitFeatureSection: React.FC = () => (
    <div className="py-20 bg-white dark:bg-gray-900">
        <div className="layout-container px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="layout-content-container max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Obrazki/Wizualizacje */}
                <div className="order-2 lg:order-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] bg-cover bg-center shadow-lg transform translate-y-8" 
                            data-alt="Team working together around a laptop"
                            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZpWe6UsIiwPwXpVeOJvOGWsTdXlcfUlIRgjWiNtnqAKq0nvV3ET-ClPQDUHzOV9169CiujbxTG3tL8JmHxVvctqMuMABDse73nChO6DxbQQZAImJ-sjHOw_4jTuqFqzavKMoaAKiQ4Dq2gnhDvdULsfyWSt23UC_uH_jOyVT8wx8oeVR6kqwJXjQ6jGYDT0H2iVNIJXS3CBPwEw7bDCGYL5dqGFHJ814VgZMtpoKf1cEdHLM_-6lkw4G453x-oVyYBl-LFjUvY0Y')` }}
                        />
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] bg-cover bg-center shadow-lg" 
                            data-alt="Modern dashboard interface on a screen"
                            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBTNDVtxklrDTMTnfYUtnyqhSMexGPdo0TV1OEhSUEPgcbBh2ZfmU7gVhLTyS9xnA8ytj2hfyT2oRrDnyphmmJkvj9P4GJo_qtjcktbmswpFYk0wdTQb1kb14wxVmGpLd9wLLQmJSosxTWpZbN2YpSW1fSAYv6N3oT9IjiNgTnW40tZgho9hh_y2FaB98tE6s2PccbjgRQSd3nVdF2ovSol7SVobieFDtVsElu8DKUYpcHzhcopcihggOwuH7kl35GPVOyp9Ned6zY')` }}
                        />
                    </div>
                </div>

                {/* Tekst / Lista Cech */}
                <div className="order-1 lg:order-2 flex flex-col gap-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Seamless integration with your favorite tools</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Don't change how you work. CloudVault integrates directly with Slack, Microsoft Office, Google Workspace, and Adobe Creative Cloud.
                    </p>
                    <ul className="flex flex-col gap-3 mt-2">
                        {[
                            "Automatic syncing across all devices",
                            "Granular access permissions",
                            "Version history up to 30 days"
                        ].map((item, index) => (
                            <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                {/* Zastąpienie material-symbols-outlined: check_circle */}
                                <Check className={`w-5 h-5 text-blue-600`} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <button className={`mt-4 w-fit text-blue-600 font-bold hover:underline flex items-center gap-1`}>
                        Learn more about integrations <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const TestimonialSection: React.FC = () => (
    <div className="py-24 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <div className="layout-container px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="max-w-[800px] text-center flex flex-col gap-8 items-center">
                {/* Zastąpienie material-symbols-outlined: format_quote */}
                <Quote className={`w-14 h-14 text-[${COLORS.primary}/20]`} /> 
                <h3 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed">
                    "This platform completely changed how we handle our creative assets. It's fast, secure, and the collaboration features are intuitive. We've saved countless hours."
                </h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 bg-cover bg-center" 
                        data-alt="Portrait of Sarah Jenkins" 
                        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJ1a7-xC8mcbysdyVaY5YULnYPjPZgWWiyqg96fXu-D4eTzxIiiTZR49ZkWWkN9MnK5Xl5QJ4MoyNnaansL0LlzAo4uEcuzHWSw9Gl-t6dbLCgxv7qFAqGYyKrW6ulk5Dm4KA7n80fNa8PEyCr2ITVKuHBRsVHd230hxOXAFm3g1M4VwEbiEHjaNY3IefDK6L9kVJnshc5xVuwaHVK32TTLMYG_VlNk4OEZl4Coyb1SYDE8W-5-g98cusdr05OpzYJcy9HR7HGIz0')` }}
                    />
                    <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white">Sarah Jenkins</div>
                        <div className="text-sm text-gray-500">CTO at TechFlow</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CTASection: React.FC = () => (
    <div className="py-20 px-4 md:px-10">
        <div className={`max-w-[1200px] mx-auto bg-[${COLORS.primary}] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative`}>
            {/* Background Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/30 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="relative z-10 flex flex-col gap-4 max-w-[600px] text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to secure your data?</h2>
                <p className="text-blue-100 text-lg">Join thousands of teams who trust CloudVault. Start your free 14-day trial today. No credit card required.</p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button variant="ctaLight" size="md" className="w-full md:w-auto">Get Started Now</Button>
                <Button variant="ctaTransparent" size="md" className="w-full md:w-auto">Contact Sales</Button>
            </div>
        </div>
    </div>
);

const Footer: React.FC = () => (
    <footer className="bg-white dark:bg-black/10 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="px-4 md:px-10 lg:px-40 max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                
                <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 pr-8">
                    <div className={`flex items-center gap-2 text-[${COLORS.textLight}] dark:text-white`}>
                        {/* Zastąpienie material-symbols-outlined: cloud_circle */}
                        {/* < className={`w-6 h-6 text-[${COLORS.primary}]`} />
                         */}
                            <img src='logo.png' className={`w-6 h-6`}/>
                        <span className="font-bold text-lg">Versec Drive</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[300px]">
                        Secure, reliable, and scalable cloud storage solutions tailored for modern businesses and individuals.
                    </p>
                </div>
                
                {/* Kolumny linków */}
                {[
                    { title: "Product", links: ["Features", "Integrations", "Enterprise", "Pricing"] },
                    { title: "Resources", links: ["Documentation", "API Reference", "Community", "Blog"] },
                    { title: "Company", links: ["About Us", "Careers", "Legal", "Contact"] },
                ].map((section, index) => (
                    <div key={index} className="flex flex-col gap-4">
                        <h4 className="font-bold text-gray-900 dark:text-white">{section.title}</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-500">
                            {section.links.map((link, linkIndex) => (
                                <li key={linkIndex}><a className={`hover:text-[${COLORS.primary}] transition-colors`} href="#">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-400">© 2023 Versec Inc. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0 text-gray-400">
                    <a className={`hover:text-[${COLORS.primary}] transition-colors flex items-center gap-1`} href="#"><Twitter className="w-4 h-4" /> Twitter</a>
                    <a className={`hover:text-[${COLORS.primary}] transition-colors flex items-center gap-1`} href="#"><Github className="w-4 h-4" /> GitHub</a>
                    <a className={`hover:text-[${COLORS.primary}] transition-colors flex items-center gap-1`} href="#"><Linkedin className="w-4 h-4" /> LinkedIn</a>
                </div>
            </div>
        </div>
    </footer>
);


// --- Główny Komponent Strony ---

const CloudVaultLandingPage: React.FC = () => {
  // Dla uproszczenia, zakładamy, że klasa 'dark' jest zarządzana na poziomie body lub html przez zewnętrzny system (np. useDarkMode hook)
  // W React, najlepiej użyć stanu do zarządzania motywem.
  // Poniższy kod przyjmuje, że klasa 'dark' jest obecna na elemencie <html> w razie potrzeby.

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <Header />
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <SplitFeatureSection />
        <TestimonialSection />
        <CTASection />
        <Footer />
    </div>
  );
};

export default CloudVaultLandingPage;