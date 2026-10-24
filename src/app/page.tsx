import { AlertCircle, ArrowDown } from "lucide-react";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { apiGet } from "@/lib/api";
import type { PagedResult, PostListItem } from "@/lib/types";
import { buildQuery, cn, groupByMonth } from "@/lib/utils";

const PAGE_SIZE = 20;

interface HomeSearchParams {
  type?: string;
  skip?: string;
}

const FILTERS = [
  { value: undefined, label: "全部" },
  { value: "2", label: "日记" },
  { value: "1", label: "随想" },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const type =
    params.type === "1" || params.type === "2" ? params.type : undefined;
  const skip = Math.max(Number(params.skip ?? 0) || 0, 0);

  let data: PagedResult<PostListItem> | null = null;
  let error: string | null = null;

  try {
    data = await apiGet<PagedResult<PostListItem>>(
      `/api/posts/public${buildQuery({
        Type: type,
        SkipCount: skip,
        MaxResultCount: PAGE_SIZE,
      })}`,
      20,
    );
  } catch (exception) {
    error = exception instanceof Error ? exception.message : "加载失败";
  }

  const groups = data ? groupByMonth(data.items) : [];
  const hasMore = data ? skip + data.items.length < data.totalCount : false;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <section className="border-b border-border-subtle pb-10 pt-14 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Personal Space
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          dnhy-space
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          日程、随想与日记。按时间向下排列，想到什么就写什么。
        </p>
      </section>

      <nav className="flex items-center gap-1 border-b border-border-subtle py-3">
        {FILTERS.map((filter) => {
          const active = type === filter.value;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/?type=${filter.value}` : "/"}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}

        {data ? (
          <span className="ml-auto font-mono text-[11px] text-muted">
            共 {data.totalCount} 条
          </span>
        ) : null}
      </nav>

      {error ? (
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <div className="text-sm text-muted">
            <p className="text-foreground">暂时无法加载内容</p>
            <p className="mt-1 font-mono text-[11px]">{error}</p>
          </div>
        </div>
      ) : null}

      {!error && groups.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">还没有公开的内容。</p>
        </div>
      ) : null}

      {groups.map((group) => (
        <section key={group.key} className="mt-6">
          <h2 className="sticky top-14 z-10 -mx-1 flex items-center gap-3 bg-background/90 px-1 py-3 font-mono text-[11px] uppercase tracking-wider text-muted backdrop-blur">
            <span>{group.label}</span>
            <span className="h-px flex-1 bg-border-subtle" />
            <span>{group.items.length}</span>
          </h2>

          <div>
            {group.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ))}

      {hasMore ? (
        <div className="flex justify-center py-10">
          <Link
            href={`/${buildQuery({
              type,
              skip: skip + PAGE_SIZE,
            })}`}
            className="inline-flex items-center gap-2 rounded-md border border-border-subtle px-3.5 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            加载更多
          </Link>
        </div>
      ) : null}
    </div>
  );
}
