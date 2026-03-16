import { redirect } from 'next/navigation';

// Root path (/) has no locale — redirect to the default German homepage.
// next-intl `as-needed` prefix means German lives at /de, English at /en.
export default function RootPage() {
  redirect('/de');
}
