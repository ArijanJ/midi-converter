<script>
    import { colors, colored_string } from "../utils/Rendering.js";
    import { separator } from "../utils/VP.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let index;

    export let chord;
    export let next;

    export let selected; // undefined/true
    
    export let settings

    function color() {
        let beat = chord.notes[0].tempo / 1000;

        let difference = next.notes[0].playTime - chord.notes[0].playTime;
        difference -= 0.5;

        // console.log(chord.notes[0], next.notes[0])

        let color = colors.long;

        if (difference < beat / 16) color = colors.sixtyfourth;
        else if (difference < beat / 8) color = colors.thirtysecond;
        else if (difference < beat / 4) color = colors.sixteenth;
        else if (difference < beat / 2) color = colors.eighth;
        else if (difference < beat) color = colors.quarter;
        else if (difference < beat * 2)
            // Or equal to a beat
            color = colors.half;
        else if (difference < beat * 4) color = colors.whole;
        else if (difference < beat * 8) color = colors.quadruple;
        else if (difference < beat * 16) color = colors.long;

        return color;
    }

    const selection_color = "rgba(97, 97, 97, 50)";

    function colored_chord() {
        if (!chord?.notes?.[0]) return "";
        if (!next) {
            color = colors.long
        } else {
            color = color()
        }

        let res = `<span style="color:${color}; ${selected ? "background-color: " + selection_color + ";" : ""}">`;

        let isChord = chord.notes.length > 1 && chord.notes.find((note) => note.valid === true)

        if (settings.oors === false)
            if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
                isChord = false

        if (isChord) res += "[";

        for (const note of chord.notes) {
            if (!note.valid) {
                res += "_";
                continue;
            }

            let draw_as_oor = (note.outOfRange === true && settings.oors === true)
            
            if (draw_as_oor === true) {
                let nonOors = chord.notes.filter(note => note.outOfRange === false);
                let startOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value - 1024)
                let endOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value + 1024)
            
                const isFirstStartOor = (note === startOors[0])
                const isLastStartOor = (note === startOors[startOors.length-1])
                const isFirstEndOorWithoutChord = !isChord && note === endOors[0];
                const isChordWithOnlyEndOorsAndIsFirstEndOor = isChord && nonOors.length === 0 && startOors.length === 0 && note === endOors[0];
                const isChordWithMoreThanOneNonOorAndIsFirstEndOor = isChord && nonOors.length > 0 && note === endOors[0];

                if (
                    isFirstStartOor ||
                    isFirstEndOorWithoutChord ||
                    isChordWithOnlyEndOorsAndIsFirstEndOor ||
                    isChordWithMoreThanOneNonOorAndIsFirstEndOor
                ) {
                    if (settings.tempoMarks)
                        res += `${settings.oorSeparator}${note.char}`
                    else if (!settings.tempoMarks)
                        res += `<span style="border-bottom: 2px solid ${color}">${note.char}</span>`
                }
                
                if (settings.tempoMarks)
                    if (isLastStartOor && nonOors.length > 0)
                        res += `'`
            
            } else if (!draw_as_oor && !note.outOfRange) {
                res += colored_string(`${note.char}`, color)
            }
        } // end note loop

        if (isChord) res += "]";

        // Separator
        let beat = chord.notes[0].tempo / 1000;
        let difference = next?.notes[0]?.playTime - chord.notes[0].playTime ?? undefined
        difference -= 0.5;

        // console.log('tm',settings.tempoMarks)
        // console.log('oors',settings.oors)
        res += settings.tempoMarks ? 
            colored_string(separator(beat, difference), color)
            : ' ';
        return res + "</span>";
    }
</script>

<span
    class="chord-block" style="font-family: {settings.font}"
    on:contextmenu|preventDefault
    on:mousedown|stopPropagation={(e) => {
        switch (e.button) {
            case 0: // Left mouse button
                dispatch("select", { index: +index, by: -1 });
                break;
            case 1: // Middle mouse button
                e.preventDefault();
                break;
            case 2: // Right mouse button
                dispatch("select", { index: +index, by: 1 });
                e.preventDefault();
                break;
        }
    }}
>
    {@html colored_chord()}
</span>

<style>
    .chord-block {
        all: unset;
    }
    .chord-block:hover {
        /* filter: brightness(75%); */
        background-color: #3d3a42;
        cursor: pointer;
    }
    .chord-block:active {
        all: unset;
    }
</style>
