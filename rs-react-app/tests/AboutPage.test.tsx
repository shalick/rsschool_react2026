import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

async function renderAboutPage() {
  const { AboutPage } = await import('../src/page-components/AboutPage');
  const jsx = await AboutPage();
  render(jsx);
}

describe('AboutPage Component', () => {
  it('should render the application title', async () => {
    await renderAboutPage();

    expect(
      screen.getByRole('heading', { name: /About This Application/i })
    ).toBeInTheDocument();
  });

  it('should display the correct author and developer information', async () => {
    await renderAboutPage();

    expect(
      screen.getByText(/Developer: \[Alexander Shabanovich \/ shalick\]/i)
    ).toBeInTheDocument();
  });

  it('should contain a valid external link to the RS School course website', async () => {
    await renderAboutPage();

    const linkElement = screen.getByRole('link', {
      name: /RS School React Course/i,
    });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://rs.school');
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
