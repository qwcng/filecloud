import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { type SharedData } from '@/types';
import Header from '@/components/Admin/Header';
import Footer from '@/components/Admin/Footer';

export default function PrivacyPolicyPage() {
    const { auth } = usePage<SharedData>().props;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <>
            <Head>
                <title>Privacy Policy - Versec Drive</title>
                <meta name="description" content="Privacy Policy for Versec Drive. Information about data collection, processing, storage, and users' rights." />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] font-sans">
                {/* HEADER */}
                <Header/>

                {/* MAIN CONTENT */}
                <main className="w-full flex-grow">
                    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0D121B] dark:text-white mb-6 tracking-tight">Privacy Policy</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                            This Privacy Policy ("Policy") applies to the website and online services available at <a href="https://filecloud.ct8.pl" className="text-blue-500 underline">https://filecloud.ct8.pl</a> (the "Service"), hereinafter referred to as "Versec Drive", "We", "Us", or "Our". This Policy describes how We collect, use, disclose, and protect personal data of users ("You" or "Your") when accessing or using the Service.
                        </p>

                        {/* Section 1 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">1. Data Controller</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                The data controller responsible for processing personal data is Versec Drive. 
                                For inquiries regarding personal data, contact us at: <a href="mailto:support@filecloud.ct8.pl" className="text-blue-500 underline">support@filecloud.ct8.pl</a>.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">2. Information We Collect</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                We may collect the following categories of personal data:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                                <li>Account information including name, email address, password, and authentication data (e.g., Google OAuth).</li>
                                <li>Technical and usage information such as IP address, device type, browser type, operating system, and service usage logs.</li>
                                <li>Content uploaded to the Service, including files, documents, images, and videos.</li>
                                <li>File metadata including file names, sizes, types, and creation dates.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">3. Purpose and Legal Basis of Data Processing</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                We process personal data for legitimate purposes, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                                <li>Provision and improvement of the Service – <strong>Legal basis:</strong> performance of a contract and/or legitimate interest.</li>
                                <li>Account security, fraud prevention, and monitoring – <strong>Legal basis:</strong> legitimate interest.</li>
                                <li>Customer support and service communications – <strong>Legal basis:</strong> consent or legitimate interest.</li>
                                <li>Marketing communications – <strong>Legal basis:</strong> consent, if given.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">4. Data Storage, Security, and Retention</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                All data stored in the Service is encrypted using industry-standard AES-256 encryption. Account information is stored in secure databases. Temporary data caches and background processes use Redis. Backups are performed regularly. Access to personal data is restricted to authorized personnel only.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                                Personal data is retained only as long as necessary to provide the Service, comply with legal obligations, or resolve disputes. Typical retention periods are as follows:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                                <li>Account information – until account deletion or 24 months of inactivity.</li>
                                <li>Uploaded files and metadata – until deletion by the user or account termination.</li>
                                <li>Logs and analytics – typically for 12 months.</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">5. Data Sharing and Third Parties</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                We do not sell or rent your personal data. Data may be shared under the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                                <li>With service providers (e.g., cloud hosting, analytics, email delivery) bound by contractual obligations to protect personal data.</li>
                                <li>With law enforcement, regulators, or authorities as required by applicable law.</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                                Some third-party services may process data outside your jurisdiction. We ensure that any international transfer of personal data is carried out in compliance with applicable data protection laws, using standard contractual clauses or equivalent safeguards.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">6. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                We use cookies and local storage to manage sessions, preferences, and analytics. You may control or withdraw consent via browser settings. Non-essential cookies are only deployed after explicit consent.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">7. Your Rights</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Under applicable data protection laws, you have the following rights:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                                <li>Access your personal data.</li>
                                <li>Request correction of inaccurate data.</li>
                                <li>Request deletion or restriction of processing.</li>
                                <li>Object to certain processing activities.</li>
                                <li>Withdraw consent at any time.</li>
                            </ul>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                                To exercise these rights, contact us at: <a href="mailto:support@filecloud.ct8.pl" className="text-blue-500 underline">support@filecloud.ct8.pl</a>.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">8. Changes to This Policy</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                We may update this Privacy Policy from time to time. Changes take effect immediately upon posting to the Service. We encourage users to review this page periodically.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section>
                            <h2 className="text-2xl font-semibold text-[#0D121B] dark:text-white mb-3">9. Contact Information</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                For questions or concerns regarding this Privacy Policy or our data practices, contact us at: <a href="mailto:support@filecloud.ct8.pl" className="text-blue-500 underline">support@filecloud.ct8.pl</a>.
                            </p>
                        </section>
                    </div>
                </main>

                {/* FOOTER */}
                <Footer/>
            </div>
        </>
    );
}