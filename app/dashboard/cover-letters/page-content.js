"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  MoreVertical,
  Trash2,
  Search,
  Clock,
  Building2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { get, del } from "@/lib/api";
import { useUIStore } from "@/store";
import { Skeleton } from "@/components/shared/loading-skeleton";

const STATUS_FILTERS = ["All", "COMPLETED", "DRAFT"];

const STATUS_COLORS = {
  COMPLETED: "success",
  DRAFT: "warning",
};

function CoverLetterSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-md border-border">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    async function fetchCoverLetters() {
      try {
        const data = await get("/cover-letters?limit=50");
        setCoverLetters(data.data || []);
      } catch {
        showToast({ message: "Failed to load cover letters", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCoverLetters();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return coverLetters.filter((c) => {
      const matchesSearch =
        (c.title || "").toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        (c.position || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [coverLetters, searchQuery, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await del(`/cover-letters/${deleteId}`);
      setCoverLetters((prev) => prev.filter((c) => c.id !== deleteId));
      showToast({ message: "Cover letter deleted", type: "success" });
    } catch {
      showToast({ message: "Failed to delete cover letter", type: "error" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl heading-display font-semibold">Cover Letters</h2>
          <p className="text-sm text-muted">
            Create AI-powered cover letters for your job applications
          </p>
        </div>
        <Link href="/cover-letter/new">
          <Button leftIcon={Plus}>New Cover Letter</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search cover letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            {STATUS_FILTERS.map((s) => (
              <TabsTrigger key={s} value={s} className="text-xs">
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="text-sm text-muted">
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <>{filtered.length} cover letter{filtered.length !== 1 ? "s" : ""} found</>
        )}
      </div>

      {isLoading ? (
        <CoverLetterSkeleton />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-md bg-muted">
            <FileText className="h-10 w-10 text-muted" />
          </div>
          <p className="text-lg font-medium">
            {searchQuery || statusFilter !== "All"
              ? "No cover letters match your filters"
              : "No cover letters yet"}
          </p>
          <p className="mb-4 text-sm text-muted">
            {searchQuery || statusFilter !== "All"
              ? "Try adjusting your search or filter"
              : "Create your first AI-powered cover letter"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <Link href="/cover-letter/new">
              <Button leftIcon={Plus}>Create Cover Letter</Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((coverLetter) => (
            <Card
              key={coverLetter.id}
              className="group rounded-md border-border transition-all hover:border-stamp/20"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{coverLetter.title}</p>
                    <div className="mt-2 space-y-1">
                      {coverLetter.company && (
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          {coverLetter.company}
                        </span>
                      )}
                      {coverLetter.position && (
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          {coverLetter.position}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 shrink-0"
                        leftIcon={MoreVertical}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/cover-letter/${coverLetter.id}`}>
                          <FileText className="mr-2 h-[18px] w-[18px]" />
                          Open Editor
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(coverLetter.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-[18px] w-[18px]" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <Badge variant={STATUS_COLORS[coverLetter.status] || "secondary"}>
                    {coverLetter.status === "COMPLETED" ? "Completed" : "Draft"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(coverLetter.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cover Letter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cover letter? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
