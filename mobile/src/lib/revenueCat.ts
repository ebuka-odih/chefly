import Constants from 'expo-constants';
import type { CustomerInfo, PurchasesEntitlementInfo, PurchasesOffering, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

export type CheflyPlanKey = 'lifetime' | 'yearly' | 'monthly';

type ExpoRevenueCatExtra = {
  revenueCat?: {
    apiKey?: string;
    entitlementId?: string;
    offeringId?: string;
    productIds?: Partial<Record<CheflyPlanKey, string>>;
    packageIds?: Partial<Record<CheflyPlanKey, string>>;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoRevenueCatExtra;

const configuredRevenueCat = extra.revenueCat ?? {};

export const REVENUECAT_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ??
  configuredRevenueCat.apiKey ??
  'test_QlSbqXjCrHRejwITrhtmvaGbJZa';

export const CHEFLY_PRO_ENTITLEMENT =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ??
  configuredRevenueCat.entitlementId ??
  'Chefly Pro';

export const CHEFLY_REVENUECAT_OFFERING_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID ??
  configuredRevenueCat.offeringId ??
  'default';

export const CHEFLY_PRODUCT_IDS: Record<CheflyPlanKey, string> = {
  lifetime: configuredRevenueCat.productIds?.lifetime ?? 'lifetime',
  yearly: configuredRevenueCat.productIds?.yearly ?? 'yearly',
  monthly: configuredRevenueCat.productIds?.monthly ?? 'monthly',
};

export const CHEFLY_PACKAGE_IDS: Record<CheflyPlanKey, string> = {
  lifetime: configuredRevenueCat.packageIds?.lifetime ?? CHEFLY_PRODUCT_IDS.lifetime,
  yearly: configuredRevenueCat.packageIds?.yearly ?? CHEFLY_PRODUCT_IDS.yearly,
  monthly: configuredRevenueCat.packageIds?.monthly ?? CHEFLY_PRODUCT_IDS.monthly,
};

const PACKAGE_MATCHERS: Record<CheflyPlanKey, string[]> = {
  lifetime: [CHEFLY_PACKAGE_IDS.lifetime, CHEFLY_PRODUCT_IDS.lifetime, '$rc_lifetime'],
  yearly: [CHEFLY_PACKAGE_IDS.yearly, CHEFLY_PRODUCT_IDS.yearly, '$rc_annual', '$rc_yearly', 'annual', 'yearly'],
  monthly: [CHEFLY_PACKAGE_IDS.monthly, CHEFLY_PRODUCT_IDS.monthly, '$rc_monthly', 'monthly'],
};

export const CHEFLY_PLAN_ORDER: CheflyPlanKey[] = ['yearly', 'monthly', 'lifetime'];

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export function getCheflyProEntitlement(customerInfo: CustomerInfo | null): PurchasesEntitlementInfo | null {
  if (!customerInfo) return null;

  return (
    customerInfo.entitlements.active[CHEFLY_PRO_ENTITLEMENT] ??
    customerInfo.entitlements.all[CHEFLY_PRO_ENTITLEMENT] ??
    null
  );
}

export function hasCheflyProAccess(customerInfo: CustomerInfo | null) {
  return getCheflyProEntitlement(customerInfo)?.isActive ?? false;
}

export function selectCheflyOffering(offerings: PurchasesOfferings | null): PurchasesOffering | null {
  if (!offerings) return null;
  return offerings.all[CHEFLY_REVENUECAT_OFFERING_ID] ?? offerings.current ?? null;
}

export function getCheflyPlanKey(aPackage: PurchasesPackage): CheflyPlanKey | null {
  const packageId = normalize(aPackage.identifier);
  const productId = normalize(aPackage.product.identifier);

  for (const key of CHEFLY_PLAN_ORDER) {
    if (PACKAGE_MATCHERS[key].some((candidate) => normalize(candidate) === packageId || normalize(candidate) === productId)) {
      return key;
    }
  }

  switch (aPackage.packageType) {
    case 'LIFETIME':
      return 'lifetime';
    case 'ANNUAL':
      return 'yearly';
    case 'MONTHLY':
      return 'monthly';
    default:
      return null;
  }
}

export function getCheflyPackages(offering: PurchasesOffering | null): Record<CheflyPlanKey, PurchasesPackage | null> {
  const empty = { lifetime: null, yearly: null, monthly: null } satisfies Record<CheflyPlanKey, PurchasesPackage | null>;
  if (!offering) return empty;

  return offering.availablePackages.reduce<Record<CheflyPlanKey, PurchasesPackage | null>>((acc, aPackage) => {
    const key = getCheflyPlanKey(aPackage);
    if (key && !acc[key]) acc[key] = aPackage;
    return acc;
  }, empty);
}

export function getRevenueCatErrorMessage(error: unknown, fallback = 'Something went wrong while talking to RevenueCat.') {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

export function isCancelledRevenueCatPurchase(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return false;
  return error.code === '1';
}

export function formatEntitlementStatus(entitlement: PurchasesEntitlementInfo | null) {
  if (!entitlement?.isActive) return 'Free plan';
  if (!entitlement.expirationDate) return 'Chefly Pro • Lifetime';
  return entitlement.willRenew ? 'Chefly Pro • Active' : 'Chefly Pro • Ends soon';
}
