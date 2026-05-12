import React from 'react';
import { Sidebar } from '@/components/shared/sidebar';
import { MobileNav } from '@/components/shared/mobile-nav';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1e293b] font-sans overflow-hidden flex-col lg:flex-row">
      <MobileNav />
      <div className="hidden lg:flex w-64 h-full shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50/50 bg-grid-pattern">
        <div className="w-full relative z-10 p-4 md:p-10">
          {children}
        </div>
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        <div className="fixed bottom-4 right-8 writing-vertical text-[10px] font-mono opacity-30 uppercase tracking-widest pointer-events-none">
          OrderFlow v2.0.1
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
