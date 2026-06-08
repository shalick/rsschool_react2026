import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button/Button';
import styles from './ModalForms.module.css';

type FormValues = {
  name: string;
  email: string;
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
  } = useForm<FormValues>({ defaultValues: { name: '', email: '', message: '' } });

  const handleUncontrolledSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
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

        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            {...register('name', { required: 'Name is required' })}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
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

        <label className={styles.field}>
          <span className={styles.label}>Message</span>
          <textarea
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

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input className={styles.input} name="name" />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input className={styles.input} type="email" name="email" />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea className={styles.textarea} rows={4} name="message" />
      </label>

      <Button type="submit">Submit Uncontrolled Form</Button>
    </form>
  );
}
