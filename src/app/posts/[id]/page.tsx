import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { CommentSection } from "@/components/comment-section";
import { LikeButton } from "@/components/like-button";
import { Markdown } from "@/components/markdown";
import { apiGetOrNull, apiSend } from "@/lib/api";
import type { PostDetail, PostLikeResult } from "@/lib/types";
import { POST_TYPE_LABEL } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { createVisitorToken } from "@/lib/visitor-token";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function loadPost(id: string) {
  return await apiGetOrNull<PostDetail>(`/api/posts/public/${id}`, 10);
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);

  if (!post) {
    return { title: "内容不存在" };
  }

  return {
    title: post.title || POST_TYPE_LABEL[post.type],
    description: post.summary,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await loadPost(id);

  if (!post) {
    notFound();
  }

  const session = await auth();
  let likedByMe = false;

  if (session?.user?.githubId) {
    try {
      const token = await createVisitorToken({
        githubId: session.user.githubId,
        githubLogin: session.user.login ?? session.user.name ?? "github-user",
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
      });

      const status = await apiSend<PostLikeResult>(
        `/api/likes/status/${post.id}`,
        { method: "GET", visitorToken: token },
      );

      likedByMe = status.isLiked;
    } catch {
      likedByMe = false;
    }
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <div className="border-b border-border-subtle pb-8 pt-12 sm:pt-16">
        <Link
          href="/"
          className="font-mono text-[11px] text-muted transition-colors hover:text-foreground"
        >
          ← 返回时间线
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
          <span className="rounded border border-border-subtle px-1.5 py-0.5">
            {POST_TYPE_LABEL[post.type]}
          </span>
          <span>{formatDateTime(post.occurredAt)}</span>
          <span>·</span>
          <span>{post.commentCount} 条评论</span>
        </div>

        {post.title ? (
          <h1 className="mt-4 text-2xl font-semibold leading-snug tracking-tight sm:text-[28px]">
            {post.title}
          </h1>
        ) : null}
      </div>

      <div className="py-8">
        <Markdown content={post.content} />
      </div>

      <div className="flex items-center justify-between border-y border-border-subtle py-4">
        <LikeButton
          postId={post.id}
          initialCount={post.likeCount}
          initialLiked={likedByMe}
          signedIn={Boolean(session?.user?.githubId)}
        />

        <a
          href="#comments"
          className="font-mono text-[11px] text-muted transition-colors hover:text-foreground"
        >
          {post.commentCount} 条评论 ↓
        </a>
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}
