import { apiRequest } from '@/lib/api';
import type { AuthSession } from '@/lib/session';

type MagicLinkRequestResponse = {
  ok: boolean;
  message: string;
};

export async function requestMagicLink(email: string) {
  return apiRequest<MagicLinkRequestResponse>('/auth/magic-link/request', {
    method: 'POST',
    body: { email },
  });
}

export async function verifyMagicLink(token: string) {
  return apiRequest<AuthSession>('/auth/magic-link/verify', {
    method: 'POST',
    body: { token },
  });
}
