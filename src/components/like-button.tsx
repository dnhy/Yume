"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  signedIn: boolean;
}

export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  signedIn,
}: LikeButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) {
      toast("点赞需要先使用 GitHub 登录", {
        description: "登录后可以点赞和评论。",
      });
      return;
    }

    if (pending) return;
    setPending(true);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "操作失败");
      }

      const result = (await response.json()) as {
        likeCount: number;
        isLiked: boolean;
      };

      setCount(result.likeCount);
      setLiked(result.isLiked);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
        liked
          ? "border-foreground bg-foreground text-background"
          : "border-border-subtle text-muted hover:border-border-strong hover:text-foreground",
        pending && "opacity-60",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
}
