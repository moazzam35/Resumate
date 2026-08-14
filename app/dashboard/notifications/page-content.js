"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Inbox,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/loading-skeleton";

const typeConfig = {
  info: {
    icon: Info,
    color: "bg-stamp/10 text-stamp",
    badge: "default",
  },
  success: {
    icon: CheckCircle2,
    color: "bg-verified/10 text-verified",
    badge: "success",
  },
  warning: {
    icon: AlertTriangle,
    color: "bg-yellow-500/10 text-yellow-500",
    badge: "warning",
  },
  error: {
    icon: AlertCircle,
    color: "bg-flag/10 text-flag",
    badge: "destructive",
  },
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?limit=50", {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications.filter((n) => n.isRead);

  const toggleRead = async (id) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: !n.isRead } : n
      )
    );

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isRead: !notification.isRead }),
      });
      if (!res.ok) throw new Error("Failed to update notification");
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: notification.isRead } : n
        )
      );
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch (err) {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete notification");
    } catch (err) {
      fetchNotifications();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="Notifications" description="Stay updated on your activity.">
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              size="sm"
              leftIcon={CheckCheck}
            >
              Mark all read
            </Button>
          )}
        </PageHeader>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {["all", "unread", "read"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <Badge variant="danger" className="ml-1.5 text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="rounded-md">
              <CardContent className="flex items-start gap-4 p-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="You're all caught up! Notifications about your activity will appear here."
        />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={`No ${filter} notifications`}
          description={
            filter === "unread"
              ? "All notifications have been read."
              : "No read notifications to display."
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => {
              const typeKey = notification.type?.toLowerCase() || "info";
              const config = typeConfig[typeKey] || typeConfig.info;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                >
                  <Card
                    className={`rounded-md transition-all cursor-pointer ${
                      !notification.isRead
                        ? "bg-primary/5 border-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleRead(notification.id)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${config.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-sm bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant={config.badge}
                          className="text-[10px] capitalize"
                        >
                          {typeKey}
                        </Badge>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          leftIcon={Trash2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
