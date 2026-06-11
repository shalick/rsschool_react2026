export type PasswordStrength = {
  hasNumber: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
};

export const checkPasswordStrength = (password: string): PasswordStrength => ({
  hasNumber: /\d/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasSpecialChar: [...password].some((char) =>
    `!@#$%^&*()_+-=[]{};':"\\|,.<>/?`.includes(char)
  ),
});

export const isPasswordStrong = (strength: PasswordStrength): boolean =>
  Object.values(strength).every(Boolean);

export const validateImageFile = (file: File): string => {
  const validTypes = ['image/png', 'image/jpeg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Only PNG and JPEG images are allowed';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return '';
};

export const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
