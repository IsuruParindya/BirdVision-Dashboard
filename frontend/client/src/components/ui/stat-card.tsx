import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="glass-card p-6 rounded-[24px] hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground font-medium mb-1">{title}</p>
          <h3 className="text-4xl font-display font-bold text-foreground tracking-tight">{value}</h3>
          
          {description && (
            <p className="text-sm mt-2 flex items-center gap-1">
              <span className={`font-semibold ${
                trend === 'up' ? 'text-emerald-500' : 
                trend === 'down' ? 'text-red-500' : 'text-accent'
              }`}>
                {description}
              </span>
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
