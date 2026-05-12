import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "indigo";
}

export function KPICard({ title, value, icon: Icon, description, trend, className, color = "blue" }: KPICardProps) {
  const colorVariants = {
    blue: "from-blue-50 to-white text-blue-600 border-blue-100",
    emerald: "from-emerald-50 to-white text-emerald-600 border-emerald-100",
    amber: "from-amber-50 to-white text-amber-600 border-amber-100",
    rose: "from-rose-50 to-white text-rose-600 border-rose-100",
    indigo: "from-indigo-50 to-white text-indigo-600 border-indigo-100",
  };

  const iconVariants = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br rounded-2xl group",
      colorVariants[color],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl transition-colors", iconVariants[color])}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{value}</div>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={cn(
               "flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase",
               trend.isUp ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            )}>
              {trend.isUp ? "▲" : "▼"} {trend.value}%
            </div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">vs mês anterior</span>
          </div>
        )}

        {description && !trend && (
          <p className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            {description}
          </p>
        )}
      </CardContent>
      <div className={cn("h-1 w-full opacity-50", colorVariants[color].split(" ")[0])} />
    </Card>
  );
}
