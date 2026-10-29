/**
 * Single implementation of the age policy, used by both the app (onboarding UI) and the
 * API (enforcement). The API is the source of truth; the app only uses it to explain rules.
 * Thresholds must be confirmed with counsel per market before launch.
 */

export type AgeTier = 'adult' | 'teen' | 'young_teen' | 'child';

export interface AgeRules {
  /** Can create their own account without a guardian. */
  canSelfRegister: boolean;
  /** A verified guardian must consent before uploading or becoming discoverable. */
  requiresGuardianConsent: boolean;
  /** Every upload goes to human review before publishing. */
  uploadsRequireReview: boolean;
  /** Profile is visible only to signed-in users. */
  signedInDiscoveryOnly: boolean;
  /** Contact requests are routed to the guardian. */
  contactViaGuardian: boolean;
  directMessages: boolean;
}

export function ageInYears(dateOfBirth: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() && now.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function ageTier(dateOfBirth: Date, now: Date = new Date()): AgeTier {
  const age = ageInYears(dateOfBirth, now);
  if (age >= 18) return 'adult';
  if (age >= 16) return 'teen';
  if (age >= 13) return 'young_teen';
  return 'child';
}

const MINOR: AgeRules = {
  canSelfRegister: true,
  requiresGuardianConsent: false,
  uploadsRequireReview: true,
  signedInDiscoveryOnly: true,
  contactViaGuardian: true,
  directMessages: false,
};

export const AGE_RULES: Record<AgeTier, AgeRules> = {
  adult: {
    canSelfRegister: true,
    requiresGuardianConsent: false,
    uploadsRequireReview: false,
    signedInDiscoveryOnly: false,
    contactViaGuardian: false,
    directMessages: false,
  },
  teen: MINOR,
  young_teen: { ...MINOR, requiresGuardianConsent: true },
  // Children are supported only through guardian- or academy-managed accounts (post-MVP).
  child: { ...MINOR, canSelfRegister: false, requiresGuardianConsent: true },
};

export function rulesFor(dateOfBirth: Date, now?: Date): AgeRules {
  return AGE_RULES[ageTier(dateOfBirth, now)];
}
