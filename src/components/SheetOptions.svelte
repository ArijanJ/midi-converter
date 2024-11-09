<script>
    import { createEventDispatcher } from 'svelte'
    import { vpScale } from "../utils/VP";

    let dispatch = createEventDispatcher()

    export let show
    export let hasMIDI = false

    let fonts = ['Verdana', 'Tahoma', 'Dejavu Sans', 'Segoe UI', 'Helvetica', 'Lucida Console', 'Candara']

    export let settings = {
        beats: 4,
        breaks: 'realistic',
        quantize: 35,
        classicChordOrder: true,
        sequentialQuantize: true,
        curlyQuantizes: true,
        pShifts: 'Start',
        pOors: 'Inorder',
        oors: true,
        tempoMarks: false,
        oorMarks: false,
        bpmChanges: true,
        bpmType: 'detailed',
        minSpeedChange: 10,
        oorSeparator: ':',
        resilience: 2,
        stickyAutoTransposition: false,
        font: fonts[0],
        lineHeight: 135,
        capturingImage: false,
        missingTempo: false,
        bpm: 120,
        tracks: [{}] // populated from main, default = all selected
    }
</script>

{#if show}

{#if settings.tracks?.length != 0 && hasMIDI}
    <hr class="my-2 mx-1">

    {#each settings.tracks as track, idx}
        <label for="trackbox{idx+1}">
            <input id="trackbox{idx+1}" type="checkbox"
                checked={track.selected}
                on:change={() => { // TODO: use (e)
                    track.selected = !track.selected;
                    settings.tracks = settings.tracks.map((track) => ({ ...track }))
                }}
            />
            Track {idx+1} ({track.name || "None"}) - {track.length} events
        </label>
    {/each}
{/if}

<hr class="my-2 mx-1">

<div class="flex flex-col items-start align-middle" style="margin-top: -0.7em">
    <div class="flex flex-row mt-3">
        <label class="flex flex-row items-center"
               title="Defines how much better a transposition should be than the previous transposition for multi-transpose to act (higher = less transposing)"
               for="atleast">Resilience (?):</label>
        <input class="w-32" id="atleast" type="range" min=0 max=12 bind:value={settings.resilience}>
        <span style="display:flex; align-items: center">{settings.resilience}</span>
    </div>
    <div class="flex flex-row mt-3">
        <label class="flex flex-row items-center"
               title="Defines whether or not the transposed region(s) should be related to previous regions"
               for="sticky-auto-transposition">Sticky auto-transposition (?):</label>
        <input class="mx-1" type='checkbox' id="sticky-auto-transposition" bind:checked={settings.stickyAutoTransposition}>
    </div>
</div>

<hr class="my-2 mx-1">

<div>
    <!-- {#if hasMIDI} -->
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
    <!-- {/if} -->

    {#if hasMIDI}
        <div class='select-div'>
            <label for='breaks-choice'>Break lines how?</label>
            <select name='breaks-choice' id='breaks-choice' bind:value={settings.breaks}>
                <option value='realistic'>Realistically</option>
                <option value='manual'>Manually</option>
            </select>
        </div>
        {#if settings.breaks == 'manual'}
            <div class='beats'>
                <label class='slider-label' for='beats-for-newline'>Break lines: </label>
                <input type='range' id='beats-for-newline' min=1 max=32 bind:value={settings.beats}>
                <span>Every {settings.beats == 1 ? "1 beat" : `${settings.beats} beats`}</span>
            </div>
        {/if}
    {:else}
        <i>Some settings are not available because the original MIDI data is missing.</i>
    {/if}

    {#if settings.missingTempo == true && hasMIDI}
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
    {/if}

    <label for='classic-chord-order'>
        <input type='checkbox' id="classic-chord-order" bind:checked={settings.classicChordOrder}>
        Classic chord order
    </label>

    <label for='order-quantizes'>
        <input type='checkbox' id="order-quantizes" bind:checked={settings.sequentialQuantize}>
        <span class="cursor-help" title="Whether quantized chords should follow their original sequential order, or use regular chord sorting">
            Sequential quantizes
        </span>
    </label>

    <label for='curly-quantizes'>
        <input type='checkbox' id="curly-quantizes" bind:checked={settings.curlyQuantizes}>
        Curly braces for quantized chords
    </label>

    <label for='out-of-range'>
        <input type='checkbox' id="out-of-range" bind:checked={settings.oors}>
        Include out of range (ctrl) notes
    </label>

    <hr class="my-2 mx-1">

    <label for='tempo-checkbox'>
        <input type='checkbox' id="tempo-checkbox" bind:checked={settings.tempoMarks}>
        Show tempo/timing marks
    </label>

    <label for='oormark-checkbox'>
        <input type='checkbox' id="oormark-checkbox" bind:checked={settings.oorMarks}>
        Show out of range (ctrl) text marks
    </label>

    {#if settings.oors && settings.oorMarks}
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

    {#if hasMIDI && !settings.missingTempo}
        <label for='bpm-changes'>
            <input type='checkbox' id="bpm-changes" bind:checked={settings.bpmChanges}>
            Show BPM changes as comments
        </label>

        {#if settings.bpmChanges}
        <div class='select-div'>
            <label for='bpmType'>BPM comments:</label>
            <select name='bpmType' id='bpmType' bind:value={settings.bpmType}>
                <option value='detailed'>Detailed</option>
                <option value='simple'>Simple</option>
            </select>
        </div>

        <div class="beats">
                <label class='slider-label' for='min-speed-change'>Min. % speed change: </label>
                <input type='range' id='min-speed-change' min=0 max=100 bind:value={settings.minSpeedChange}>
                <span>At least {settings.minSpeedChange}%</span>
        </div>
        {/if}
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

    <div class="flex flex-col items-start align-middle" style="margin-top: -0.3em">
        <div class="flex flex-row mt-3">
            <label class="flex flex-row items-center"
                   for="line-height">Line height:</label>
            <input class="w-32" id="line-height" type="range" min=110 max=160 bind:value={settings.lineHeight}>
            <span style="display:flex; align-items: center">{settings.lineHeight}</span>
        </div>
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
