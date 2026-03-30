'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import gsap from 'gsap';

import type { WPPortfolioItem, WPCategory } from '@/types/wordpress';
import { extractImagesFromContent } from '@/lib/wordpress/content-utils';
import {
  getCategoriesFromPortfolioItems,
  filterPortfolioItemsByCategory,
} from '@/lib/portfolio-utils';
import PortfolioCategoryFilter from './PortfolioCategoryFilter';

interface PortfolioGridFightForSpaceProps {
  items: WPPortfolioItem[];
  title?: string;
}

const PROJECTS_PER_ROW = 9;
const TOTAL_ROWS = 10;

interface FightForSpaceProject {
  id: number;
  name: string;
  year: string;
  href: string;
  img: string;
  alt: string;
  categories: WPCategory[];
}

export default function PortfolioGridFightForSpace({
  items,
  title,
}: PortfolioGridFightForSpaceProps) {
  const locale = useLocale();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const rowsRef = useRef<HTMLDivElement[]>([]);
  const rowStartWidth = useRef(125);
  const rowEndWidth = useRef(500);

  const categories = useMemo(() => getCategoriesFromPortfolioItems(items), [items]);
  const filteredItems = useMemo(
    () => filterPortfolioItemsByCategory(items, selectedCategoryId),
    [items, selectedCategoryId],
  );

  const projects: FightForSpaceProject[] = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) return [];
    return filteredItems.map((item) => {
      const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
      const contentImages = extractImagesFromContent(item.content?.rendered || '');
      const fallbackImage = contentImages[0];
      const displayImageUrl = featuredImage?.source_url ?? fallbackImage?.url ?? '';
      const displayImageAlt =
        featuredImage?.alt_text || fallbackImage?.altText || item.title?.rendered || 'Project Image';
      const parsedYear = item.date ? new Date(item.date).getFullYear() : NaN;
      const year = Number.isFinite(parsedYear) ? parsedYear.toString() : '';
      const cats = (item._embedded?.['wp:term']?.[0] || []) as WPCategory[];
      return {
        id: item.id,
        name: (item.acf?.portfolio_title || item.title?.rendered || 'Untitled').replace(/<[^>]*>/g, '').trim(),
        year,
        href: `/${locale}/portfolio/${item.slug}`,
        img: displayImageUrl,
        alt: displayImageAlt,
        categories: cats,
      };
    });
  }, [filteredItems, locale]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rows = rowsRef.current.filter(Boolean);
    if (rows.length === 0) return;

    const isMobile = window.innerWidth < 1000;
    rowStartWidth.current = isMobile ? 250 : 125;
    rowEndWidth.current = isMobile ? 750 : 500;

    // Measure section height at full expansion, then reset rows.
    const firstRow = rows[0];
    firstRow.style.width = `${rowEndWidth.current}%`;
    const expandedRowHeight = firstRow.offsetHeight;
    firstRow.style.width = '';

    const sectionGap = parseFloat(getComputedStyle(section).gap) || 0;
    const sectionPadding = parseFloat(getComputedStyle(section).paddingTop) || 0;
    section.style.height = `${
      expandedRowHeight * rows.length +
      sectionGap * (rows.length - 1) +
      sectionPadding * 2
    }px`;

    function onScrollUpdate() {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Batch reads first.
      const rects = rows.map((row) => row.getBoundingClientRect());

      // Batch writes after.
      rows.forEach((row, i) => {
        const rect = rects[i];
        const rowTop = rect.top + scrollY;
        const rowBottom = rowTop + rect.height;

        const scrollStart = rowTop - viewportHeight;
        const scrollEnd = rowBottom;

        let progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        progress = Math.max(0, Math.min(1, progress));

        row.style.width = `${
          rowStartWidth.current +
          (rowEndWidth.current - rowStartWidth.current) * progress
        }%`;
      });
    }

    gsap.ticker.add(onScrollUpdate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const isNowMobile = window.innerWidth < 1000;
        rowStartWidth.current = isNowMobile ? 250 : 125;
        rowEndWidth.current = isNowMobile ? 750 : 500;

        firstRow.style.width = `${rowEndWidth.current}%`;
        const newRowHeight = firstRow.offsetHeight;
        firstRow.style.width = '';

        section.style.height = `${
          newRowHeight * rows.length +
          sectionGap * (rows.length - 1) +
          sectionPadding * 2
        }px`;
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      gsap.ticker.remove(onScrollUpdate);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [projects.length]);

  if (!projects || projects.length === 0) {
    return (
      <section className="w-full">
        {title && <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">{title}</h2>}
        {categories.length > 0 && (
          <div className="mb-8 flex justify-center">
            <PortfolioCategoryFilter categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
          </div>
        )}
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">No projects found.</p>
        </div>
      </section>
    );
  }

  const rowsData: FightForSpaceProject[][] = [];
  let currentProjectIndex = 0;
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row: FightForSpaceProject[] = [];
    for (let c = 0; c < PROJECTS_PER_ROW; c++) {
      row.push(projects[currentProjectIndex % projects.length]);
      currentProjectIndex++;
    }
    rowsData.push(row);
  }

  rowsRef.current = [];

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">
      {title && <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">{title}</h2>}

      {categories.length > 0 && (
        <div className="mb-8 flex justify-center">
          <PortfolioCategoryFilter categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
        </div>
      )}

      {/* Mirror reference: section with overflow:hidden, rows start at 125% */}
      <section
        ref={sectionRef}
        className="relative w-full py-2 flex flex-col items-center gap-2 overflow-hidden"
      >
        {rowsData.map((rowProjects, rowIndex) => (
          <div
            key={rowIndex}
            style={{ width: `${rowStartWidth.current}%` }}
            className="flex gap-4"
            ref={(el) => { if (el) rowsRef.current[rowIndex] = el; }}
          >
            {rowProjects.map((project, colIndex) => (
              <Link
                key={`${project.id}-${colIndex}`}
                href={project.href}
                className="group flex-1 aspect-7/5 flex flex-col overflow-hidden"
              >
                {/* Image — flex:1 min-h-0 mirrors reference .project-img */}
                <div className="relative flex-1 min-h-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-sm">
                  {project.img && (
                    <Image
                      src={project.img}
                      alt={project.alt}
                      fill
                      sizes="(max-width: 1000px) 84vw, 56vw"
                      quality={85}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                {/* Info row — mirrors reference .project-info */}
                <div className="flex items-center justify-between pt-1 shrink-0">
                  <p className="text-[0.6rem] uppercase tracking-tight font-medium text-zinc-900 dark:text-white truncate">
                    {project.name}
                  </p>
                  <p className="text-[0.6rem] uppercase tracking-tight font-medium text-zinc-500 shrink-0 ml-1">
                    {project.year}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </section>
  );
}
