"use client";

import { Check, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const POLL_INTERVAL = 8000;
const BUBBLE_DURATION = 2800;

type Phase = "done" | "idle" | "refreshing";

interface ContentLiveRefreshProps {
  endpoint: string;
  initialVersion: string;
  refreshingLabel: string;
  updatedLabel: string;
}

/**
 * 轮询后端版本号：后台改完数据后自动刷新当前页面，并在右下角提示。
 */
export function ContentLiveRefresh({
  endpoint,
  initialVersion,
  refreshingLabel,
  updatedLabel,
}: ContentLiveRefreshProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(false);
  const versionRef = useRef(initialVersion);
  const hideTimer = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let inFlight = false;

    const check = async () => {
      if (cancelled || inFlight || document.visibilityState === "hidden") {
        return;
      }

      inFlight = true;

      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { version?: string };
        const nextVersion = data.version;

        if (!nextVersion || nextVersion === versionRef.current) {
          return;
        }

        versionRef.current = nextVersion;
        window.clearTimeout(hideTimer.current);
        setPhase("refreshing");
        setVisible(true);

        router.refresh();
        setPhase("done");
        hideTimer.current = window.setTimeout(
          () => setVisible(false),
          BUBBLE_DURATION,
        );
      } catch {
        // 轮询失败时保持当前页面，下一轮继续尝试。
      } finally {
        inFlight = false;
      }
    };

    const schedule = () => {
      if (cancelled) {
        return;
      }

      timer = window.setTimeout(async () => {
        await check();
        schedule();
      }, POLL_INTERVAL);
    };

    void check();
    schedule();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void check();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [endpoint, router]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-5 right-5 z-50 transition-all duration-300 ease-out sm:bottom-8 sm:right-8",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-background/90 px-3.5 py-2 font-mono text-[11px] text-muted shadow-lg backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          {phase === "refreshing" ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          ) : null}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>

        <RefreshCw
          className={cn(
            "h-3.5 w-3.5 text-muted",
            phase === "refreshing" ? "animate-spin" : "hidden",
          )}
        />

        <span className="text-foreground">
          {phase === "refreshing" ? refreshingLabel : updatedLabel}
        </span>

        <Check
          className={cn(
            "h-3.5 w-3.5 text-accent",
            phase === "refreshing" && "hidden",
          )}
        />
      </div>
    </div>
  );
}
