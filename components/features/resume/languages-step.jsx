"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { languageSchema } from "@/validators";
import { post, put, del } from "@/lib/api";

const PROFICIENCY_LABELS = {
  BASIC: "Basic",
  CONVERSATIONAL: "Conversational",
  FLUENT: "Fluent",
  NATIVE: "Native",
  PROFESSIONAL: "Professional",
};

export function LanguagesStep({ resume, resumeId }) {
  const [languages, setLanguages] = useState(resume?.languages || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [proficiency, setProficiency] = useState("CONVERSATIONAL");
  const showToast = useUIStore((s) => s.showToast);
  const { addLanguage, updateLanguage, removeLanguage } = useResumeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(languageSchema),
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingId) {
        const res = await put(`/resumes/${resumeId}/languages`, {
          itemId: editingId,
          ...data,
          proficiency,
        });
        setLanguages((prev) =>
          prev.map((l) => (l.id === editingId ? res.item : l))
        );
        updateLanguage(res.item);
      } else {
        const res = await post(`/resumes/${resumeId}/languages`, {
          ...data,
          proficiency,
        });
        setLanguages((prev) => [...prev, res.item]);
        addLanguage(res.item);
      }
      setShowForm(false);
      setEditingId(null);
      reset();
      setProficiency("CONVERSATIONAL");
      showToast({ message: "Language saved", type: "success" });
    } catch {
      showToast({ message: "Failed to save", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await del(`/resumes/${resumeId}/languages?itemId=${id}`);
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      removeLanguage(id);
      showToast({ message: "Deleted", type: "success" });
    } catch {
      showToast({ message: "Failed", type: "error" });
    }
  };

  const handleEdit = (lang) => {
    setEditingId(lang.id);
    setProficiency(lang.proficiency || "CONVERSATIONAL");
    reset({ name: lang.name });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Languages
            </CardTitle>
            <CardDescription>Add languages you speak</CardDescription>
          </div>
          <Button
            size="sm"
            leftIcon={Plus}
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingId(null);
              reset({ name: "" });
              setProficiency("CONVERSATIONAL");
              setShowForm(true);
            }}
          >
            Add
          </Button>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {languages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Globe className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No languages added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {languages.map((lang) => (
                  <motion.div
                    key={lang.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{lang.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {PROFICIENCY_LABELS[lang.proficiency] || lang.proficiency}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(lang)}
                        aria-label={`Edit ${lang.name}`}
                        leftIcon={Plus}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(lang.id)}
                        aria-label={`Delete ${lang.name}`}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "Add"} Language
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2">
              <Label>Language *</Label>
              <Input
                {...register("name")}
                placeholder="English"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Proficiency</Label>
              <Select value={proficiency} onValueChange={setProficiency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="CONVERSATIONAL">Conversational</SelectItem>
                  <SelectItem value="FLUENT">Fluent</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="NATIVE">Native</SelectItem>
                </SelectContent>
              </Select>
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
