export default function NavButton({ action, children }: { action: () => void, children: React.ReactNode }) {
  return (
    <button className="btn-nav" onClick={action}>
      {children}
    </button>
  );
}