<script>
  import { toasts, removeToast } from "../stores/ToastStore.js";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
</script>

<div
  class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
>
  {#each $toasts as toast (toast.id)}
    <div
      animate:flip={{ duration: 300 }}
      in:fly={{ y: 20, duration: 400, opacity: 0 }}
      out:fade={{ duration: 200 }}
      class="pointer-events-auto min-w-[200px] px-4 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-center justify-between gap-4 border"
      class:bg-neutral-800={toast.type === "info"}
      class:border-neutral-700={toast.type === "info"}
      class:bg-emerald-900={toast.type === "success"}
      class:border-emerald-700={toast.type === "success"}
      class:bg-amber-900={toast.type === "warning"}
      class:border-amber-700={toast.type === "warning"}
      class:bg-rose-900={toast.type === "error"}
      class:border-rose-700={toast.type === "error"}
      style="background: linear-gradient(135deg, rgba(45, 42, 50, 0.9) 0%, rgba(60, 60, 60, 0.8) 100%);"
    >
      {#key toast.version}
        <div
          in:fly={{ y: 20, duration: 400, opacity: 0 }}
          class="flex items-center justify-between gap-4 w-full"
        >
          <div class="flex items-center gap-3">
            {#if toast.type === "success"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-emerald-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            {:else if toast.type === "warning"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            {:else if toast.type === "error"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-rose-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            {/if}
            <span class="text-white text-sm font-medium">{toast.message}</span>
          </div>
          <button
            on:click={() => removeToast(toast.id)}
            class="text-white/40 hover:text-white/80 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      {/key}
    </div>
  {/each}
</div>

<style>
  div {
    font-family: "Inter", sans-serif;
  }
</style>
