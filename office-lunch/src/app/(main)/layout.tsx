import { QueryPanel } from "@/components/query-panel";
import { Sidebar } from "@/components/sidebar";
import { UserProvider } from "@/components/user-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="lg:flex">
        <Sidebar />
        <main className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 pt-6 sm:px-8 lg:pt-10">{children}</main>
      </div>
      <QueryPanel />
    </UserProvider>
  );
}
