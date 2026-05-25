import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectionState {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  setSelected: (id: string, selected: boolean) => void;
  clearSelections: () => void;
}

interface PersistedState {
  selectedIdsArray: string[];
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set) => ({
      selectedIds: new Set<string>(),
      toggleSelection: (id) =>
        set((state) => {
          const newSet = new Set(state.selectedIds);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return { selectedIds: newSet };
        }),
      setSelected: (id, selected) =>
        set((state) => {
          const newSet = new Set(state.selectedIds);
          if (selected) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
          return { selectedIds: newSet };
        }),
      clearSelections: () => set({ selectedIds: new Set() }),
    }),
    {
      name: 'selection-storage',
      onRehydrateStorage: () => (state) => {
        if (state && !state.selectedIds) {
          state.selectedIds = new Set();
        }
      },
      partialize: (state) => ({
        selectedIdsArray: Array.from(state.selectedIds),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as PersistedState | undefined;
        if (persisted?.selectedIdsArray) {
          return {
            ...currentState,
            selectedIds: new Set(persisted.selectedIdsArray),
          };
        }
        return currentState;
      },
    }
  )
);
