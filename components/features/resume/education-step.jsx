"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore, useUIStore } from "@/store";
import { educationSchema } from "@/validators";
import { post, put, del } from "@/lib/api";

export function EducationStep({ resume, resumeId }) {
  const [educations, setEducations] = useState(resume?.educations || []);
  const { addEducation, updateEducation, removeEducation } = useResumeStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(educationSchema) });
  const isCurrent = watch("isCurrent");

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingId) {
        const res = await put(`/resumes/${resumeId}/educations`, { itemId: editingId, ...data });
        setEducations((prev) => prev.map((e) => (e.id === editingId ? res.item : e)));
        updateEducation(res.item);
      } else {
        const res = await post(`/resumes/${resumeId}/educations`, data);
        setEducations((prev) => [...prev, res.item]);
        addEducation(res.item);
      }
      setShowForm(false); setEditingId(null); reset();
      showToast({ message: "Education saved", type: "success" });
    } catch { showToast({ message: "Failed to save", type: "error" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await del(`/resumes/${resumeId}/educations?itemId=${id}`); setEducations((prev) => prev.filter((e) => e.id !== id)); removeEducation(id); showToast({ message: "Deleted", type: "success" }); } catch { showToast({ message: "Failed", type: "error" }); }
  };

  const handleEdit = (edu) => {
    setEditingId(edu.id);
    reset({ institution: edu.institution, degree: edu.degree, field: edu.field || "", location: edu.location || "", startDate: edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "", endDate: edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "", isCurrent: edu.isCurrent, gpa: edu.gpa || "", highlights: edu.highlights || [] });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Education</CardTitle>
            <CardDescription>Add your educational background</CardDescription>
          </div>
          <Button size="sm" leftIcon={Plus} className="w-full sm:w-auto" onClick={() => { setEditingId(null); reset({ institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", isCurrent: false, gpa: "", highlights: [] }); setShowForm(true); }}>Add</Button>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {educations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No education added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {educations.map((edu) => (
                  <motion.div key={edu.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="group flex items-start justify-between rounded-lg border p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - {edu.isCurrent ? "Present" : edu.endDate ? new Date(edu.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(edu)} aria-label={`Edit ${edu.degree || "education"}`} leftIcon={Plus} />
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(edu.id)} aria-label={`Delete ${edu.degree || "education"}`} className="hover:text-flag" leftIcon={Trash2} />
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Education</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2"><Label htmlFor="institution">Institution *</Label><Input id="institution" {...register("institution")} placeholder="MIT" />{errors.institution && <p className="text-xs text-destructive">{errors.institution.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="degree">Degree *</Label><Input id="degree" {...register("degree")} placeholder="Bachelor's" />{errors.degree && <p className="text-xs text-destructive">{errors.degree.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="field">Field</Label><Input id="field" {...register("field")} placeholder="Computer Science" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="startDate">Start Date *</Label><Input id="startDate" type="date" {...register("startDate")} />{errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="endDate">End Date</Label><Input id="endDate" type="date" disabled={isCurrent} {...register("endDate")} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch aria-label="Currently studying here" onCheckedChange={(c) => setValue("isCurrent", c)} /><Label className="text-sm">Currently studying here</Label></div>
            <div className="space-y-2"><Label htmlFor="gpa">GPA</Label><Input id="gpa" {...register("gpa")} placeholder="3.8/4.0" /></div>
            <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" {...register("location")} placeholder="Cambridge, MA" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>Cancel</Button>
              <Button type="submit" loading={isSaving}>{editingId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
