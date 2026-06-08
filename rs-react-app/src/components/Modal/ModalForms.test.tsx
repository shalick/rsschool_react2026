import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

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
      country: '',
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

    fireEvent.click(screen.getByRole('button', { name: /Submit React Hook Form/i }));

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
});
