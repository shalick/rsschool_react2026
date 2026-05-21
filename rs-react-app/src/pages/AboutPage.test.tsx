import { render, screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';
import { describe, expect, it } from 'vitest';

describe('AboutPage Component', () => {
  it('should render the application title', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: /About This Application/i })
    ).toBeInTheDocument();
  });

  it('should display the correct author and developer information', () => {
    render(<AboutPage />);

    expect(
      screen.getByText(/Developer: \[Alexander Shabanovich \/ shalick\]/i)
    ).toBeInTheDocument();
  });

  it('should contain a valid external link to the RS School course website', () => {
    render(<AboutPage />);

    const linkElement = screen.getByRole('link', {
      name: /RS School React Course/i,
    });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://rs.school');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
