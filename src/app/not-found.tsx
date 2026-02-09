import { getPageBySlug } from '@/lib/wordpress';
import Mandala404Client from './not-found/Mandala404Client';

export default async function NotFound() {
  let title: string | undefined;
  let message: string | undefined;
  let buttonText: string | undefined;
  let buttonLink: string | undefined;
  let primaryColor: string | undefined;
  let bgColor: string | undefined;

  try {
    const page = await getPageBySlug('not-found');
    const meta = page?.meta_box ?? page?.acf;
    if (meta) {
      title = meta.notfound_title;
      message = meta.notfound_message;
      buttonText = meta.notfound_button_text;
      buttonLink = meta.notfound_button_link;
      primaryColor = meta.notfound_primary_color;
      bgColor = meta.notfound_bg_color;
    }
  } catch {
    // Use defaults if WordPress unavailable
  }

  return (
    <Mandala404Client
      title={title}
      message={message}
      buttonText={buttonText}
      buttonLink={buttonLink}
      primaryColor={primaryColor}
      bgColor={bgColor}
    />
  );
}
