import { AlertCircle } from "lucide-react";

import { DeadlineCard } from "@/components/deadline-card";
import { ContentLiveRefresh } from "@/components/content-live-refresh";
import { apiGetFresh } from "@/lib/api";
import type { ContentVersion, DeadlineItem } from "@/lib/types";

export const metadata = {
  title: "Deadline",
  description: "项目的到期进度。",
};

export default async function DeadlinesPage() {
  const [deadlineResult, version] = await Promise.all([
    apiGetFresh<DeadlineItem[]>("/api/deadlines/public")
      .then((data) => ({ data, error: null as string | null }))
      .catch((exception) => ({
        data: null,
        error: exception instanceof Error ? exception.message : "加载失败",
      })),
    apiGetFresh<ContentVersion>("/api/deadlines/public/version")
      .then((data) => data.version)
      .catch(() => ""),
  ]);

  const items = deadlineResult.data;
  const error = deadlineResult.error;

  const ongoing = items?.filter((item) => item.status !== 3) ?? [];
  const overdueCount = items ? items.length - ongoing.length : 0;
  const nearest = [...ongoing].sort(
    (a, b) => a.daysRemaining - b.daysRemaining,
  )[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <section className="border-b border-border-subtle pb-10 pt-14 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Deadlines
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Deadline
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          正在推进的项目，进度由开始日期到到期日期的时间自动计算。
        </p>

        {items ? (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-mono text-[11px]">
            <div>
              <dt className="uppercase tracking-wider text-muted">进行中</dt>
              <dd className="mt-1.5 text-xl tabular-nums text-foreground">
                {ongoing.length}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-wider text-muted">已过期</dt>
              <dd className="mt-1.5 text-xl tabular-nums text-foreground">
                {overdueCount}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="uppercase tracking-wider text-muted">最近到期</dt>
              <dd className="mt-1.5 truncate text-sm text-muted-strong">
                {nearest ? nearest.projectName : "—"}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      {error ? (
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <div className="text-sm text-muted">
            <p className="text-foreground">暂时无法加载 deadline</p>
            <p className="mt-1 font-mono text-[11px]">{error}</p>
          </div>
        </div>
      ) : null}

      {!error && items?.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">还没有设置 deadline。</p>
          <p className="mt-2 font-mono text-[11px] text-muted">
            在后台添加项目后，这里会显示到期进度。
          </p>
        </div>
      ) : null}

      {items && items.length > 0 ? (
        <div className="mt-2">
          {items.map((item, index) => (
            <DeadlineCard key={item.id} deadline={item} index={index} />
          ))}
        </div>
      ) : null}

      <ContentLiveRefresh
        endpoint="/api/deadlines/version"
        initialVersion={version}
        refreshingLabel="正在同步最新 Deadline"
        updatedLabel="Deadline 已更新"
      />
    </div>
  );
}
