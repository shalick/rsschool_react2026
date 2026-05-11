import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./Loader.module.css', () => ({
  default: {
    container: 'container',
    spinner: 'spinner',
    text: 'text',
  },
}));

describe('Loader', () => {
  it('renders the loading text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading countries…')).toBeInTheDocument();
  });

  it('renders the spinner element', () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('applies the container class to the wrapping div', () => {
    const { container } = render(<Loader />);
    const div = container.firstChild;
    expect(div).toHaveClass('container');
  });

  it('applies the text class to the paragraph', () => {
    render(<Loader />);
    const paragraph = screen.getByText('Loading countries…');
    expect(paragraph).toHaveClass('text');
  });
});
