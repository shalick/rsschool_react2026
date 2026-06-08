import type { ComponentPropsWithoutRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.stubGlobal('alert', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

vi.mock('./ModalForms.module.css', () => ({
  default: {
    form: 'form',
    description: 'description',
    field: 'field',
    label: 'label',
    input: 'input',
    textarea: 'textarea',
    checkbox: 'checkbox',
    error: 'error',
  },
}));

vi.mock('../Button/Button', () => ({
  Button: ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('../../utils/formUtils', async () => {
  const actual = await vi.importActual<typeof import('../../utils/formUtils')>('../../utils/formUtils');
  return {
    ...actual,
    readFileAsDataURL: vi.fn().mockResolvedValue('data:image/png;base64,valid-image'),
  };
});

vi.mock('../../store/useCountriesStore', () => ({
  useCountriesStore: () => ({
    countries: [
      { cca3: 'USA', name: { common: 'United States' }, flags: {}, capital: [], region: '', population: 0 },
      { cca3: 'CAN', name: { common: 'Canada' }, flags: {}, capital: [], region: '', population: 0 },
    ],
  }),
}));

import { ModalForms } from './ModalForms';

describe('ModalForms', () => {
  it('renders uncontrolled form fields with labels linked by htmlFor and submits collected data', () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    const nameLabel = screen.getByText('Name').closest('label');
    expect(nameLabel).toHaveAttribute('for', 'name');
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Accept Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '29' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'female' } });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'United States' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello world' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Uncontrolled Form/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Alice',
      age: 29,
      email: 'alice@example.com',
      gender: 'female',
      acceptedTerms: true,
      message: 'Hello world',
      image: '',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      country: 'United States',
    });
  });

  it('renders React Hook Form fields with labels linked by htmlFor and submits collected data', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="react-hook-form" onSubmit={handleSubmit} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Accept Terms and Conditions')).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '35' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bob@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'female' } });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass456!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'SecurePass456!' },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'United States' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'React Hook Form message' },
    });

    const submitButton = screen.getByRole('button', { name: /Submit React Hook Form/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Bob',
        age: 35,
        email: 'bob@example.com',
        gender: 'female',
        acceptedTerms: true,
        message: 'React Hook Form message',
        image: '',
        password: 'SecurePass456!',
        confirmPassword: 'SecurePass456!',
        country: 'United States',
      });
    });
  });

  it('disables React Hook Form submit until the schema is valid and shows validation errors without layout shift', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="react-hook-form" onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Submit React Hook Form/i });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'charlie@example.com' },
    });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    const passwordInputs = screen.getAllByLabelText(/Password/i, { selector: 'input' });
    fireEvent.change(passwordInputs[0], { target: { value: 'short' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'United States' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Validation test' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();

    const updatedPasswordInputs = screen.getAllByLabelText(/Password/i, { selector: 'input' });
    fireEvent.change(updatedPasswordInputs[0], { target: { value: 'ValidPass123!' } });
    fireEvent.change(updatedPasswordInputs[1], { target: { value: 'ValidPass123!' } });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows a file type error for invalid uploaded image in uncontrolled form', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    const fileInput = screen.getByLabelText(/Upload Image/i);
    const invalidFile = new File(['data'], 'photo.gif', { type: 'image/gif' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(await screen.findByText(/Only PNG and JPEG images are allowed/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('opens the uncontrolled country dropdown and selects a country', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    const countrySearch = screen.getByPlaceholderText('Search country...');
    fireEvent.change(countrySearch, { target: { value: 'United' } });

    const option = await screen.findByText('United States');
    fireEvent.click(option);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '29' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello world' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Uncontrolled Form/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
        country: 'United States',
      }));
    });
  });

  it('shows password strength feedback while typing in uncontrolled form', () => {
    const handleSubmit = vi.fn();
    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('shows an image error on invalid file upload in react-hook-form', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="react-hook-form" onSubmit={handleSubmit} />);

    const fileInput = screen.getByLabelText(/Upload Image/i);
    const invalidFile = new File(['gif'], 'photo.gif', { type: 'image/gif' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(await screen.findByText(/Only PNG and JPEG images are allowed/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('alerts and prevents submission when uncontrolled form validation fails', () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '29' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Mismatch123!' },
    });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'Canada' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello world' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Uncontrolled Form/i }));

    expect(global.alert).toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits React Hook Form with a valid image file upload', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="react-hook-form" onSubmit={handleSubmit} />);

    const fileInput = screen.getByLabelText(/Upload Image/i);
    const validFile = new File(['dummy'], 'photo.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Diana' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '28' } });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'diana@example.com' },
    });
    fireEvent.click(screen.getByLabelText('Accept Terms and Conditions'));
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'ValidPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'ValidPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'United States' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Valid submission' },
    });

    const submitButton = screen.getByRole('button', { name: /Submit React Hook Form/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Diana',
        age: 28,
        email: 'diana@example.com',
        gender: 'male',
        acceptedTerms: true,
        message: 'Valid submission',
        image: 'data:image/png;base64,valid-image',
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
        country: 'United States',
      });
    });
  });
});
