<script>
  import { quotaError } from "../stores/QuotaStore.js";

  export let used = 0;
  export let showQuotaButton = true;

  function openLandingPage() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    window.open(url.toString(), "_blank");
  }
</script>

<div class="w-full py-2 select-none text-white/70">
  <div class="flex items-center justify-between gap-2">
    <span>
      Used ~{used} / 5000 kB
      <span
        class="cursor-help"
        title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct."
      >
        ⓘ
      </span>
    </span>
    {#if $quotaError && showQuotaButton}
      <button
        class="!m-0 !p-1 !text-xs whitespace-nowrap !border-rose-600 !text-rose-300 !bg-rose-950"
        title="Storage is full, the current sheet couldn't be saved. Open the site in a new tab to export or delete other sheets."
        on:click={openLandingPage}
      >
        Free up space
      </button>
    {/if}
  </div>
</div>
