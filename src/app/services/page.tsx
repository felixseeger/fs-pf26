import { Metadata } from 'next';
import { getServiceItems } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import ServiceGrid from '@/components/services/ServiceGrid';

export const metadata: Metadata = {
    title: 'Services',
    description: 'Web design, development, and digital strategy. Book a consultation or request a quote for your project.',
    alternates: { canonical: getCanonicalUrl('/services') },
};

export default async function ServicesPage() {
    const services = await getServiceItems(100);

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <main className="max-w-6xl mx-auto px-6 py-20">
                <header className="max-w-3xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
                        My <span className="text-blue-600 dark:text-blue-500">Services.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Comprehensive digital solutions tailored to your needs. From concept to execution, 
                        I deliver high-quality work that drives results.
                    </p>
                </header>

                <ServiceGrid services={services} />
            </main>
        </div>
    );
}
