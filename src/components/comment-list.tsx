"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { CommentItem } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

interface CommentListProps {
  comments: CommentItem[];
  currentGithubId?: string;
}

export function CommentList({ comments, currentGithubId }: CommentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function remove(id: string) {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "删除失败");
      }

      router.refresh();
      toast.success("评论已删除");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  if (comments.length === 0) {
    return (
      <p className="py-6 text-sm text-muted">还没有评论，来说点什么吧。</p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {comments.map((comment) => {
        const isMine = currentGithubId === String(comment.authorGithubId);

        return (
          <li key={comment.id} className="flex gap-3 py-4">
            {comment.authorAvatarUrl ? (
              <Image
                src={comment.authorAvatarUrl}
                alt={comment.authorLogin}
                width={28}
                height={28}
                className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-border-subtle"
              />
            ) : (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface font-mono text-[10px] text-muted">
                {comment.authorLogin.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  {comment.authorName}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  @{comment.authorLogin}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {formatRelative(comment.creationTime)}
                </span>

                {isMine ? (
                  <button
                    type="button"
                    onClick={() => remove(comment.id)}
                    disabled={deletingId === comment.id}
                    className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-muted transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </button>
                ) : null}
              </div>

              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-strong">
                {comment.content}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
