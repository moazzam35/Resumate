"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Briefcase,
  Sparkles,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { experienceSchema } from "@/validators";
import { post, put, del } from "@/lib/api";

export function ExperienceStep({ resume, resumeId, onGenerateTool }) {
  const [experiences, setExperiences] = useState(resume?.experiences || []);
  const { addExperience, updateExperience, removeExperience } = useResumeStore();

  useEffect(() => {
    if (resume?.experiences) setExperiences(resume.experiences);
  }, [resume]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(experienceSchema),
  });

  const isCurrent = watch("isCurrent");

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingId) {
        const res = await put(`/resumes/${resumeId}/experiences`, {
          itemId: editingId,
          ...data,
        });
        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? res.item : e))
        );
        updateExperience(res.item);
      } else {
        const res = await post(`/resumes/${resumeId}/experiences`, data);
        setExperiences((prev) => [...prev, res.item]);
        addExperience(res.item);
      }
      setShowForm(false);
      setEditingId(null);
      reset();
      showToast({ message: "Experience saved", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to save", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await del(`/resumes/${resumeId}/experiences?itemId=${id}`);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      removeExperience(id);
      showToast({ message: "Experience deleted", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to delete", type: "error" });
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    reset({
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      type: exp.type || "",
      startDate: exp.startDate
        ? new Date(exp.startDate).toISOString().split("T")[0]
        : "",
      endDate: exp.endDate
        ? new Date(exp.endDate).toISOString().split("T")[0]
        : "",
      isCurrent: exp.isCurrent,
      description: exp.description || "",
      highlights: exp.highlights || [],
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
            <CardDescription>
              Add your work experience to showcase your professional background
            </CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={Sparkles}
              className="flex-1 sm:flex-initial"
              onClick={() => onGenerateTool?.("IMPROVE_EXPERIENCE")}
            >
              Generate
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => {
                setEditingId(null);
                reset({
                  company: "",
                  position: "",
                  location: "",
                  type: "",
                  startDate: "",
                  endDate: "",
                  isCurrent: false,
                  description: "",
                  highlights: [],
                });
                setShowForm(true);
              }}
              leftIcon={Plus}
            >
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {experiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No experience added yet</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Add&quot; to include your work experience
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {experiences.map((exp) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{exp.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {exp.isCurrent
                          ? "Present"
                          : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(exp)}
                        aria-label={`Edit ${exp.position || "experience"}`}
                        leftIcon={Pencil}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(exp.id)}
                        aria-label={`Delete ${exp.position || "experience"}`}
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
              {editingId ? "Edit Experience" : "Add Experience"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" placeholder="Google" {...register("company")} />
                {errors.company && (
                  <p className="text-xs text-destructive">{errors.company.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  placeholder="Software Engineer"
                  {...register("position")}
                />
                {errors.position && (
                  <p className="text-xs text-destructive">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Bahawalnagar" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" placeholder="Full-time" {...register("type")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  disabled={isCurrent}
                  {...register("endDate")}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isCurrent"
                onCheckedChange={(checked) => setValue("isCurrent", checked)}
              />
              <Label htmlFor="isCurrent" className="text-sm">
                Currently working here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your role and responsibilities..."
                rows={3}
                {...register("description")}
              />
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
