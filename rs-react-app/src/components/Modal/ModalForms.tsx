import React, { useRef, useState, useMemo } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../Button/Button';
import { useCountriesStore } from '../../store/useCountriesStore';
import styles from './ModalForms.module.css';

type Gender = 'male' | 'female';

type FormValues = {
  name: string;
  age: number;
  email: string;
  gender: Gender;
  acceptedTerms: boolean;
  message: string;
  image: string; // base64
  password: string;
  confirmPassword: string;
  country: string;
};

interface PasswordStrength {
  hasNumber: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const isPasswordStrong = (strength: PasswordStrength): boolean => {
  return Object.values(strength).every((v) => v);
};

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    age: z
      .coerce
      .number()
      .refine((value) => !Number.isNaN(value), { message: 'Age is required' })
      .min(0, 'Age must be 0 or greater'),
    email: z.string().email('Enter a valid email'),
    gender: z.enum(['male', 'female'] as const),
    acceptedTerms: z.boolean().refine((value) => value === true, {
      message: 'You must accept Terms and Conditions',
    }),
    message: z.string().min(1, 'Message is required'),
    image: z.string().optional().default(''),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    country: z.string().min(1, 'Select a country'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }

    if (data.password && !isPasswordStrong(checkPasswordStrength(data.password))) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message:
          'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character',
      });
    }
  });

type FormSchemaValues = z.infer<typeof formSchema>;

const validateImageFile = (file: File): string => {
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

interface ModalFormsProps {
  type: 'uncontrolled' | 'react-hook-form';
  onSubmit: (values: FormValues) => void;
}

export function ModalForms({ type, onSubmit }: ModalFormsProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [uncontrolledImageError, setUncontrolledImageError] = useState('');
  const [uncontrolledPasswordStrength, setUncontrolledPasswordStrength] = useState<PasswordStrength>(
    {
      hasNumber: false,
      hasUppercase: false,
      hasLowercase: false,
      hasSpecialChar: false,
    }
  );
  const [uncontrolledCountryFilter, setUncontrolledCountryFilter] = useState('');
  const [selectedUncontrolledCountry, setSelectedUncontrolledCountry] = useState('');
  const [showUncontrolledCountries, setShowUncontrolledCountries] = useState(false);
  const [rhfImageBase64, setRhfImageBase64] = useState('');
  const [rhfImageError, setRhfImageError] = useState('');

  const { countries } = useCountriesStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormSchemaValues>({
    resolver: zodResolver(formSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      age: 0,
      email: '',
      gender: 'male',
      acceptedTerms: false,
      message: '',
      image: '',
      password: '',
      confirmPassword: '',
      country: '',
    },
  });

  const renderError = (message?: string) => (
    <span className={styles.error}>{message ?? '\u00A0'}</span>
  );

  const password = watch('password');
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  const filteredCountries = useMemo(() => {
    if (!uncontrolledCountryFilter) return countries;
    return countries.filter((c) =>
      c.name.common.toLowerCase().includes(uncontrolledCountryFilter.toLowerCase())
    );
  }, [uncontrolledCountryFilter, countries]);

  const handleUncontrolledImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setUncontrolledImageError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Store in a data attribute on the form for retrieval
      (e.target as any).dataset.base64 = base64;
    };
    reader.readAsDataURL(file);
    setUncontrolledImageError('');
  };

  const handleRhfImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setRhfImageError(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setRhfImageBase64(base64);
    };
    reader.readAsDataURL(file);
    setRhfImageError('');
  };

  const handleUncontrolledPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUncontrolledPasswordStrength(checkPasswordStrength(e.target.value));
  };

  const handleUncontrolledSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const ageValue = formData.get('age');
    const age = typeof ageValue === 'string' && ageValue.trim() !== '' ? Number(ageValue) : 0;

    const imageInput = formRef.current?.querySelector<HTMLInputElement>('input[name="image"]');
    const image = (imageInput as any)?.dataset?.base64 || '';

    const payload = {
      name: (formData.get('name') as string) ?? '',
      age,
      email: (formData.get('email') as string) ?? '',
      gender: ((formData.get('gender') as string) ?? 'male') as Gender,
      acceptedTerms: formData.get('acceptedTerms') === 'on',
      message: (formData.get('message') as string) ?? '',
      image,
      password: (formData.get('password') as string) ?? '',
      confirmPassword: (formData.get('confirmPassword') as string) ?? '',
      country: selectedUncontrolledCountry || uncontrolledCountryFilter,
    };

    const validation = formSchema.safeParse(payload);
    if (!validation.success) {
      alert(validation.error.issues[0]?.message ?? 'Validation failed');
      return;
    }

    onSubmit(validation.data as FormValues);

    event.currentTarget.reset();
    setUncontrolledCountryFilter('');
    setSelectedUncontrolledCountry('');
    setShowUncontrolledCountries(false);
    formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  };

  const handleHookFormSubmit: SubmitHandler<FormSchemaValues> = (values) => {
    onSubmit({
      ...values,
      image: rhfImageBase64,
    } as FormValues);
    reset();
    setRhfImageBase64('');
  };

  if (type === 'react-hook-form') {
    return (
      <form className={styles.form} onSubmit={handleSubmit(handleHookFormSubmit)}>
        <p className={styles.description}>
          This form uses React Hook Form validation and field registration.
        </p>

        <label className={styles.field} htmlFor="name">
          <span className={styles.label}>Name</span>
          <input
            id="name"
            className={styles.input}
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {renderError(errors.name?.message)}
        </label>

        <label className={styles.field} htmlFor="age">
          <span className={styles.label}>Age</span>
          <input
            id="age"
            className={styles.input}
            type="number"
            min={0}
            {...register('age', { valueAsNumber: true })}
            aria-invalid={errors.age ? 'true' : 'false'}
          />
          {renderError(errors.age?.message)}
        </label>

        <label className={styles.field} htmlFor="email">
          <span className={styles.label}>Email</span>
          <input
            id="email"
            className={styles.input}
            type="email"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {renderError(errors.email?.message)}
        </label>

        <label className={styles.field} htmlFor="gender">
          <span className={styles.label}>Gender</span>
          <select
            id="gender"
            className={styles.input}
            {...register('gender')}
            aria-invalid={errors.gender ? 'true' : 'false'}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {renderError(errors.gender?.message)}
        </label>

        <div className={styles.field}>
          <label className={styles.checkboxLabel} htmlFor="acceptedTerms">
            <input
              id="acceptedTerms"
              className={styles.checkbox}
              type="checkbox"
              {...register('acceptedTerms')}
              aria-invalid={errors.acceptedTerms ? 'true' : 'false'}
            />
            <span className={styles.label}>Accept Terms and Conditions</span>
          </label>
          {renderError(errors.acceptedTerms?.message)}
        </div>

        <label className={styles.field} htmlFor="image">
          <span className={styles.label}>Upload Image (PNG/JPEG, max 5MB)</span>
          <input
            id="image"
            className={styles.input}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleRhfImageChange}
          />
          {renderError(rhfImageError)}
        </label>

        <label className={styles.field} htmlFor="password">
          <span className={styles.label}>Password</span>
          <input
            id="password"
            className={styles.input}
            type="password"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {renderError(errors.password?.message)}
          {password && (
            <div className={styles.strengthIndicator}>
              <div
                className={`${styles.strengthBit} ${
                  passwordStrength.hasNumber ? styles.active : ''
                }`}
              >
                #
              </div>
              <div
                className={`${styles.strengthBit} ${
                  passwordStrength.hasUppercase ? styles.active : ''
                }`}
              >
                A
              </div>
              <div
                className={`${styles.strengthBit} ${
                  passwordStrength.hasLowercase ? styles.active : ''
                }`}
              >
                a
              </div>
              <div
                className={`${styles.strengthBit} ${
                  passwordStrength.hasSpecialChar ? styles.active : ''
                }`}
              >
                !
              </div>
            </div>
          )}
        </label>

        <label className={styles.field} htmlFor="confirmPassword">
          <span className={styles.label}>Confirm Password</span>
          <input
            id="confirmPassword"
            className={styles.input}
            type="password"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          />
          {renderError(errors.confirmPassword?.message)}
        </label>

        <label className={styles.field} htmlFor="country">
          <span className={styles.label}>Country</span>
          <select
            id="country"
            className={styles.input}
            {...register('country')}
            aria-invalid={errors.country ? 'true' : 'false'}
          >
            <option value="">-- Select a country --</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
          {renderError(errors.country?.message)}
        </label>

        <label className={styles.field} htmlFor="message">
          <span className={styles.label}>Message</span>
          <textarea
            id="message"
            className={styles.textarea}
            rows={4}
            {...register('message')}
            aria-invalid={errors.message ? 'true' : 'false'}
          />
          {renderError(errors.message?.message)}
        </label>

        <Button type="submit" disabled={!isValid || Boolean(rhfImageError)}>
          Submit React Hook Form
        </Button>
      </form>
    );
  }

  return (
    <form className={styles.form} ref={formRef} onSubmit={handleUncontrolledSubmit}>
      <p className={styles.description}>
        This form is rendered as an uncontrolled HTML form.
      </p>

      <label className={styles.field} htmlFor="name">
        <span className={styles.label}>Name</span>
        <input id="name" className={styles.input} name="name" />
      </label>

      <label className={styles.field} htmlFor="age">
        <span className={styles.label}>Age</span>
        <input id="age" className={styles.input} type="number" min={0} name="age" />
      </label>

      <label className={styles.field} htmlFor="email">
        <span className={styles.label}>Email</span>
        <input id="email" className={styles.input} type="email" name="email" />
      </label>

      <label className={styles.field} htmlFor="gender">
        <span className={styles.label}>Gender</span>
        <select id="gender" className={styles.input} name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>

      <div className={styles.field}>
        <label className={styles.checkboxLabel} htmlFor="acceptedTerms">
          <input
            id="acceptedTerms"
            className={styles.checkbox}
            type="checkbox"
            name="acceptedTerms"
          />
          <span className={styles.label}>Accept Terms and Conditions</span>
        </label>
      </div>

      <label className={styles.field} htmlFor="image">
        <span className={styles.label}>Upload Image (PNG/JPEG, max 5MB)</span>
        <input
          id="image"
          className={styles.input}
          type="file"
          name="image"
          accept="image/png,image/jpeg"
          onChange={handleUncontrolledImageChange}
        />
        {uncontrolledImageError && (
          <span className={styles.error}>{uncontrolledImageError}</span>
        )}
      </label>

      <label className={styles.field} htmlFor="password">
        <span className={styles.label}>Password</span>
        <input
          id="password"
          className={styles.input}
          type="password"
          name="password"
          onChange={handleUncontrolledPasswordChange}
        />
        {Object.values(uncontrolledPasswordStrength).some((v) => v) && (
          <div className={styles.strengthIndicator}>
            <div
              className={`${styles.strengthBit} ${
                uncontrolledPasswordStrength.hasNumber ? styles.active : ''
              }`}
            >
              #
            </div>
            <div
              className={`${styles.strengthBit} ${
                uncontrolledPasswordStrength.hasUppercase ? styles.active : ''
              }`}
            >
              A
            </div>
            <div
              className={`${styles.strengthBit} ${
                uncontrolledPasswordStrength.hasLowercase ? styles.active : ''
              }`}
            >
              a
            </div>
            <div
              className={`${styles.strengthBit} ${
                uncontrolledPasswordStrength.hasSpecialChar ? styles.active : ''
              }`}
            >
              !
            </div>
          </div>
        )}
      </label>

      <label className={styles.field} htmlFor="confirmPassword">
        <span className={styles.label}>Confirm Password</span>
        <input
          id="confirmPassword"
          className={styles.input}
          type="password"
          name="confirmPassword"
        />
      </label>

      <label className={styles.field} htmlFor="country">
        <span className={styles.label}>Country</span>
        <input
          id="country"
          className={styles.input}
          type="text"
          name="countrySearch"
          placeholder="Search country..."
          value={uncontrolledCountryFilter}
          onChange={(e) => {
            setUncontrolledCountryFilter(e.target.value);
            setSelectedUncontrolledCountry('');
            setShowUncontrolledCountries(true);
          }}
          onFocus={() => setShowUncontrolledCountries(true)}
        />
        {showUncontrolledCountries && filteredCountries.length > 0 && (
          <div className={styles.dropdown}>
            {filteredCountries.slice(0, 10).map((country) => (
              <div
                key={country.cca3}
                className={styles.dropdownItem}
                onClick={() => {
                  setUncontrolledCountryFilter(country.name.common);
                  setSelectedUncontrolledCountry(country.name.common);
                  setShowUncontrolledCountries(false);
                }}
              >
                {country.name.common}
              </div>
            ))}
          </div>
        )}
        <input
          type="hidden"
          name="country"
          value={selectedUncontrolledCountry}
        />
      </label>

      <label className={styles.field} htmlFor="message">
        <span className={styles.label}>Message</span>
        <textarea
          id="message"
          className={styles.textarea}
          rows={4}
          name="message"
        />
      </label>

      <Button type="submit">Submit Uncontrolled Form</Button>
    </form>
  );
}
