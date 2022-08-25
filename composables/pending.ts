import { defineStore } from "pinia";

export const usePendingStore = defineStore("pendingStore", {
  state: () => ({
    pendingStates: new Set<string>(),
  }),
  getters: {
    pending: (state) => state.pendingStates.size > 0,
  },
  actions: {
    addPending(name: string) {
      this.pendingStates.add(name);
    },
    deletePending(name: string) {
      this.pendingStates.delete(name);
    },
  },
});
