import Link from "next/link";

import type { PostListItem } from "@/lib/types";
import { POST_TYPE_LABEL } from "@/lib/types";
import { cn, formatDay, formatWeekday, formatRelative } from "@/lib/utils";

interface PostCardProps {
  post: PostListItem;
  showDate?: boolean;
}

export function PostCard({ post, showDate = true }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex gap-4 border-b border-border-subtle px-1 py-5 transition-colors hover:bg-surface sm:gap-8 sm:px-2"
    >
      {showDate ? (
        <div className="w-10 shrink-0 pt-0.5 text-right sm:w-12">
          <div className="font-mono text-base leading-none text-foreground">
            {formatDay(post.occurredAt)}
          </div>
          <div className="mt-1.5 font-mono text-[11px] text-muted">
            {formatWeekday(post.occurredAt)}
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
              post.type === 2
                ? "border-border-strong text-muted-strong"
                : "border-border-subtle text-muted",
            )}
          >
            {POST_TYPE_LABEL[post.type]}
          </span>
          {post.visibility === 1 ? (
            <span className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[10px] text-muted">
              私密
            </span>
          ) : null}
          <span className="font-mono text-[11px] text-muted">
            {formatRelative(post.occurredAt)}
          </span>
        </div>

        {post.title ? (
          <h2 className="text-[15px] font-medium leading-snug tracking-tight text-foreground">
            {post.title}
          </h2>
        ) : null}

        <p
          className={cn(
            "mt-1 line-clamp-2 text-sm leading-relaxed text-muted",
            !post.title && "mt-0",
          )}
        >
          {post.summary}
        </p>

        <div className="mt-2.5 flex items-center gap-4 font-mono text-[11px] text-muted">
          <span>♥ {post.likeCount}</span>
          <span>💬 {post.commentCount}</span>
          <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
            阅读 →
          </span>
        </div>
      </div>
    </Link>
  );
}
