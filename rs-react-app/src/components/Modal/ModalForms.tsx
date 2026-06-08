import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button/Button';
import styles from './ModalForms.module.css';

type Gender = 'male' | 'female';

type FormValues = {
  name: string;
  age: number;
  email: string;
  gender: Gender;
  acceptedTerms: boolean;
  message: string;
};

interface ModalFormsProps {
  type: 'uncontrolled' | 'react-hook-form';
  onSubmit: (values: FormValues) => void;
}

export function ModalForms({ type, onSubmit }: ModalFormsProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      age: 0,
      email: '',
      gender: 'male',
      acceptedTerms: false,
      message: '',
    },
  });

  const handleUncontrolledSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const ageValue = formData.get('age');
    const age = typeof ageValue === 'string' && ageValue.trim() !== '' ? Number(ageValue) : 0;

    onSubmit({
      name: (formData.get('name') as string) ?? '',
      age,
      email: (formData.get('email') as string) ?? '',
      gender: ((formData.get('gender') as string) ?? 'male') as Gender,
      acceptedTerms: formData.get('acceptedTerms') === 'on',
      message: (formData.get('message') as string) ?? '',
    });

    event.currentTarget.reset();
    formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  };

  const handleHookFormSubmit = (values: FormValues) => {
    onSubmit(values);
    reset();
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
            {...register('name', { required: 'Name is required' })}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </label>

        <label className={styles.field} htmlFor="age">
          <span className={styles.label}>Age</span>
          <input
            id="age"
            className={styles.input}
            type="number"
            min={0}
            {...register('age', {
              valueAsNumber: true,
              required: 'Age is required',
              min: { value: 0, message: 'Age must be 0 or greater' },
            })}
            aria-invalid={errors.age ? 'true' : 'false'}
          />
          {errors.age && <span className={styles.error}>{errors.age.message}</span>}
        </label>

        <label className={styles.field} htmlFor="email">
          <span className={styles.label}>Email</span>
          <input
            id="email"
            className={styles.input}
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </label>

        <label className={styles.field} htmlFor="gender">
          <span className={styles.label}>Gender</span>
          <select
            id="gender"
            className={styles.input}
            {...register('gender', { required: 'Select a gender' })}
            aria-invalid={errors.gender ? 'true' : 'false'}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className={styles.error}>{errors.gender.message}</span>}
        </label>

        <label className={styles.field} htmlFor="acceptedTerms">
          <input
            id="acceptedTerms"
            className={styles.checkbox}
            type="checkbox"
            {...register('acceptedTerms', {
              required: 'You must accept Terms and Conditions',
            })}
            aria-invalid={errors.acceptedTerms ? 'true' : 'false'}
          />
          <span className={styles.label}>Accept Terms and Conditions</span>
        </label>
        {errors.acceptedTerms && (
          <span className={styles.error}>{errors.acceptedTerms.message}</span>
        )}

        <label className={styles.field} htmlFor="message">
          <span className={styles.label}>Message</span>
          <textarea
            id="message"
            className={styles.textarea}
            rows={4}
            {...register('message', { required: 'Message is required' })}
            aria-invalid={errors.message ? 'true' : 'false'}
          />
          {errors.message && <span className={styles.error}>{errors.message.message}</span>}
        </label>

        <Button type="submit">Submit React Hook Form</Button>
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
          <option value="other">Other</option>
        </select>
      </label>

      <label className={styles.field} htmlFor="acceptedTerms">
        <input
          id="acceptedTerms"
          className={styles.checkbox}
          type="checkbox"
          name="acceptedTerms"
        />
        <span className={styles.label}>Accept Terms and Conditions</span>
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
