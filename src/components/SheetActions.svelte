<script>
  import { createEventDispatcher } from "svelte";
  import SelectionIcon from "./SelectionIcon.svelte";

  export let settings;

  export let hasSelection = false;
  let dispatch = createEventDispatcher();
</script>

<div class="flex flex-row gap-1 sticky top-0 z-10 app-background-color">
  <button on:click={() => dispatch("addTitle")}>Add title</button>
  <button on:click={() => dispatch("copyText")}>Copy Text</button>

  <button
    disabled={settings.capturingImage}
    on:click={() =>
      dispatch("captureSheetAsImage", {
        mode: "download",
        selectionOnly: hasSelection,
      })}
  >
    {#if settings.capturingImage}
      Please Wait...
    {:else}
      Download Image
      {#if hasSelection}
        <SelectionIcon />
      {/if}
    {/if}
  </button>

  {#if typeof ClipboardItem !== "undefined"}
    <!-- note: not supported by mozilla -->
    <button
      disabled={settings.capturingImage}
      on:click={() =>
        dispatch("captureSheetAsImage", {
          mode: "copy",
          selectionOnly: hasSelection,
        })}
    >
      {#if settings.capturingImage}
        Please Wait...
      {:else}
        Copy Image
        {#if hasSelection}
          <SelectionIcon />
        {/if}
      {/if}
    </button>
  {/if}

  <button on:click={() => dispatch("copyTransposes")}>
    Copy Transposes
    {#if hasSelection}
      <SelectionIcon />
    {/if}
  </button>
  <button disabled={!hasSelection} on:click={() => dispatch("splitSheet")}>
    Split Sheet
    {#if hasSelection}
      <SelectionIcon />
    {/if}
  </button>
  <button on:click={() => dispatch("export")}>Export</button>
</div>
