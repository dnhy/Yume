import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import type { PostListItem } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDay(iso: string) {
  return format(new Date(iso), "dd");
}

export function formatWeekday(iso: string) {
  return format(new Date(iso), "EEE", { locale: zhCN });
}

export function formatMonthLabel(iso: string) {
  return format(new Date(iso), "yyyy 年 M 月");
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd HH:mm");
}

export function formatDate(iso: string) {
  return format(new Date(iso), "yyyy.MM.dd");
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)} 天前`;
  return format(new Date(iso), "yyyy-MM-dd");
}

export interface TimelineGroup {
  key: string;
  label: string;
  items: PostListItem[];
}

export function groupByMonth(items: PostListItem[]): TimelineGroup[] {
  const groups = new Map<string, TimelineGroup>();

  for (const item of items) {
    const date = new Date(item.occurredAt);
    const key = format(date, "yyyy-MM");
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        key,
        label: formatMonthLabel(item.occurredAt),
        items: [item],
      });
    }
  }

  return Array.from(groups.values());
}

export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
