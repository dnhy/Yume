"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Error
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">页面出错了</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        {error.message || "请稍后重试。"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md border border-border-subtle px-3.5 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        再试一次
      </button>
    </div>
  );
}
