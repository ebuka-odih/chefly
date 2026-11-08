import { useSyncExternalStore } from 'react';
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type LogInResult,
  type MakePurchaseResult,
  type PurchasesOffering,
  type PurchasesOfferings,
  type PurchasesPackage,
  type PurchasesStoreTransaction,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';
import {
  type CheflyPlanKey,
  CHEFLY_PLAN_ORDER,
  CHEFLY_PRO_ENTITLEMENT,
  REVENUECAT_API_KEY,
  formatEntitlementStatus,
  getCheflyPackages,
  getCheflyProEntitlement,
  getRevenueCatErrorMessage,
  hasCheflyProAccess,
  isCancelledRevenueCatPurchase,
  selectCheflyOffering,
} from '@/lib/revenueCat';

type RevenueCatUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type SubscriptionState = {
  initialized: boolean;
  busy: boolean;
  ready: boolean;
  lastError: string | null;
  lastEvent: string | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  currentOffering: PurchasesOffering | null;
  packages: Record<CheflyPlanKey, PurchasesPackage | null>;
  isPro: boolean;
  appUserId: string | null;
  isAnonymous: boolean | null;
  lastSyncedAt: string | null;
};

const initialState: SubscriptionState = {
  initialized: false,
  busy: false,
  ready: false,
  lastError: null,
  lastEvent: null,
  customerInfo: null,
  offerings: null,
  currentOffering: null,
  packages: {
    lifetime: null,
    yearly: null,
    monthly: null,
  },
  isPro: false,
  appUserId: null,
  isAnonymous: null,
  lastSyncedAt: null,
};

let state = initialState;
let isConfigured = false;
let bootstrapPromise: Promise<void> | null = null;
let customerInfoListener: CustomerInfoUpdateListener | null = null;
let lastUserKey: string | null = null;
const listeners = new Set<() => void>();

const isNativeRevenueCatPlatform = Platform.OS === 'ios' || Platform.OS === 'android';

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function setState(patch: Partial<SubscriptionState>) {
  state = { ...state, ...patch };
  emit();
}

function applyCustomerInfo(customerInfo: CustomerInfo | null) {
  setState({
    customerInfo,
    isPro: hasCheflyProAccess(customerInfo),
    lastEvent: formatEntitlementStatus(getCheflyProEntitlement(customerInfo)),
  });
}

function getUserKey(user: RevenueCatUser | null | undefined) {
  return JSON.stringify({
    id: user?.id ?? null,
    email: user?.email ?? null,
    name: user?.name ?? null,
  });
}

async function refreshRevenueCatState() {
  if (!isConfigured) return;

  const [customerInfo, offerings, appUserId, isAnonymous] = await Promise.all([
    Purchases.getCustomerInfo(),
    Purchases.getOfferings(),
    Purchases.getAppUserID(),
    Purchases.isAnonymous(),
  ]);

  const currentOffering = selectCheflyOffering(offerings);

  state = {
    ...state,
    initialized: true,
    ready: true,
    busy: false,
    customerInfo,
    offerings,
    currentOffering,
    packages: getCheflyPackages(currentOffering),
    isPro: hasCheflyProAccess(customerInfo),
    appUserId,
    isAnonymous,
    lastSyncedAt: new Date().toISOString(),
  };
  emit();
}

async function syncSubscriberProfile(user: RevenueCatUser) {
  await Promise.all([
    Purchases.setEmail(user.email?.trim() || null),
    Purchases.setDisplayName(user.name?.trim() || null),
    Purchases.setAttributes({
      chefly_user_id: user.id,
    }),
  ]);
}

async function ensureCustomerIdentity(user: RevenueCatUser | null | undefined) {
  if (!isConfigured) return;

  const isAnonymous = await Purchases.isAnonymous();
  const currentAppUserId = await Purchases.getAppUserID();

  if (user?.id) {
    let loginResult: LogInResult | null = null;
    if (isAnonymous || currentAppUserId !== user.id) {
      loginResult = await Purchases.logIn(user.id);
      applyCustomerInfo(loginResult.customerInfo);
    }
    await syncSubscriberProfile(user);
    return loginResult;
  }

  if (!isAnonymous) {
    const customerInfo = await Purchases.logOut();
    applyCustomerInfo(customerInfo);
  }

  return null;
}

export async function bootstrapRevenueCat(user: RevenueCatUser | null | undefined) {
  const nextUserKey = getUserKey(user);
  if (lastUserKey === nextUserKey && state.ready) return;

  if (!isNativeRevenueCatPlatform) {
    lastUserKey = nextUserKey;
    setState({
      initialized: true,
      ready: true,
      busy: false,
      lastEvent: 'RevenueCat purchases are enabled in iOS and Android development builds.',
      lastError: null,
    });
    return;
  }

  if (!REVENUECAT_API_KEY) {
    lastUserKey = nextUserKey;
    setState({
      initialized: true,
      ready: true,
      busy: false,
      lastError: 'Missing RevenueCat API key.',
    });
    return;
  }

  bootstrapPromise = (bootstrapPromise ?? Promise.resolve()).then(async () => {
    if (lastUserKey === nextUserKey && state.ready) return;

    setState({ busy: true, lastError: null });

    try {
      if (!isConfigured) {
        Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: user?.id,
          entitlementVerificationMode: Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
          diagnosticsEnabled: __DEV__,
        });
        isConfigured = true;

        await Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.INFO);

        if (!customerInfoListener) {
          customerInfoListener = (customerInfo) => {
            applyCustomerInfo(customerInfo);
          };
          Purchases.addCustomerInfoUpdateListener(customerInfoListener);
        }
      }

      await ensureCustomerIdentity(user);
      await refreshRevenueCatState();
      lastUserKey = nextUserKey;
      setState({ lastError: null });
    } catch (error) {
      setState({
        initialized: true,
        ready: true,
        busy: false,
        lastError: getRevenueCatErrorMessage(error, 'RevenueCat could not finish setting up.'),
      });
    }
  });

  try {
    await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}

export async function refreshSubscriptions() {
  setState({ busy: true, lastError: null });
  try {
    await refreshRevenueCatState();
    setState({ lastError: null });
  } catch (error) {
    setState({ busy: false, lastError: getRevenueCatErrorMessage(error, 'We could not refresh your subscription status.') });
    throw error;
  }
}

export async function purchaseCheflyPlan(planKey: CheflyPlanKey) {
  const aPackage = state.packages[planKey];
  if (!aPackage) throw new Error(`The ${planKey} product is not available in the current offering.`);

  setState({ busy: true, lastError: null });

  try {
    const result = await Purchases.purchasePackage(aPackage);
    applyCustomerInfo(result.customerInfo);
    await refreshRevenueCatState();
    return result;
  } catch (error) {
    if (isCancelledRevenueCatPurchase(error)) {
      setState({ busy: false, lastEvent: 'Purchase cancelled' });
      return null;
    }

    const message = getRevenueCatErrorMessage(error, 'Your purchase did not complete.');
    setState({ busy: false, lastError: message });
    throw new Error(message);
  }
}

export async function restoreCheflyPurchases() {
  setState({ busy: true, lastError: null });

  try {
    const customerInfo = await Purchases.restorePurchases();
    applyCustomerInfo(customerInfo);
    await refreshRevenueCatState();
    return customerInfo;
  } catch (error) {
    const message = getRevenueCatErrorMessage(error, 'We could not restore your purchases.');
    setState({ busy: false, lastError: message });
    throw new Error(message);
  }
}

export async function presentCheflyPaywall() {
  setState({ busy: true, lastError: null });

  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      offering: state.currentOffering ?? undefined,
      requiredEntitlementIdentifier: CHEFLY_PRO_ENTITLEMENT,
      displayCloseButton: true,
    });

    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      await refreshRevenueCatState();
    } else {
      setState({ busy: false, lastEvent: 'Paywall dismissed' });
    }

    return result;
  } catch (error) {
    const message = getRevenueCatErrorMessage(error, 'We could not present the RevenueCat paywall.');
    setState({ busy: false, lastError: message });
    throw new Error(message);
  }
}

export async function presentCheflyCustomerCenter() {
  setState({ busy: true, lastError: null });

  try {
    await RevenueCatUI.presentCustomerCenter({
      callbacks: {
        onRestoreCompleted: ({ customerInfo }) => {
          applyCustomerInfo(customerInfo);
        },
      },
    });
    await refreshRevenueCatState();
  } catch (error) {
    const message = getRevenueCatErrorMessage(error, 'We could not open Customer Center.');
    setState({ busy: false, lastError: message });
    throw new Error(message);
  }
}

export function useSubscription() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getSubscriptionProducts() {
  return CHEFLY_PLAN_ORDER
    .map((key) => ({ key, package: state.packages[key] }))
    .filter((entry): entry is { key: CheflyPlanKey; package: PurchasesPackage } => Boolean(entry.package));
}

export type SubscriptionSummary = ReturnType<typeof useSubscription>;
export type SubscriptionPurchaseResult = MakePurchaseResult | null;
export type SubscriptionTransaction = PurchasesStoreTransaction;
