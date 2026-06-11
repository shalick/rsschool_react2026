import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../components/Modal/ModalForms.module.css', () => ({
  default: {
    form: 'form',
    description: 'description',
    field: 'field',
    label: 'label',
    input: 'input',
    textarea: 'textarea',
    checkbox: 'checkbox',
    error: 'error',
    dropdown: 'dropdown',
    dropdownItem: 'dropdownItem',
    strengthIndicator: 'strengthIndicator',
    strengthBit: 'strengthBit',
    active: 'active',
  },
}));

vi.mock('../components/Button/Button', () => ({
  Button: ({ children, ...props }: React.ComponentPropsWithoutRef<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('../store/useCountriesStore', () => ({
  useCountriesStore: () => ({
    countries: [
      { cca3: 'USA', name: { common: 'United States' }, flags: {}, capital: [], region: '', population: 0 },
      { cca3: 'CAN', name: { common: 'Canada' }, flags: {}, capital: [], region: '', population: 0 },
    ],
  }),
}));

import { ModalForms } from '../components/Modal/ModalForms';

describe('ModalForms from test directory', () => {
  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders React Hook Form country input with datalist suggestions', () => {
    const handleSubmit = vi.fn();

    const { container } = render(
      <ModalForms type="react-hook-form" onSubmit={handleSubmit} />
    );

    const countryInput = screen.getByLabelText('Country');
    expect(countryInput).toBeInTheDocument();
    expect(countryInput).toHaveAttribute('list', 'country-options');

    const datalist = container.querySelector('datalist#country-options');
    expect(datalist).toBeInTheDocument();

    const options = Array.from(datalist?.querySelectorAll('option') ?? []).map(
      (option) => option.value
    );
    expect(options).toEqual(['United States', 'Canada']);
  });

  it('renders uncontrolled country search suggestions and allows selecting a country', async () => {
    const handleSubmit = vi.fn();

    render(<ModalForms type="uncontrolled" onSubmit={handleSubmit} />);

    const countrySearchInput = screen.getByPlaceholderText('Search country...');
    fireEvent.change(countrySearchInput, { target: { value: 'United' } });

    const suggestion = await screen.findByText('United States');
    fireEvent.click(suggestion);

    expect(countrySearchInput).toHaveValue('United States');
  });
});
