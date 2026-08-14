"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Shrink,
  Wand2,
  Mic,
  Briefcase,
  Clock,
  ChevronDown,
  Code,
  Users,
  AlertCircle,
  Lightbulb,
  MessageSquareText,
  X,
  Square,
  Loader2,
  BookOpen,
  Target,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";
import { cn } from "@/lib/utils";

const categoryConfig = {
  technical: { label: "Technical", icon: Code, color: "bg-stamp/10 text-stamp" },
  behavioral: { label: "Behavioral", icon: Users, color: "bg-seal/10 text-seal" },
  situational: { label: "Situational", icon: AlertCircle, color: "bg-flag/10 text-flag" },
};

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  return Math.abs(hash >>> 0);
}

const DIFFICULTY = {
  easy: { label: "Easy", dot: "bg-verified", time: "~1 min" },
  medium: { label: "Medium", dot: "bg-seal", time: "~2 min" },
  hard: { label: "Hard", dot: "bg-flag", time: "~3 min" },
};

function getDifficulty(question) {
  const r = hashString(question) % 10;
  if (r < 3) return DIFFICULTY.easy;
  if (r < 7) return DIFFICULTY.medium;
  return DIFFICULTY.hard;
}

function parseQuestions(result) {
  if (!result) return null;

  if (typeof result === "object") {
    const parsed = {};
    for (const [key, value] of Object.entries(result)) {
      if (Array.isArray(value)) {
        parsed[key] = value.map((item, i) => ({
          id: `${key}-${i}`,
          question: item.question || item.q || String(item),
          answer: item.answer || item.a || "",
        }));
      }
    }
    return Object.keys(parsed).length > 0 ? parsed : null;
  }

  if (typeof result === "string") {
    try {
      const json = JSON.parse(result);
      return parseQuestions(json);
    } catch {
      return {
        general: [
          {
            id: "general-0",
            question: "Interview Questions",
            answer: result,
          },
        ],
      };
    }
  }

  return null;
}

function parseAnswer(text) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const blocks = [];
  const isBullet = (l) => /^[-*•]|\d+[.)]/.test(l);
  let para = [];
  let bullets = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushBullets = () => {
    if (bullets) {
      blocks.push({ type: "ul", items: bullets });
      bullets = null;
    }
  };

  for (const line of lines) {
    if (isBullet(line)) {
      flushPara();
      if (!bullets) bullets = [];
      bullets.push(line.replace(/^[-*•]\s*|\d+[.)]\s*/, ""));
    } else {
      flushBullets();
      para.push(line);
    }
  }
  flushBullets();
  flushPara();

  return blocks.length ? blocks : [{ type: "p", text: String(text || "") }];
}

async function runAIAction(type, data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ type, data }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || !payload.success) {
    throw new Error(payload.message || "AI request failed. Please try again.");
  }
  return payload.result;
}

function toStringAnswer(result) {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    return result.answer || result.text || result.rewritten || "";
  }
  return String(result ?? "");
}

function Inline({ text }) {
  const source = String(text || "");
  const parts = source.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);

  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          ) : part.startsWith("__") && part.endsWith("__") && part.length > 4 ? (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  const colon = source.indexOf(":");
  if (colon > 0 && colon <= 44) {
    return (
      <>
        <strong className="font-semibold text-ink">{source.slice(0, colon + 1)}</strong>
        {source.slice(colon + 1)}
      </>
    );
  }

  return source;
}

function AnswerBody({ text }) {
  const blocks = parseAnswer(text);

  return (
    <div className="min-w-0 break-words space-y-3 text-sm leading-[1.7] text-ink-soft">
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        ) : (
          <ul key={i} className="space-y-1.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-stamp/40" />
                <span>
                  <Inline text={item} />
                </span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function AnswerCard({ answer }) {
  return (
    <div className="rounded-md border border-border border-l-2 border-l-stamp/40 bg-surface">
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-stamp" />
          <span className="mono-data text-[10px] font-semibold uppercase tracking-wider text-stamp">
            AI Suggested Answer
          </span>
        </div>
        {!answer ? (
          <p className="text-sm text-muted">No suggested answer available.</p>
        ) : (
          <AnswerBody text={answer} />
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="mb-1.5 text-xs font-semibold text-ink">{children}</p>;
}

function BulletGroup({ title, items, dot }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className={cn("mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full", dot || "bg-stamp/40")} />
            <span>
              <Inline text={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExplanationContent({ explanation }) {
  if (typeof explanation === "string") {
    return (
      <p className="text-sm leading-[1.7] text-ink-soft">
        <Inline text={explanation} />
      </p>
    );
  }

  const e = explanation || {};
  return (
    <div className="space-y-4 text-sm leading-[1.7] text-ink-soft">
      {e.overview && (
        <p>
          <Inline text={e.overview} />
        </p>
      )}
      {Array.isArray(e.steps) && e.steps.length > 0 && (
        <div>
          <SectionLabel>Step by step</SectionLabel>
          <ol className="space-y-1.5">
            {e.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mono-data mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border bg-paper text-[10px] font-semibold tabular-nums text-ink-soft">
                  {i + 1}
                </span>
                <span>
                  <Inline text={s} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {e.example && (
        <div>
          <SectionLabel>Example</SectionLabel>
          <div className="rounded-sm border border-border bg-paper px-3 py-2.5">
            <Inline text={e.example} />
          </div>
        </div>
      )}
      {Array.isArray(e.bestPractices) && e.bestPractices.length > 0 && (
        <BulletGroup title="Best practices" items={e.bestPractices} dot="bg-verified/60" />
      )}
      {Array.isArray(e.commonMistakes) && e.commonMistakes.length > 0 && (
        <BulletGroup title="Common mistakes" items={e.commonMistakes} dot="bg-flag/60" />
      )}
    </div>
  );
}

function ExplanationBlock({ explanation, onClose }) {
  return (
    <div className="mt-3 rounded-md border border-border border-l-2 border-l-stamp/40 bg-surface">
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-stamp" />
            <span className="mono-data text-[10px] font-semibold uppercase tracking-wider text-stamp">
              Detailed Explanation
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close explanation"
            className="rounded-sm p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <ExplanationContent explanation={explanation} />
      </div>
    </div>
  );
}

function VariantBlock({ label, text, icon: Icon, onClose }) {
  return (
    <div className="rounded-md border border-border border-l-2 border-l-stamp/40 bg-surface">
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-stamp" />
            <span className="mono-data text-[10px] font-semibold uppercase tracking-wider text-stamp">
              {label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${label}`}
            className="rounded-sm p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <AnswerBody text={text} />
      </div>
    </div>
  );
}

function AnswerActions({
  copied,
  busyAction,
  onCopy,
  onRegenerate,
  onExplain,
  onShorter,
  onProfessional,
  onPractice,
}) {
  const busy = busyAction !== null;
  const actions = [
    { id: "copy", label: copied ? "Copied" : "Copy", title: "Copy question and answer", icon: copied ? Check : Copy, onClick: onCopy, active: copied },
    { id: "regenerate", label: "Regenerate", title: "Regenerate answer", icon: RefreshCw, onClick: onRegenerate, loading: busyAction === "regenerate" },
    { id: "explain", label: "Explain", title: "Explain the answer", icon: Lightbulb, onClick: onExplain, loading: busyAction === "explain" },
    { id: "shorter", label: "Shorter", title: "Concise version", icon: Shrink, onClick: onShorter, loading: busyAction === "shorter" },
    { id: "professional", label: "Professional", title: "Professional version", icon: Wand2, onClick: onProfessional, loading: busyAction === "professional" },
    { id: "practice", label: "Practice", title: "Practice speaking", icon: Mic, onClick: onPractice, loading: busyAction === "practice" },
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button
          key={a.id}
          variant="outline"
          size="sm"
          title={a.title}
          leftIcon={a.icon}
          onClick={a.onClick}
          loading={a.loading}
          disabled={busy}
          className={cn("px-3 text-xs", a.active && "border-stamp/40 text-stamp")}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}

function QuestionCard({ item, index, jobTitle, onUpdateAnswer, aiAtLimit, onAiLimit }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [shorter, setShorter] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const difficulty = getDifficulty(item.question || "");
  const answerText = typeof item.answer === "string" ? item.answer : "";
  const busy = busyAction !== null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Q: ${item.question}\n\nA: ${answerText}`);
      setCopied(true);
      showToast({ message: "Question and answer copied to clipboard", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: "Failed to copy to clipboard", type: "error" });
    }
  };

  const runAction = async (action, type, data) => {
    if (busy) return null;
    if (aiAtLimit) {
      onAiLimit?.();
      return null;
    }
    setBusyAction(action);
    try {
      return await runAIAction(type, data);
    } catch (error) {
      showToast({ message: error.message || "AI request failed. Please try again.", type: "error" });
      return null;
    } finally {
      setBusyAction(null);
    }
  };

  const handleRegenerate = async () => {
    const result = await runAction("regenerate", "REGENERATE_ANSWER", {
      jobTitle,
      question: item.question,
      answer: answerText,
    });
    if (result != null) {
      onUpdateAnswer(item.id, toStringAnswer(result));
      showToast({ message: "New answer generated", type: "success" });
    }
  };

  const handleExplain = async () => {
    const result = await runAction("explain", "EXPLAIN_ANSWER", {
      jobTitle,
      question: item.question,
      answer: answerText,
    });
    if (result != null) setExplanation(result);
  };

  const handleShorter = async () => {
    const result = await runAction("shorter", "SHORTER_ANSWER", {
      jobTitle,
      question: item.question,
      answer: answerText,
    });
    if (result != null) setShorter(toStringAnswer(result));
  };

  const handleProfessional = async () => {
    const result = await runAction("professional", "PROFESSIONAL_ANSWER", {
      jobTitle,
      question: item.question,
      answer: answerText,
    });
    if (result != null) setProfessional(toStringAnswer(result));
  };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card transition-colors duration-200 hover:border-border-strong">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper"
      >
        <span className="mono-data mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-paper text-[11px] font-semibold tabular-nums text-ink-soft">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-medium leading-snug text-ink">
            {item.question}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", difficulty.dot)} aria-hidden="true" />
              {difficulty.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {difficulty.time}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{
          height: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
          opacity: { duration: 0.22, delay: open ? 0.04 : 0 },
        }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4">
          <AnswerCard answer={answerText} />
          {explanation && (
            <ExplanationBlock explanation={explanation} onClose={() => setExplanation(null)} />
          )}
          {(shorter || professional) && (
            <div className="mt-3 space-y-3">
              {shorter && (
                <VariantBlock label="Concise version" text={shorter} icon={Shrink} onClose={() => setShorter(null)} />
              )}
              {professional && (
                <VariantBlock label="Professional version" text={professional} icon={Wand2} onClose={() => setProfessional(null)} />
              )}
            </div>
          )}
          <AnswerActions
            copied={copied}
            busyAction={busyAction}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onExplain={handleExplain}
            onShorter={handleShorter}
            onProfessional={handleProfessional}
            onPractice={() => setPracticeOpen(true)}
          />
          <PracticeModal
            open={practiceOpen}
            onOpenChange={setPracticeOpen}
            question={item.question}
            jobTitle={jobTitle}
          />
        </div>
      </motion.div>
    </div>
  );
}

function ScoreList({ title, items, icon: Icon, tone, dot }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", tone)} />
        <span className="text-xs font-semibold text-ink">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-snug text-ink-soft">
            <span className={cn("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <span>
              <Inline text={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvaluationResult({ result }) {
  const score = Math.max(0, Math.min(100, Number(result.score) || 0));
  const scoreTone = score >= 80 ? "text-verified" : score >= 60 ? "text-seal" : "text-flag";
  const barTone = score >= 80 ? "bg-verified" : score >= 60 ? "bg-seal" : "bg-flag";

  return (
    <div className="space-y-4 rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-paper">
          <span className={cn("mono-data text-xl font-bold", scoreTone)}>{score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Overall score</p>
          <p className="mt-1 text-sm leading-snug text-ink-soft">{result.feedback}</p>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barTone)}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreList title="Strengths" items={result.strengths} icon={ThumbsUp} tone="text-verified" dot="bg-verified/70" />
        <ScoreList title="Weaknesses" items={result.weaknesses} icon={ThumbsDown} tone="text-flag" dot="bg-flag/70" />
      </div>
      <ScoreList title="Suggested improvements" items={result.improvements} icon={TrendingUp} tone="text-seal" dot="bg-seal/70" />
      <div className="rounded-md border border-border bg-paper p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-stamp" />
          <span className="mono-data text-[10px] font-semibold uppercase tracking-wider text-stamp">
            Ideal answer
          </span>
        </div>
        <AnswerBody text={result.idealAnswer} />
      </div>
    </div>
  );
}

function PracticeModal({ open, onOpenChange, question, jobTitle }) {
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const showToast = useUIStore((s) => s.showToast);
  const recognitionRef = useRef(null);

  const reset = () => {
    setAnswer("");
    setResult(null);
    setError(null);
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const handleOpenChange = (next) => {
    if (!next && isEvaluating) return;
    onOpenChange(next);
    if (!next) reset();
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      showToast({ message: "Voice input isn't supported in this browser. Please type instead.", type: "error" });
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setAnswer(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      showToast({ message: "Could not capture voice. Please type your answer instead.", type: "error" });
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleEvaluate = async () => {
    if (!answer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setError(null);
    setResult(null);
    try {
      const res = await runAIAction("PRACTICE_INTERVIEW", { jobTitle, question, candidateAnswer: answer });
      if (res && typeof res === "object") {
        setResult(res);
      } else {
        setError("Could not evaluate the answer. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Practice answering</DialogTitle>
        <DialogDescription className="sr-only">
          Type or speak your answer and get AI feedback with a score, strengths, weaknesses, and an ideal answer.
        </DialogDescription>
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          aria-label="Close practice"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-paper text-ink-soft transition-colors hover:bg-paper-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Question</p>
            <p className="mt-1.5 text-sm font-medium leading-snug text-ink">{question}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="practice-answer" className="text-xs font-semibold text-ink-soft">
                Your answer
              </label>
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40",
                  isListening
                    ? "border-flag/40 bg-flag/10 text-flag"
                    : "border-border text-muted hover:border-border-strong hover:text-ink"
                )}
                aria-label={isListening ? "Stop recording" : "Speak your answer"}
              >
                {isListening ? (
                  <>
                    <Square className="h-3 w-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3" />
                    Speak
                  </>
                )}
              </button>
            </div>
            <textarea
              id="practice-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder="Type or speak your answer..."
              className="w-full resize-y rounded-md border border-border bg-paper px-3 py-3 text-base leading-relaxed text-ink placeholder:text-muted focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/30 min-h-[140px] sm:min-h-[120px] sm:py-2.5 sm:text-sm"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isEvaluating ? (
            <div className="flex items-center justify-center gap-2.5 rounded-md border border-border bg-surface py-8 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-stamp" />
              Evaluating your answer...
            </div>
          ) : (
            result && <EvaluationResult result={result} />
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleEvaluate}
              disabled={!answer.trim() || isEvaluating}
              loading={isEvaluating}
              leftIcon={Sparkles}
            >
              {result ? "Re-evaluate" : "Evaluate answer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  const benefits = [
    "Technical questions",
    "Behavioral questions",
    "Situational questions",
    "AI-suggested answers",
  ];

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center sm:py-14">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stamp/10">
        <MessageSquareText className="h-5 w-5 text-stamp" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">Ready to start preparing?</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        Enter a target role above and generate a personalized set of interview questions.
      </p>
      <ul className="mt-5 flex max-w-sm flex-wrap items-center justify-center gap-1.5">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-soft"
          >
            <Check className="h-3 w-3 text-verified" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const { atAiLimit, isEnterprise } = useSubscription();
  const aiAtLimit = atAiLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGenerate = async () => {
    const role = jobTitle.trim();
    if (!role || isGenerating) return;
    if (aiAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await runAIAction("INTERVIEW_QUESTIONS", { jobTitle: role });
      const parsed = parseQuestions(result);
      if (parsed) {
        setTargetRole(role);
        setQuestions(parsed);
      } else {
        setError("Could not parse interview questions. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateAnswer = (id, answer) => {
    setQuestions((prev) => {
      if (!prev) return prev;
      const next = {};
      for (const [category, items] of Object.entries(prev)) {
        next[category] = items.map((it) => (it.id === id ? { ...it, answer } : it));
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-3xl space-y-6"
    >
      <section aria-labelledby="interview-prep-title" className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10">
              <MessageSquareText className="h-5 w-5 text-stamp" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="interview-prep-title" className="text-base font-semibold text-ink">
                Interview Prep
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">
                Generate tailored interview questions based on your target role.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="target-role-input"
              className="mb-1.5 block text-xs font-semibold text-ink-soft"
            >
              Target Role
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="group flex h-12 min-w-0 w-full items-center overflow-hidden rounded-lg border border-border bg-paper transition-colors duration-200 focus-within:border-stamp/70 focus-within:ring-[3px] focus-within:ring-stamp/15 sm:w-auto sm:flex-1">
                <span className="flex h-full w-11 shrink-0 items-center justify-center text-muted transition-colors duration-200 group-focus-within:text-stamp">
                  <Briefcase className="h-5 w-5 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                </span>
                <input
                  id="target-role-input"
                  type="text"
                  autoComplete="off"
                  aria-describedby="target-role-hint"
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base font-medium text-ink placeholder:font-normal placeholder:text-muted focus:outline-none sm:text-sm"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle.trim()}
                loading={isGenerating}
                showLabelWhileLoading
                className={cn(
                  "h-12 w-full shrink-0 rounded-lg px-5 text-base font-semibold sm:w-auto sm:px-6 sm:text-sm",
                  aiAtLimit && "opacity-40"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {!isGenerating && <Sparkles className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />}
                  <span>{isGenerating ? "Generating questions..." : "Generate Questions"}</span>
                </span>
              </Button>
            </div>
          </div>

          <p id="target-role-hint" className="mt-4 text-xs leading-relaxed text-muted">
            Questions are tailored to your target role and include AI-generated suggested answers.
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {questions ? (
        <div className="space-y-8">
          {Object.entries(questions).map(([category, items]) => {
            const config = categoryConfig[category] || {
              label: category.charAt(0).toUpperCase() + category.slice(1),
              icon: MessageSquareText,
              color: "bg-muted/10 text-muted",
            };
            const Icon = config.icon;
            return (
              <section key={category} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-sm", config.color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-ink">{config.label} Questions</h2>
                  <span className="mono-data rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted">
                    {items.length}
                  </span>
                  <span className="ml-1 h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <QuestionCard
                      key={item.id}
                      item={item}
                      index={index}
                      jobTitle={targetRole || jobTitle}
                      onUpdateAnswer={handleUpdateAnswer}
                      aiAtLimit={aiAtLimit}
                      onAiLimit={() => setShowUpgrade(true)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="ai"
      />
    </motion.div>
  );
}
