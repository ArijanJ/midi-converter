<script>
    import { colors, colored_string } from "../utils/Rendering.js"
    import { separator } from "../utils/VP.js"
    import { Sheet } from "../utils/VP.js"

    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher()

    export let index /* ID */

    export let line /* Sheet-like */
    $: {
        previousChord = { notes: [{ playTime: -999999 }] }
        originalSheet = new Sheet(line.chords)
        sheet = originalSheet.transpose(line.transposition, settings.pShifts, settings.pOors)
        penalty = 0.000
    }

    export let passedNext // Next note for coloring purposes

    let originalSheet = new Sheet(line.chords)
    let sheet = originalSheet

    export let sameTranspositionAsPrevious = false

    export let settings
    
    let penalty = 0.000
    let previousChord = { notes: [{ playTime: -999999 }] }

    function colored_chord(chord, color) {
        let res = `<span style="color:${color}">`

        let isChord = (chord.notes.length > 1 && chord.notes.find(note => note.valid === true))
        if (settings.oors === false)
        if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
            isChord = false

        if (isChord) res += '['

        for (const note of chord.notes) {
            if (!note.valid) { res += '_'; continue }

            if (note.outOfRange === true) {
                if (settings.oors === true)
                res += `<span style="display:inline-block; border-bottom: 2px solid ${color}">${note.char}</span>`
            } else res += note.char
        }

        if (isChord) res += ']'

        return res + '</span>'
    }

    function render(sheet) {
        const negtransposition = -line.transposition

        let result = '' 
        if (!sameTranspositionAsPrevious) {
            result += colored_string(`Transpose by: ${negtransposition > 0 ? '+' : ''}${negtransposition}`, 'white')
            if (line.difference) result += colored_string(` (${-line.difference > 0 ? '+' : ''}${-line.difference})`, 'white')
            result += '\n'
        }

        let chords = sheet.chords
        for (let i = 0; i < chords.length; i++) {
            if (!chords) { result += '[bad-midi-file!]<br>'; continue }

            const current = {
                chord: chords[i],
            }; current.note = current.chord?.notes[0]

            const next = {
                chord: chords[i+1],
            }; next.note = next.chord?.notes[0]

            if (!current.note) { continue }

            if (!next.note) {
                if (passedNext) { next.note = passedNext; }
                else { result += colored_chord(current.chord, 'white'); continue  }
            }

            let beat = current.note.tempo / 1000

            let difference = next.note.playTime - current.note.playTime 
            if(current.chord.is_quantized)
                difference = next.note.playTime - current.chord.notes.slice(-1)[0].playTime 
            difference -= 0.5

            let color = colors.long

            if (difference < beat / 16)
                color = colors.sixtyfourth
            else if (difference < beat / 8)
                color = colors.thirtysecond
            else if (difference < beat / 4)
                color = colors.sixteenth
            else if (difference < beat / 2)
                color = colors.eighth
            else if (difference < beat)
                color = colors.quarter
            else if (difference < beat * 2) // Or equal to a beat
                color = colors.half
            else if (difference < beat * 2)
                color = colors.whole
            else if (difference < beat * 4)
                color = colors.quadruple
            else if (difference < beat * 8)
                color = colors.long

            result += colored_chord(current.chord, color)
            result += (settings.tempoMarks ? colored_string(separator(beat, difference), color) : ' ')
        }
        return result
    }
</script>

<div class="viewer">
    <button class="line" 
            on:click={() => dispatch('clicked', { index: +index, by: 1 })}
            on:contextmenu|preventDefault={() => dispatch('clicked', {index: +index, by: -1})}
            on:auxclick|preventDefault={() => dispatch('auto', {index: +index, sheet: originalSheet})}
            on:mousedown={(e) => {if(e.which === 2) e.preventDefault()}}>
        {@html render(sheet)}
    </button>
</div>

<style>
    .viewer {
        display: block;
        white-space: pre-line;
        overflow-y: scroll;
        overflow-x: hidden;
        font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
            "Lucida Sans", Arial, sans-serif;
        /* height: 100%; */
        padding: 0.1em;
        background: #2D2A32;
    }

    .line {
        all: unset;
    }
    .line:hover {
        filter: brightness(75%);
        cursor: pointer
    }
    .line:active {
        all: unset
    }
</style>

