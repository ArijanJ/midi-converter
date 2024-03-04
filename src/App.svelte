<script>
    import { domToBlob } from "modern-screenshot";
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
        if (normalizedPlayTime + error_range >= goal) {
            penalty += normalizedPlayTime
            return true
        }
    }

    let saveSheet = () => {
        let events = getEvents(MIDIObject, selectedTracks)
		originalSheet = generateSheet(events, settings)
        settings.missingTempo = originalSheet.missingTempo
    }

	let createLines = () => {
        sheetReady = false

        if (!originalSheet) return
        const chords = originalSheet.chords

        penalty = 0.000
        lines = []
        let acc = [] // Chord[]
        for (let i = 0; i <= chords.length; i++) {
            const current = {
                chord: chords[i],
            }; current.note = current.chord?.notes[0]

            const next = {
                chord: chords[i+1],
            }; next.note = next.chord?.notes[0]

            if (!current.note || !current.chord) continue

            if (shouldBreak(current.note) && acc.length > 0) {
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
                 oldSettings.sequentialQuantize != settings.sequentialQuantize ||
                 oldSettings.classicChordOrder != settings.classicChordOrder) {
            saveSheet()
            createLines()
            lines = lines
        }
        else if (oldSettings.bpm != settings.bpm) {
            saveSheet()
            createLines()
        }
        oldSettings = { ...settings }
	}

    let auto = () => { 
        settings.transposition = bestTransposition(originalSheet, 11)
        for (let i = 0; i < lines.length; i++)
            setLineTransposition(i, settings.transposition)
    }

    let lineBasedAuto = (fromLine = 0) => {
        let previous = bestTransposition(lines[fromLine].originalSheet, 11, 0, true)

        for (let index = fromLine; index <= lines.length; index++) {
            const line = lines[index]
            if (!line) continue

            const newTransposition = bestTransposition(line.originalSheet, 8, previous, false, settings.lbauto_atleast, previous)
            setLineTransposition(index, newTransposition)

            previous = newTransposition
        }
        
        lines = lines
    }

    let lines = [] // [{ chords: Chord[], transposition?, continuation: undefined, comment: false }, ...]

    function setLineTransposition(idx, transposition) {
        let index = +idx
        lines[index].transposition = transposition

        if(lines[index-1])
            lines[index].difference = lines[index].transposition - lines[index-1].transposition
        if(lines[index+1])
            lines[index+1].difference = lines[index+1].transposition - lines[index].transposition
    }

    let lineTransposed = (e) => {
        const index = e.detail.index
        const by = e.detail.by
        setTimeout(() => {
            setLineTransposition(index, lines[index].transposition+by)
        }, 0)
    }

    let autoLine = (e) => {
        const keepGoing = e.detail.keepGoing
        const index = e.detail.index
        const sheet = e.detail.sheet
        let previous = lines[index-1]?.transposition ?? 0
        setLineTransposition(index, bestTransposition(sheet, 11, previous, 0, 0))
        if(keepGoing) { // Transpose all the way down
            lineBasedAuto(index)
        }
    }

    let getTransposesOfSheet = () => {
        let transposes = lines.reduce((acc, line, i) => {
            if (i === 0 || (lines[i-1]?.transposition ?? 0) !== line.transposition) {
                acc.push(-line.transposition);
            }

            return acc;
        }, []);

        return transposes
    }

    let copyTransposes = () => {
        let transposes = getTransposesOfSheet();
        navigator.clipboard.writeText(transposes.join(" "));
    }

    /**
     * Takes an image of the sheet, which can then be either copied/downloaded.
     * The image should be cropped to the maximum measure length via the value notesContainerWidth.
     * It's value depends on the max-content width of the div where notesContainerWidth is set.
     * @param {string} mode - A string indicating how the user wants to retrieve the image.
     * @enum {string} ["download", "copy"]
     */
    function captureSheetAsImage(mode) {
        settings.capturingImage = true;

        setTimeout(() =>
            domToBlob(container, {width: notesContainerWidth, scale: 2}).then((blob) => {
                if (mode === "copy") {
                    copyCapturedImage(blob);
                }
                else {
                    downloadCapturedImage(blob);
                }

                settings.capturingImage = false;
            }
        ), 250)
    }

    function handleCaptureSheetAsImage(event) {
       captureSheetAsImage(event.detail.mode);
    }

    function copyCapturedImage(blob) {
        // note: ClipboardItem is not supported by mozilla
        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ])
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
        filename = filename.join(".") + ".png";

        let linkEl = document.createElement("a");
        linkEl.href = url
        linkEl.download = filename

        document.body.appendChild(linkEl);
        linkEl.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(linkEl);
    }

    function comment(e) {
        const index = e.detail.index
        const action = e.detail.action
        const comment = e.detail.comment
        switch(action) {
            case "add": {
                setTimeout(() => { // Make sure previous comment, if it exists, gets to update
                    if (lines[index-1]?.comment) return
                    lines.splice(index, 0, { comment: "Add a comment..." })
                    lines = lines
                }, 0)
                break
            }
            case "remove": {
                lines.splice(index, 1)
                lines = lines
                break
            }
            case "update": {
                lines[index].comment = comment
            }
        }
    }

    /** Checks if a line at index has same transposition as previous non-comment line */
    function stap(index) {
        const line = lines[index]
        for (let i = index - 1; i >= 0; i--) {
            const previous = lines[i]
            if (previous.comment) continue

            return previous.transposition == line.transposition
        }
    }
</script>

<svelte:head>
    <title>MIDI Converter</title>
</svelte:head>

<div style="display: inline-block">
    <label for="file">
        Please import a MIDI file:
        <a href="https://github.com/ArijanJ/midi-converter/wiki/Usage">How do I use this?</a>
    </label>
    <input type="file" bind:this={fileInput} accept=".mid,.midi">
</div>

<SheetOptions
    show={sheetReady}
    on:auto={auto}
    on:lineBasedAuto={() => { lineBasedAuto() }}
    on:captureSheetAsImage={handleCaptureSheetAsImage}
    on:copyText={() => {
        settings.tempoMarks = true
        setTimeout(() => {
            let text = ''
            let linesElement = container.querySelector('div.viewer').parentElement
            for (let line of linesElement.children) {
                if (!line?.innerText) continue

                let lineNotes = line.children[0].innerText.split("\n")
                if (lineNotes[0].includes("Transpose")) {
                    lineNotes[0] += "\n";
                }

                text += lineNotes.join("") + '\n'
            }
            navigator.clipboard.writeText(text)
        }, 0)
    }}
    on:copyTransposes={copyTransposes}
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
            <Line line={line}
                  {index}
                  {settings}
                  comment={line.comment}
                  passedNext={line.continuation}
                  on:transpose={lineTransposed}
                  on:auto={autoLine}
                  on:comment={comment}
                  sameTranspositionAsPrevious={stap(index)}/>
            {/each}
        </div>
    </div>
{/if}
