<style>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>

<script>
    import { domToBlob } from "modern-screenshot";
    import { getMIDIFileFromArrayBuffer, getEvents, getTracks, getTempo } from './utils/MIDI.js'
	import { generateSheet as generateChords, best_transposition_for_monochord, Chord as ChordObject, Note, is_chord, not_chord, index_of_index } from './utils/VP.js'
    let real_index_of = (x) => index_of_index(chords_and_otherwise, x)
    let chord_at = (x) => chords_and_otherwise[real_index_of(x)]

    import SheetOptions from './components/SheetOptions.svelte'
    import Track from './components/Track.svelte'
    import Chord from './components/Chord.svelte'
    import HistoryEntry from "./components/HistoryEntry.svelte";

    let importer = {
        element: undefined, // main welcome screen div
        hide: () => { importer.element.style.top = "-110vh"; softRegen(); resetSelection(); repopulateTransposeComments() },
        show: () => { importer.element.style.top = "0px" }
    }

    import history, { decompress, remainingSize } from './utils/History'
    let remaining = remainingSize()
    const sample_uri = 'https://gist.githubusercontent.com/ArijanJ/' + 
                       '80f86cbe9dcf8384dbdf9578c83102a6/raw/4ec84c63f655866e6d0d4e1c75949a22537c417e/' +
                       'Mar'+'iage_d'+'Amour_(sample).json'

    import SheetActions from "./components/SheetActions.svelte";
    import Guide from "./components/Guide.svelte";

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
            existingProject.proceed('load')
        },
        proceed: (force_decision = 'prompt') => {
            let decision = existingProject.element?.returnValue // dialog result
            if (force_decision !== 'prompt') decision = force_decision
            if (!decision) return

            if (decision == "load" || decision == "existing") {
                console.log("Loading", existingProject.name)

                sheetReady = true
                chords_and_otherwise = existingProject.data

                let old_style_project = !chords_and_otherwise.find((e) => is_chord(e))?.notes
                if (old_style_project) {
                    confirm("Looks like this project is from an older version, and unfortunately can't be opened anymore.\n" +
                            "You can right-click it on the main screen to export or delete it from your list.\n\n" +
                            "If you must view/edit it again, you can open it in an older version (reach me at @arijanj on Discord for help with this)")
                    window.location.reload()
                }

                softRegen()
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

	let chords_and_otherwise

    // [true, true, false, true, ...]
    let selectedTracks

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

        const file_is_json = fileInput.files[0].type.split("/")[1] === "json"
        if (file_is_json) {
            let sheetData = await fileInput.files[0].text()
            existingProject.set(JSON.parse(sheetData))

            sheetReady = true
            chords_and_otherwise = existingProject.data
            updateChords()

            return
        }

        await fileInput.files[0].arrayBuffer().then((arrbuf) =>{
            MIDIObject = getMIDIFileFromArrayBuffer(arrbuf)

            let tempo = getTempo(MIDIObject).ticksPerBeat

            if(!getTempo(MIDIObject).ticksPerBeat)
                console.error("No ticksPerBeat in this midi file")

            tracks = getTracks(MIDIObject)
            selectedTracks = tracks.map(() => true)

            sheetReady = false
            trackChooser.show()
        })
    }

    let saveSheet = () => {
        if (!MIDIObject) { console.log('no midiobject'); return }
        // console.log(MIDIObject.tracks)
        let events = getEvents(MIDIObject, selectedTracks)
        
        let res = generateChords(events, settings, chords_and_otherwise, getTempo(MIDIObject).ticksPerBeat)

        chords_and_otherwise = res.chords
        settings.missingTempo = !res.hasTempo
        
        let only_chords = chords_and_otherwise.filter(e => is_chord(e))
        only_chords.forEach((chord, i) => { 
            chord.next = { notes: [ { playTime: only_chords[i+1]?.notes[0]?.playTime } ] }
        }) // trust
        
        updateChords()
        repopulateTransposeComments()

        sheetReady = true
    }

    /**
     * Recreate the chord with existing data (for e.g. reordering purposes)
     * 
     * Calls updateChords()
     */
    function softRegen() {
        if(!chords_and_otherwise) return
        for(let i = 0; i < chords_and_otherwise.length; i++) {
            let chord = chords_and_otherwise[i]
            if(is_chord(chord)) {
                let new_notes = []
                for (let note of chord.notes) {
                    let new_note = new Note(note.value, note.playTime, note.ticks, note.tempo, note.BPM, note.delta, settings.pShifts, settings.pOors)
                    new_note.original = note.original
                    new_notes.push(new_note)
                }
                let new_chord = new ChordObject(new_notes, settings.classicChordOrder, settings.sequentialQuantize)
                new_chord.index = chord.index
                new_chord.next = chord.next
                if('reflow' in chord) new_chord.reflow = chord.reflow

                // new_note = new_note.sort((a, b) => a.displayValue - b.displayValue);
                chords_and_otherwise[i].notes = new_notes

                chords_and_otherwise[i] = new_chord
            }
        }

        updateChords()
    }

    let oldSettings
    let settings

    try { 
        settings = JSON.parse(localStorage.getItem('preferences')); 
        settings.beats = 4; settings.breaks = 'realistic'; settings.bpm = 120 // doesn't make sense to save this
    } 
    catch (e) { settings = undefined; }
	$: {
        if (!oldSettings) { oldSettings = { ...settings }; break $ }
        
        let changed = (key) => settings[key] != oldSettings[key]
    
        if (["beats",
            "breaks",
            "classicChordOrder",
            "quantize",
            "sequentialQuantize",
            "minSpeedChange",
            "bpmChanges",
            "bpmType",
            "bpm"].some(changed))
                saveSheet() // Full regeneration needed
        
       // Regeneration that doesn't require a MIDIObject
        if (["pShifts",
             "pOors",
             "classicChordOrder",
             "quantize",
             "sequentialQuantize"].some(changed))
                softRegen()
        
        if (MIDIObject)
            localStorage.setItem('preferences', JSON.stringify(settings))
        
        renderSelection()

        oldSettings = { ...settings }
	}

    let updateChords = () => {
        chords_and_otherwise = chords_and_otherwise
    }

    let addComment = (index) => {
        let real = real_index_of(index)
        chords_and_otherwise.splice(real, 0, { type: "comment", kind: "custom", text: "Add a comment..." })
        renderSelection()
    }
    
    let updateComment = (index, text) => {
        if (text == '')
            chords_and_otherwise.splice(index, 1)
        else
            chords_and_otherwise[index].text = text
        renderSelection()
        autosave()
    }

    let transposeRegion = (left, right, by, opts = undefined) => {
        let relative = opts?.relative ?? false

        for (let i = left; i <= chords_and_otherwise.length; i++) {
            let chord = chord_at(i)
            if (not_chord(chord)) continue

            if (chord.index > right) break
            transposeChord(i, by, { relative, skipUpdate: true })
        }

        if (opts?.skipSave === true) return
        repopulateTransposeComments()
        renderSelection()
        autosave()
    }

    let autoRegion = (left, right, opts = undefined) => {
        let stickTo = opts?.stickTo
        let skipSave = opts?.skipSave ?? false
        let ignorePrevious = opts?.ignorePrevious ?? false
    
        let chords_in_region = []
        for (let i = left; i <= right; i++) {
            let selected_chord = chords_and_otherwise[real_index_of(i)]
            chords_in_region.push(selected_chord)
        }

        if (stickTo == 'same')
            stickTo = chords_in_region[0].notes[0].transposition()

        let ignores = ignorePrevious ? [chords_in_region[0].notes[0].transposition] : []
        let best = best_transposition_for_monochord(chords_in_region, 11, stickTo, settings.resilience ?? 4, ignores)
        transposeRegion(left, right, best, { relative: false, skipSave: true })

        repopulateTransposeComments()
        if (!skipSave) autosave()
        
        return best
    }

    let repopulateTransposeComments = () => {
        if(!chords_and_otherwise) return

        // console.log(chords_and_otherwise)
        chords_and_otherwise = chords_and_otherwise.filter(e => { /* console.log(e); */ return e.kind != "transpose" })

        let first_note = next_not(chords_and_otherwise, not_chord, 0).notes[0]
        let initial_transposition = first_note.transposition

        // Add first transpose comment
        chords_and_otherwise.splice(0, 0, { type: "comment", kind: "transpose", text: `Transpose by: ${-initial_transposition}`, notop: true  })

        let previous_transposition = initial_transposition

        for (let i = 0; i < chords_and_otherwise.length; i++) {
            let current = chords_and_otherwise[i]
            if (not_chord(current)) continue

            let transposition = current.notes[0].transposition
            let difference = transposition - previous_transposition

            if (difference != 0) {
                // Add comment
                let text = `Transpose by: ${-transposition > 0 ? '+' : ''}${-transposition}`
                text += ` (${-difference > 0 ? '+' : ''}${-difference})`

                let non_comment_index = i-1

                // Make sure to add the transpose before all other comments for consistency
                while (chords_and_otherwise[non_comment_index]?.type == "comment") 
                    non_comment_index--

                chords_and_otherwise.splice(non_comment_index+1, 0, { type: "comment", kind: "transpose", text })
                previous_transposition = transposition
            }
        }
        
        softRegen()
        renderSelection()
    }

    let transposeChord = (index, by, opts /* { relative = false, skipUpdate = false } */) => {
        let relative = opts?.relative ?? false
        let skipUpdate = opts?.skipUpdate ?? false
        
        let chord = chord_at(index)
        if(not_chord(chord)) return

        // console.log('transposing', chord, 'by', by)
        chord.transpose(by, relative, true) // mutate

        if (!skipUpdate) updateChords()
    }

    let multiTransposeRegion = (left, right /* [{left, right}, {...}] */) => {
        let regions = []

        let idx = real_index_of(left)
        for (let i = idx; i < chords_and_otherwise.length; i++) {
            let event = chords_and_otherwise[i] ?? undefined
            if (event.index >= right) {
                regions.push({ left, right: event.index })
                break
            }
            if (event.type == "break" || !chords_and_otherwise[i+1]) {
                let next_chord = next_not(chords_and_otherwise, not_chord, i)
                regions.push({ left, right: next_chord.index })
                left = next_chord.index
            }
        }

        // console.log(regions)

        let chord = chords_and_otherwise[real_index_of(regions[0].left)]

        let previous_transposition = chord.notes[0]?.transposition ?? 0
        // console.log('prevt:', previous_transposition);
        for (let region of regions) {
            // console.log('transposing region', region.left, region.right)
            let best = autoRegion(region.left, region.right, { 
                stickTo: previous_transposition, 
                skipSave: true,
            })
            previous_transposition = best
            // console.log('prevt:', previous_transposition);
        }

        repopulateTransposeComments()
        autosave()
    }

    let sheetTransposes = () => {
        let transpose_comments = chords_and_otherwise.filter(e => e.kind == "transpose")
        return transpose_comments.map((e) => {
            const match = e.text.match(/Transpose by:\s(\+?(-?\d+))/);
            return match ? match[2] : null;
        }).join(' ');
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
        settings.oorMarks = false

        // Widen actual container to prevent cutoff
        container.firstChild.style.width = `${notesContainerWidth + 1}px`

        setTimeout(() =>
            domToBlob(container, {width: notesContainerWidth, scale: 2}).then((blob) => {
                if (mode === "copy") {
                    copyCapturedImage(blob);
                }
                else {
                    downloadCapturedImage(blob);
                }

                settings.capturingImage = false;

                // Restore original element size
                container.firstChild.style.width = 'max-content'
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

    function droppedFile(e) {
        e.preventDefault()

        let file = e?.dataTransfer?.items?.[0]
        if(!file || !file.getAsFile) { console.error('bad file dropped'); return }

        fileInput.files = e.dataTransfer.files
        onFileChange()
    }

    function clearFiles() {
        chords_and_otherwise = undefined
        document.getElementById("drop").value = "";
    }

    let pieces = history.getAll()
    if(pieces.length == 0 && !localStorage.getItem('hadSample') ) {
        localStorage.setItem('hadSample', true)

        fetch(sample_uri)
            .then(response => response.json())
            .then(other => {
                history.add(other.name, other.settings, other.data, true)
                setTimeout(() => {
                    pieces = history.getAll(
                    remaining = remainingSize()
            )}, 0)
            })
    }

    function autosave() {
        if (filename) history.add(filename, settings, chords_and_otherwise).then(() => pieces = history.getAll())

        remaining = remainingSize()
        console.log('saving', chords_and_otherwise)
        return
    }

    function next_not(coll, pred, start=0) {
        let i = start
        while(coll[i] && pred(coll[i])) {
            i++
        } /* then */ return coll[i]
    }

    let has_selection = false
    let selection = {
        left: undefined,
        right: undefined
    }
    $: {
        has_selection = selection.left != undefined && selection.right != undefined
        // print("Selection: ", selection)
    }

    function resetSelection(e) {
        if (!sheetReady || !selection.left && !selection.right) return

        for (let i = selection.left; i < chords_and_otherwise.length; i++) {
            const chord = chords_and_otherwise[i]
            if (not_chord(chord)) continue
            
            if (chord.index > selection.right) break
            
            chord.selected = undefined
        }

        selection.left = undefined
        selection.right = undefined

        // for (let event of chords_and_otherwise) {
        //     if (is_chord(event)) {
        //         event.selected = undefined
        //     }
        // }

        updateChords()
    }

    function selectAll() {
        selection.left = 0
        selection.right = chords_and_otherwise.length - 1

        renderSelection()
    }

    function renderSelection(e) {
        if(!chords_and_otherwise) return
        // console.log('rendering', selection)
    
        // Deselect everything
        for (let i = selection.left; i < chords_and_otherwise.length; i++) {
            let chord = chords_and_otherwise[real_index_of(i)]
            if (not_chord(chord)) continue
            chord.selected = undefined
            if (i > chord.index) break
        }

        // Select pertinent part
        for (let i = selection.left; i <= selection.right; i++) {
            let chord = chords_and_otherwise[real_index_of(i)]
            if (!chord) continue
            if (chord.index > selection.right) break

            chord.selected = true
        }

        updateChords()
    }

    function setSelection(event_or_index) {
        let index = event_or_index.detail?.index ?? event_or_index
        if (event_or_index.detail?.toBottom) {
            resetSelection()
            selection.left = index
            index = chords_and_otherwise.length - 1
        }

        // Double-click to select line
        if (selection.left === index && selection.right === index) {
            // Find line bounds
            let left = real_index_of(index)
            // console.log(left)
            while (is_chord(chords_and_otherwise[left])) {
                left--
            } left++
            let right = left
            while (is_chord(chords_and_otherwise[right])) {
                right++
            } right--

            selection.left = chords_and_otherwise[left].index
            selection.right = chords_and_otherwise[right].index
        }
        // Swap left and right if needed
        else if(index < selection.left || selection.left === undefined) {
            selection.right = selection.left ?? index
            selection.left = index
        } else {
            selection.right = index
        }

        renderSelection()
    }

    function splitLineAt(index) {
        let real_index = real_index_of(index)

        chords_and_otherwise.splice(real_index, 0, { type: "break" })
        updateChords()
    }
    
    function joinRegion(left, right) {
        let start = real_index_of(left)
        for (let i = start; i < chords_and_otherwise.length; i++) {
            if (chords_and_otherwise[i]?.type == "break") {
                chords_and_otherwise.splice(i, 1)
                i--
            }
            if (i > real_index_of(right)) break
        }
        updateChords()
    }
    
    function continueTranspose(direction /* 'ltr' or 'rtl' */) {
        let start = (direction == 'ltr' ? selection.left : selection.right)
        let transposition = chords_and_otherwise[real_index_of(start)].notes[0].transposition

        transposeRegion(selection.left, selection.right, transposition)
    }
</script>

<svelte:window on:keydown={(e) => { 
    if (e.key == "Escape") resetSelection() 
    if (e.key == "b") { 
        let chord_to_print = chord_at(selection.left)
        console.log('-----------')
        console.log(chord_to_print)
        console.log(chord_to_print.notes[0])
        console.log('-----------')
    }
}}></svelte:window>

<svelte:head>
    <title>MIDI Converter</title>
</svelte:head>

<svelte:body on:click|self={resetSelection} on:keypress|self={() => {}}></svelte:body>

<!-- <button class="sticky" on:click={() => { repopulateTransposeComments() }}>do stuff</button> -->

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
            {#if pieces.length == 1 && pieces[0].name.endsWith("(sample)")}
            <p class="text-white text-3xl">Or, try this sample piece:</p>
            {:else}
            <p class="text-white text-3xl">Or, continue one of your previous projects:</p>
            {/if}
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

        <div>Used ~{remaining} / 5000 kB
            <span title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct.">ⓘ</span>
        </div>
    {/if}
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-row" on:click|self={resetSelection} on:keypress|self={() => {}}>
    <div id="sidebar" class="mx-1 my-0 flex flex-col sticky overflow-y-auto top-0" style="min-width:25em; max-width:25em; max-height: 99vh; max-height: 99dvh">
        <div>
            {#if sheetReady}
                <p class="mb-2">You are currently editing: {filename}</p>
                <button class="w-full" on:click={() => { importer.show(); setTimeout(() => { sheetReady = false; filename = null; clearFiles();}, 600) }}>
                    Import another MIDI/JSON file
                </button>
                <hr class="my-2 mx-1">

            {/if}
            <!-- Selection control -->
            <div class="flex flex-col gap-2">
                <button on:click={selectAll}>Select all</button>
                {#if has_selection}
                <div class="flex flex-row justify-around items-center gap-2">
                    <button class="w-full block" on:click={() => { transposeRegion(selection.left, selection.right, 1, { relative: true }); repopulateTransposeComments() }}>Transpose selection down</button>
                    <button class="w-full block" on:click={() => { transposeRegion(selection.left, selection.right, -1, { relative: true }); repopulateTransposeComments() }}>Transpose selection up</button>
                </div>
                <button on:click={() => { autoRegion(selection.left, selection.right, {ignorePrevious: true})}}>Auto-transpose (single)</button>
                <button on:click={() => { multiTransposeRegion(selection.left, selection.right) }}>Auto-transpose (multi)</button>

                <!-- Continue transpose L/R -->
                <div class="flex flex-row justify-around items-stretch gap-2">
                    <button class="w-full block" on:click={() => { continueTranspose('rtl') }}>Continue transposition (right to left)</button>
                    <button class="w-full block" on:click={() => { continueTranspose('ltr') }}>Continue transposition (left to right)</button>
                </div>
                <hr class="my-2 mx-1">
                <div class="flex flex-row justify-around items-stretch gap-2">
                    <button class="w-full block" on:click={() => { joinRegion(selection.left, selection.right) }}>Join selection</button>
                    <button class="w-full block" on:click={() => { splitLineAt(selection.left) }}>Split selection</button>
                </div>
                <div class="flex flex-row justify-around items-stretch gap-2">
                    <button class="w-full block" disabled={settings.breaks != 'realistic'}
                            title={settings.breaks != 'realistic' ? "Only available with 'Realistic' breaks mode" : "" }
                            on:click={() => { chord_at(selection.left-1).reflow = true; saveSheet() }}>Make measure beginning</button>
                    <button class="w-full block" on:click={() => { addComment(selection.left) }}>Add a comment</button>
                </div>
                {/if}
            </div>
            <SheetOptions
                bind:settings
                show={sheetReady}
                hasMIDI={!(!MIDIObject)}
            />
        </div>
        <Guide />
        <hr class="mx-2 my-1">
        <a target="_blank" class="underline text-white" href="https://github.com/ArijanJ/midi-converter/issues">
            Suggestions, bug reports, or just need help?
        </a>
    </div>

    <section bind:this={trackChooser.element} id="track-chooser" class="z-40 w-full absolute flex flex-col gap-4 justify-center items-center content-center text-2xl"
             style="top: -110vh; height: 100vh; background: rgb(45,42,50);
                    background: linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%);
                    transition: all 0.6s ease-in-out;">
        <div id="tracks" class="flex flex-col gap-2">
        {#if tracks}
            {#each tracks as { name, length }, idx}
                <Track {name} {length} idx={idx+1}
                bind:selected={selectedTracks[idx]} />
            {/each}
        {/if}
        </div>
        <button on:click={() => { saveSheet(); trackChooser.hide() }}>Import selected tracks</button>
    </section>

    {#if sheetReady == true}
        <div class="flex flex-col items-start" on:click|self={resetSelection} on:keypress|self={() => {}} on:contextmenu|preventDefault>
            <SheetActions {settings}
                on:captureSheetAsImage={(event) => { captureSheetAsImage(event.detail.mode) }}
                on:copyText={() => {
                    settings.tempoMarks = true
                    settings.oorMarks = true
                    setTimeout(() => {
                        navigator.clipboard.writeText(container.firstChild.innerText)
                    }, 0)
                }}
                on:copyTransposes={() => {navigator.clipboard.writeText(sheetTransposes())}}
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
                <div style="width: max-content; font-family:{settings.font}; line-height:{settings.lineHeight}%" bind:clientWidth={notesContainerWidth} on:click|self={resetSelection} on:keypress|self={() => {}}>
                    {#each chords_and_otherwise as inner, index }
                        <!-- not a chord -->
                        {#if inner.type} 
                            {@const next_thing = chords_and_otherwise[+index+1]}
                            {@const previous_thing = chords_and_otherwise[+index-1]}
                            {#if inner.type === "break"}
                                {#if next_thing?.type != "comment"}
                                    <br>
                                {/if}
                            {:else if inner.type === "comment"}
                                {#if previous_thing?.type != "comment" && inner.notop != true && inner.kind != 'inline'}
                                    <br>
                                {/if}
                                {#if inner.kind == "custom" || inner.kind == "tempo" || inner.kind == "inline"}
                                    <span class="comment" on:click|stopPropagation 
                                      on:keypress|stopPropagation 
                                      contenteditable="true" 
                                      on:contextmenu|preventDefault
                                      style="white-space:pre-wrap;"
                                      on:focusout={(e) => { updateComment(index, e.target.innerText) }}>
                                        {#if inner.kind == 'inline'}
                                          {@html inner.text}
                                        {:else}
                                          {inner.text}
                                        {/if}
                                    </span>
                                {:else}
                                    <span on:contextmenu|preventDefault class="comment">{inner.text}</span>
                                {/if}
                                {#if inner.kind != 'inline'}
                                    <br>
                                {/if}
                            {/if}
                        {:else}
                            <!-- if it's an actual chord -->
                            <Chord chord={inner} 
                                   next={inner.next ?? undefined}
                                   selected={inner.selected} 
                                   index={inner.index} 
                                   on:select={setSelection}
                                   {settings}
                                />
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>