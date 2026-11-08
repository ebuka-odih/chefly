import { useEffect } from 'react';
import { bootstrapRevenueCat } from '@/lib/subscriptionStore';
import { useSession } from '@/lib/session';

export function RevenueCatBootstrap() {
  const session = useSession();
  const user = session?.user ?? null;

  useEffect(() => {
    bootstrapRevenueCat(
      user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : null,
    ).catch(() => {
      // The subscription store exposes the error to the UI.
    });
  }, [user]);

  return null;
}
