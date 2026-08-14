"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [templateUsage, setTemplateUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [templatesRes, statsRes] = await Promise.all([
          fetch("/api/admin/templates", { headers }),
          fetch("/api/admin/stats", { headers }),
        ]);

        const templatesData = await templatesRes.json();
        const statsData = await statsRes.json();

        if (templatesData.success && templatesData.data) {
          setTemplates(templatesData.data.map((t) => ({ ...t, active: t.isActive })));
        }
        if (statsData.success && statsData.data?.templateUsage) {
          setTemplateUsage(statsData.data.templateUsage);
        }
      } catch (err) {
        console.error("Failed to fetch templates data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleTemplate = async (id) => {
    const current = templates.find((t) => t.id === id);
    if (!current) return;

    const nextActive = !current.active;
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: nextActive } : t))
    );

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/templates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update template");
      }
    } catch (err) {
      console.error("Failed to toggle template:", err);
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: current.active } : t))
      );
    }
  };

  const totalUsage = templateUsage.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Management"
        description="Manage resume templates and view usage statistics."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
              <CardTitle className="heading-display">Template Usage Overview</CardTitle>
            <CardDescription>Usage distribution across all templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={templateUsage}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--stamp)" name="Usage Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {templates.map((template) => (
          <motion.div key={template.id} variants={item}>
            <Card className={cn("transition-opacity", !template.active && "opacity-60")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center bg-stamp/10"
                    >
                      <Palette className="h-5 w-5 text-stamp" />
                    </div>
                    <div>
                      <CardTitle className="text-base heading-display">{template.name}</CardTitle>
                      <p className="text-xs text-muted capitalize">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.isPremium && (
                      <Badge variant="default" className="text-[10px]">Premium</Badge>
                    )}
                    <Switch
                      checked={template.active}
                      onCheckedChange={() => toggleTemplate(template.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <BarChart3 className="h-4 w-4" />
                    <span>
                      {templateUsage.find((u) => u.name === template.name)?.count?.toLocaleString() ?? 0} uses
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {totalUsage > 0
                      ? (((templateUsage.find((u) => u.name === template.name)?.count ?? 0) / totalUsage) * 100).toFixed(1) + "%"
                      : "0%"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
