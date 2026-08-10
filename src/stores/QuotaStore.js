import { writable } from "svelte/store";

// True when the most recent save attempt failed because storage is full.
// Used to highlight the "free up space" button until a save succeeds again.
export const quotaError = writable(false);

export function showQuotaError(context = {}) {
  quotaError.set(true);
}

export function clearQuotaError() {
  quotaError.set(false);
}
