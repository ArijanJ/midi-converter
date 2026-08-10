<script>
  export let percent = 0;
  export let description = "";
</script>

<div class="flex flex-col gap-2 w-full">
  <div class="flex justify-between items-center text-sm">
    <span class="text-gray-300">{description || "Starting..."}</span>
    <span class="text-gray-400 tabular-nums">{Math.round(percent)}%</span>
  </div>
  <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
    <div
      class="h-full bg-blue-500 rounded-full transition-all duration-100"
      style="width: {Math.min(100, Math.max(0, percent))}%"
    ></div>
  </div>
</div>
