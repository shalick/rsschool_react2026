import { describe, expect, it, beforeEach } from 'vitest';
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
});
