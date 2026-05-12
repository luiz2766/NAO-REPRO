import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'OrderFlow - Gestão de Entregas',
  description: 'Sistema profissional de gestão de pedidos logísticos.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable)}>
      <body suppressHydrationWarning className="bg-[#F8FAFC]">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
