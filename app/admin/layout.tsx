import { ReactNode } from "react";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white md:flex-row">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-6 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
