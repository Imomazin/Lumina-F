/**
 * Authentication Configuration
 *
 * NextAuth.js setup with credentials and OAuth providers
 */

import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { users, accounts, sessions, User } from "@/lib/db";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = users.findByEmail(credentials.email);
        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.passwordHash) {
          throw new Error("Please sign in with your OAuth provider");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth sign in
      if (account && profile?.email) {
        let dbUser = users.findByEmail(profile.email);

        if (!dbUser) {
          // Create new user
          dbUser = users.create({
            email: profile.email,
            emailVerified: new Date().toISOString(),
            passwordHash: null,
            name: profile.name ?? null,
            image: (profile as any).picture ?? (profile as any).avatar_url ?? null,
            role: "USER",
            stripeCustomerId: null,
            stripePriceId: null,
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
          });
        }

        // Link account if not already linked
        const existingAccount = accounts.findByProvider(
          account.provider,
          account.providerAccountId
        );

        if (!existingAccount) {
          accounts.create({
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: (account as any).session_state ?? null,
          });
        }

        // Update user object for session
        user.id = dbUser.id;
        user.role = dbUser.role;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// ============================================================================
// AUTH UTILITIES
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<User> {
  const existingUser = users.findByEmail(data.email);
  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(data.password);

  return users.create({
    email: data.email.toLowerCase(),
    emailVerified: null,
    passwordHash,
    name: data.name ?? null,
    image: null,
    role: "USER",
    stripeCustomerId: null,
    stripePriceId: null,
    stripeSubscriptionId: null,
    stripeCurrentPeriodEnd: null,
  });
}

export function getUserById(id: string): User | undefined {
  return users.findById(id);
}

export function getUserByEmail(email: string): User | undefined {
  return users.findByEmail(email);
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<User | undefined> {
  const passwordHash = await hashPassword(newPassword);
  return users.update(userId, { passwordHash });
}

export function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string }
): User | undefined {
  return users.update(userId, data);
}
