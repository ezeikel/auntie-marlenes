import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  token: vi.fn(),
}));
vi.mock('jose', () => ({
  createRemoteJWKSet: (url: URL) => url.href,
  jwtVerify: mocks.verify,
}));
vi.mock('@/lib/prisma', () => ({
  db: { user: { findUnique: mocks.findUnique, create: mocks.create } },
}));
vi.mock('@/lib/auth-mobile', () => ({ createToken: mocks.token }));

import { POST as apple } from '../../app/api/auth/mobile/apple/route';
import { POST as google } from '../../app/api/auth/mobile/google/route';

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv(
    'APPLE_MOBILE_CLIENT_ID',
    'com.chewybytes.auntiemarlenes.app, com.chewybytes.auntiemarlenes.app.dev',
  );
  vi.stubEnv('GOOGLE_WEB_CLIENT_ID', 'google-client');
  vi.stubEnv('GOOGLE_CLIENT_ID', 'nextauth-client');
});
describe.each([
  [
    'apple',
    apple,
    'identityToken',
    'https://appleid.apple.com/auth/keys',
    'https://appleid.apple.com',
    [
      'com.chewybytes.auntiemarlenes.app',
      'com.chewybytes.auntiemarlenes.app.dev',
    ],
  ],
  [
    'google',
    google,
    'idToken',
    'https://www.googleapis.com/oauth2/v3/certs',
    ['accounts.google.com', 'https://accounts.google.com'],
    ['google-client', 'nextauth-client'],
  ],
] as const)(
  '%s identity verification',
  (_name, handler, field, jwks, issuer, audience) => {
    const request = (body: object) =>
      new Request('https://local.test', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    it('verifies signature, issuer, audience, algorithm and expiry before accessing users', async () => {
      mocks.verify.mockResolvedValue({
        payload: { email: 'test@example.test', name: 'Test' },
      });
      mocks.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.test',
      });
      mocks.token.mockResolvedValue('session');
      const response = await handler(request({ [field]: 'signed-token' }));
      expect(response.status).toBe(200);
      expect(mocks.verify).toHaveBeenCalledWith(
        'signed-token',
        jwks,
        expect.objectContaining({
          issuer,
          audience,
          algorithms: ['RS256'],
          requiredClaims: ['sub', 'iat', 'exp'],
        }),
      );
      expect(await response.json()).toEqual({ sessionToken: 'session' });
    });
    it('rejects an invalid signature without any DB access or session minting', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mocks.verify.mockRejectedValue(new Error('bad signature'));
      expect((await handler(request({ [field]: 'forged' }))).status).toBe(400);
      expect(mocks.findUnique).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
      expect(mocks.token).not.toHaveBeenCalled();
    });
    it('rejects missing tokens and verified tokens without an email', async () => {
      expect((await handler(request({}))).status).toBe(400);
      mocks.verify.mockResolvedValue({ payload: { sub: '1' } });
      expect((await handler(request({ [field]: 'token' }))).status).toBe(400);
      expect(mocks.findUnique).not.toHaveBeenCalled();
    });
  },
);
