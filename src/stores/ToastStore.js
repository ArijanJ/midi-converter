import { writable, get } from 'svelte/store';

export const toasts = writable([]);

const timeouts = new Map();

export const addToast = (message, type = 'info', duration = 3000) => {
  const currentToasts = get(toasts);
  const existingToast = currentToasts.find((t) => t.message === message);

  if (existingToast) {
    // Reset timer and update version to trigger re-animation
    if (timeouts.has(existingToast.id)) {
      clearTimeout(timeouts.get(existingToast.id));
    }

    toasts.update((all) =>
      all.map((t) =>
        t.id === existingToast.id ? { ...t, version: Date.now() } : t
      )
    );

    if (duration) {
      const timeout = setTimeout(() => {
        removeToast(existingToast.id);
      }, duration);
      timeouts.set(existingToast.id, timeout);
    }
    return;
  }

  const id = Math.random().toString(36).substring(2, 9);
  const version = Date.now();
  toasts.update((all) => [{ id, message, type, version }, ...all]);

  if (duration) {
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);
    timeouts.set(id, timeout);
  }
};

export const removeToast = (id) => {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id));
    timeouts.delete(id);
  }
  toasts.update((all) => all.filter((t) => t.id !== id));
};
