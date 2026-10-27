"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { DEADLINE_STATUS_LABEL, type DeadlineItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const FALLBACK_ACCENT = "#0070f3";
const COUNT_UP_DURATION = 1100;

interface DeadlineCardProps {
  deadline: DeadlineItem;
  index: number;
}

export function DeadlineCard({ deadline, index }: DeadlineCardProps) {
  const [percent, setPercent] = useState(0);
  const { daysRemaining, status } = deadline;

  useEffect(() => {
    const target = deadline.progressPercent;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedFrame = window.requestAnimationFrame(() => setPercent(target));
      return () => window.cancelAnimationFrame(reducedFrame);
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min((now - startedAt) / COUNT_UP_DURATION, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setPercent(Math.round(target * eased));

      if (elapsed < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [deadline.progressPercent]);

  const daysLabel =
    status === 3
      ? `已过期 ${Math.abs(daysRemaining)} 天`
      : daysRemaining === 0
        ? "今天到期"
        : `还有 ${daysRemaining} 天`;

  const style = {
    "--deadline-accent": deadline.accentColor ?? FALLBACK_ACCENT,
    "--deadline-progress": `${deadline.progressPercent}%`,
    "--deadline-delay": `${Math.min(index, 12) * 70}ms`,
  } as CSSProperties;

  return (
    <article
      data-status={status}
      style={style}
      className="deadline-card group border-b border-border-subtle"
    >
      <div className="px-1 py-6 transition-colors hover:bg-surface/60 sm:px-2">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] tabular-nums text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="truncate text-[15px] font-medium leading-snug tracking-tight text-foreground">
                {deadline.projectName}
              </h2>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-wide",
                  status === 3
                    ? "border-border-subtle text-muted"
                    : status === 2
                      ? "border-border-strong text-muted-strong"
                      : "border-border-subtle text-muted",
                )}
              >
                {DEADLINE_STATUS_LABEL[status]}
              </span>
            </div>

            {deadline.description ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                {deadline.description}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-right font-mono text-[11px]">
            <div
              className={cn(
                "tabular-nums",
                status === 3 ? "text-muted" : "text-foreground",
              )}
            >
              {daysLabel}
            </div>
            <div className="mt-1 tabular-nums text-muted">
              {formatDate(deadline.dueDate)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div
            role="progressbar"
            aria-label={`${deadline.projectName} 的进度`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={deadline.progressPercent}
            className="relative h-1.5 w-full rounded-full bg-surface ring-1 ring-inset ring-border-subtle"
          >
            <div className="deadline-bar-fill relative h-full rounded-full">
              <span className="deadline-bar-shine absolute inset-0 overflow-hidden rounded-full" />
              <span className="deadline-head-dot absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted">
            <span>
              {formatDate(deadline.startDate)} → {formatDate(deadline.dueDate)}
            </span>
            <span className="tabular-nums text-muted-strong">{percent}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}
