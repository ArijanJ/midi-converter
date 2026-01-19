<script>
    import { colors, color_for_chord, colored_string, render_chord } from "../utils/Rendering.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let index;

    export let chord;
    export let next;

    export let selected; // undefined/true
    
    export let settings
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
    {...$$restProps}
    class="chord-block {$$restProps.class ?? ''}"
    on:contextmenu|preventDefault
    on:mousedown|stopPropagation={(e) => {
        switch (e.button) {
            case 0: // Left mouse button
                dispatch("select", { index: +index, by: -1 });
                break;
            case 1: // Middle mouse button
                dispatch("select", { index: +index, by: -1, toBottom: true });
                e.preventDefault();
                break;
            case 2: // Right mouse button
                dispatch("select", { index: +index, by: 1 });
                e.preventDefault();
                break;
        }
    }}
>
    {@html render_chord(chord, next, settings, selected)}
</span>

<style>
    .chord-block {
        /* all: unset; */
        position:relative
        /* padding: 20px;
        margin: -20px; */
    }
    .chord-block::before {
        content: '';
        position: absolute;
        height: 126%;
        width: 100%;
    }
    .chord-block:hover {
        /* filter: brightness(75%); */
        background-color: #3d3a42;
        cursor: pointer;
    }
    /* .chord-block:active {
        all: unset;
    } */
</style>
