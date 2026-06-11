import { create } from 'zustand';

export type SubmissionType = 'uncontrolled' | 'react-hook-form';

export type Gender = 'male' | 'female';

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
  isNew?: boolean;
}

interface SubmissionState {
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'isNew'>) => void;
  clearSubmissions: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  addSubmission: (submission) => {
    const id = `${submission.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date().toISOString(),
      isNew: true,
    };

    set((state) => ({ submissions: [newSubmission, ...state.submissions] }));

    setTimeout(() => {
      set((state) => ({
        submissions: state.submissions.map((item) =>
          item.id === id ? { ...item, isNew: false } : item
        ),
      }));
    }, 4000);
  },
  clearSubmissions: () => set({ submissions: [] }),
}));
