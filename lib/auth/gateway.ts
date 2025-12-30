/**
 * Login Access Gateway
 *
 * Role-Based Access Control (RBAC) system with permissions,
 * feature flags, and audit logging
 */

import { User } from '@/lib/db';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'GUEST' | 'USER' | 'ANALYST' | 'ADMIN' | 'SUPER_ADMIN';

export type Permission =
  // Analysis permissions
  | 'analysis:create'
  | 'analysis:read'
  | 'analysis:update'
  | 'analysis:delete'
  | 'analysis:export'
  | 'analysis:share'
  // Advanced features
  | 'feature:monte_carlo'
  | 'feature:lbo_model'
  | 'feature:comps'
  | 'feature:portfolio'
  | 'feature:collaboration'
  | 'feature:api_access'
  | 'feature:excel_export'
  | 'feature:pdf_export'
  // Admin permissions
  | 'admin:users'
  | 'admin:billing'
  | 'admin:settings'
  | 'admin:audit_logs'
  | 'admin:system';

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface AccessPolicy {
  role: UserRole;
  permissions: Permission[];
  limits: {
    maxAnalyses: number;
    maxForecstYears: number;
    maxMonteCarlo: number;
    maxPortfolioCompanies: number;
    maxExportsPerMonth: number;
    maxApiCallsPerDay: number;
  };
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  requiredTier: SubscriptionTier;
  requiredRole: UserRole;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  requiredTier?: SubscriptionTier;
  upgradeUrl?: string;
}

export interface GatewayContext {
  user: User | null;
  role: UserRole;
  tier: SubscriptionTier;
  permissions: Permission[];
  sessionId: string;
  ipAddress?: string;
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  GUEST: 0,
  USER: 1,
  ANALYST: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  GUEST: [
    'analysis:read',
  ],
  USER: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
  ],
  ANALYST: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'analysis:share',
    'feature:monte_carlo',
    'feature:lbo_model',
    'feature:comps',
    'feature:excel_export',
    'feature:pdf_export',
  ],
  ADMIN: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'analysis:share',
    'feature:monte_carlo',
    'feature:lbo_model',
    'feature:comps',
    'feature:portfolio',
    'feature:collaboration',
    'feature:excel_export',
    'feature:pdf_export',
    'feature:api_access',
    'admin:users',
    'admin:billing',
    'admin:settings',
  ],
  SUPER_ADMIN: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'analysis:share',
    'feature:monte_carlo',
    'feature:lbo_model',
    'feature:comps',
    'feature:portfolio',
    'feature:collaboration',
    'feature:excel_export',
    'feature:pdf_export',
    'feature:api_access',
    'admin:users',
    'admin:billing',
    'admin:settings',
    'admin:audit_logs',
    'admin:system',
  ],
};

// ============================================================================
// SUBSCRIPTION TIER DEFINITIONS
// ============================================================================

const TIER_LIMITS: Record<SubscriptionTier, AccessPolicy['limits']> = {
  free: {
    maxAnalyses: 3,
    maxForecstYears: 5,
    maxMonteCarlo: 1000,
    maxPortfolioCompanies: 0,
    maxExportsPerMonth: 5,
    maxApiCallsPerDay: 0,
  },
  starter: {
    maxAnalyses: 20,
    maxForecstYears: 10,
    maxMonteCarlo: 5000,
    maxPortfolioCompanies: 5,
    maxExportsPerMonth: 50,
    maxApiCallsPerDay: 100,
  },
  professional: {
    maxAnalyses: 100,
    maxForecstYears: 20,
    maxMonteCarlo: 50000,
    maxPortfolioCompanies: 25,
    maxExportsPerMonth: 500,
    maxApiCallsPerDay: 1000,
  },
  enterprise: {
    maxAnalyses: -1, // Unlimited
    maxForecstYears: 30,
    maxMonteCarlo: 100000,
    maxPortfolioCompanies: -1, // Unlimited
    maxExportsPerMonth: -1, // Unlimited
    maxApiCallsPerDay: -1, // Unlimited
  },
};

const TIER_FEATURES: Record<SubscriptionTier, Permission[]> = {
  free: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
  ],
  starter: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'feature:excel_export',
  ],
  professional: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'analysis:share',
    'feature:monte_carlo',
    'feature:lbo_model',
    'feature:comps',
    'feature:excel_export',
    'feature:pdf_export',
  ],
  enterprise: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'analysis:share',
    'feature:monte_carlo',
    'feature:lbo_model',
    'feature:comps',
    'feature:portfolio',
    'feature:collaboration',
    'feature:excel_export',
    'feature:pdf_export',
    'feature:api_access',
  ],
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: 'monte_carlo_simulation',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'Monte Carlo simulation for valuation uncertainty',
  },
  {
    name: 'lbo_modeling',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'Leveraged buyout financial modeling',
  },
  {
    name: 'comparable_companies',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'Comparable company analysis',
  },
  {
    name: 'portfolio_analysis',
    enabled: true,
    requiredTier: 'enterprise',
    requiredRole: 'ADMIN',
    description: 'Multi-company portfolio analysis',
  },
  {
    name: 'real_time_collaboration',
    enabled: true,
    requiredTier: 'enterprise',
    requiredRole: 'USER',
    description: 'Real-time multi-user collaboration',
  },
  {
    name: 'api_access',
    enabled: true,
    requiredTier: 'enterprise',
    requiredRole: 'ADMIN',
    description: 'REST API access for integrations',
  },
  {
    name: 'excel_import_export',
    enabled: true,
    requiredTier: 'starter',
    requiredRole: 'USER',
    description: 'Import and export Excel files',
  },
  {
    name: 'pdf_reports',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'Generate PDF reports',
  },
  {
    name: 'ai_insights',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'AI-powered financial insights',
  },
  {
    name: 'custom_templates',
    enabled: true,
    requiredTier: 'professional',
    requiredRole: 'ANALYST',
    description: 'Create custom financial model templates',
  },
];

// ============================================================================
// ACCESS GATEWAY CLASS
// ============================================================================

export class AccessGateway {
  private auditLog: AuditLogEntry[] = [];
  private context: GatewayContext;

  constructor(user: User | null, options?: { sessionId?: string; ipAddress?: string }) {
    const role = this.determineRole(user);
    const tier = this.determineTier(user);

    this.context = {
      user,
      role,
      tier,
      permissions: this.getEffectivePermissions(role, tier),
      sessionId: options?.sessionId ?? this.generateSessionId(),
      ipAddress: options?.ipAddress,
    };
  }

  // =========================================================================
  // ROLE & TIER DETERMINATION
  // =========================================================================

  private determineRole(user: User | null): UserRole {
    if (!user) return 'GUEST';
    return (user.role as UserRole) || 'USER';
  }

  private determineTier(user: User | null): SubscriptionTier {
    if (!user) return 'free';
    // Check Stripe subscription
    if (user.stripeSubscriptionId && user.stripeCurrentPeriodEnd) {
      const periodEnd = new Date(user.stripeCurrentPeriodEnd);
      if (periodEnd > new Date()) {
        // Map Stripe price ID to tier
        const priceId = user.stripePriceId;
        if (priceId?.includes('enterprise')) return 'enterprise';
        if (priceId?.includes('professional')) return 'professional';
        if (priceId?.includes('starter')) return 'starter';
      }
    }
    return 'free';
  }

  private getEffectivePermissions(role: UserRole, tier: SubscriptionTier): Permission[] {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    const tierPerms = TIER_FEATURES[tier] || [];

    // Intersection of role and tier permissions (must have both)
    return rolePerms.filter(p => tierPerms.includes(p) || p.startsWith('admin:'));
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // =========================================================================
  // PERMISSION CHECKS
  // =========================================================================

  hasPermission(permission: Permission): boolean {
    return this.context.permissions.includes(permission);
  }

  hasRole(requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[this.context.role] >= ROLE_HIERARCHY[requiredRole];
  }

  hasTier(requiredTier: SubscriptionTier): boolean {
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'professional', 'enterprise'];
    return tierOrder.indexOf(this.context.tier) >= tierOrder.indexOf(requiredTier);
  }

  checkAccess(permission: Permission): AccessCheckResult {
    if (this.hasPermission(permission)) {
      return { allowed: true };
    }

    // Determine why access was denied
    const rolePerms = ROLE_PERMISSIONS[this.context.role] || [];
    const tierPerms = TIER_FEATURES[this.context.tier] || [];

    if (!rolePerms.includes(permission)) {
      // Need higher role
      const requiredRole = Object.entries(ROLE_PERMISSIONS).find(([_, perms]) =>
        perms.includes(permission)
      )?.[0] as UserRole | undefined;

      return {
        allowed: false,
        reason: 'Insufficient role permissions',
        requiredPermission: permission,
        requiredRole,
      };
    }

    if (!tierPerms.includes(permission)) {
      // Need higher tier
      const requiredTier = Object.entries(TIER_FEATURES).find(([_, perms]) =>
        perms.includes(permission)
      )?.[0] as SubscriptionTier | undefined;

      return {
        allowed: false,
        reason: 'Feature not available in current subscription',
        requiredPermission: permission,
        requiredTier,
        upgradeUrl: '/pricing',
      };
    }

    return {
      allowed: false,
      reason: 'Access denied',
      requiredPermission: permission,
    };
  }

  // =========================================================================
  // FEATURE FLAG CHECKS
  // =========================================================================

  isFeatureEnabled(featureName: string): boolean {
    const flag = FEATURE_FLAGS.find(f => f.name === featureName);
    if (!flag || !flag.enabled) return false;

    return this.hasRole(flag.requiredRole) && this.hasTier(flag.requiredTier);
  }

  getEnabledFeatures(): string[] {
    return FEATURE_FLAGS
      .filter(f => f.enabled && this.hasRole(f.requiredRole) && this.hasTier(f.requiredTier))
      .map(f => f.name);
  }

  getFeatureFlags(): FeatureFlag[] {
    return FEATURE_FLAGS.map(f => ({
      ...f,
      enabled: this.isFeatureEnabled(f.name),
    }));
  }

  // =========================================================================
  // LIMIT CHECKS
  // =========================================================================

  getLimits(): AccessPolicy['limits'] {
    return TIER_LIMITS[this.context.tier];
  }

  checkLimit(limitType: keyof AccessPolicy['limits'], currentValue: number): {
    allowed: boolean;
    limit: number;
    remaining: number;
  } {
    const limits = this.getLimits();
    const limit = limits[limitType];

    if (limit === -1) {
      // Unlimited
      return { allowed: true, limit: -1, remaining: -1 };
    }

    return {
      allowed: currentValue < limit,
      limit,
      remaining: Math.max(0, limit - currentValue),
    };
  }

  // =========================================================================
  // AUDIT LOGGING
  // =========================================================================

  logAction(
    action: string,
    resource: string,
    options?: {
      resourceId?: string;
      details?: Record<string, any>;
      success?: boolean;
      errorMessage?: string;
    }
  ): void {
    const entry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: this.context.user?.id ?? 'anonymous',
      userEmail: this.context.user?.email ?? 'anonymous',
      action,
      resource,
      resourceId: options?.resourceId,
      details: options?.details,
      ipAddress: this.context.ipAddress,
      timestamp: new Date().toISOString(),
      success: options?.success ?? true,
      errorMessage: options?.errorMessage,
    };

    this.auditLog.push(entry);

    // In production, this would be sent to a logging service
    console.log('[AUDIT]', JSON.stringify(entry));
  }

  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  // =========================================================================
  // CONTEXT GETTERS
  // =========================================================================

  getUser(): User | null {
    return this.context.user;
  }

  getRole(): UserRole {
    return this.context.role;
  }

  getTier(): SubscriptionTier {
    return this.context.tier;
  }

  getPermissions(): Permission[] {
    return [...this.context.permissions];
  }

  getSessionId(): string {
    return this.context.sessionId;
  }

  // =========================================================================
  // AUTHORIZATION HELPERS
  // =========================================================================

  canCreateAnalysis(): boolean {
    return this.hasPermission('analysis:create');
  }

  canExport(): boolean {
    return this.hasPermission('analysis:export');
  }

  canShare(): boolean {
    return this.hasPermission('analysis:share');
  }

  canUseAdvancedFeatures(): boolean {
    return this.hasPermission('feature:monte_carlo') ||
           this.hasPermission('feature:lbo_model') ||
           this.hasPermission('feature:comps');
  }

  canAccessAdmin(): boolean {
    return this.hasPermission('admin:users') ||
           this.hasPermission('admin:billing') ||
           this.hasPermission('admin:settings');
  }

  isAuthenticated(): boolean {
    return this.context.user !== null;
  }

  // =========================================================================
  // MIDDLEWARE HELPERS
  // =========================================================================

  requireAuth(): void {
    if (!this.isAuthenticated()) {
      throw new AccessDeniedError('Authentication required', 'auth:required');
    }
  }

  requirePermission(permission: Permission): void {
    const result = this.checkAccess(permission);
    if (!result.allowed) {
      throw new AccessDeniedError(result.reason || 'Permission denied', permission);
    }
  }

  requireRole(role: UserRole): void {
    if (!this.hasRole(role)) {
      throw new AccessDeniedError(`Role ${role} or higher required`, `role:${role}`);
    }
  }

  requireTier(tier: SubscriptionTier): void {
    if (!this.hasTier(tier)) {
      throw new AccessDeniedError(`Subscription tier ${tier} or higher required`, `tier:${tier}`);
    }
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class AccessDeniedError extends Error {
  public code: string;
  public upgradeUrl?: string;

  constructor(message: string, code: string, upgradeUrl?: string) {
    super(message);
    this.name = 'AccessDeniedError';
    this.code = code;
    this.upgradeUrl = upgradeUrl;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createGateway(user: User | null, options?: {
  sessionId?: string;
  ipAddress?: string;
}): AccessGateway {
  return new AccessGateway(user, options);
}

export function createGuestGateway(): AccessGateway {
  return new AccessGateway(null);
}

// ============================================================================
// ROUTE PROTECTION HELPERS
// ============================================================================

export interface ProtectedRouteConfig {
  requiredAuth?: boolean;
  requiredRole?: UserRole;
  requiredTier?: SubscriptionTier;
  requiredPermissions?: Permission[];
}

export function protectRoute(
  gateway: AccessGateway,
  config: ProtectedRouteConfig
): AccessCheckResult {
  // Check authentication
  if (config.requiredAuth && !gateway.isAuthenticated()) {
    return {
      allowed: false,
      reason: 'Authentication required',
    };
  }

  // Check role
  if (config.requiredRole && !gateway.hasRole(config.requiredRole)) {
    return {
      allowed: false,
      reason: `Role ${config.requiredRole} required`,
      requiredRole: config.requiredRole,
    };
  }

  // Check tier
  if (config.requiredTier && !gateway.hasTier(config.requiredTier)) {
    return {
      allowed: false,
      reason: `Subscription ${config.requiredTier} required`,
      requiredTier: config.requiredTier,
      upgradeUrl: '/pricing',
    };
  }

  // Check permissions
  if (config.requiredPermissions) {
    for (const permission of config.requiredPermissions) {
      const result = gateway.checkAccess(permission);
      if (!result.allowed) {
        return result;
      }
    }
  }

  return { allowed: true };
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export interface UsageStats {
  analysesCreated: number;
  exportsThisMonth: number;
  apiCallsToday: number;
  lastActivity: string;
}

export function checkUsageLimits(
  gateway: AccessGateway,
  usage: UsageStats
): {
  canCreateAnalysis: boolean;
  canExport: boolean;
  canMakeApiCall: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const limits = gateway.getLimits();

  const analysisCheck = gateway.checkLimit('maxAnalyses', usage.analysesCreated);
  const exportCheck = gateway.checkLimit('maxExportsPerMonth', usage.exportsThisMonth);
  const apiCheck = gateway.checkLimit('maxApiCallsPerDay', usage.apiCallsToday);

  if (!analysisCheck.allowed) {
    warnings.push(`Analysis limit reached (${limits.maxAnalyses})`);
  } else if (analysisCheck.remaining <= 2 && analysisCheck.remaining > 0) {
    warnings.push(`Only ${analysisCheck.remaining} analyses remaining`);
  }

  if (!exportCheck.allowed) {
    warnings.push(`Export limit reached (${limits.maxExportsPerMonth}/month)`);
  }

  if (!apiCheck.allowed) {
    warnings.push(`API limit reached (${limits.maxApiCallsPerDay}/day)`);
  }

  return {
    canCreateAnalysis: analysisCheck.allowed,
    canExport: exportCheck.allowed,
    canMakeApiCall: apiCheck.allowed,
    warnings,
  };
}
