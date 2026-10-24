import Image from "next/image";
import Link from "next/link";

import { auth, githubEnabled, signIn, signOut } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "时间线" },
  { href: "/?type=2", label: "日记" },
  { href: "/?type=1", label: "随想" },
];

async function signInWithGithub() {
  "use server";
  await signIn("github", { redirectTo: "/" });
}

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-sm font-medium tracking-tight text-foreground"
          >
            dnhy<span className="text-muted">.space</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!githubEnabled ? null : session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.avatarUrl ? (
                <Image
                  src={session.user.avatarUrl}
                  alt={session.user.name ?? "avatar"}
                  width={24}
                  height={24}
                  className="rounded-full border border-border-subtle"
                />
              ) : null}
              <span className="hidden font-mono text-xs text-muted sm:inline">
                {session.user.login ?? session.user.name}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-border-subtle px-2.5 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
                >
                  退出
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGithub}>
              <button
                type="submit"
                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85"
              >
                使用 GitHub 登录
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
