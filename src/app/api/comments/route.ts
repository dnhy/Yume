import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ApiError, apiSend } from "@/lib/api";
import type { CommentItem } from "@/lib/types";
import { createVisitorToken } from "@/lib/visitor-token";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ message: "请先使用 GitHub 登录" }, { status: 401 });
  }

  const body = (await request.json()) as { postId?: string; content?: string };

  if (!body.postId || !body.content?.trim()) {
    return NextResponse.json({ message: "评论内容不能为空" }, { status: 400 });
  }

  try {
    const token = await createVisitorToken({
      githubId: session.user.githubId,
      githubLogin: session.user.login ?? session.user.name ?? "github-user",
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    });

    const comment = await apiSend<CommentItem>("/api/comments", {
      method: "POST",
      body: { postId: body.postId, content: body.content.trim() },
      visitorToken: token,
    });

    revalidatePath(`/posts/${body.postId}`);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "评论失败";
    return NextResponse.json({ message }, { status });
  }
}
