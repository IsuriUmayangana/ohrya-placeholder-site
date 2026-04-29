
export default function Layout({ children }: { children: React.ReactNode }) {

  return (
      <main className="min-h-screen w-full overflow-x-hidden flex flex-col">
        {children}
      </main>
  );
}