import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSelectionStore } from './useSelectionStore';

describe('useSelectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState({ selectedIds: new Set() });
    localStorage.clear();
  });

  it('should have initial state with empty Set', () => {
    const state = useSelectionStore.getState();
    expect(state.selectedIds).toBeInstanceOf(Set);
    expect(state.selectedIds.size).toBe(0);
  });

  describe('toggleSelection', () => {
    it('should add id to selectedIds when not present', () => {
      const { toggleSelection } = useSelectionStore.getState();
      toggleSelection('DEU');
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.has('DEU')).toBe(true);
      expect(selectedIds.size).toBe(1);
    });

    it('should remove id from selectedIds when already present', () => {
      useSelectionStore.setState({ selectedIds: new Set(['DEU']) });
      const { toggleSelection } = useSelectionStore.getState();
      toggleSelection('DEU');
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.has('DEU')).toBe(false);
      expect(selectedIds.size).toBe(0);
    });

    it('should work with multiple ids', () => {
      const { toggleSelection } = useSelectionStore.getState();
      toggleSelection('DEU');
      toggleSelection('FRA');
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.has('DEU')).toBe(true);
      expect(selectedIds.has('FRA')).toBe(true);
      expect(selectedIds.size).toBe(2);
    });
  });

  describe('setSelected', () => {
    it('should add id when selected=true', () => {
      const { setSelected } = useSelectionStore.getState();
      setSelected('DEU', true);
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.has('DEU')).toBe(true);
    });

    it('should remove id when selected=false', () => {
      useSelectionStore.setState({ selectedIds: new Set(['DEU']) });
      const { setSelected } = useSelectionStore.getState();
      setSelected('DEU', false);
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.has('DEU')).toBe(false);
    });

    it('should do nothing when setting selected=false on non-existing id', () => {
      const { setSelected } = useSelectionStore.getState();
      setSelected('DEU', false);
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.size).toBe(0);
    });
  });

  describe('clearSelections', () => {
    it('should remove all selections', () => {
      useSelectionStore.setState({ selectedIds: new Set(['DEU', 'FRA']) });
      const { clearSelections } = useSelectionStore.getState();
      clearSelections();
      const { selectedIds } = useSelectionStore.getState();
      expect(selectedIds.size).toBe(0);
    });
  });

  describe('persistence', () => {
    it('should persist selectedIds to localStorage via partialize', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const { toggleSelection } = useSelectionStore.getState();
      toggleSelection('DEU');
      expect(setItemSpy).toHaveBeenCalledWith(
        'selection-storage',
        expect.stringContaining('"selectedIdsArray":["DEU"]')
      );
      setItemSpy.mockRestore();
    });

    it('should restore state from localStorage on rehydration', () => {
      const mockPersisted = JSON.stringify({
        state: { selectedIdsArray: ['DEU', 'FRA'] },
      });
      localStorage.setItem('selection-storage', mockPersisted);
      const persistedState = { selectedIdsArray: ['DEU', 'FRA'] };
      const currentState = { selectedIds: new Set() };
      const newState = {
        ...currentState,
        selectedIds: new Set(persistedState.selectedIdsArray),
      };
      expect(newState.selectedIds.has('DEU')).toBe(true);
      expect(newState.selectedIds.has('FRA')).toBe(true);
    });
  });
});
