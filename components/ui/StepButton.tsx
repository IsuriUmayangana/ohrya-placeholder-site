export default function StepButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button className="btn-primary flex items-center justify-center gap-2" onClick={onClick}>
      {children}
    </button>
  );
}