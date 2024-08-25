<script>
    import { createEventDispatcher } from "svelte"
    import { render_chord } from "../utils/Rendering"

    import { Note, Chord } from "../utils/VP"
    import Keyboard from "./Piano/Keyboard.svelte"

    let dispatch = createEventDispatcher()

    let firstNote = undefined
    // Stores the chord while it's being edited (not saved yet in case the user wants to cancel)
    let tempBuffer = undefined

    let overrides = {shifts: undefined, oors: undefined}
    let hasOverrides = () => {
        return !([undefined, 'keep'].includes(overrides.shifts) && [undefined, 'keep'].includes(overrides.oors))
    }    

    export let chord = undefined
    $: {
        if (chord?.notes?.length > 0) {
            firstNote = chord.notes[0]
            tempBuffer = JSON.parse(JSON.stringify(chord))
        }
    }

    export let settings = undefined
    export let dialog = undefined

    let removeNote = (i) => {
        if(i.detail) {
            // This is now a MIDI note value passed from the Keyboard
            i = tempBuffer.notes.findIndex(note => note.original === i.detail)
        }
        console.log('removing', i, tempBuffer.notes[i])

        tempBuffer.notes.splice(i, 1)
        
        updateWithOverrides()
    }

    let addNote = (event) => {
        let clone = JSON.parse(JSON.stringify(firstNote))
        let transposition = clone.value - clone.original

        clone.original = event.detail
        clone.value = clone.original + transposition

        tempBuffer.notes.push(new Note(clone))
        
        updateWithOverrides()
    }
    
    let updateWithOverrides = () => {
        let newNotes = tempBuffer.notes.map(n => {
            let newNote = new Note(n.value, n.playTime, n.ticks,
                n.tempo, n.BPM, n.delta,
                tempBuffer.overrides?.shifts ?? 'keep',
                tempBuffer.overrides?.oors ?? 'keep', 
                false
            )
            newNote.original = n.original
            return newNote 
        })
        let newChord = new Chord(newNotes, false)
        if(hasOverrides()) {
            newChord.overrides = overrides
        }
        tempBuffer = newChord
    }

    let applyChanges = () => {
        let notes = tempBuffer.notes.map(n => new Note(n))
        let newChord = new Chord(notes, false)
        if(hasOverrides()) {
            newChord.overrides = tempBuffer.overrides
            // console.log('sending overrides:', tempBuffer.overrides)
        }
        dispatch('chordChanged', newChord)
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => {overrides = {shifts: 'keep', oors: 'keep'}; dispatch('closed')}} 
        on:click|self={() => {dialog.close(); dispatch('closed')}} 
        class="rounded-lg overflow-hidden p-2">
    <div class="flex flex-col items-center gap-2">
        <div id="chord" style="background-color: #2D2A32" class="text-2xl p-1 rounded-md">
            {@html render_chord(tempBuffer, undefined, settings, false)}
        </div>

        {#if tempBuffer}
            <div class="flex flex-col items-center justify-center gap-2">
                <p>Remove a note:</p>
                <div class="flex flex-row">
                    {#each tempBuffer.notes as note, i}
                        <div class="w-full">
                            <button on:click={() => { removeNote(i) }}
                                    class="text-2xl text-nowrap border-none">
                                {note.char ?? '[invalid]'}
                            </button>
                        </div>
                    {/each}
                </div>
                <p>Toggle a note:</p>

                <Keyboard 
                    octaves=7
                    keysPressed={tempBuffer.notes.map(note => note.original)}
                    on:noteon={addNote}
                    on:noteoff={removeNote}/>

                {#if tempBuffer.notes.length > 1}
                    <hr class="my-2 mx-1 border-gray-500 border-1 w-full">
                    <p>Overrides (optional):</p>
                    <div class="flex flex-row gap-2">
                        <div class='select-div'>
                            <label for='shifts-position'>Shifted notes at:</label>
                            <select name='shifts-position' id='shifts-position' bind:value={overrides.shifts}
                                    on:change={() => { 
                                        if (!('overrides' in tempBuffer))
                                            tempBuffer.overrides = {}
                                        tempBuffer.overrides.shifts = overrides.shifts
                                        updateWithOverrides()
                                    }}>
                                <option selected value='keep'>Keep</option>
                                <option value='Start'>Start</option>
                                <option value='End'>End</option>
                            </select>
                        </div>

                        <div class='select-div'>
                            <label for='oors-position'>Out of range notes at:</label>
                            <select name='oors-position' id='oors-position' bind:value={overrides.oors}
                            on:change={() => { 
                                if (!('overrides' in tempBuffer))
                                    tempBuffer.overrides = {}
                                tempBuffer.overrides.oors = overrides.oors
                                updateWithOverrides()
                            }}>
                                <option selected value='keep'>Keep</option>
                                <option value='Inorder'>Inorder</option>
                                <option value='Start'>Start</option>
                                <option value='End'>End</option>
                            </select>
                        </div>
                    </div>
                {/if}
                <hr class="my-2 mx-1 border-gray-500 border-1 w-full">
                <button on:click={() => { dialog.close(); applyChanges() }}>Apply</button>
            </div>
        {/if}
    </div>
</dialog>

<style>
    * {
        color: black
    }
</style>