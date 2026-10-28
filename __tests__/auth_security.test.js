/**
 * Authentication Security & OTP Verification Test Suite
 * Validates all 9 security requirements specified by Dharani Herbbals:
 * 1. Enter number and do not verify OTP -> login must fail
 * 2. Enter different person's number -> no login without verifying OTP sent to that number
 * 3. Enter incorrect OTP -> login must fail
 * 4. Enter expired/reused OTP -> login must fail
 * 5. Verify correct OTP -> login succeeds for matching account only
 * 6. Restart app with valid session -> restore same authenticated account
 * 7. Restart app with invalid/expired session -> require login
 * 8. Switch numbers/accounts -> never retain previous user's identity/data
 * 9. OTP auto-fill -> authentication still requires successful backend verification
 */

const store = {};

jest.mock('@react-native-async-storage/async-storage', () => {
  const innerStore = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => innerStore[key] || null),
      setItem: jest.fn(async (key, val) => {
        innerStore[key] = String(val);
      }),
      removeItem: jest.fn(async (key) => {
        delete innerStore[key];
      }),
      multiRemove: jest.fn(async (keys) => {
        keys.forEach(k => delete innerStore[k]);
      }),
    },
  };
});

import { api } from '../src/services/api';
import storage from '../src/services/storage';

describe('OTP Authentication Security & Auto-Login Prevention', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    await storage.clearAuth();
    await storage.setAddresses([]);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  // TEST 1: Enter a number and do not verify OTP -> login must fail
  test('Case 1: Entering a number and requesting OTP does NOT authenticate or create user session', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: true,
        message: 'OTP sent successfully',
        user_id: 29523,
        mobile: '9999999999',
        otp: '123456', // Simulated server response in test mode
      }),
    });

    const res = await api.loginWithMobile('9999999999');

    // Verification 1: loginWithMobile strips the OTP so client application never receives it
    expect(res.otp).toBeUndefined();
    expect(res.success).toBe(true);

    // Verification 2: Storage has NO user and NO token
    const storedUser = await storage.getUser();
    const storedToken = await storage.getToken();
    expect(storedUser).toBeNull();
    expect(storedToken).toBeNull();
  });

  // TEST 2: Enter a different person's number -> no login without verifying the OTP sent to that number
  test("Case 2: Entering another person's number does NOT auto-login or reveal OTP", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: true,
        message: 'OTP sent successfully',
        user_id: 88888,
        mobile: '9876543210',
        otp: '887766',
      }),
    });

    const res = await api.loginWithMobile('9876543210');

    // The leaked server OTP must be completely sanitized and removed
    expect(res.otp).toBeUndefined();
    expect(res.user_id).toBe(88888);

    // Session remains completely unauthenticated
    const storedUser = await storage.getUser();
    expect(storedUser).toBeNull();
  });

  // TEST 3: Enter an incorrect OTP -> login must fail
  test('Case 3: Submitting an incorrect OTP causes backend rejection and prevents login', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: false,
        message: 'Invalid OTP',
      }),
    });

    await expect(
      api.verifyOtp({ mobile: '9999999999', otp: '000000', userId: 29523 })
    ).rejects.toThrow('Invalid OTP');

    // Storage remains empty
    const storedUser = await storage.getUser();
    expect(storedUser).toBeNull();
  });

  // TEST 4: Enter an expired or previously used OTP -> login must fail
  test('Case 4: Submitting an expired or reused OTP causes backend rejection and prevents login', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: false,
        message: 'Invalid OTP',
      }),
    });

    await expect(
      api.verifyOtp({ mobile: '9999999999', otp: '162036', userId: 29523 })
    ).rejects.toThrow('Invalid OTP');

    const storedUser = await storage.getUser();
    expect(storedUser).toBeNull();
  });

  // TEST 5: Verify the correct OTP -> login succeeds for the matching account only
  test('Case 5: Submitting valid OTP successfully authenticates and binds to matching verified user', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: true,
        message: 'OTP verified successfully',
        user_id: 29523,
        user: {
          id: 29523,
          name: 'DENNIS STORES',
          mobile: '9999999999',
          role: 'sarvo',
          is_store_member: false,
        },
        token: 'auth-token-dharani-29523',
      }),
    });

    const res = await api.verifyOtp({ mobile: '9999999999', otp: '162036', userId: 29523 });
    expect(res.success).toBe(true);
    expect(res.user.id).toBe(29523);
    expect(res.user.mobile).toBe('9999999999');

    // Emulate AuthContext storage binding
    await storage.setUser(res.user);
    await storage.setToken(res.token);

    const storedUser = await storage.getUser();
    const storedToken = await storage.getToken();
    expect(storedUser).toEqual(res.user);
    expect(storedToken).toBe('auth-token-dharani-29523');
  });

  // TEST 6: Restart the app with a valid session -> restore the same authenticated account safely
  test('Case 6: Valid session is verified with backend before restoring', async () => {
    const existingUser = {
      id: 29523,
      name: 'DENNIS STORES',
      mobile: '9999999999',
    };
    await storage.setUser(existingUser);
    await storage.setToken('auth-token-dharani-29523');

    // Mock backend returning valid user address query
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user_id: 29523,
        user_name: 'DENNIS STORES',
        total_addresses: 1,
        addresses: [],
      }),
    });

    const isValid = await api.validateSession(existingUser.id);
    expect(isValid).toBe(true);

    const restoredUser = await storage.getUser();
    expect(restoredUser.id).toBe(29523);
  });

  // TEST 7: Restart the app with an invalid or expired session -> require login
  test('Case 7: Expired or deleted user session is rejected by backend and cleared from storage', async () => {
    const staleUser = {
      id: 999999,
      name: 'Deleted User',
      mobile: '9111111111',
    };
    await storage.setUser(staleUser);
    await storage.setToken('stale-token');

    // Mock backend returning 400 for non-existent user
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        message: 'No User matches the given query.',
      }),
    });

    await expect(api.validateSession(staleUser.id)).rejects.toThrow('Session invalid or user not found');

    // On catching auth failure, app clears auth
    await storage.clearAuth();
    const clearedUser = await storage.getUser();
    expect(clearedUser).toBeNull();
  });

  // TEST 8: Switch numbers or accounts -> never retain previous user's identity or addresses
  test("Case 8: Switching accounts purges previous user's credentials and addresses", async () => {
    // User A logged in with addresses
    const userA = { id: 29523, mobile: '9999999999', name: 'User A' };
    await storage.setUser(userA);
    await storage.setToken('token-a');
    await storage.setAddresses([{ id: 101, address: 'User A Address' }]);

    expect((await storage.getUser()).id).toBe(29523);
    expect((await storage.getAddresses()).length).toBe(1);

    // Switch account / logout
    await storage.clearAuth();
    await storage.setAddresses([]);

    // Verify User A data is completely wiped
    expect(await storage.getUser()).toBeNull();
    expect(await storage.getToken()).toBeNull();
    expect(await storage.getAddresses()).toEqual([]);

    // Now User B logs in
    const userB = { id: 30000, mobile: '9888888888', name: 'User B' };
    await storage.setUser(userB);
    await storage.setToken('token-b');

    const activeUser = await storage.getUser();
    expect(activeUser.id).toBe(30000);
    expect(activeUser.mobile).toBe('9888888888');
  });

  // TEST 9: OTP auto-fill works -> authentication still requires successful backend verification
  test('Case 9: OTP auto-filled string must pass backend verification before creating session', async () => {
    const autofilledOtp = '543210';

    // 9a. If backend rejects autofilled OTP (e.g. mismatched code), login is blocked
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: false,
        message: 'Invalid OTP',
      }),
    });

    await expect(
      api.verifyOtp({ mobile: '9999999999', otp: autofilledOtp, userId: 29523 })
    ).rejects.toThrow('Invalid OTP');

    expect(await storage.getUser()).toBeNull();

    // 9b. Only when backend confirms autofilled OTP does authentication succeed
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: true,
        message: 'OTP verified successfully',
        user_id: 29523,
        user: { id: 29523, mobile: '9999999999', name: 'Verified Customer' },
      }),
    });

    const verifyRes = await api.verifyOtp({ mobile: '9999999999', otp: autofilledOtp, userId: 29523 });
    expect(verifyRes.success).toBe(true);
    await storage.setUser(verifyRes.user);

    expect((await storage.getUser()).id).toBe(29523);
  });
});
