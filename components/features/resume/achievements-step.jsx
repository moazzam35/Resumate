"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResumeStore, useUIStore } from "@/store";
import { achievementSchema } from "@/validators";
import { post, put, del } from "@/lib/api";

export function AchievementsStep({ resume, resumeId, onGenerateTool }) {
  const [achievements, setAchievements] = useState(resume?.achievements || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const { addAchievement, updateAchievement, removeAchievement } = useResumeStore();

  useEffect(() => {
    if (resume?.achievements) setAchievements(resume.achievements);
  }, [resume?.achievements]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(achievementSchema),
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingId) {
        const res = await put(`/resumes/${resumeId}/achievements`, {
          itemId: editingId,
          ...data,
        });
        setAchievements((prev) =>
          prev.map((a) => (a.id === editingId ? res.item : a))
        );
        updateAchievement(res.item);
      } else {
        const res = await post(`/resumes/${resumeId}/achievements`, data);
        setAchievements((prev) => [...prev, res.item]);
        addAchievement(res.item);
      }
      setShowForm(false);
      setEditingId(null);
      reset();
      showToast({ message: "Achievement saved", type: "success" });
    } catch {
      showToast({ message: "Failed to save", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await del(`/resumes/${resumeId}/achievements?itemId=${id}`);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      removeAchievement(id);
      showToast({ message: "Deleted", type: "success" });
    } catch {
      showToast({ message: "Failed", type: "error" });
    }
  };

  const handleEdit = (ach) => {
    setEditingId(ach.id);
    reset({
      title: ach.title,
      description: ach.description || "",
      url: ach.url || "",
      date: ach.date
        ? new Date(ach.date).toISOString().split("T")[0]
        : "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> Achievements
            </CardTitle>
            <CardDescription>
              Add your notable achievements and awards
            </CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              leftIcon={Sparkles}
              className="flex-1 sm:flex-initial"
              onClick={() => onGenerateTool?.("GENERATE_ACHIEVEMENTS")}
            >
              Generate
            </Button>
            <Button
              size="sm"
              leftIcon={Plus}
              className="flex-1 sm:flex-initial"
              onClick={() => {
                setEditingId(null);
                reset({ title: "", description: "", url: "", date: "" });
                setShowForm(true);
              }}
            >
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Trophy className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No achievements added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {achievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{ach.title}</p>
                      {ach.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {ach.description}
                        </p>
                      )}
                      {ach.date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ach.date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(ach)}
                        aria-label={`Edit ${ach.title || "achievement"}`}
                        leftIcon={Plus}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(ach.id)}
                        aria-label={`Delete ${ach.title || "achievement"}`}
                        className="hover:text-destructive"
                        leftIcon={Trash2}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} Achievement
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Employee of the Year"
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
                placeholder="Describe your achievement..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  {...register("url")}
                  placeholder="https://..."
                />
                {errors.url && (
                  <p className="text-xs text-destructive">
                    {errors.url.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSaving}>
                {editingId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
