<script>
    // Credits to https://github.com/danferns/svelte-piano
    export let noteNum;
    export let keyWidth = 8;
    export let pressed = false;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let isNatural = ![1, 3, 6, 8, 10].includes(noteNum % 12);
    let bias = 0;

    // the accidental keys are not perfectly in center
    if (!isNatural) {
        if ([1, 6].includes(noteNum % 12)) bias = -keyWidth / 12;
        else if ([3, 10].includes(noteNum % 12)) bias = keyWidth / 12;
    }

    function keyPressed() {
        if (pressed) { 
            dispatch("noteoff", noteNum) 
            pressed = false
            return
        }
        dispatch("noteon", noteNum);
        pressed = true;
    }

    function keyReleased() {
        return
        if (!pressed) return;
        dispatch("noteoff", noteNum);
        pressed = false;
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class:accidental={!isNatural}
    class:natural={isNatural}
    class:pressed
    style="--width: {keyWidth - keyWidth * 0.47 * !isNatural}px; transform: translate({bias}px);"
    draggable="false"
    on:mousedown|preventDefault={keyPressed}
    on:mouseup|preventDefault={keyReleased}
    on:mouseenter={(e) => { if (e.buttons) keyPressed(); }}
    on:mouseleave={(e) => { if (e.buttons) keyReleased(); }}
    on:touchstart|preventDefault={keyPressed}
    on:touchend|preventDefault={keyReleased}
/>

<style>
    div {
        flex-shrink: 0;
        width: var(--width);
        min-width: min-content;

        border-radius: 0px 0px calc(var(--width) / 8) calc(var(--width) / 8);
        -webkit-user-drag: none;
    }

    .accidental {
        margin: 0px calc(var(--width) / -2) 0px calc(var(--width) / -2);
        z-index: 2;

        height: 60%;
        background: black;

        box-shadow: inset white 0px 0px 2px 0px;
    }

    .natural {
        height: 100%;
        box-shadow: inset black 0px 0px 2px 0px;
    }

    .accidental.pressed {
        background: #ff966d;
    }

    .natural.pressed {
        background: #ff966d;
    }
</style>
