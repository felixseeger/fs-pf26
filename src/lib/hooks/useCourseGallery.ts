/**
 * Hook for fetching course gallery data and preparing it for DisplayCarousel
 * Usage in a course page component:
 *
 * const { images, isLoading } = useCourseGallery(course.acf?.courses_gallery);
 * return <DisplayCarousel images={images} />
 */

'use client';

import { useState, useEffect } from 'react';
import type { ACFImage } from '@/types/wordpress';

interface CourseGalleryData {
  images: Array<string | ACFImage>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to prepare course gallery images for DisplayCarousel
 * Handles both ACFImage objects and image IDs from WordPress
 *
 * @param gallery - Raw gallery data from course ACF field (courses_gallery)
 * @returns Object with images array, loading state, and error handling
 */
export function useCourseGallery(
  gallery: (ACFImage | number)[] | undefined | false
): CourseGalleryData {
  const [images, setImages] = useState<Array<string | ACFImage>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
      setImages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Filter out false/null values and normalize the data
      const processedImages: Array<string | ACFImage> = gallery
        .filter((item): item is ACFImage | number => item !== false && item !== null)
        .map((item) => {
          // If it's an ACFImage object, return as-is
          if (typeof item === 'object' && item.url) {
            return item as ACFImage;
          }
          // If it's a number (attachment ID), construct URL if needed
          // Note: You may need to fetch this from WordPress if you have the ID
          // For now, just store the ID and handle it separately
          return item;
        });

      setImages(processedImages);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to process gallery'));
      setIsLoading(false);
    }
  }, [gallery]);

  return { images, isLoading, error };
}

/**
 * Hook to fetch a course by slug and get its gallery images
 * Usage:
 *
 * const { course, images, isLoading } = useCourseGalleryBySlug('my-course');
 * return <DisplayCarousel images={images} />
 */

import { getCourseBySlug } from '@/lib/wordpress/course';

interface CourseGalleryBySlugData {
  course: any | null;
  images: Array<string | ACFImage>;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseGalleryBySlug(slug: string): CourseGalleryBySlugData {
  const [course, setCourse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { images } = useCourseGallery(course?.acf?.courses_gallery);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCourseBySlug(slug);
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch course'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  return { course, images, isLoading, error };
}
