<script>
    import { createEventDispatcher } from "svelte";

    export let settings

    let dispatch = createEventDispatcher()
</script>

<div class="flex flex-row gap-1">
    <button on:click={ () => dispatch("copyText") }>Copy Text</button>

    <button disabled={settings.capturingImage} on:click={() => dispatch("captureSheetAsImage", {mode: "download"})}>
        {#if settings.capturingImage}
            Please Wait...
        {:else}
            Download Image
        {/if}
    </button>

    {#if typeof ClipboardItem !== "undefined"}
        <!-- note: not supported by mozilla -->
        <button disabled={settings.capturingImage} on:click={() => dispatch("captureSheetAsImage", {mode: "copy"})}>
            {#if settings.capturingImage}
                Please Wait...
            {:else}
                Copy Image
            {/if}
        </button>
    {/if}

    <button on:click={ () => dispatch("copyTransposes") }>Copy Transposes</button>

    <button on:click={ () => dispatch("addTitle") }>Add title</button>

    <button on:click={ () => dispatch("export") }>Export</button>
</div>