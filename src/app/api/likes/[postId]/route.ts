import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ApiError, apiSend } from "@/lib/api";
import type { PostLikeResult } from "@/lib/types";
import { createVisitorToken } from "@/lib/visitor-token";

export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ message: "未登录" }, { status: 401 });
  }

  const { postId } = await context.params;

  try {
    const token = await createVisitorToken({
      githubId: session.user.githubId,
      githubLogin: session.user.login ?? session.user.name ?? "github-user",
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    });

    const result = await apiSend<PostLikeResult>(`/api/likes/status/${postId}`, {
      method: "GET",
      visitorToken: token,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "查询失败";
    return NextResponse.json({ message }, { status });
  }
}
