import { create } from 'zustand';
import { User } from '../types';

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));