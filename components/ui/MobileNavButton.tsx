export default function MobileNavButton({ action, children }: { action: () => void, children: React.ReactNode }) {
  return (
    <button className="btn-mobile-nav" onClick={action}>
      {children}
    </button>
  );
}