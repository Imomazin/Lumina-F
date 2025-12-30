/**
 * Security Utilities
 *
 * Rate limiting, CSRF protection, input sanitization, and audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: NextRequest) => string;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

export function rateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs, maxRequests, keyGenerator } = {
    ...DEFAULT_RATE_LIMIT,
    ...config,
  };

  // Generate rate limit key
  const key = keyGenerator
    ? keyGenerator(request)
    : getClientIP(request) ?? "anonymous";

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Start new window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count++;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return null;
}

export function rateLimitMiddleware(
  config: Partial<RateLimitConfig> = {}
): (request: NextRequest) => NextResponse | null {
  return (request: NextRequest) => {
    const result = rateLimit(request, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (result.resetAt - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": config.maxRequests?.toString() ?? "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetAt.toString(),
          },
        }
      );
    }

    return null; // Allow request to proceed
  };
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_TOKEN_COOKIE = "csrf_token";

export function generateCSRFToken(): string {
  return uuid();
}

export function validateCSRFToken(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF for GET, HEAD, OPTIONS
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(request.method)) {
    return null;
  }

  // Skip CSRF for API routes that use API keys
  if (request.headers.get("x-api-key")) {
    return null;
  }

  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
  }

  return null;
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      (result as any)[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      (result as any)[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      (result as any)[key] = value;
    }
  }

  return result;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

// In-memory audit log (use database in production)
const auditLog: AuditLogEntry[] = [];

export function logAuditEvent(
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): void {
  auditLog.push({
    ...entry,
    id: uuid(),
    timestamp: new Date().toISOString(),
  });

  // Keep only last 10000 entries in memory
  if (auditLog.length > 10000) {
    auditLog.shift();
  }
}

export function getAuditLog(
  filter?: Partial<Pick<AuditLogEntry, "userId" | "action" | "resource">>
): AuditLogEntry[] {
  if (!filter) {
    return [...auditLog].reverse();
  }

  return auditLog
    .filter((entry) => {
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.resource && entry.resource !== filter.resource) return false;
      return true;
    })
    .reverse();
}

// ============================================================================
// API KEY VALIDATION
// ============================================================================

export interface APIKeyInfo {
  id: string;
  organizationId: string;
  permissions: string[];
}

// Simulated API key store (use database in production)
const apiKeys = new Map<string, APIKeyInfo>();

export function validateAPIKey(key: string): APIKeyInfo | null {
  return apiKeys.get(key) ?? null;
}

export function createAPIKey(
  organizationId: string,
  permissions: string[] = ["read"]
): { key: string; info: APIKeyInfo } {
  const key = `lf_${uuid().replace(/-/g, "")}`;
  const info: APIKeyInfo = {
    id: uuid(),
    organizationId,
    permissions,
  };

  apiKeys.set(key, info);

  return { key, info };
}

export function revokeAPIKey(key: string): boolean {
  return apiKeys.delete(key);
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://api.openai.com",
      "frame-ancestors 'none'",
    ].join("; "),
  };
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Include both uppercase and lowercase letters");
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one number");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one special character");
  }

  // Check for common patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /(.)\1{2,}/, // Repeating characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push("Avoid common patterns");
      break;
    }
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 3,
  };
}
