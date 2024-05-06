<script>
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher()

    import history from "../utils/History";
    import { intlFormatDistance } from "date-fns";

    import { onMount } from "svelte";

    export let piece
    
    let title; // HTMLElement
    
    let wrapOnUnderlines = () => { // does not work :(
        if (!title) return
        title.innerHTML = title.innerHTML.replaceAll('_', '<wbr/>_')
    }
    // onMount(wrapOnUnderlines)

    let load = () => {
        dispatch('load', { project: piece })
    }
    
    let removalDialog;
    let remove = () => {
        removalDialog.showModal()
    }
    
    let processDecision = () => {
        if (removalDialog.returnValue == "export-and-delete") {
            dispatch('export')
            history.delete(piece.name)
            dispatch('refresh')
        }
        else if (removalDialog.returnValue == "delete") {
            history.delete(piece.name)
            dispatch('refresh')
        }
    }
</script>

<dialog bind:this={removalDialog} class="rounded-lg overflow-hidden"
        on:close={processDecision}>
    <form>
        <p class="p-3 text-center">
            Are you sure that you'd like to delete {piece.name} from your history?
        </p>
        <div class="mx-2 mb-2 flex gap-2 w-full justify-center">
            <button formmethod="dialog" class="p-1" value="cancel">Cancel</button>
            <button formmethod="dialog" class="p-1" value="export-and-delete">Export and Delete</button>
            <button formmethod="dialog" class="p-1" value="delete">Delete</button>
        </div>
    </form>
</dialog>

<button title={piece.name} on:click={load} class="max-w-64 text-dimgrey justify-center align-middle text-nowrap text-ellipsis overflow-hidden"
                                           style="background: none !important; border: 1px solid dimgrey"
        on:contextmenu|preventDefault={remove}>
    <div bind:this={title} style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
        {piece.name}
    </div>
    <hr style="border-top: 1px solid dimgrey !important; width:100%" class="m-1">
    <div class="italic">
        {intlFormatDistance(piece.updated, Date.now())} - {Math.round(Object.keys(piece.data).length * 11.2 / 1024)} kb<!-- complete guess because i couldn't figure this out -->
    </div>
</button>