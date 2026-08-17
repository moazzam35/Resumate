"use client";

import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResumeStore, useUIStore } from "@/store";
import { personalInfoSchema } from "@/validators";
import { put } from "@/lib/api";

export function PersonalInfoStep({ resume, resumeId, onGenerateTool }) {
  const { setCurrentResume, setLastSaved } = useResumeStore();
  const showToast = useUIStore((s) => s.showToast);

  const pi = resume?.personalInfo || {};

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: pi.name ?? resume?.name ?? "",
      email: pi.email ?? resume?.email ?? "",
      phone: pi.phone ?? resume?.phone ?? "",
      location: pi.location ?? resume?.location ?? "",
      title: pi.title ?? resume?.title ?? "",
      summary: resume?.summary ?? pi.summary ?? "",
      linkedin: pi.linkedin ?? resume?.linkedin ?? "",
      github: pi.github ?? resume?.github ?? "",
      portfolio: pi.portfolio ?? resume?.portfolio ?? "",
    },
  });

  const summaryLength = watch("summary")?.length || 0;

  const values = watch();
  const snapshot = JSON.stringify(values);
  const isInitialMount = useRef(true);
  const pendingRef = useRef(false);
  const saveTimer = useRef(null);
  const prevSnapshot = useRef(snapshot);
  const latestValues = useRef(values);

  useEffect(() => {
    latestValues.current = values;
  }, [snapshot]);

  const doSave = useCallback(async () => {
    const payload = latestValues.current;
    const current = useResumeStore.getState().currentResume || {};
    const { summary, ...piFields } = payload;
    setCurrentResume({
      ...current,
      personalInfo: { ...(current.personalInfo || {}), ...piFields },
      summary,
    });
    try {
      const res = await put(`/resumes/${resumeId}`, payload);
      const saved = res?.resume || res;
      if (saved) setCurrentResume(saved);
      setLastSaved(new Date());
    } catch (error) {
      showToast({ message: "Failed to auto-save", type: "error" });
    }
  }, [resumeId, setCurrentResume, setLastSaved, showToast]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (snapshot === prevSnapshot.current) return;
    prevSnapshot.current = snapshot;
    pendingRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      pendingRef.current = false;
      doSave();
    }, 600);
  }, [snapshot, doSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      if (pendingRef.current) {
        put(`/resumes/${resumeId}`, latestValues.current).catch(() => {});
      }
    };
  }, [resumeId]);

  useEffect(() => {
    const nextSummary = resume?.summary ?? resume?.personalInfo?.summary ?? "";
    if (getValues("summary") !== nextSummary) {
      setValue("summary", nextSummary, { shouldValidate: true, shouldDirty: true });
    }
  }, [resume?.summary, resume?.personalInfo?.summary, getValues, setValue]);

  const onSubmit = async (data) => {
    try {
      const res = await put(`/resumes/${resumeId}`, data);
      const saved = res?.resume || res;
      if (saved) {
        setCurrentResume(saved);
      } else {
        const { summary, ...piFields } = data;
        setCurrentResume({
          ...resume,
          personalInfo: { ...(resume?.personalInfo || {}), ...piFields },
          summary,
        });
      }
      showToast({ message: "Personal info saved", type: "success" });
    } catch (error) {
      showToast({ message: "Failed to save", type: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Tell us about yourself. This information will appear at the top of
              your resume.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={Sparkles}
            className="hidden sm:inline-flex shrink-0"
            onClick={() => onGenerateTool?.("SUMMARY")}
          >
            Generate
          </Button>
        </CardHeader>
        <CardContent className="space-y-5 px-0 md:space-y-4 md:px-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Moazzam" error={errors.name?.message} {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="moazzampasha@gmail.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="030000000000"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Bahawalnagar"
                {...register("location")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="Software Engineer"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary *</Label>
            <Textarea
              id="summary"
              placeholder="Write a brief professional summary..."
              rows={4}
              error={errors.summary?.message}
              helperText={
                !errors.summary?.message ? `${summaryLength}/50 characters` : undefined
              }
              {...register("summary")}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={Sparkles}
              className="w-full sm:hidden mt-1.5"
              onClick={() => onGenerateTool?.("SUMMARY")}
            >
              Improve with AI
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://www.linkedin.com/in/moazzam-pasha-9619783a9/"
                error={errors.linkedin?.message}
                {...register("linkedin")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                placeholder="https://github.com/moazzam35"
                error={errors.github?.message}
                {...register("github")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                id="portfolio"
                placeholder="https://moazzam35.github.io/portfolio/"
                error={errors.portfolio?.message}
                {...register("portfolio")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
