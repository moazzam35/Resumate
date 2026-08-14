"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/page-header";
import SearchBar from "@/components/shared/search-bar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn, formatRelativeTime, downloadResumePDF } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusColors = {
  COMPLETED: "success",
  DRAFT: "warning",
  ARCHIVED: "outline",
};

export default function AdminResumesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [summary, setSummary] = useState({ total: 0, drafts: 0, completed: 0, published: 0, templatesUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchResumes = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter.toUpperCase());

    try {
      const res = await fetch(`/api/admin/resumes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setResumes(json.data);
        setPagination({
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
          total: json.pagination.total,
        });
        if (json.summary) setSummary(json.summary);
      } else {
        setError(json.error || "Failed to fetch resumes");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchResumes(1);
  }, [fetchResumes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Management"
        description="View and manage all resumes on the platform."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted">Total Resumes</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted">Completed</p>
            <p className="text-2xl font-semibold">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted">Templates Used</p>
            <p className="text-2xl font-semibold">{summary.templatesUsed}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search resumes..."
          className="w-full sm:w-80"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-flag/10 border border-flag/20"
        >
          <span className="text-xs font-medium text-flag flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-xs text-muted hover:text-foreground">Dismiss</button>
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resume</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ATS Score</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : resumes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted">
                        No resumes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resumes.map((resume) => (
                      <motion.tr
                        key={resume.id}
                        variants={item}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <p className="font-medium text-sm">{resume.title}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted">
                          {resume.user?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {resume.template}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[resume.status] || "secondary"}>
                            {resume.status?.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  (resume.atsScore ?? 0) >= 80
                                    ? "bg-verified"
                                    : (resume.atsScore ?? 0) >= 60
                                    ? "bg-stamp"
                                    : "bg-flag"
                                )}
                                style={{ width: `${resume.atsScore ?? 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{resume.atsScore ?? 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted text-sm">
                          {formatRelativeTime(resume.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => router.push(`/resume/${resume.id}`)} leftIcon={Eye} />
                            <Button variant="ghost" size="icon-sm" onClick={() => downloadResumePDF(resume.id, resume.title)} leftIcon={Download} />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} resumes)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchResumes(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchResumes(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
