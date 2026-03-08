/**
 * EXAMPLE: Course Page with DisplayCarousel
 * 
 * This file shows how to integrate DisplayCarousel into a course page.
 * Copy the patterns below to your actual course page component.
 * 
 * Two patterns are shown:
 * 1. Server-side rendering (recommended for SEO)
 * 2. Client-side hook approach (for real-time updates)
 */

// ============================================================================
// PATTERN 1: Server-Side Rendering (Recommended)
// ============================================================================

import { getCourseBySlug, getCourseNeighbors } from '@/lib/wordpress/course';
import DisplayCarousel from '@/components/courses/DisplayCarousel';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CoursePage({ params }: PageProps) {
  // Fetch course data server-side
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  // Extract gallery images from ACF field
  const galleryImages = (course.acf?.courses_gallery || []).filter(
    (img): img is Exclude<typeof img, number> => typeof img !== 'number'
  );

  // Optionally get neighboring courses for navigation
  const neighbors = await getCourseNeighbors(params.slug);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Hero Section with 3D Gallery Display */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          {/* Display Carousel - Full Width */}
          {galleryImages.length > 0 ? (
            <div className="mb-12">
              <DisplayCarousel 
                images={galleryImages}
                modelPath="/models/monitor.glb"
                className="w-full"
              />
            </div>
          ) : (
            <div className="mb-12 flex items-center justify-center h-96 bg-slate-800 rounded-lg">
              <p className="text-slate-400">No gallery images available</p>
            </div>
          )}

          {/* Course Info */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">
              {course.title?.rendered || 'Untitled Course'}
            </h1>
            
            {course.excerpt?.rendered && (
              <div 
                className="text-lg text-slate-300 mb-8"
                dangerouslySetInnerHTML={{ __html: course.excerpt.rendered }}
              />
            )}

            {course.content?.rendered && (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: course.content.rendered }}
              />
            )}

            {/* Gallery Count Info */}
            {galleryImages.length > 0 && (
              <div className="mt-8 p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-300 text-sm">
                  📷 Gallery contains {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation */}
      {neighbors && (neighbors.previous || neighbors.next) && (
        <section className="py-12 border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {neighbors.previous && (
                <a 
                  href={`/courses/${neighbors.previous.slug}`}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <p className="text-sm text-slate-400 mb-2">← Previous</p>
                  <p className="text-white font-semibold truncate">
                    {neighbors.previous.title}
                  </p>
                </a>
              )}
              {neighbors.next && (
                <a 
                  href={`/courses/${neighbors.next.slug}`}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <p className="text-sm text-slate-400 mb-2">Next →</p>
                  <p className="text-white font-semibold truncate">
                    {neighbors.next.title}
                  </p>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/**
 * ============================================================================
 * PATTERN 2: Client-Side Hook Approach (Alternative)
 * ============================================================================
 * 
 * If you prefer to fetch data on the client side, use the useCourseGalleryBySlug hook:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useCourseGalleryBySlug } from '@/lib/hooks/useCourseGallery';
 * import { DisplayCarousel } from '@/components/courses/DisplayCarousel';
 * 
 * export default function CoursePageClient({ slug }: { slug: string }) {
 *   const { course, images, isLoading, error } = useCourseGalleryBySlug(slug);
 * 
 *   if (isLoading) {
 *     return <div className="flex items-center justify-center h-96">Loading...</div>;
 *   }
 * 
 *   if (error || !course) {
 *     return <div className="text-red-500">Failed to load course</div>;
 *   }
 * 
 *   return (
 *     <main>
 *       <DisplayCarousel images={images} />
 *       <h1>{course.title?.rendered}</h1>
 *     </main>
 *   );
 * }
 * ```
 * 
 * COMPARISON:
 * - Server Pattern: Better SEO, no loading state visible, simpler code
 * - Client Pattern: More interactive, handles real-time updates, loading states visible
 * 
 * For complete API reference and troubleshooting, see DisplayCarousel.README.md
 */
