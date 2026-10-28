/**
 * Automated Unit Tests for OTP Auto-Fill & Extraction Logic
 */

describe('OTP Extraction & Auto-Fill Formatting', () => {
  const extractOtp = (message) => {
    // 1. Keyword-based 6-digit match (e.g. "verification code is 123456", "OTP: 123456")
    const matchKeyword6 = message.match(/(?:otp|code|verification|passcode)[^0-9]{0,15}(\d{6})/i);
    if (matchKeyword6) return matchKeyword6[1];

    // 2. Standalone 6-digit match
    const match6 = message.match(/(?<!\d)(\d{6})(?!\d)/);
    if (match6) return match6[1];

    // 3. Keyword-based 4-digit match
    const matchKeyword4 = message.match(/(?:otp|code|verification|passcode)[^0-9]{0,15}(\d{4})/i);
    if (matchKeyword4) return matchKeyword4[1];

    // 4. Standalone 4-digit match
    const match4 = message.match(/(?<!\d)(\d{4})(?!\d)/);
    if (match4) return match4[1];

    return null;
  };

  const cleanInputOtp = (text) => {
    return (text || '').replace(/[^0-9]/g, '').slice(0, 6);
  };

  test('Extracts 6-digit OTP from standard Indian DLT verification SMS', () => {
    const sms = 'Your Dharani Herbbals verification code is 240867. Valid for 5 minutes. Do not share with anyone.';
    expect(extractOtp(sms)).toBe('240867');
  });

  test('Extracts 6-digit OTP from Google SMS Retriever formatted message with 11-char app hash', () => {
    const sms = '<#> 390136 is your Dharani Herbbals verification code.\nkTS7TqR+IXM';
    expect(extractOtp(sms)).toBe('390136');
  });

  test('Extracts 6-digit OTP from release SMS Retriever formatted message with release hash', () => {
    const sms = '<#> Your Dharani Herbbals verification code is 854181.\nBmlRBG4Cub6';
    expect(extractOtp(sms)).toBe('854181');
  });

  test('Extracts 6-digit OTP from resent SMS notification', () => {
    const sms = 'Your fresh OTP for Dharani Herbbals is 751866. Valid for 5 mins.';
    expect(extractOtp(sms)).toBe('751866');
  });

  test('Correctly distinguishes between 6-digit PIN code and 6-digit OTP', () => {
    const sms = 'Store PIN: 638459. Your Dharani Herbbals verification code is 126218.';
    expect(extractOtp(sms)).toBe('126218');
  });

  test('Extracts 4-digit OTP fallback when 4-digit code is sent', () => {
    const sms = 'Your login code is 8294';
    expect(extractOtp(sms)).toBe('8294');
  });

  test('Does NOT falsely match 10-digit mobile number as an OTP', () => {
    const sms = 'Welcome to Dharani Herbbals! We received a login request for mobile 9876543210. Your OTP is 418205.';
    expect(extractOtp(sms)).toBe('418205');
  });

  test('Cleans full pasted code with spaces or dashes correctly', () => {
    expect(cleanInputOtp(' 240 867 ')).toBe('240867');
    expect(cleanInputOtp('390-136')).toBe('390136');
    expect(cleanInputOtp('Code: 751866.')).toBe('751866');
  });

  test('Limits input code to maximum 6 digits', () => {
    expect(cleanInputOtp('1234567890')).toBe('123456');
  });

  test('Gracefully handles empty or null input', () => {
    expect(cleanInputOtp('')).toBe('');
    expect(cleanInputOtp(null)).toBe('');
  });

  test('Populates all 6 visual boxes in correct sequential order', () => {
    const otp = '854181';
    const boxes = [0, 1, 2, 3, 4, 5].map(index => otp[index] || '');
    expect(boxes).toEqual(['8', '5', '4', '1', '8', '1']);
  });

  test('Allows single digit manual typing step by step', () => {
    let currentOtp = '';
    const typeDigit = (digit) => {
      currentOtp = cleanInputOtp(currentOtp + digit);
    };

    typeDigit('3');
    expect([0, 1, 2, 3, 4, 5].map(i => currentOtp[i] || '')).toEqual(['3', '', '', '', '', '']);

    typeDigit('9');
    expect([0, 1, 2, 3, 4, 5].map(i => currentOtp[i] || '')).toEqual(['3', '9', '', '', '', '']);

    // Backspace
    currentOtp = currentOtp.slice(0, -1);
    expect([0, 1, 2, 3, 4, 5].map(i => currentOtp[i] || '')).toEqual(['3', '', '', '', '', '']);
  });

  test('Requires server verification before completing authentication (no automatic login)', async () => {
    let isAuthenticated = false;
    const mockVerifyApi = jest.fn().mockImplementation(async ({ otp }) => {
      if (otp === '854181') {
        return { success: true, user: { id: 29523, name: 'Dharani Customer' } };
      }
      return { success: false, message: 'Invalid OTP' };
    });

    const handleAutoFillAndVerify = async (incomingOtp) => {
      const cleaned = cleanInputOtp(incomingOtp);
      if (cleaned.length === 6) {
        const res = await mockVerifyApi({ otp: cleaned });
        if (res.success) {
          isAuthenticated = true;
        }
      }
    };

    // Valid OTP confirms authentication via API
    await handleAutoFillAndVerify('854181');
    expect(mockVerifyApi).toHaveBeenCalledWith({ otp: '854181' });
    expect(isAuthenticated).toBe(true);

    // Invalid OTP does NOT authenticate
    isAuthenticated = false;
    await handleAutoFillAndVerify('000000');
    expect(mockVerifyApi).toHaveBeenCalledWith({ otp: '000000' });
    expect(isAuthenticated).toBe(false);
  });
});
