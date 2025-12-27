/**
 * Stripe Payment Integration
 *
 * Handles subscriptions, billing, and payment processing
 */

import Stripe from "stripe";
import { users } from "@/lib/db";

// Initialize Stripe (use test key for development)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2023-10-16",
  typescript: true,
});

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export const PLANS = {
  FREE: {
    name: "Free",
    description: "For individuals getting started",
    price: 0,
    priceId: null,
    features: [
      "1 project",
      "Basic financial analysis",
      "PDF export",
      "Email support",
    ],
    limits: {
      projects: 1,
      collaborators: 0,
      exports: 5,
      apiCalls: 0,
    },
  },
  PRO: {
    name: "Pro",
    description: "For professionals and consultants",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro",
    features: [
      "Unlimited projects",
      "Advanced DCF & valuation",
      "Scenario analysis",
      "Excel & PowerPoint export",
      "Priority support",
      "API access",
    ],
    limits: {
      projects: -1, // unlimited
      collaborators: 0,
      exports: -1,
      apiCalls: 1000,
    },
  },
  TEAM: {
    name: "Team",
    description: "For teams and small businesses",
    price: 79,
    priceId: process.env.STRIPE_TEAM_PRICE_ID ?? "price_team",
    features: [
      "Everything in Pro",
      "5 team members",
      "Real-time collaboration",
      "Comments & reviews",
      "Team analytics",
      "Slack integration",
    ],
    limits: {
      projects: -1,
      collaborators: 5,
      exports: -1,
      apiCalls: 10000,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations",
    price: null, // Custom pricing
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "price_enterprise",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "SSO / SAML",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
    limits: {
      projects: -1,
      collaborators: -1,
      exports: -1,
      apiCalls: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const user = users.findById(userId);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      userId,
    },
  });

  users.update(userId, { stripeCustomerId: customer.id });

  return customer.id;
}

export async function getCustomerPortalUrl(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const customerId = await createOrRetrieveCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
      },
    },
    allow_promotion_codes: true,
  });

  return session.url ?? "";
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  users.update(userId, {
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    stripeCurrentPeriodEnd: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  users.update(userId, {
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    stripeCurrentPeriodEnd: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  users.update(userId, {
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
  });
}

// ============================================================================
// PLAN UTILITIES
// ============================================================================

export function getPlanFromPriceId(priceId: string | null): PlanType {
  if (!priceId) return "FREE";

  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.priceId === priceId) {
      return plan as PlanType;
    }
  }

  return "FREE";
}

export function canAccessFeature(
  userPlan: PlanType,
  feature: "projects" | "collaborators" | "exports" | "apiCalls",
  currentUsage: number
): boolean {
  const limit = PLANS[userPlan].limits[feature];
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan].limits;
}
