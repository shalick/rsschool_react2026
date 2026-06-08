import { create } from 'zustand';

export type SubmissionType = 'uncontrolled' | 'react-hook-form';

export type Gender = 'male' | 'female' | 'other';

export interface Submission {
  id: string;
  type: SubmissionType;
  name: string;
  age: number;
  email: string;
  gender: Gender;
  acceptedTerms: boolean;
  message: string;
  image: string; // base64
  password: string;
  confirmPassword: string;
  country: string;
  submittedAt: string;
}

interface SubmissionState {
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt'>) => void;
  clearSubmissions: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  addSubmission: (submission) =>
    set((state) => ({
      submissions: [
        {
          ...submission,
          id: `${submission.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          submittedAt: new Date().toISOString(),
        },
        ...state.submissions,
      ],
    })),
  clearSubmissions: () => set({ submissions: [] }),
}));
