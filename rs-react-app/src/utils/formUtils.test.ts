import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkPasswordStrength,
  isPasswordStrong,
  readFileAsDataURL,
  validateImageFile,
} from './formUtils';

describe('formUtils', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calculates password strength flags correctly', () => {
    expect(checkPasswordStrength('simple')).toEqual({
      hasNumber: false,
      hasUppercase: false,
      hasLowercase: true,
      hasSpecialChar: false,
    });

    expect(checkPasswordStrength('Strong1!')).toEqual({
      hasNumber: true,
      hasUppercase: true,
      hasLowercase: true,
      hasSpecialChar: true,
    });
  });

  it('returns true only for strong passwords', () => {
    expect(isPasswordStrong(checkPasswordStrength('Weak1'))).toBe(false);
    expect(isPasswordStrong(checkPasswordStrength('Strong1!'))).toBe(true);
  });

  it('validates image file type and maximum size', () => {
    const invalidType = new File(['gifdata'], 'test.gif', { type: 'image/gif' });
    expect(validateImageFile(invalidType)).toBe('Only PNG and JPEG images are allowed');

    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    expect(validateImageFile(largeFile)).toBe('Image size must be less than 5MB');

    const validFile = new File(['data'], 'photo.jpeg', { type: 'image/jpeg' });
    expect(validateImageFile(validFile)).toBe('');
  });

  it('reads a file as a data URL', async () => {
    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      result = 'data:image/png;base64,AAAA';
      readAsDataURL() {
        this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await expect(readFileAsDataURL(file)).resolves.toBe('data:image/png;base64,AAAA');

    vi.stubGlobal('FileReader', originalFileReader);
  });
});
