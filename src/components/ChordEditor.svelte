<script>
    import { createEventDispatcher } from "svelte"
    import { render_chord } from "../utils/Rendering"

    import { Note, Chord } from "../utils/VP"
    import Keyboard from "./Piano/Keyboard.svelte"

    let dispatch = createEventDispatcher()

    let firstNote = undefined
    // Stores the chord while it's being edited (not saved yet in case the user wants to cancel)
    let tempBuffer = undefined

    export let chord = undefined
    $: {
        if (chord?.notes?.length > 0) {
            firstNote = chord.notes[0]
            tempBuffer = JSON.parse(JSON.stringify(chord))
        }
    }

    export let settings = undefined
    export let dialog = undefined

    let noteToAdd = undefined

    let removeNote = (i) => {
        if(i.detail) {
            // This is now a MIDI note value passed from the Keyboard
            i = tempBuffer.notes.findIndex(note => note.original === i.detail)
        }
        tempBuffer.notes.splice(i, 1)
        tempBuffer = new Chord(tempBuffer) // regen for correct sorting
    }

    let addNote = (event) => {
        let clone = JSON.parse(JSON.stringify(firstNote))
        let transposition = clone.value - clone.original

        clone.original = event.detail
        clone.value = clone.original + transposition

        tempBuffer.notes.push(new Note(clone))
        tempBuffer = new Chord(tempBuffer) // regen for correct sorting
    }

    let applyChanges = () => {
        let notes = tempBuffer.notes.map(n => new Note(n))
        let newChord = new Chord(notes)
        dispatch('chordChanged', newChord)
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click|self={() => {dialog.close()}} class="rounded-lg overflow-hidden p-2">
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

                <!-- Don't really need this I suppose? -->
                <!-- <div id="buttons">
                    <input type="text" class="w-12" bind:value={noteToAdd}>
                    <button>Add from QWERTY (at {firstNote.transposition} transposition)</button>
                </div> -->

                <hr class="my-2 mx-1 border-black border-1 w-full">
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