import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        这里什么都没有
      </h1>
      <p className="mt-3 text-sm text-muted">
        内容不存在，或者它还没有被公开。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md border border-border-subtle px-3.5 py-2 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        返回时间线
      </Link>
    </div>
  );
}
