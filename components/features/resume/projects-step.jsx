"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FolderOpen, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore, useUIStore } from "@/store";
import { projectSchema } from "@/validators";
import { post, put, del } from "@/lib/api";

export function ProjectsStep({ resume, resumeId, onGenerateTool }) {
  const [projects, setProjects] = useState(resume?.projects || []);
  const { addProject, updateProject, removeProject } = useResumeStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState("");
  const showToast = useUIStore((s) => s.showToast);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema) });

  useEffect(() => {
    if (resume?.projects) setProjects(resume.projects);
  }, [resume?.projects]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const techs = techInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = { ...data, technologies: techs };
      if (editingId) {
        const res = await put(`/resumes/${resumeId}/projects`, { itemId: editingId, ...payload });
        setProjects((prev) => prev.map((p) => (p.id === editingId ? res.item : p)));
        updateProject(res.item);
      } else {
        const res = await post(`/resumes/${resumeId}/projects`, payload);
        setProjects((prev) => [...prev, res.item]);
        addProject(res.item);
      }
      setShowForm(false); setEditingId(null); reset(); setTechInput("");
      showToast({ message: "Project saved", type: "success" });
    } catch { showToast({ message: "Failed", type: "error" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await del(`/resumes/${resumeId}/projects?itemId=${id}`); setProjects((prev) => prev.filter((p) => p.id !== id)); removeProject(id); showToast({ message: "Deleted", type: "success" }); } catch { showToast({ message: "Failed", type: "error" }); }
  };

  const handleEdit = (proj) => {
    setEditingId(proj.id);
    reset({ name: proj.name, description: proj.description || "", url: proj.url || "", github: proj.github || "", startDate: proj.startDate ? new Date(proj.startDate).toISOString().split("T")[0] : "", endDate: proj.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "" });
    setTechInput((proj.technologies || []).join(", "));
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Projects</CardTitle>
            <CardDescription>Showcase your best projects</CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button type="button" size="sm" variant="outline" leftIcon={Sparkles} className="flex-1 sm:flex-initial" onClick={() => onGenerateTool?.("GENERATE_PROJECTS")}>Generate</Button>
            <Button type="button" size="sm" leftIcon={Plus} className="flex-1 sm:flex-initial" onClick={() => { setEditingId(null); reset({ name: "", description: "", url: "", github: "", startDate: "", endDate: "" }); setTechInput(""); setShowForm(true); }}>Add</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No projects added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {projects.map((proj) => (
                  <motion.div key={proj.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="group flex items-start justify-between rounded-lg border p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{proj.name}</p>
                      {proj.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{proj.description}</p>}
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.technologies.map((tech, i) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(proj)} aria-label={`Edit ${proj.name}`} leftIcon={Pencil} />
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(proj.id)} aria-label={`Delete ${proj.name}`} className="hover:text-flag" leftIcon={Trash2} />
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Project</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2"><Label>Project Name *</Label><Input {...register("name")} placeholder="E-commerce Platform" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register("description")} rows={3} placeholder="Describe your project..." /></div>
            <div className="space-y-2"><Label>Technologies</Label><Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="React, Node.js, PostgreSQL" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>URL</Label><Input {...register("url")} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>GitHub</Label><Input {...register("github")} placeholder="https://github.com/..." /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); reset(); setTechInput(""); }}>Cancel</Button>
              <Button type="submit" loading={isSaving}>{editingId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
