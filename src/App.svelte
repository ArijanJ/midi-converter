<style>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>

<script>
    import { domToBlob } from "modern-screenshot";
    import { getMIDIFileFromArrayBuffer, getEvents, getTempo } from './utils/MIDI.js'
	import { generateSheet, bestTransposition } from './utils/VP.js'
    import SheetOptions from './components/SheetOptions.svelte'
    import Track from './components/Track.svelte'
    import Line from './components/Line.svelte'
    import HistoryEntry from "./components/HistoryEntry.svelte";

    import { onMount } from "svelte";

    let importer = {
        element: undefined, // main welcome screen div
        hide: () => { importer.element.style.top = "-110vh" },
        show: () => { importer.element.style.top = "0px" }
    }

    import history, { decompress, remainingSize } from './utils/History'
    
    let remaining = remainingSize()
    
    import SheetActions from "./components/SheetActions.svelte";
    let existingProject = { 
        element: undefined, 
        name: undefined,
        data: undefined,
        set: (project, exportedCurrent = false) => {
            MIDIObject = exportedCurrent ? MIDIObject : undefined
            existingProject.name = filename ?? project.name
            existingProject.data = decompress(project.data)
        },
        setAndProceed: (project, exportedCurrent = false) => {
            MIDIObject = exportedCurrent ? MIDIObject : undefined
            existingProject.name = filename ?? project.name
            existingProject.data = decompress(project.data)
            existingProject.proceed(true)
        },
        proceed: (forceLoad) => {
            let decision = existingProject.element?.returnValue // dialog result
            if (forceLoad) decision = "load"
            if (!decision) return

            if (decision == "load" || decision == "existing") {
                console.log("Loading", existingProject.name)

                sheetReady = true
                lines = existingProject.data
            }
            else if (decision == "export-and-restart") {
                history.export(existingProject.name).then((piece) => {
                    downloadSheetData(piece)
                    importFile()
                })
            }
            else if (decision == "new") {
                importFile()
            }

            importer.hide()
        }
    }

    let filename;
    let basename = (s) => { 
        if (!s) return;
        return s.split(".").slice(0, -1).join('.') 
    }

	// DOM input element
	let fileInput;
    $: {
        if (fileInput) filename = basename(fileInput.files[0]?.name) ?? existingProject.name
    }

    let trackChooser = {
        element: undefined,
        hide: () => { trackChooser.element.style.top = "-110vh" },
        show: () => { trackChooser.element.style.top = "0px" }
    }

	let sheetReady = false

	let MIDIObject
    let tracks

	// VP.js/Sheet
	let originalSheet
    let sheetText

    // [true, true, false, true, ...]
    let selectedTracks

    // For line break calculations
    let penalty = 0.000
    let error_range = 0.5

    let container
    let notesContainerWidth

    async function onFileChange() {
        filename = basename(fileInput.files[0].name)
        let exists = pieces.find((entry) => entry.name == filename) ?? false
        if(exists /* in history */) {
            existingProject.name = filename
            existingProject.data = decompress(exists.data)
            existingProject.element.showModal()
        }
        else {
            importFile()
            importer.hide()
        }
    }
    
    async function importFile(dataTransfer = undefined) {
        if (dataTransfer) fileInput.files = dataTransfer.files

        if (fileInput.files[0].type.split("/")[1] === "json") {
            let sheetData = await fileInput.files[0].text()
            existingProject.set(JSON.parse(sheetData))

            sheetReady = true
            lines = existingProject.data

            return
        }

        await fileInput.files[0].arrayBuffer().then((arrbuf) =>{
            MIDIObject = getMIDIFileFromArrayBuffer(arrbuf)

            if(!getTempo(MIDIObject).ticksPerBeat)
                console.error("No ticksPerBeat in this midi file")

            tracks = MIDIObject.tracks
            selectedTracks = tracks.map(() => true)
            
            sheetReady = false
            trackChooser.show()

            penalty = 0.000
        })
    }

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
                lines.push({ chords: acc, transposition: settings.transposition, continuation: current.note})
                acc = []
            }

            acc.push(current.chord)
        }
        lines.push({ chords: acc, transposition: 0, continuation: undefined }) /* Push the leftovers */
		sheetReady = true

		// Hide TrackChooser
		// trackSelection = false
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
        else if (oldSettings.beats != settings.beats ||
                 oldSettings.classicChordOrder != settings.classicChordOrder) {
            createLines()
            lines = lines
        }
        else if (oldSettings.quantize != settings.quantize ||
                 oldSettings.sequentialQuantize != settings.sequentialQuantize) {
            saveSheet()
            createLines()
            lines = lines
        }
        else if (oldSettings.bpm != settings.bpm) {
            saveSheet()
            createLines()
        }

        sheetText = ""
        oldSettings = { ...settings }
	}

    let auto = () => { 
        settings.transposition = bestTransposition(originalSheet, 11)
        console.log(bestTransposition(originalSheet, 11));
        for (let i = 0; i < lines.length; i++)
            setLineTransposition(i, settings.transposition)
        autosave()
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
        autosave()
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
            autosave()
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
        autosave()
    }

    let getTransposesOfSheet = () => {
        const getPrevTranspose = (i) => {
            i -= 1;
            while (i >= 0) {
                if (!lines[i]?.comment) {
                    return lines[i].transposition
                }
                i -= 1
            }

            return false
        }

        let transposes = lines.reduce((acc, line, i) => {
            let prevTranspose = getPrevTranspose(i)

            if (!line.comment && (i === 0 || prevTranspose !== line.transposition)) {
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
        download(blob, "png")
    }

    function downloadSheetData(piece) {
        filename = piece.name
        let blob = new Blob([JSON.stringify(piece)], { type: "text/json" })
        download(blob, "json")
    }

    function download(blob, extension) {
        const url = URL.createObjectURL(blob);

        let output = `${filename}.${extension}`

        // create a temporary element to download the data
        let linkEl = document.createElement("a");
        linkEl.href = url
        linkEl.download = output

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
        autosave()
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

    function droppedFile(e) {
        e.preventDefault()
        
        let file = e?.dataTransfer?.items?.[0]
        if(!file || !file.getAsFile) { console.error('bad file dropped'); return }

        fileInput.files = e.dataTransfer.files
        onFileChange()
    }

    function clearFiles() {
        document.getElementById("drop").value = "";
    }

    let pieces = history.getAll()
    
    function autosave() {
        if (filename) history.add(filename, settings, lines).then(() => pieces = history.getAll())
        remaining = remainingSize()
        return
    }
    
</script>

<svelte:head>
    <title>MIDI Converter</title>
</svelte:head>

<dialog bind:this={existingProject.element} class="rounded-lg overflow-hidden"
        on:close={() => { existingProject.proceed() }}>
    <form class="flex flex-col row-auto items-center">
        <p class="p-3 text-center">
            Careful, you've previously edited this sheet!
            <br>
            Loading it again will overwrite your progress.
        </p>
        <div class="mx-2 mb-2 flex gap-2 w-full justify-center">
            <button formmethod="dialog" class="p-1" value="load">Load saved</button>
            <button formmethod="dialog" class="p-1" value="export-and-restart">Export and Start over</button>
            <button formmethod="dialog" class="p-1" value="new">Start over</button>
        </div>
    </form>
</dialog>

<div bind:this={importer.element}
    class="flex flex-col gap-12 w-full h-full items-center align-center justify-center content-center
            absolute top-0 z-50"
     style="height:100%; background: rgb(45,42,50);
            background: linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%); 
            transition: all 0.6s ease-in-out;">
    <div class="flex flex-col items-center gap-6">
        <p class="text-white text-3xl">Import a MIDI/JSON file to get started:</p>
        <label on:drop|preventDefault={droppedFile} on:dragover|preventDefault
               for="drop" class="cursor-pointer 
                                 rounded-xl
                                 text-xl
                                 p-4"
                            style="border: 2px solid dimgrey">
            Click or drop a MIDI/JSON file here!
        </label>
        <input id="drop" class="hidden" type="file" bind:this={fileInput} accept=".mid,.midi,.json" on:change={onFileChange}>
    </div>

    {#if pieces.length > 0} <!-- Has piece(s) in history? -->
        <hr class="w-[58em]" style="border: 1px solid #a0a0a0">

        <div class="flex flex-col items-center gap-6">
            <p class="text-white text-3xl">Or, continue one of your previous projects:</p>
            <div class="w-3/4 flex flex-wrap justify-center gap-2 overflow-clip text-ellipsis">
                {#each pieces as piece}
                    <HistoryEntry
                        {piece}
                        on:load={(x) => { existingProject.setAndProceed(x.detail.project); importer.hide() }}
                        on:refresh={() => { pieces = history.getAll(); remaining = remainingSize() }}
                        on:export={() => downloadSheetData(piece)}
                    />
                {/each}
            </div>
        </div>
        
        <div>Used {remaining} / 5000 kB
            <span title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct.">ⓘ</span>
        </div>
    {/if}
</div>

<div class="flex flex-row">
    <div class="m-1" style="min-width:25em; max-width:25em">
        <div>
            {#if sheetReady}
                <p class="mb-2">You are currently editing: {filename}</p>
                <button on:click={() => { importer.show(); setTimeout(() => { sheetReady = false; filename = null; clearFiles();}, 600) }}>
                    Import another MIDI/JSON file
                </button>
                <hr class="my-2 mx-1">
            {/if}
            <SheetOptions
                bind:settings
                show={sheetReady}
                hasMIDI={!(!MIDIObject)}
                on:auto={auto}
                on:lineBasedAuto={() => {lineBasedAuto()}}
            />
        </div>
    </div>
    
    <section bind:this={trackChooser.element} id="track-chooser" class="z-40 w-full absolute flex flex-col gap-4 justify-center items-center content-center text-2xl"
             style="top: -110vh; height: 100vh; background: rgb(45,42,50);
                    background: linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%); 
                    transition: all 0.6s ease-in-out;">
        <div id="tracks" class="flex flex-col gap-2">
        {#if tracks}
            {#each tracks as track, idx}
                <Track {track} idx={idx+1}
                bind:selected={selectedTracks[idx]} />
            {/each}
        {/if}
        </div>
        <button on:click={() => { saveSheet(); createLines(); trackChooser.hide() }}>Import selected tracks</button>
    </section>
    
    {#if sheetReady == true}
        <div class="flex flex-col items-start">
            <SheetActions {settings} 
                on:captureSheetAsImage={(event) => { captureSheetAsImage(event.detail.mode) }}
                on:copyText={() => {
                    settings.tempoMarks = true
                    setTimeout(() => {
                        navigator.clipboard.writeText(sheetText)
                    }, 0)
                }}
                on:copyTransposes={copyTransposes}
                on:export={() => {
                    autosave()
                    setTimeout(() => {
                        if (existingProject?.data === undefined) {
                            let pieces = history.getAll()
                            let thisPiece = pieces.filter(entry => entry.name === filename)[0]

                            existingProject.setAndProceed(thisPiece, true)
                        }

                        history.export(existingProject.name).then((piece) => downloadSheetData(piece))
                    }, 0)
                }}
            />

            <div style="background: #2D2A32; user-select: none" bind:this={container}>
                <div style="width: max-content" bind:clientWidth={notesContainerWidth}>
                    {#each Object.entries(lines) as [ index, line ]}
                    <Line line={line}
                          prevLine={lines?.[index-1]}
                          {index}
                          {settings}
                          comment={line.comment}
                          passedNext={line.continuation}
                          on:transpose={lineTransposed}
                          on:auto={autoLine}
                          on:comment={comment}
                          on:sheetText={(text) => sheetText += text.detail + "\n"}
                          sameTranspositionAsPrevious={stap(index)}/>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
