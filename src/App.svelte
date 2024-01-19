<script>
    import { domToBlob } from "modern-screenshot";
    import {isImageCaptureInProgress} from "./store";
    import { getMIDIFileFromArrayBuffer, getEvents, getTempo } from './utils/MIDI.js'
	import { generateSheet, bestTransposition } from './utils/VP.js'
    import SheetOptions from './components/SheetOptions.svelte'
    import Track from './components/Track.svelte'
    import Line from './components/Line.svelte'
	import { onMount } from 'svelte'

	// DOM input element
	let fileInput

	let trackSelection = false
	let sheetReady = false

	let MIDIObject
    let tracks

	// VP.js/Sheet
	let originalSheet

    // [true, true, false, true, ...]
    let selectedTracks

    // For line break calculations
    let penalty = 0.000
    let error_range = 0.5

    let container
    let notesContainerWidth

	onMount(() => {
		fileInput.addEventListener('change', async() => {
			await fileInput.files[0].arrayBuffer().then((arrbuf) =>{
				MIDIObject = getMIDIFileFromArrayBuffer(arrbuf)

				if(!getTempo(MIDIObject).ticksPerBeat)
					console.error("No ticksPerBeat in this midi file")

                tracks = MIDIObject.tracks
                selectedTracks = tracks.map(() => true)

				trackSelection = true
				sheetReady = false
                penalty = 0.000
			})
		}, false)
	})

    function shouldBreak(note) {
        if (!note) return false
        let tempo_ms = note.tempo / 1000 // Turn 652174 into 652.174
        let goal = tempo_ms * settings.beats
        let normalizedPlayTime = note.playTime - penalty
        // console.log(`So far: ${normalizedPlayTime}, Goal: ${goal}`)
        if (normalizedPlayTime + error_range >= goal) {
            penalty += normalizedPlayTime
            return true
        }
    }

    let saveSheet = () => {
		originalSheet = generateSheet(getEvents(MIDIObject, selectedTracks), settings.quantize, settings.pShifts, settings.pOors, settings.sequentialQuantize)
    }

	let createLines = () => {
        sheetReady = false

        if (!originalSheet) return
        const chords = originalSheet.chords

        penalty = 0.000
        lines = []
        let acc = [] // [Chord]
        for (let i = 0; i <= chords.length; i++) {
            const current = {
                chord: chords[i],
            }; current.note = current.chord?.notes[0]

            const next = {
                chord: chords[i+1],
            }; next.note = next.chord?.notes[0]

            if (!current.note) { continue }
            if (shouldBreak(current.note)) {
                lines.push({ chords: acc, transposition: settings.transposition, continuation: current.note })
                acc = []
            }

            acc.push(current.chord)
        }
        lines.push({ chords: acc, transposition: 0, continuation: undefined }) /* Push the leftovers */
		sheetReady = true

		// Hide TrackChooser
		trackSelection = false
        lines = lines
	}

    let oldSettings
    let settings
	$: {
        if (!oldSettings) { oldSettings = { ...settings }; break $ }
        if (oldSettings.transposition != settings.transposition) {
            for (let line of lines) {
                line.transposition = settings.transposition
            }
            lines = lines
        }
        else if (oldSettings.beats != settings.beats) {
            createLines()
        }
        else if (oldSettings.quantize != settings.quantize ||
                 oldSettings.sequentialQuantize != settings.sequentialQuantize) {
            saveSheet()
            createLines()
            lines = lines
        }
        oldSettings = { ...settings }
	}

    let auto = () => { settings.transposition = bestTransposition(originalSheet, 11) }

    let lines = [] // [{chords: [], transposition?, continuation: undefined}...]

    function setLineTransposition(idx, transposition) {
        let index = +idx
        lines[index].transposition = transposition

        lines[index].difference = lines[index].transposition - lines[index-1].transposition // Relative
        lines[index+1].difference = lines[index+1].transposition - lines[index].transposition // Relative
    }

    let lineClicked = (e) => {
        const index = e.detail.index
        let by = e.detail.by
        console.log(`Transposing line ${e.detail.index} by ${by}`)
        setLineTransposition(index, lines[index].transposition+by)
    }

    let autoLine = (e) => {
        const index = e.detail.index
        const sheet = e.detail.sheet
        setLineTransposition(index, bestTransposition(sheet, 11))
    }

    /**
     * Takes an image of the sheet, which can then be either copied/downloaded.
     * The image should be cropped to the maximum measure length via the value notesContainerWidth.
     * It's value depends on the max-content width of the div where notesContainerWidth is set.
     * @param {string} mode - A string indicating how the user wants to retrieve the image.
     * @enum {string} ["download", "copy"]
     */
    function captureSheetAsImage(mode) {
        isImageCaptureInProgress.set(true)

        setTimeout(() =>
            domToBlob(container, {width: notesContainerWidth, scale: 2}).then((blob) => {
                if (mode === "copy") {
                    copyCapturedImage(blob);
                    return;
                }

                downloadCapturedImage(blob);
            }
        ), 250)
    }

    function handleCaptureSheetAsImage(event) {
       captureSheetAsImage(event.detail.mode);
    }

    function copyCapturedImage(blob) {
        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ])
            isImageCaptureInProgress.set(false)
        }
        catch (err) {
            console.error(err);
        }
    }

    function downloadCapturedImage(blob) {
        const url = URL.createObjectURL(blob);

        // create a temporary element to download the image
        let filename = fileInput.files[0].name.split(".");
        filename.pop();
        filename = filename[0] + ".png";

        let linkEl = document.createElement("a");
        linkEl.href = url
        linkEl.download = filename

        document.body.appendChild(linkEl);
        linkEl.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(linkEl);
        isImageCaptureInProgress.set(false)
    }
</script>

<svelte:head>
    <title>MIDI Converter</title>
</svelte:head>

<div style="display: inline-block">
    <label for="file">Please import a MIDI file:</label>
    <input type="file" bind:this={fileInput} accept=".mid,.midi">
</div>

<SheetOptions
    show={sheetReady}
    on:auto={auto}
    on:captureSheetAsImage={handleCaptureSheetAsImage}
    bind:settings
/>

{#if trackSelection}
<section id="track-chooser">
    <div id="tracks">
        {#each tracks as track, idx}
            <Track {track} idx={idx+1} 
            bind:selected={selectedTracks[idx]} />
        {/each}
    </div>
    <button on:click={() => { saveSheet(); createLines() }}>Import selected tracks</button>
</section>
{/if}

{#if sheetReady}
    <div style="background: #2D2A32" bind:this={container}>
        <div style="width: max-content" bind:clientWidth={notesContainerWidth}>
            {#each Object.entries(lines) as [ index, line ]}
                {@const last = lines[index-1]}
                {@const next = line.continuation}
                {@const sameTranspositionAsPrevious = last?.transposition == line.transposition}
                <Line line={line}
                      {sameTranspositionAsPrevious}
                      {index}
                      {settings}
                      passedNext={next}
                      on:clicked={lineClicked}
                      on:auto={autoLine}/>
            {/each}
        </div>
    </div>
{/if}
