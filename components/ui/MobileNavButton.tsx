export default function MobileNavButton({ action, children, disabled }: { 
  action: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button 
      className="btn-mobile-nav" 
      onClick={action}
      disabled={disabled}
    >
      {children}
    </button>
  );
}