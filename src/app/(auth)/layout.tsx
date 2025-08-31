
import { DataProvider } from "@/context/data-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        {children}
      </main>
    </DataProvider>
  );
}
