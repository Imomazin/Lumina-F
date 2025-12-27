/**
 * Local JSON Database
 *
 * A lightweight file-based database for development.
 * In production, replace with Prisma/PostgreSQL.
 */

import { v4 as uuid } from "uuid";

// Types matching Prisma schema
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type SubscriptionPlan = "FREE" | "PRO" | "TEAM" | "ENTERPRISE";
export type ProjectStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  emailVerified: string | null;
  passwordHash: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
  settings: Record<string, unknown>;
  plan: SubscriptionPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  billingEmail: string | null;
  maxSeats: number;
}

export interface Membership {
  id: string;
  role: MembershipRole;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  isArchived: boolean;
  isPublic: boolean;
  publicToken: string | null;
  createdAt: string;
  updatedAt: string;
  inputs: Record<string, unknown> | null;
  assumptions: Record<string, unknown> | null;
  results: Record<string, unknown> | null;
  workspaceId: string | null;
  ownerId: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

interface Database {
  users: User[];
  organizations: Organization[];
  memberships: Membership[];
  projects: Project[];
  sessions: Session[];
  accounts: Account[];
}

// In-memory database (persisted to localStorage in browser)
let db: Database = {
  users: [],
  organizations: [],
  memberships: [],
  projects: [],
  sessions: [],
  accounts: [],
};

// Load from localStorage if available
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("lumina_db");
  if (stored) {
    try {
      db = JSON.parse(stored);
    } catch {
      // Use default empty db
    }
  }
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem("lumina_db", JSON.stringify(db));
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const users = {
  create: (data: Omit<User, "id" | "createdAt" | "updatedAt">): User => {
    const now = new Date().toISOString();
    const user: User = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(user);
    persist();
    return user;
  },

  findById: (id: string): User | undefined => {
    return db.users.find((u) => u.id === id);
  },

  findByEmail: (email: string): User | undefined => {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  update: (id: string, data: Partial<User>): User | undefined => {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = {
      ...db.users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    persist();
    return db.users[index];
  },

  delete: (id: string): boolean => {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    persist();
    return true;
  },

  list: (): User[] => {
    return [...db.users];
  },
};

// ============================================================================
// ORGANIZATION OPERATIONS
// ============================================================================

export const organizations = {
  create: (data: Omit<Organization, "id" | "createdAt" | "updatedAt">): Organization => {
    const now = new Date().toISOString();
    const org: Organization = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    db.organizations.push(org);
    persist();
    return org;
  },

  findById: (id: string): Organization | undefined => {
    return db.organizations.find((o) => o.id === id);
  },

  findBySlug: (slug: string): Organization | undefined => {
    return db.organizations.find((o) => o.slug === slug);
  },

  update: (id: string, data: Partial<Organization>): Organization | undefined => {
    const index = db.organizations.findIndex((o) => o.id === id);
    if (index === -1) return undefined;
    db.organizations[index] = {
      ...db.organizations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    persist();
    return db.organizations[index];
  },

  delete: (id: string): boolean => {
    const index = db.organizations.findIndex((o) => o.id === id);
    if (index === -1) return false;
    db.organizations.splice(index, 1);
    persist();
    return true;
  },

  listByUser: (userId: string): Organization[] => {
    const membershipOrgIds = db.memberships
      .filter((m) => m.userId === userId)
      .map((m) => m.organizationId);
    return db.organizations.filter((o) => membershipOrgIds.includes(o.id));
  },
};

// ============================================================================
// MEMBERSHIP OPERATIONS
// ============================================================================

export const memberships = {
  create: (data: Omit<Membership, "id" | "createdAt" | "updatedAt">): Membership => {
    const now = new Date().toISOString();
    const membership: Membership = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    db.memberships.push(membership);
    persist();
    return membership;
  },

  findByUserAndOrg: (userId: string, organizationId: string): Membership | undefined => {
    return db.memberships.find(
      (m) => m.userId === userId && m.organizationId === organizationId
    );
  },

  listByOrg: (organizationId: string): Membership[] => {
    return db.memberships.filter((m) => m.organizationId === organizationId);
  },

  update: (id: string, data: Partial<Membership>): Membership | undefined => {
    const index = db.memberships.findIndex((m) => m.id === id);
    if (index === -1) return undefined;
    db.memberships[index] = {
      ...db.memberships[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    persist();
    return db.memberships[index];
  },

  delete: (id: string): boolean => {
    const index = db.memberships.findIndex((m) => m.id === id);
    if (index === -1) return false;
    db.memberships.splice(index, 1);
    persist();
    return true;
  },
};

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

export const projects = {
  create: (data: Omit<Project, "id" | "createdAt" | "updatedAt">): Project => {
    const now = new Date().toISOString();
    const project: Project = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    db.projects.push(project);
    persist();
    return project;
  },

  findById: (id: string): Project | undefined => {
    return db.projects.find((p) => p.id === id);
  },

  findByPublicToken: (token: string): Project | undefined => {
    return db.projects.find((p) => p.publicToken === token && p.isPublic);
  },

  update: (id: string, data: Partial<Project>): Project | undefined => {
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    db.projects[index] = {
      ...db.projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    persist();
    return db.projects[index];
  },

  delete: (id: string): boolean => {
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.projects.splice(index, 1);
    persist();
    return true;
  },

  listByOwner: (ownerId: string): Project[] => {
    return db.projects.filter((p) => p.ownerId === ownerId && !p.isArchived);
  },

  listByWorkspace: (workspaceId: string): Project[] => {
    return db.projects.filter((p) => p.workspaceId === workspaceId && !p.isArchived);
  },
};

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export const sessions = {
  create: (data: Omit<Session, "id">): Session => {
    const session: Session = {
      ...data,
      id: uuid(),
    };
    db.sessions.push(session);
    persist();
    return session;
  },

  findByToken: (token: string): Session | undefined => {
    return db.sessions.find((s) => s.sessionToken === token);
  },

  delete: (token: string): boolean => {
    const index = db.sessions.findIndex((s) => s.sessionToken === token);
    if (index === -1) return false;
    db.sessions.splice(index, 1);
    persist();
    return true;
  },

  deleteByUserId: (userId: string): void => {
    db.sessions = db.sessions.filter((s) => s.userId !== userId);
    persist();
  },
};

// ============================================================================
// ACCOUNT OPERATIONS (for OAuth)
// ============================================================================

export const accounts = {
  create: (data: Omit<Account, "id">): Account => {
    const account: Account = {
      ...data,
      id: uuid(),
    };
    db.accounts.push(account);
    persist();
    return account;
  },

  findByProvider: (provider: string, providerAccountId: string): Account | undefined => {
    return db.accounts.find(
      (a) => a.provider === provider && a.providerAccountId === providerAccountId
    );
  },

  findByUserId: (userId: string): Account[] => {
    return db.accounts.filter((a) => a.userId === userId);
  },

  delete: (provider: string, providerAccountId: string): boolean => {
    const index = db.accounts.findIndex(
      (a) => a.provider === provider && a.providerAccountId === providerAccountId
    );
    if (index === -1) return false;
    db.accounts.splice(index, 1);
    persist();
    return true;
  },
};

// ============================================================================
// UTILITY
// ============================================================================

export function resetDatabase(): void {
  db = {
    users: [],
    organizations: [],
    memberships: [],
    projects: [],
    sessions: [],
    accounts: [],
  };
  persist();
}

export function getDatabase(): Database {
  return { ...db };
}
