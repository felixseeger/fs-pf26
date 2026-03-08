'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const rowsRef = useRef<HTMLDivElement[]>([]);
  const rowStartWidth = useRef(125);
  const rowEndWidth = useRef(500);

  const categories = useMemo(
    () => getCategoriesFromPortfolioItems(items),
    [items],
  );

  const filteredItems = useMemo(
    () => filterPortfolioItemsByCategory(items, selectedCategoryId),
    [items, selectedCategoryId],
  );

  const projects: FightForSpaceProject[] = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) return [];

    return filteredItems.map((item) => {
      const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
      const contentImages = extractImagesFromContent(
        item.content?.rendered || '',
      );
      const fallbackImage = contentImages[0];
      const displayImageUrl =
        featuredImage?.source_url ?? fallbackImage?.url ?? '';
      const displayImageAlt =
        featuredImage?.alt_text ||
        fallbackImage?.altText ||
        item.title?.rendered ||
        'Project Image';
      const year = new Date(item.date).getFullYear().toString();
      const cats = (item._embedded?.['wp:term']?.[0] ||
        []) as WPCategory[];

      return {
        id: item.id,
        name: item.acf?.portfolio_title || item.title?.rendered || 'Untitled',
        year,
        href: `/portfolio/${item.slug}`,
        img: displayImageUrl,
        alt: displayImageAlt,
        categories: cats,
      };
    });
  }, [filteredItems]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rows = rowsRef.current.filter(Boolean);
    if (rows.length === 0) return;

    const isMobile = window.innerWidth < 1000;
    rowStartWidth.current = isMobile ? 250 : 125;
    rowEndWidth.current = isMobile ? 750 : 500;

    const firstRow = rows[0];
    firstRow.style.width = `${rowEndWidth.current}%`;
    const expandedRowHeight = firstRow.offsetHeight;
    firstRow.style.width = '';

    const computed = getComputedStyle(section);
    const sectionGap = parseFloat(computed.gap || '0') || 0;
    const sectionPadding =
      parseFloat(computed.paddingTop || '0') || 0;

    const expandedSectionHeight =
      expandedRowHeight * rows.length +
      sectionGap * (rows.length - 1) +
      sectionPadding * 2;

    section.style.height = `${expandedSectionHeight}px`;

    function onScrollUpdate() {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      rows.forEach((row) => {
        const rect = row.getBoundingClientRect();
        const rowTop = rect.top + scrollY;
        const rowBottom = rowTop + rect.height;

        const scrollStart = rowTop - viewportHeight;
        const scrollEnd = rowBottom;

        let progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        progress = Math.max(0, Math.min(1, progress));

        const width =
          rowStartWidth.current +
          (rowEndWidth.current - rowStartWidth.current) * progress;
        row.style.width = `${width}%`;
      });
    }

    gsap.ticker.add(onScrollUpdate);

    const handleResize = () => {
      const isNowMobile = window.innerWidth < 1000;
      rowStartWidth.current = isNowMobile ? 250 : 125;
      rowEndWidth.current = isNowMobile ? 750 : 500;

      if (!rows[0]) return;

      rows[0].style.width = `${rowEndWidth.current}%`;
      const newRowHeight = rows[0].offsetHeight;
      rows[0].style.width = '';

      const computedResize = getComputedStyle(section);
      const resizeGap = parseFloat(computedResize.gap || '0') || 0;
      const resizePadding =
        parseFloat(computedResize.paddingTop || '0') || 0;

      const newSectionHeight =
        newRowHeight * rows.length +
        resizeGap * (rows.length - 1) +
        resizePadding * 2;

      section.style.height = `${newSectionHeight}px`;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gsap.ticker.remove(onScrollUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, [projects.length]);

  if (!projects || projects.length === 0) {
    return (
      <section className="w-full">
        {title && (
          <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">
            {title}
          </h2>
        )}
        {categories.length > 0 && (
          <div className="mb-8 flex justify-center">
            <PortfolioCategoryFilter
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
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
    const rowProjects: FightForSpaceProject[] = [];
    for (let c = 0; c < PROJECTS_PER_ROW; c++) {
      const project = projects[currentProjectIndex % projects.length];
      rowProjects.push(project);
      currentProjectIndex++;
    }
    rowsData.push(rowProjects);
  }

  rowsRef.current = [];

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">
      {title && (
        <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">
          {title}
        </h2>
      )}

      {categories.length > 0 && (
        <div className="mb-8 flex justify-center">
          <PortfolioCategoryFilter
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>
      )}

      <section
        ref={sectionRef}
        className="relative w-full py-2 flex flex-col items-center gap-2 overflow-hidden"
      >
        {rowsData.map((rowProjects, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4"
            ref={(el) => {
              if (el) rowsRef.current[rowIndex] = el;
            }}
          >
            {rowProjects.map((project, colIndex) => (
              <div
                key={`${project.id}-${colIndex}`}
                className="group flex-1 aspect-7/5 flex flex-col overflow-hidden"
              >
                <Link
                  href={project.href}
                  className="relative flex-1 min-h-0 overflow-hidden block bg-zinc-100 dark:bg-zinc-900 rounded-lg"
                >
                  {project.img && (
                    <img
                      src={project.img}
                      alt={project.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-lg"
                      loading="lazy"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span
                      className="text-xs font-semibold uppercase tracking-tight text-white line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: project.name }}
                    />
                    {project.categories.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {project.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-zinc-100"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))}
      </section>
    </section>
  );
}

