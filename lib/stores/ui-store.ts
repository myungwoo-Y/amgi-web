import { create } from "zustand";

interface UIState {
  isCreateDeckOpen: boolean;
  openCreateDeck: () => void;
  closeCreateDeck: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateDeckOpen: false,
  openCreateDeck: () => set({ isCreateDeckOpen: true }),
  closeCreateDeck: () => set({ isCreateDeckOpen: false }),
}));
