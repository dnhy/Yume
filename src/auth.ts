import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      githubId?: string;
      login?: string;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }
}

interface VisitorJwtFields {
  githubId?: string;
  login?: string;
  avatarUrl?: string | null;
}

export const githubEnabled = Boolean(
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: githubEnabled ? [GitHub] : [],
  callbacks: {
    async jwt({ token, profile }) {
      const target = token as typeof token & VisitorJwtFields;

      if (profile) {
        const githubProfile = profile as {
          id?: number | string;
          login?: string;
          name?: string | null;
          avatar_url?: string | null;
        };

        target.githubId = githubProfile.id ? String(githubProfile.id) : undefined;
        target.login = githubProfile.login;
        target.avatarUrl = githubProfile.avatar_url ?? null;
        target.name = githubProfile.name ?? githubProfile.login ?? target.name;
      }

      return target;
    },
    async session({ session, token }) {
      const source = token as typeof token & VisitorJwtFields;

      session.user.githubId = source.githubId;
      session.user.login = source.login;
      session.user.avatarUrl = source.avatarUrl;
      return session;
    },
  },
});
