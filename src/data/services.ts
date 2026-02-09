import { Code2, Palette, Smartphone, TrendingUp, Rocket, Headphones, LucideIcon } from 'lucide-react';

export interface ServiceData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const defaultServices: ServiceData[] = [
  {
    id: 'web-dev',
    icon: Code2,
    title: 'Web Development',
    description: 'Custom websites and web applications built with modern technologies for optimal performance and scalability.',
  },
  {
    id: 'ui-ux',
    icon: Palette,
    title: 'UI/UX Design',
    description: 'User-centered design solutions that create engaging and intuitive digital experiences across all platforms.',
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile applications that deliver seamless user experiences on iOS and Android.',
  },
  {
    id: 'strategy',
    icon: TrendingUp,
    title: 'Digital Strategy',
    description: 'Strategic planning and consulting to help your business thrive in the digital landscape and reach your goals.',
  },
  {
    id: 'branding',
    icon: Rocket,
    title: 'Brand Identity',
    description: 'Comprehensive branding solutions that establish a strong and memorable market presence for your business.',
  },
  {
    id: 'support',
    icon: Headphones,
    title: 'Support & Maintenance',
    description: 'Ongoing support and maintenance to keep your digital products running smoothly and up-to-date with the latest technologies.',
  },
];
