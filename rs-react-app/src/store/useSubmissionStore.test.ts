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
    });
    expect(submissions[0].id).toBeDefined();
    expect(submissions[0].submittedAt).toBeDefined();
  });
});
