<script>
    // Credits to https://github.com/danferns/svelte-piano
    export let octaves = 2;
    export let middleC = 60;
    export let keysPressed = [];

    import Key from "./Key.svelte";
    let keys;

    $: keys = [...Array(octaves * 12 + 1).keys()].map(
        (i) => i + (middleC - Math.floor(octaves / 2) * 12)
    );
</script>

<div class="keyboard">
    <div>
        {#each keys as note}
            <Key noteNum={note} on:noteon on:noteoff pressed={keysPressed.includes(note)}/>
        {/each}
    </div>
</div>

<style>
    .keyboard {
        display: flex;
        justify-content: center;
    }

    .keyboard > div {
        display: flex;
        overflow: auto;
        padding: 8px;
        height: 48px;
    }
</style>