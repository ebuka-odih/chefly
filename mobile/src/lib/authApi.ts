import { apiRequest } from '@/lib/api';
import { getAccessToken, updateSessionUser } from '@/lib/session';
import type { AuthSession, AuthUser } from '@/lib/session';

type MagicLinkRequestResponse = {
  ok: boolean;
  message: string;
};

export async function requestOtp(email: string) {
  return apiRequest<MagicLinkRequestResponse>('/auth/otp/request', {
    method: 'POST',
    body: { email },
  });
}

export async function requestMagicLink(email: string) {
  return requestOtp(email);
}

export async function verifyOtp(email: string, code: string) {
  return apiRequest<AuthSession>('/auth/otp/verify', {
    method: 'POST',
    body: { email, code },
  });
}

export async function verifyMagicLink(token: string) {
  return apiRequest<AuthSession>('/auth/magic-link/verify', {
    method: 'POST',
    body: { token },
  });
}

export async function updateProfileName(name: string) {
  const token = getAccessToken();
  if (!token) throw new Error('You need to sign in again.');
  const user = await apiRequest<AuthUser>('/auth/me', {
    method: 'PATCH',
    token,
    body: { name },
  });
  updateSessionUser(user);
  return user;
}
