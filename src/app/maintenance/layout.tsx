export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {children}
    </div>
  );
}
