"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  signedIn: boolean;
  loginEnabled: boolean;
}

export function CommentForm({
  postId,
  signedIn,
  loginEnabled,
}: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || pending) return;

    setPending(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "评论失败");
      }

      setContent("");
      router.refresh();
      toast.success("评论已发布");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "评论失败");
    } finally {
      setPending(false);
    }
  }

  if (!loginEnabled) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm text-muted">
        评论功能尚未开放。
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-sm text-muted">
        点击右上角的「使用 GitHub 登录」即可评论。
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="写下你的想法…"
        className="w-full resize-y rounded-lg border border-border-subtle bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted focus:border-border-strong"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted">
          {content.length}/2000
        </span>
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          发表评论
        </button>
      </div>
    </form>
  );
}
