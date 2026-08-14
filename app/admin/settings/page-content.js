"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, BrainCircuit, CreditCard, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "",
    siteUrl: "",
    aiModel: "llama-3.3-70b-versatile",
    aiEnabled: true,
    stripeEnabled: false,
    emailEnabled: true,
    maxResumesPerUser: 1,
    freeAiRequestsPerDay: 50,
    proAiRequestsPerDay: 500,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/admin/settings", { headers });
        const data = await res.json();
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Failed to save settings (${res.status})`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveError(err.message || "Failed to save settings");
      setTimeout(() => setSaveError(null), 6000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Settings"
          description="Configure platform settings and preferences."
        />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-28" />
          ))}
        </div>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Configure platform settings and preferences."
      >
        <Button onClick={handleSave} disabled={saving} loading={saving} leftIcon={Save}>
          {saveError ? "Save Failed" : saved ? "Saved!" : "Save Changes"}
        </Button>
      </PageHeader>

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-flag/10 border border-flag/20"
        >
          <span className="text-xs font-medium text-flag">{saveError}</span>
        </motion.div>
      )}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-verified/10 border border-verified/20"
        >
          <span className="text-xs font-medium text-verified">Settings saved.</span>
        </motion.div>
      )}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/40">
        <span className="text-xs text-muted">
          These settings are read from environment variables (.env) and can only be changed on the
          server — saving from this page is not supported yet.
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <BrainCircuit className="h-4 w-4" />
              AI Config
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">Site Configuration</CardTitle>
                    <CardDescription>Basic platform settings and branding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input
                          id="site-name"
                          value={settings.siteName}
                          onChange={(e) => updateField("siteName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site-url">Site URL</Label>
                        <Input
                          id="site-url"
                          value={settings.siteUrl}
                          onChange={(e) => updateField("siteUrl", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">Feature Flags</CardTitle>
                    <CardDescription>Enable or disable platform features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      <SettingRow
                        label="AI Resume Builder"
                        description="Allow users to use AI to generate resume content"
                      >
                        <Switch
                          checked={settings.aiEnabled}
                          onCheckedChange={(checked) => updateField("aiEnabled", checked)}
                        />
                      </SettingRow>
                      <SettingRow
                        label="Stripe Integration"
                        description="Enable Stripe payment processing"
                      >
                        <Switch
                          checked={settings.stripeEnabled}
                          onCheckedChange={(checked) => updateField("stripeEnabled", checked)}
                        />
                      </SettingRow>
                      <SettingRow
                        label="Email Notifications"
                        description="Enable email notification system"
                      >
                        <Switch
                          checked={settings.emailEnabled}
                          onCheckedChange={(checked) => updateField("emailEnabled", checked)}
                        />
                      </SettingRow>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">AI Model Configuration</CardTitle>
                    <CardDescription>Configure AI models and usage limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Primary AI Model</Label>
                        <Select
                          value={settings.aiModel}
                          onValueChange={(val) => updateField("aiModel", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Free Plan Daily AI Limit</Label>
                        <Input
                          type="number"
                          value={settings.freeAiRequestsPerDay}
                          onChange={(e) => updateField("freeAiRequestsPerDay", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pro Plan Daily AI Limit</Label>
                        <Input
                          type="number"
                          value={settings.proAiRequestsPerDay}
                          onChange={(e) => updateField("proAiRequestsPerDay", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Resumes Per User</Label>
                        <Input
                          type="number"
                          value={settings.maxResumesPerUser}
                          onChange={(e) => updateField("maxResumesPerUser", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="billing">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">Subscription Plans</CardTitle>
                    <CardDescription>Configure pricing and plan features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { name: "Free", price: "$0", features: ["1 resume", "Basic templates", `${settings.freeAiRequestsPerDay} AI requests/day`] },
                        { name: "Pro", price: "$12/mo", features: ["Unlimited resumes", "All templates", `${settings.proAiRequestsPerDay} AI requests/day`, "Priority support"] },
                        { name: "Enterprise", price: "$29/mo", features: ["Everything in Pro", "5000 AI requests/day", "Custom templates", "API access", "Dedicated support"] },
                      ].map((plan) => (
                        <div key={plan.name} className="rounded-md border p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-2xl font-semibold mt-1">{plan.price}</p>
                          </div>
                          <Separator />
                          <ul className="space-y-1.5 text-sm text-muted">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-stamp" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">Payment Settings</CardTitle>
                    <CardDescription>Configure payment processing options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      <SettingRow
                        label="Stripe Integration"
                        description="Enable or disable Stripe payment processing"
                      >
                        <Switch
                          checked={settings.stripeEnabled}
                          onCheckedChange={(checked) => updateField("stripeEnabled", checked)}
                        />
                      </SettingRow>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item}>
                <Card>
                  <CardHeader>
                    <CardTitle className="heading-display">Email Notifications</CardTitle>
                    <CardDescription>Configure email notification settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      <SettingRow
                        label="Email Notifications"
                        description="Enable or disable email notifications globally"
                      >
                        <Switch
                          checked={settings.emailEnabled}
                          onCheckedChange={(checked) => updateField("emailEnabled", checked)}
                        />
                      </SettingRow>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
