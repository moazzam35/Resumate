"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResumeStore, useUIStore } from "@/store";
import { certificateSchema } from "@/validators";
import { post, del } from "@/lib/api";

export function CertificatesStep({ resume, resumeId }) {
  const [certificates, setCertificates] = useState(resume?.certificates || []);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const { addCertificate, removeCertificate } = useResumeStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(certificateSchema) });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const res = await post(`/resumes/${resumeId}/certificates`, data);
      setCertificates((prev) => [...prev, res.item]);
      addCertificate(res.item);
      setShowForm(false); reset();
      showToast({ message: "Certificate added", type: "success" });
    } catch { showToast({ message: "Failed", type: "error" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await del(`/resumes/${resumeId}/certificates?itemId=${id}`); setCertificates((prev) => prev.filter((c) => c.id !== id)); removeCertificate(id); showToast({ message: "Deleted", type: "success" }); } catch { showToast({ message: "Failed", type: "error" }); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Certificates</CardTitle>
            <CardDescription>Add your certifications and licenses</CardDescription>
          </div>
          <Button size="sm" leftIcon={Plus} className="w-full sm:w-auto" onClick={() => { reset({ name: "", issuer: "", url: "", date: "" }); setShowForm(true); }}>Add</Button>
        </CardHeader>
        <CardContent className="px-0 md:px-5">
          {certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Award className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No certificates added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {certificates.map((cert) => (
                  <motion.div key={cert.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="group flex items-start justify-between rounded-lg border p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      {cert.date && <p className="text-xs text-muted-foreground">{new Date(cert.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>}
                    </div>
                    <Button variant="ghost" size="icon-sm" className="shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-flag" onClick={() => handleDelete(cert.id)} aria-label={`Delete ${cert.name}`} leftIcon={Trash2} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Certificate</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" {...register("name")} placeholder="AWS Solutions Architect" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="issuer">Issuer *</Label><Input id="issuer" {...register("issuer")} placeholder="Amazon Web Services" />{errors.issuer && <p className="text-xs text-destructive">{errors.issuer.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" {...register("date")} /></div>
            <div className="space-y-2"><Label htmlFor="url">URL</Label><Input id="url" {...register("url")} placeholder="https://..." /></div>
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
