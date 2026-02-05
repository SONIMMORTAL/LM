import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon }: StatCardProps) {
    const changeColors = {
        positive: "text-green-400",
        negative: "text-red-400",
        neutral: "text-noir-ash",
    };

    return (
        <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-noir-slate rounded-lg">
                    <Icon className="w-5 h-5 text-accent-cyan" />
                </div>
                {change && (
                    <span className={`text-xs font-medium ${changeColors[changeType]}`}>
                        {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            <p className="text-sm text-noir-ash">{title}</p>
        </div>
    );
}
