import type { Metadata } from 'next';
import MaintenanceScene from './MaintenanceScene';

export const metadata: Metadata = {
  title: 'Maintenance',
  description: 'We will be back shortly.',
  robots: 'noindex, nofollow',
};

export default function MaintenancePage() {
  return (
    <div className="relative w-full h-full min-h-screen">
      <MaintenanceScene />
    </div>
  );
}
