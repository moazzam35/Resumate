"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

export default function StatCard({ title, value, icon: Icon, description, trend, trendValue, className, color }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-violet-500/10 text-violet-500",
    green: "bg-emerald-500/10 text-emerald-500",
    orange: "bg-amber-500/10 text-amber-500",
    red: "bg-rose-500/10 text-rose-500",
    primary: "bg-primary/10 text-primary",
  };

  return (
    <Card hover className={cn("transition-all duration-300", className)}>
      <CardContent className="flex items-center gap-4 p-5">
        {Icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", colorMap[color] || colorMap.blue)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight mt-0.5">
            <AnimatedCounter target={typeof value === "number" ? value : 0} />
            {typeof value === "string" ? value : ""}
          </p>
          {trendValue && (
            <div className="flex items-center gap-1 mt-1">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <p className={cn("text-[10px] font-medium", trend === "up" ? "text-success" : "text-destructive")}>
                {trend === "up" ? "+" : ""}{trendValue}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
