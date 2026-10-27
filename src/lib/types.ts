export type PostType = 1 | 2;
export type PostVisibility = 1 | 2;

export const POST_TYPE_LABEL: Record<PostType, string> = {
  1: "随想",
  2: "日记",
};

export interface PagedResult<T> {
  totalCount: number;
  items: T[];
}

export interface PostListItem {
  id: string;
  type: PostType;
  title: string;
  summary: string;
  visibility: PostVisibility;
  occurredAt: string;
  creationTime: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
}

export interface PostDetail extends PostListItem {
  content: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorGithubId: number;
  authorLogin: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  creationTime: string;
}

export interface PostLikeResult {
  postId: string;
  likeCount: number;
  isLiked: boolean;
}

export type DeadlineStatus = 1 | 2 | 3;

export const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  1: "进行中",
  2: "即将到期",
  3: "已过期",
};

export interface DeadlineItem {
  id: string;
  projectName: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
  accentColor?: string | null;
  sortOrder: number;
  progressPercent: number;
  daysRemaining: number;
  status: DeadlineStatus;
  creationTime: string;
}

export interface ContentVersion {
  version: string;
}

