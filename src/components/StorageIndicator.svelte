<script>
  export let used = 0;
</script>

<div class="w-full py-2 select-none text-white/70">
  Used ~{used} / 5000 kB
  <span
    class="cursor-help"
    title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct."
  >
    ⓘ
  </span>
</div>
