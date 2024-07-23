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

<span
    class="chord-block"
    on:contextmenu|preventDefault
    on:mousedown|stopPropagation={(e) => {
        switch (e.button) {
            case 0: // Left mouse button
                dispatch("select", { index: +index, by: -1 });
                break;
            case 1: // Middle mouse button
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
        all: unset;
    }
    .chord-block:hover {
        /* filter: brightness(75%); */
        background-color: #3d3a42;
        cursor: pointer;
    }
    .chord-block:active {
        all: unset;
    }
</style>
