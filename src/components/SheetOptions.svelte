<script>
    import { createEventDispatcher } from 'svelte'
    let dispatch = createEventDispatcher()

    export let show

    export let settings = {
        beats: 4,
        quantize: 35,
        sequentialQuantize: false,
        pShifts: 'Start',
        pOors: 'Start',
        oors: true,
        tempoMarks: false,
        transposition: 0
    }
</script>

{#if show}
<div style="display: inline-block">
	<label for="number">Transpose (sheet) by:</label>
	<input type="number" bind:value={settings.transposition} min=-24 max=24>
    <button on:click={() => { dispatch('auto') }}>Auto-transpose</button>
</div>

<div>
    <div class='select-div'>
        <label for='shifts-position'>Place shifted notes at:</label>
        <select name='shifts-position' id='shifts-position' bind:value={settings.pShifts}>
            <option value='Start'>Start</option>
            <option value='End'>End</option>
        </select>
    </div>

    <div class='select-div'>
        <label for='oors-position'>Place out of range notes at:</label>
        <select name='oors-position' id='oors-position' bind:value={settings.pOors}>
            <option value='Start'>Start</option>
            <option value='End'>End</option>
        </select>
    </div>

    <div class='beats'>
        <label class='slider-label' for='beats-for-newline'>Break lines: </label>
        <input type='range' id='beats-for-newline' min=1 max=32 bind:value={settings.beats}>
        <span>Every {settings.beats == 1 ? "1 beat" : `${settings.beats} beats`}</span>
    </div>

    <div class='quantize'>
        <label class='slider-label' for='quantize-prompt'>Quantize: </label>
        <input type='range' id="quantize-prompt" min=1 max=100 bind:value={settings.quantize}>
        <span>{settings.quantize} miliseconds</span>
    </div>

    <label for='order-quantizes'>
        <input type='checkbox' id="order-quantizes" bind:checked={settings.sequentialQuantize}>
        Sequential quantizes
    </label>

    <label for='out-of-range'>
        <input type='checkbox' id="out-of-range" bind:checked={settings.oors}>
        Include out of range (ctrl) notes
    </label>

    <label for='tempo-checkbox'>
        <input type='checkbox' id="tempo-checkbox" bind:checked={settings.tempoMarks}>
        Show tempo marks
    </label>
</div>

<style>
    label {
        max-width: fit-content;
        text-align: center;
    }

    .select-div {
        display: flex;
        flex-direction: row;
        align-items: center;
        text-align: center;
    }

    select {
        height: auto;
        margin-left: 0.4em;
        margin-top: 0.2em;
        margin-bottom: 0;
    }

    input[type="checkbox"] {
        display: inline-block;
        vertical-align: middle;
    }

    input[type="range"] {
        margin-left: 0.4em;
        margin-right: 0.4em;
        margin-bottom: 0;
    }

    input[type="file"] {
        margin-bottom: 0;
    }
    
    .beats, .quantize, .select-label {
        display: flex;
        flex-direction: row;
    }
</style>
{/if} <!-- {#if show} -->
