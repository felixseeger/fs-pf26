'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Code2, Palette, Smartphone, TrendingUp, Rocket, Headphones, ChevronRight, LucideIcon } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
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
  className = ''
}: ServicesSectionProps) {
  return (
    <section className={`py-24 md:py-40 bg-white dark:bg-background relative overflow-hidden ${className}`} id="services" style={{ isolation: 'isolate' }}>
      <DotMatrixStatic color="#3b82f6" dotSize={2} spacing={20} opacity={0.18} className="-z-10" />
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-unbounded font-bold uppercase tracking-widest text-primary">
              Services
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-unbounded font-black text-zinc-900 dark:text-white">
            What I Do
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const cardContent = (
              <TiltCard
                className="group p-8 rounded-2xl
                          bg-zinc-100 dark:bg-zinc-900
                          hover:bg-primary dark:hover:bg-primary
                          cursor-pointer"
              >
                {service.iconUrl ? (
                  <div className="featured-image-write-in mb-6 w-12 h-12 service-icon service-icon-blue relative shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={service.iconUrl}
                      alt={service.iconAlt || `${service.title} icon`}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full transition-[filter] duration-300 group-hover:brightness-0"
                    />
                  </div>
                ) : Icon ? (
                  <div className="mb-6 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 dark:text-primary group-hover:text-black dark:group-hover:text-black transition-colors duration-300">
                    <Icon className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="mb-6 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 dark:text-primary group-hover:text-black dark:group-hover:text-black transition-colors duration-300">
                    <Code2 className="w-12 h-12" strokeWidth={1.5} />
                  </div>
                )}

                <h3 className="text-2xl font-unbounded font-bold mb-4
                              text-zinc-900 dark:text-white
                              group-hover:text-black dark:group-hover:text-black
                              transition-colors duration-300">
                  {service.title}
                </h3>

                <p className="text-zinc-600 dark:text-zinc-400
                            group-hover:text-black/70 dark:group-hover:text-black/70
                            transition-colors duration-300
                            leading-relaxed">
                  {service.description}
                </p>

                {service.slug && (
                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold
                                  text-blue-500 dark:text-lime-400
                                  group-hover:text-black dark:group-hover:text-black
                                  transition-colors duration-300">
                    Read more
                    <ChevronRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                )}
              </TiltCard>
            );

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {service.slug ? (
                  <Link href={`/services/${service.slug}`} className="block h-full">
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
