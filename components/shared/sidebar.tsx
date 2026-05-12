'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ChevronRight,
  TrendingUp,
  BarChart3,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/pedidos', icon: Package },
  { name: 'Prioridades', href: '/prioridades', icon: BarChart3 },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex h-screen w-full lg:w-64 flex-col border-r border-slate-200 bg-white shadow-sm z-20">
      <div className="flex h-20 items-center px-6">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <TrendingUp className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            OrderFlow
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-hide">
        <div className="mb-4">
          <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"
                  )}>
                    <item.icon size={18} strokeWidth={2.5} />
                  </div>
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} strokeWidth={2.5} className="text-blue-400" />}
              </Link>
            );
          })}
        </div>

        <div>
          <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</p>
          <Link
            href="/configuracoes"
            onClick={handleLinkClick}
            className={cn(
              "group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/configuracoes" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-slate-200">
              <Settings size={18} strokeWidth={2.5} />
            </div>
            Configurações
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-white shadow-sm font-bold text-xs">
                LH
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Luiz Henrique</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Administrador</p>
              </div>
           </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-11 text-slate-500 font-medium hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={18} strokeWidth={2.5} />
          Sair do Sistema
        </Button>
      </div>
    </div>
  );
}
