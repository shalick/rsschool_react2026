import { describe, expect, it } from 'vitest';
import {
  checkPasswordStrength,
  isPasswordStrong,
  validateImageFile,
} from '../utils/formUtils';

describe('formUtils from test directory', () => {
  it('computes password strength correctly', () => {
    expect(checkPasswordStrength('basic')).toEqual({
      hasNumber: false,
      hasUppercase: false,
      hasLowercase: true,
      hasSpecialChar: false,
    });

    expect(checkPasswordStrength('Str0ng!')).toEqual({
      hasNumber: true,
      hasUppercase: true,
      hasLowercase: true,
      hasSpecialChar: true,
    });
  });

  it('validates password strength correctly', () => {
    expect(isPasswordStrong(checkPasswordStrength('weak'))).toBe(false);
    expect(isPasswordStrong(checkPasswordStrength('Good1!Pass'))).toBe(true);
  });

  it('rejects unsupported image types and large files', () => {
    const invalidType = new File(['gif'], 'photo.gif', { type: 'image/gif' });
    expect(validateImageFile(invalidType)).toBe('Only PNG and JPEG images are allowed');

    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    expect(validateImageFile(largeFile)).toBe('Image size must be less than 5MB');
  });
});
