'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WPPortfolioItem } from '@/types/wordpress';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { getCategoriesFromPortfolioItems, filterPortfolioItemsByCategory } from '@/lib/portfolio-utils';
import PortfolioCategoryFilter from '@/components/portfolio/PortfolioCategoryFilter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const SECTION_TITLE = 'Selected Works';
const SECTION_DESCRIPTION =
  'Explore a curated gallery of our most recent digital experiences, brand identities, and creative solutions developed for forward-thinking clients.';

interface SelectedWorksSectionProps {
  items: WPPortfolioItem[];
  maxItems?: number;
}

function MasonryCard({
  item,
  variant = 'default',
}: {
  item: WPPortfolioItem;
  variant?: 'default' | 'tall';
}) {
  const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
  const title = item.title?.rendered || 'Project';

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group block rounded-xl overflow-hidden bg-zinc-800 dark:bg-zinc-800/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 break-inside-avoid mb-6"
      data-portfolio-card
    >
      <div
        className={`relative w-full overflow-hidden will-change-[clip-path] ${
          variant === 'tall' ? 'aspect-[3/4] min-h-[320px]' : 'aspect-video'
        }`}
        data-portfolio-card-image
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        {featuredImage?.source_url ? (
          <Image
            src={featuredImage.source_url}
            alt={featuredImage.alt_text || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-700 flex items-center justify-center">
            <span className="text-zinc-500 font-medium text-lg uppercase tracking-wider">
              {title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3
            className="text-white font-bold text-lg line-clamp-2 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
      </div>
    </Link>
  );
}

function ViewAllCTA({ arrowRef }: { arrowRef: React.RefObject<SVGElement | null> }) {
  return (
    <Link
      href="/portfolio"
      className="group flex flex-col items-center justify-center rounded-xl overflow-hidden bg-primary text-primary-foreground p-8 md:p-10 min-h-[280px] break-inside-avoid mb-6 hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
      data-portfolio-cta
    >
      <div className="flex gap-2 mb-4">
        <LayoutGrid className="w-8 h-8" aria-hidden />
        <LayoutGrid className="w-8 h-8" aria-hidden />
      </div>
      <h3 className="font-unbounded font-black text-2xl md:text-3xl uppercase tracking-tight text-center mb-2">
        View All Projects
      </h3>
      <p className="text-primary-foreground/80 text-sm md:text-base text-center mb-6 max-w-xs">
        Explore our complete portfolio.
      </p>
      <span className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm group-hover:gap-3 transition-all">
        See All
        <ArrowRight ref={arrowRef as React.Ref<SVGSVGElement>} className="w-8 h-8 shrink-0" aria-hidden />
      </span>
    </Link>
  );
}

export default function SelectedWorksSection({ items, maxItems = 6 }: SelectedWorksSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  const categories = useMemo(() => getCategoriesFromPortfolioItems(items), [items]);
  const filteredItems = useMemo(
    () => filterPortfolioItemsByCategory(items, selectedCategoryId),
    [items, selectedCategoryId]
  );
  const displayItems = filteredItems.slice(0, maxItems);
  const hasItems = displayItems.length > 0;

  useGSAP(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const desc = descRef.current;
    const arrow = arrowRef.current;
    if (!section) return;

    if (headline) {
      gsap.set(headline, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(headline, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1.2,
        },
      });
    }

    if (desc) {
      gsap.set(desc, { clipPath: 'inset(100% 0 0 0)' });
      gsap.to(desc, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'top 35%',
          scrub: 1.2,
        },
      });
    }

    const cardImages = section.querySelectorAll<HTMLElement>('[data-portfolio-card-image]');
    cardImages.forEach((el) => {
      gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
      gsap.to(el, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el.closest('[data-portfolio-card]') || el,
          start: 'top 90%',
          end: 'top 50%',
          scrub: 1,
        },
      });
    });

    const ctaCard = section.querySelector<HTMLElement>('[data-portfolio-cta]');
    if (ctaCard) {
      gsap.set(ctaCard, { opacity: 0, y: 24 });
      gsap.to(ctaCard, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaCard,
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1,
        },
      });
    }

    if (arrow) {
      gsap.to(arrow, {
        x: 6,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, [hasItems, displayItems.length]);

  return (
    <section
      ref={sectionRef}
      id="selected-works"
      className="mb-24 bg-zinc-100 dark:bg-zinc-900/50 py-16 md:py-20"
      suppressHydrationWarning
    >
      <div className="max-w-6xl mx-auto px-4" suppressHydrationWarning>
        <header className="mb-12 md:mb-16" suppressHydrationWarning>
          <div className="flex items-center gap-4 mb-4" suppressHydrationWarning>
            <span className="w-12 h-px bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">
              Portfolio
            </span>
          </div>
          <div
            ref={headlineRef}
            className="overflow-hidden will-change-[clip-path] mb-6"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-unbounded font-black text-black dark:text-white">
              <span>{SECTION_TITLE.split(' ')[0]}</span>{' '}
              <span className="text-[#1d4ed8]">{SECTION_TITLE.split(' ')[1]}</span>
            </h2>
          </div>
          <div
            ref={descRef}
            className="overflow-hidden will-change-[clip-path]"
            style={{ clipPath: 'inset(100% 0 0 0)' }}
          >
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed">
              {SECTION_DESCRIPTION}
            </p>
          </div>
        </header>

        {categories.length > 0 && (
          <div className="mb-8" suppressHydrationWarning>
            <PortfolioCategoryFilter
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>
        )}

        {hasItems ? (
          <div
            className="columns-1 md:columns-2 gap-x-6"
            style={{ columnFill: 'balance' }}
            suppressHydrationWarning
          >
            {displayItems.map((item, index) => (
              <MasonryCard
                key={item.id}
                item={item}
                variant={index === 4 ? 'tall' : 'default'}
              />
            ))}
            <ViewAllCTA arrowRef={arrowRef} />
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-200 dark:bg-zinc-800/80 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {items.length === 0
                ? 'No portfolio projects to display yet.'
                : 'No projects in this category.'}
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-primary hover:underline"
            >
              View Portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
