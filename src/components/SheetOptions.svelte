<script>
    import { createEventDispatcher } from 'svelte'
    import {vpScale} from "../utils/VP";

    let dispatch = createEventDispatcher()

    export let show
    export let hasMIDI = false

    let fonts = ['Verdana', 'Tahoma', 'Dejavu Sans', 'Segoe UI', 'Helvetica', 'Lucida Console', 'Candara']

    export let settings = {
        beats: 4,
        quantize: 35,
        classicChordOrder: true,
        sequentialQuantize: false,
        curlyQuantizes: false,
        pShifts: 'Start',
        pOors: 'Inorder',
        oors: true,
        tempoMarks: false,
        bpmChanges: true,
        minSpeedChange: 10,
        oorSeparator: ':',
        // transposition: 0,
        lbauto_atleast: 4,
        font: fonts[0],
        capturingImage: false,
        missingTempo: false,
        bpm: 120
    }
</script>

{#if show}
<!-- <div class="flex flex-col items-start align-middle">
    <button style="margin-bottom: 0;" on:click={() => { dispatch('lineBasedAuto') }}>Line-based auto-transpose</button>
    <div class="flex flex-row mt-3">
        <label class="flex flex-row items-center"
               title="Controls how much better a transposition should be than the previous transposition for line-based auto-transpose to act (higher = less transposing)" 
               for="atleast">Resilience (?):</label>
        <input class="w-32" id="atleast" type="range" min=1 max=24 bind:value={settings.lbauto_atleast}>
        <span style="display:flex; align-items: center">{settings.lbauto_atleast}</span>
    </div>
</div> -->

<hr class="my-2 mx-1">

<div>
    <div class='select-div'>
        <label for='shifts-position'>Place shifted notes at:</label>
        <select disabled={settings.classicChordOrder} title={settings.classicChordOrder ? "Disable \"Classic chord order\" to customize this." : "" }
                name='shifts-position' id='shifts-position' bind:value={settings.pShifts}>
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

    <hr class="my-2 mx-1">

    {#if hasMIDI}
        <div class='beats'>
            <label class='slider-label' for='beats-for-newline'>Break lines: </label>
            <input type='range' id='beats-for-newline' min=1 max=32 bind:value={settings.beats}>
            <span>Every {settings.beats == 1 ? "1 beat" : `${settings.beats} beats`}</span>
        </div>
    {:else}
        <i>Some settings are not available because the original MIDI data is missing.</i>
    {/if}

    {#if settings.missingTempo == true}
        <div class='tempo'>
            <label class='slider-label' for='tempo'
                title="You're able to change this because your MIDI file doesn't have tempo/BPM.">
                    BPM (?): </label>
            <input type='range' id='tempo' min=1 max=300 bind:value={settings.bpm}>
            <input type='number' class='w-16 box-border' min=1 max=300 bind:value={settings.bpm}>
        </div>
    {/if}

    {#if hasMIDI}
        <div class='beats'>
            <label class='slider-label' for='quantize-prompt'>Quantize: </label>
            <input type='range' id="quantize-prompt" min=1 max=250 bind:value={settings.quantize}>
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
    {/if}

    <label for='curly-quantizes'>
        <input type='checkbox' id="curly-quantizes" bind:checked={settings.curlyQuantizes}>
        Curly braces for quantized chords
    </label>

    <div></div>
    <label for='out-of-range'>
        <input type='checkbox' id="out-of-range" bind:checked={settings.oors}>
        Include out of range (ctrl) notes
    </label>

    <label for='tempo-checkbox'>
        <input type='checkbox' id="tempo-checkbox" bind:checked={settings.tempoMarks}>
        Show tempo and out-of-range marks 
    </label>

    {#if hasMIDI}
        <label for='bpm-changes'>
            <input type='checkbox' id="bpm-changes" bind:checked={settings.bpmChanges}>
            Show BPM changes as comments
        </label>
        <div class="beats"> 
            {#if settings.bpmChanges}
                <label class='slider-label' for='min-speed-change'>Min. % speed change: </label>
                <input type='range' id='min-speed-change' min=0 max=100 bind:value={settings.minSpeedChange}>
                <span>At least {settings.minSpeedChange}%</span>
            {/if}
        </div>
    {/if}


    {#if settings.oors && settings.tempoMarks}
    <div>
        <label title="Helps tell you if notes are out-of-range, certain characters are restricted from use!" for="oor-separator">Out-of-range separator (?):</label>
        <div style="display: inline-flex">
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

    <hr class="my-2 mx-1">

    <div class='select-div'>
        <label for='font'>Font:</label>
        <select name='font' id='font' bind:value={settings.font}>
            {#each fonts as font}
                <option value={font}>{font}</option>
            {/each}
        </select>
    </div>

    <hr class="my-2 mx-1">

</div>

<style>
    * {
        user-select: none;
    }

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
    
    select option {
        background: #2D2A32;
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
    
    .beats, .select-label, .tempo {
        display: flex;
        flex-direction: row;
    }
</style>
{/if} <!-- {#if show} -->
