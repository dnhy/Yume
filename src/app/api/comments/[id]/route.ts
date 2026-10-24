import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ApiError, apiSend } from "@/lib/api";
import { createVisitorToken } from "@/lib/visitor-token";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ message: "请先使用 GitHub 登录" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const token = await createVisitorToken({
      githubId: session.user.githubId,
      githubLogin: session.user.login ?? session.user.name ?? "github-user",
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    });

    await apiSend<void>(`/api/comments/${id}/mine`, {
      method: "DELETE",
      visitorToken: token,
    });

    revalidatePath("/posts/[id]", "page");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "删除失败";
    return NextResponse.json({ message }, { status });
  }
}
