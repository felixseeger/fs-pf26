import HideShell from './HideShell';

export const metadata = {
  title: 'Maintenance',
  description: 'We will be back shortly.',
  robots: 'noindex, nofollow',
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HideShell />
      {children}
    </>
  );
}
