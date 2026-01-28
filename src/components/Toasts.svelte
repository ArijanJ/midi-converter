<script>
  import { toasts, removeToast } from "../stores/ToastStore.js";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const types = {
    info: { bg: "bg-neutral-800", border: "border-neutral-700", color: "text-blue-400", icon: "ℹ"},
    success: { bg: "bg-emerald-900", border: "border-emerald-700", color: "text-emerald-400", icon: "✓"},
    warning: { bg: "bg-amber-900", border: "border-amber-700", color: "text-amber-400", icon: "⚠"},
    error: { bg: "bg-rose-900",border: "border-rose-700", color: "text-rose-400", icon: "✕"},
  };
</script>

<div
  class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
>
  {#each $toasts as toast (toast.id)}
    {@const config = types[toast.type] || types.info}
    <div
      animate:flip={{ duration: 300 }}
      in:fly={{ y: 20, duration: 400, opacity: 0 }}
      out:fade={{ duration: 200 }}
      class="pointer-events-auto min-w-[200px] px-4 py-3 rounded-lg shadow-xl backdrop-blur-md flex items-center justify-between gap-4 border {config.bg} {config.border}"
      style="background: linear-gradient(135deg, rgba(45, 42, 50, 0.9) 0%, rgba(60, 60, 60, 0.8) 100%);"
    >
      {#key toast.version}
        <div
          in:fly={{ y: 20, duration: 400, opacity: 0 }}
          class="flex items-center gap-3 w-full"
        >
          <span class="text-lg {config.color}">{config.icon}</span>
          <span class="text-white text-sm font-medium flex-1"
            >{toast.message}</span
          >
          <button
            on:click={() => removeToast(toast.id)}
            class="text-white/40 hover:text-white/80 transition-colors text-lg leading-none px-5"
          >
            ✕
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
