import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmissionCardsList } from './SubmissionCardsList';
import type { Submission } from '../../store/useSubmissionStore';
import { useSubmissionStore } from '../../store/useSubmissionStore';

vi.mock('../../store/useSubmissionStore', () => ({
  useSubmissionStore: vi.fn(),
}));

vi.mock('./SubmissionCardsList.module.css', () => ({
  default: {
    empty: 'empty',
    root: 'root',
    heading: 'heading',
    grid: 'grid',
    card: 'card',
    newCard: 'newCard',
    cardHeader: 'cardHeader',
    type: 'type',
    time: 'time',
    field: 'field',
    imageContainer: 'imageContainer',
    image: 'image',
    message: 'message',
  },
}));

const mockedUseSubmissionStore = vi.mocked(useSubmissionStore);

describe('SubmissionCardsList component', () => {
  beforeEach(() => {
    mockedUseSubmissionStore.mockReset();
  });

  it('renders empty state when there are no submissions', () => {
    mockedUseSubmissionStore.mockImplementation(
      (selector: (state: { submissions: Submission[] }) => unknown) =>
        selector({ submissions: [] })
    );

    render(<SubmissionCardsList />);

    expect(screen.getByText('No form submissions yet.')).toBeInTheDocument();
  });

  it('renders submission cards with image, masked password, and new state classes', () => {
    const submission = {
      id: 'submission-1',
      type: 'react-hook-form',
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
      gender: 'female',
      acceptedTerms: true,
      message: 'Hello from Alice',
      image: 'data:image/png;base64,abc123',
      password: 'supersecret',
      confirmPassword: 'supersecret',
      country: 'Wonderland',
      submittedAt: '2026-06-08T12:00:00.000Z',
      isNew: true,
    };

    mockedUseSubmissionStore.mockImplementation(
      (selector: (state: { submissions: Submission[] }) => unknown) =>
        selector({ submissions: [submission] })
    );

    render(<SubmissionCardsList />);

    expect(screen.getByText('Submission History')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('female')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('Wonderland')).toBeInTheDocument();
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument();

    const card = screen.getByRole('article');
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('newCard');

    const image = screen.getByRole('img', { name: 'Uploaded by {submission.name}' });
    expect(image).toHaveAttribute('src', 'data:image/png;base64,abc123');
    expect(image).toHaveClass('image');

    expect(screen.getByText('********')).toBeInTheDocument();
  });
});
