<script>
    import { createEventDispatcher } from 'svelte'
    import {vpScale} from "../utils/VP";

    let dispatch = createEventDispatcher()

    export let show

    let fonts = ['Verdana', 'Tahoma', 'Dejavu Sans', 'Segoe UI', 'Gill Sans', 'Helvetica',  'Lucida Sans', 'Century Gothic']

    export let settings = {
        beats: 4,
        quantize: 35,
        classicChordOrder: true,
        sequentialQuantize: false,
        pShifts: 'Start',
        pOors: 'Inorder',
        oors: true,
        tempoMarks: false,
        oorSeparator: ':',
        transposition: 0,
        lbauto_atleast: 4,
        font: fonts[0],
        capturingImage: false,
        missingTempo: false,
        bpm: 120
    }

    const isAscii = str => /^[\x00-\x7F]+$/.test(str);
</script>

{#if show}
<div style="display: inline-block">
	<label for="transpose">Transpose (sheet) by:</label>
	<input id="transpose" type="number" bind:value={settings.transposition} min=-24 max=24>
    <button on:click={() => { dispatch('auto') }}>Auto-transpose</button>
</div>

<div class="quantize">
    <button style="margin-bottom: 0" on:click={() => { dispatch('lineBasedAuto') }}>Line-based auto-transpose</button>
    <label style="margin-left: 0.5em; display:flex; align-items: center"
           title="Controls how much better a transposition should be than the previous transposition for line-based auto-transpose to act (higher = less transposing)" 
           for="atleast" class='slider-label'>Resilience (?):</label>
    <input id="atleast" type="range" min=1 max=24 bind:value={settings.lbauto_atleast}>
    <span style="display:flex; align-items: center">{settings.lbauto_atleast}</span>
</div>

<div>
    <div class='select-div'>
        <label for='shifts-position'>Place shifted notes at:</label>
        <select disabled={settings.classicChordOrder} name='shifts-position' id='shifts-position' bind:value={settings.pShifts}>
            <option value='Start'>Start</option>
            <option value='End'>End</option>
        </select>
    </div>

    <div class='select-div'>
        <label for='oors-position'>Place out of range notes at:</label>
        <select name='oors-position' id='oors-position' bind:value={settings.pOors}>
            <option value='Inorder'>Inorder</option>
            <option value='Start'>Start</option>
            <option value='End'>End</option>
        </select>
    </div>

    <div class='select-div'>
        <label for='font'>Font:</label>
        <select name='font' id='font' bind:value={settings.font}>
            {#each fonts as font}
                <option value={font}>{font}</option>
            {/each}
        </select>
    </div>

    <div class='beats'>
        <label class='slider-label' for='beats-for-newline'>Break lines: </label>
        <input type='range' id='beats-for-newline' min=1 max=32 bind:value={settings.beats}>
        <span>Every {settings.beats == 1 ? "1 beat" : `${settings.beats} beats`}</span>
    </div>

    {#if settings.missingTempo == true}
        <div class='tempo'>
            <label class='slider-label' for='tempo'
                title="You're able to change this because your MIDI file doesn't have tempo/BPM.">
                    BPM (?): </label>
            <input type='range' id='tempo' min=1 max=300 bind:value={settings.bpm}>
            <span>{settings.bpm}</span>
        </div>
    {/if}

    <div class='quantize'>
        <label class='slider-label' for='quantize-prompt'>Quantize: </label>
        <input type='range' id="quantize-prompt" min=1 max=100 bind:value={settings.quantize}>
        <span>{settings.quantize} miliseconds</span>
    </div>

    <label for='classic-chord-order'>
        <input type='checkbox' id="classic-chord-order" bind:checked={settings.classicChordOrder}>
        Classic chord order
    </label>

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

    {#if settings.oors}
    <div>
        <label title="Helps tell you if notes are out-of-range, certain characters are restricted from use!" for="oor-separator">Out-of-range separator (?):</label>
        <div style="display: inline-flex;">
            <input
                type='text'
                id="oor-separator"
                bind:value={settings.oorSeparator}
                on:input={(val) => {
                    if ([null, "0", "", "    ", " ", "'", "[", "]", "(", ")", "{", "}", "_", "-", ".", ","]
                        .concat(vpScale.split(''))
                        .includes(val.data?.toLowerCase() ?? null))
                    { // if restricted char, reset to default
                        settings.oorSeparator = ":"
                    }
                    else settings.oorSeparator = val.data[0]
                }}
            >
        </div>
    </div>
    {/if}

    <button on:click={ () => dispatch("copyText") }>
        Copy Text
    </button>

    <button on:click={ () => dispatch("copyTransposes") }>
        Copy Transposes
    </button>

    <button
        disabled={settings.capturingImage}
        on:click={() => dispatch("captureSheetAsImage", {mode: "download"})}
    >
        {#if settings.capturingImage}
            Please Wait...
        {:else}
            Download Image
        {/if}
    </button>

    {#if typeof ClipboardItem !== "undefined"}
        <!-- note: not supported by mozilla -->
        <button
            disabled={settings.capturingImage}
            on:click={() => dispatch("captureSheetAsImage", {mode: "copy"})}
        >
            {#if settings.capturingImage}
                Please Wait...
            {:else}
                Copy Image
            {/if}
        </button>
    {/if}
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

    input[type="text"] {
        margin-bottom: 0;
    }
    
    .beats, .quantize, .select-label, .tempo {
        display: flex;
        flex-direction: row;
    }
</style>
{/if} <!-- {#if show} -->
