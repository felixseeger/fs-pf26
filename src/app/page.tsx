import { redirect } from 'next/navigation';

// Root path (/) has no locale — redirect to the default German homepage.
// next-intl `always` prefix means all locales are explicit: /de, /en, etc.
export default function RootPage() {
  redirect('/de');
}
