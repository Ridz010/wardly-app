export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
    </main>
  );
}
