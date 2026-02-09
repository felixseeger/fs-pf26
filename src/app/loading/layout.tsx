export default function LoadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#d1d9b8]">
      {children}
    </div>
  );
}
