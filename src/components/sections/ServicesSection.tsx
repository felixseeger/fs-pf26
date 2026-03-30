'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Code2, Palette, Smartphone, TrendingUp, Rocket, Headphones, type LucideIcon } from 'lucide-react';
import DestructServicesCard from '@/components/services/DestructServicesCard';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';

/** Service item: supports WP (iconUrl from services_gallery) or legacy (Lucide icon) */
export interface Service {
  id: string;
  /** Lucide icon component (legacy) */
  icon?: LucideIcon;
  /** Icon image URL from services_gallery or featured image */
  iconUrl?: string;
  /** Alt text for icon image */
  iconAlt?: string;
  title: string;
  description: string;
  /** Link to service detail page */
  slug?: string;
  /** Deliverables for physics explosion effect (from acf.deliverables) */
  deliverables?: string[];
}

interface ServicesSectionProps {
  services?: Service[];
  className?: string;
}

const defaultServices: Service[] = [
  { id: 'web-dev', icon: Code2, title: 'Web Development', description: 'Custom websites and web applications built with modern technologies for optimal performance.' },
  { id: 'ui-ux', icon: Palette, title: 'UI/UX Design', description: 'User-centered design solutions that create engaging and intuitive digital experiences.' },
  { id: 'mobile', icon: Smartphone, title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver seamless user experiences.' },
  { id: 'strategy', icon: TrendingUp, title: 'Digital Strategy', description: 'Strategic planning and consulting to help your business thrive in the digital landscape.' },
  { id: 'branding', icon: Rocket, title: 'Brand Identity', description: 'Comprehensive branding solutions that establish a strong and memorable market presence.' },
  { id: 'support', icon: Headphones, title: 'Support & Maintenance', description: 'Ongoing support and maintenance to keep your digital products running smoothly.' },
];

export default function ServicesSection({
  services = defaultServices,
  className = '',
}: ServicesSectionProps) {
  const t = useTranslations('services');
  return (
    <section
      className={`py-24 md:py-40 relative overflow-hidden ${className}`}
      id="services"
      style={{ isolation: 'isolate', backgroundColor: '#011627' }}
    >
      <DotMatrixStatic color="#a3e635" dotSize={2} spacing={20} opacity={0.1} className="-z-10" />

      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10">
          <span className="text-[10px] font-unbounded font-black uppercase tracking-[0.4em] text-zinc-500">
            {t('label')}
          </span>
          <span className="text-[10px] font-unbounded tracking-widest text-zinc-600 tabular-nums">
            {services.length.toString().padStart(2, '0')} {t('disciplines')}
          </span>
        </div>

        {/* Service rows */}
        <div>
          {services.map((service, index) => {
            const rowInner = (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="group flex items-start gap-5 md:gap-8 py-8 md:py-10 border-b border-white/10 cursor-pointer">
                  {/* Index */}
                  <span className="shrink-0 pt-1 md:pt-2 text-[10px] font-unbounded font-black text-zinc-600 tabular-nums">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>

                  {/* Title + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start md:items-center justify-between gap-4">
                      <h3 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-unbounded font-black uppercase text-white leading-none transition-colors duration-300 group-hover:text-primary break-words">
                        {service.title}
                      </h3>
                      <ArrowUpRight
                        className="shrink-0 w-5 h-5 md:w-6 md:h-6 mt-0.5 text-zinc-700 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500 max-w-xl leading-relaxed opacity-0 -translate-y-1 transition-all duration-300 delay-75 group-hover:opacity-100 group-hover:translate-y-0">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );

            const rowWithPhysics = service.deliverables?.length ? (
              <DestructServicesCard deliverables={service.deliverables} className="h-full">
                {rowInner}
              </DestructServicesCard>
            ) : rowInner;

            return (
              <div key={service.id}>
                {service.slug ? (
                  <Link href={`/services/${service.slug}`} className="block">
                    {rowWithPhysics}
                  </Link>
                ) : rowWithPhysics}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 md:mt-24 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            {t('ctaTagline')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 self-start sm:self-auto bg-primary text-primary-foreground font-unbounded font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300"
          >
            {t('ctaButton')}
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
