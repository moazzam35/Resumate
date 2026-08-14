"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore, useUIStore } from "@/store";
import { skillSchema } from "@/validators";
import { post, del } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SKILL_COLORS = [
  "bg-stamp/10 text-stamp border-stamp/25",
  "bg-verified/10 text-verified border-verified/25",
  "bg-seal/10 text-seal border-seal/25",
  "bg-flag/10 text-flag border-flag/25",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
];

function getSkillColor(name, category, index) {
  const seed = category || name || "";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return SKILL_COLORS[seed ? hash % SKILL_COLORS.length : index % SKILL_COLORS.length];
}

export function SkillsStep({ resume, resumeId, onGenerateTool }) {
  const [skills, setSkills] = useState(resume?.skills || []);
  const { addSkill, removeSkill } = useResumeStore();
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [level, setLevel] = useState("INTERMEDIATE");
  const showToast = useUIStore((s) => s.showToast);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(skillSchema) });

  useEffect(() => {
    if (resume?.skills) setSkills(resume.skills);
  }, [resume?.skills]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const res = await post(`/resumes/${resumeId}/skills`, { ...data, level });
      setSkills((prev) => [...prev, res.item]);
      addSkill(res.item);
      setShowForm(false); reset(); setLevel("INTERMEDIATE");
      showToast({ message: "Skill added", type: "success" });
    } catch { showToast({ message: "Failed", type: "error" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await del(`/resumes/${resumeId}/skills?itemId=${id}`); setSkills((prev) => prev.filter((s) => s.id !== id)); removeSkill(id); showToast({ message: "Deleted", type: "success" }); } catch { showToast({ message: "Failed", type: "error" }); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Skills</CardTitle>
            <CardDescription>Add your technical and soft skills</CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button type="button" size="sm" variant="outline" leftIcon={Sparkles} className="flex-1 sm:flex-initial" onClick={() => onGenerateTool?.("GENERATE_SKILLS")}>
              Generate
            </Button>
            <Button type="button" size="sm" leftIcon={Plus} className="flex-1 sm:flex-initial" onClick={() => { reset({ name: "", category: "" }); setLevel("INTERMEDIATE"); setShowForm(true); }}>Add</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Wrench className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No skills added yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {skills.map((skill, index) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="default" className={cn("gap-1 pr-1 group", getSkillColor(skill.name, skill.category, index))}>
                      {skill.name}
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(skill.id)} aria-label={`Delete ${skill.name}`} className="ml-1 hover:bg-flag/20 hover:text-flag" leftIcon={Trash2} />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Skill Name *</Label><Input id="name" {...register("name")} placeholder="JavaScript" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" {...register("category")} placeholder="Programming Languages" /></div>
            <div className="space-y-2"><Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger aria-label="Level"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              <Button type="submit" loading={isSaving}>Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
