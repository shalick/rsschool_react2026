import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useSubmissionStore } from './useSubmissionStore';

describe('useSubmissionStore', () => {
  beforeEach(() => {
    useSubmissionStore.setState({ submissions: [] });
  });

  it('adds a new submission to the store', () => {
    const addSubmission = useSubmissionStore.getState().addSubmission;

    addSubmission({
      type: 'uncontrolled',
      name: 'Alice',
      age: 32,
      email: 'alice@example.com',
      gender: 'female',
      acceptedTerms: true,
      message: 'Hello world',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      country: 'United States',
    });

    const submissions = useSubmissionStore.getState().submissions;
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      type: 'uncontrolled',
      name: 'Alice',
      age: 32,
      email: 'alice@example.com',
      gender: 'female',
      acceptedTerms: true,
      message: 'Hello world',
      password: 'SecurePass123!',
      country: 'United States',
      isNew: true,
    });
    expect(submissions[0].id).toBeDefined();
    expect(submissions[0].submittedAt).toBeDefined();
  });

  it('clears submissions when clearSubmissions is called', () => {
    useSubmissionStore.getState().addSubmission({
      type: 'react-hook-form',
      name: 'Bob',
      age: 44,
      email: 'bob@example.com',
      gender: 'female',
      acceptedTerms: true,
      message: 'Test',
      image: '',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      country: 'Canada',
    });

    useSubmissionStore.getState().clearSubmissions();
    expect(useSubmissionStore.getState().submissions).toHaveLength(0);
  });

  it('clears the isNew flag after the highlight timeout expires', () => {
    vi.useFakeTimers();

    useSubmissionStore.getState().addSubmission({
      type: 'uncontrolled',
      name: 'Charlie',
      age: 27,
      email: 'charlie@example.com',
      gender: 'male',
      acceptedTerms: true,
      message: 'Hello again',
      image: '',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      country: 'United States',
    });

    const [submission] = useSubmissionStore.getState().submissions;
    expect(submission.isNew).toBe(true);

    vi.advanceTimersByTime(4000);
    expect(useSubmissionStore.getState().submissions[0]?.isNew).toBe(false);

    vi.useRealTimers();
  });
});
