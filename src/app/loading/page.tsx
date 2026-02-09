import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/wordpress';
import PreloaderClient from './PreloaderClient';

export const metadata: Metadata = {
  title: 'Loading',
  description: 'Loading experience',
  robots: 'noindex, nofollow',
};

export default async function LoadingPage() {
  const page = await getPageBySlug('loading');
  const meta = page?.meta_box ?? page?.acf;

  const orbitLabels = meta?.loading_orbit_labels?.length
    ? meta.loading_orbit_labels
    : undefined;
  const backgroundColor = meta?.loading_background_color ?? undefined;
  const textColor = meta?.loading_text_color ?? undefined;
  const counterDuration = meta?.loading_counter_duration ?? undefined;
  const redirectUrl = meta?.loading_redirect_url ?? undefined;
  const heroHeading = meta?.loading_hero_heading ?? undefined;
  const heroImageUrl =
    meta?.loading_hero_image && 'url' in meta.loading_hero_image
      ? (meta.loading_hero_image as { url: string }).url
      : null;

  return (
    <PreloaderClient
      orbitLabels={orbitLabels}
      backgroundColor={backgroundColor}
      textColor={textColor}
      counterDuration={counterDuration}
      redirectUrl={redirectUrl}
      heroHeading={heroHeading}
      heroImageUrl={heroImageUrl}
    />
  );
}
