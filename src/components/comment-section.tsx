import { auth, githubEnabled } from "@/auth";
import { apiGetOrNull } from "@/lib/api";
import type { CommentItem, PagedResult } from "@/lib/types";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

export async function CommentSection({ postId }: { postId: string }) {
  const session = await auth();
  const data = await apiGetOrNull<PagedResult<CommentItem>>(
    `/api/comments?PostId=${postId}&MaxResultCount=100`,
  );

  const comments = data?.items ?? [];

  return (
    <section id="comments" className="mt-12 border-t border-border-subtle pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight">
          评论
          <span className="ml-2 font-mono text-xs text-muted">
            {data?.totalCount ?? 0}
          </span>
        </h2>
      </div>

      <CommentForm
        postId={postId}
        loginEnabled={githubEnabled}
        signedIn={Boolean(session?.user?.githubId)}
      />

      <div className="mt-6">
        <CommentList
          comments={comments}
          currentGithubId={session?.user?.githubId}
        />
      </div>
    </section>
  );
}
