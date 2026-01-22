<script>
  export let used = 0;
  export let total = 5000;

  $: percentage = Math.min(Math.max((used / total) * 100, 0), 100);

  $: colorClass =
    percentage > 90
      ? "from-red-500 to-rose-600"
      : percentage > 70
        ? "from-amber-400 to-orange-500"
        : "from-sky-400 to-indigo-500";
</script>

<div
  class="storage-container w-full px-2 py-2 select-none opacity-80 hover:opacity-100 transition-opacity"
>
  <div class="flex justify-between items-center mb-1 px-1">
    <span class="text-[9px] font-bold uppercase tracking-wider text-white/60">
      Storage Usage
    </span>
    <span class="text-[9px] font-mono font-medium text-white/70">
      ~{used} / {total} kB
    </span>
  </div>

  <div
    class="relative h-1.5 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden backdrop-blur-sm"
    title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct."
  >
    <!-- Progress Fill -->
    <div
      class="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r {colorClass} opacity-60"
      style="width: {percentage}%"
    >
      <!-- Slightly more noticeable Shimmer effect -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg] animate-shimmer"
      ></div>
    </div>
  </div>

  <div class="mt-0.5 px-1 flex justify-end">
    <span
      class="text-[8px] font-bold text-white/50 tracking-tighter uppercase italic"
    >
      {percentage.toFixed(1)}% full
    </span>
  </div>
</div>

<style>
  .storage-container {
    font-family:
      "Inter",
      system-ui,
      -apple-system,
      sans-serif;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-200%) skewX(-20deg);
    }
    100% {
      transform: translateX(200%) skewX(-20deg);
    }
  }

  .animate-shimmer {
    animation: shimmer 7s infinite linear;
  }
</style>
