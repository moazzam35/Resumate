"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Clock, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminPaymentsPage() {
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/admin/stats", { headers });
        const data = await res.json();
        if (data.success && data.data?.revenueByMonth) {
          setRevenueByMonth(data.data.revenueByMonth);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const totalRevenue = revenueByMonth.reduce((sum, r) => sum + (r.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Management"
        description="View and manage all payment transactions."
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Est. Revenue</p>
                  <p className="text-2xl font-semibold">{loading ? <Skeleton className="h-7 w-24" /> : `$${totalRevenue.toLocaleString()}`}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-verified/10">
                  <DollarSign className="h-6 w-6 text-verified" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Months Tracked</p>
                  <p className="text-2xl font-semibold">{loading ? <Skeleton className="h-7 w-16" /> : revenueByMonth.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-stamp/10">
                  <CreditCard className="h-6 w-6 text-stamp" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Avg Monthly</p>
                  <p className="text-2xl font-semibold">
                    {loading ? <Skeleton className="h-7 w-24" /> : `$${revenueByMonth.length > 0 ? Math.round(totalRevenue / revenueByMonth.length).toLocaleString() : 0}`}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-stamp/10">
                  <TrendingUp className="h-6 w-6 text-stamp" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Stripe Status</p>
                  <p className="text-2xl font-semibold">Inactive</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-stamp/10">
                  <Clock className="h-6 w-6 text-stamp" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="heading-display">Revenue by Month</CardTitle>
            <CardDescription>Estimated from active premium subscriptions (no payment provider wired up)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="var(--verified)" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No Payment Records</p>
              <p className="text-sm">Payment records will appear here once Stripe integration is active.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
