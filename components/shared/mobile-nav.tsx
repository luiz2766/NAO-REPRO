'use client';

import React, { useState } from 'react';
import { Menu, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import Link from 'next/link';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-md">
          <TrendingUp className="text-white" size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">
          OrderFlow
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="text-slate-500" />}>
          <Menu size={24} />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <Sidebar onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
