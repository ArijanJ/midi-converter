import { separator } from "../utils/VP.js";

const colors = {
    long: 'white',
    quadruple: '#a3f0a3',
    whole: '#74da74',
    half: '#9ada5a',
    quarter: '#c0c05a',
    eighth: '#da7e5a',
    sixteenth: '#daa6a6',
    thirtysecond: '#ff1900',
    sixtyfourth: '#9c0f00'
}

function color_for_chord(beat, difference) {
    // let beat = curr_note.tempo / 1000;

    // let difference = next_note.playTime - curr_note.playTime;
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

// These two are deprecated
// function yellow_to_green(value) {
//     value = Math.max(0.0, Math.min(4.0, value))
//     const red = 255 - (255/4.0)*value
//     const green = 255
//     return `rgb(${red}, ${green}, 0)`
// }

// function yellow_to_red(value) {
//     value = Math.max(0.0, Math.min(4.0, value))
//     const red = 255
//     const green = 255 - (255/4.0)*value 
//     return `rgb(${red}, ${green}, 0)`
// }

function colored_string(s, color, options = {}) {
    return `<span style="color:${color};${options.underline ? `border-bottom:2px solid ${color}` : ''}">${s}</span>`
}

function render_chord(chord, next, settings, selected) {
    // If capturing image, we want to hide the selection background
    const selection_color = settings?.capturingImage ? "rgba(0, 0, 0, 0)" : "rgba(97, 97, 97, 50)";

    let color

    let curr_note = chord?.notes?.[0]
    let next_note = next?.notes?.[0]
    if (!curr_note) return "";

    let beat = 0, difference = 0

    if (!next_note) {
        color = colors.long
    } else {
        beat = curr_note.tempo / 1000;
        difference = next_note?.playTime - curr_note.playTime - 0.5;
        color = color_for_chord(beat, difference)
    }

    let res = `<span style="color:${color}; ${selected ? "background-color: " + selection_color + ";" : ""}">`;

    let isChord = chord.notes.length > 1 && chord.notes.find((note) => note.valid === true)

    if (settings.oors === false)
        if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
            isChord = false

    if (isChord) {
        if (chord.is_quantized && settings.curlyQuantizes === true) {
            res += "{"
        } else
            res += "["
    }

    for (const note of chord.notes) {
        if (!note.valid) {
            res += "_";
            continue;
        }

        let draw_as_oor = (note.outOfRange === true && settings.oors === true)

        if (draw_as_oor === true) {
            let nonOors = chord.notes.filter(note => note.outOfRange === false)
            let startOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value - 1024)
            let endOors = chord.notes.filter(note => note.outOfRange === true && note.displayValue === note.value + 1024)

            const isFirstStartOor = (note === startOors[0])
            const isLastStartOor = (note === startOors[startOors.length - 1])
            const isFirstEndOorWithoutChord = !isChord && note === endOors[0];
            const isChordWithOnlyEndOorsAndIsFirstEndOor = isChord && nonOors.length === 0 && startOors.length === 0 && note === endOors[0];
            const isChordWithMoreThanOneNonOorAndIsFirstEndOor = isChord && nonOors.length > 0 && note === endOors[0];

            let text_representation = note.char

            // TODO: does not work with sequential quantize (e.g. you can get {:8p4q'} where the 4 is a regular non-oor note)
            if (
                isFirstStartOor ||
                isFirstEndOorWithoutChord ||
                isChordWithOnlyEndOorsAndIsFirstEndOor ||
                isChordWithMoreThanOneNonOorAndIsFirstEndOor
            ) {
                if (settings.oorMarks)
                    text_representation = settings.oorSeparator + text_representation
            }

            res += `<span style="display:inline-flex; justify-content: center; min-width: 0.6em; border-bottom: 2px solid; font-weight: 900">`
                + `${text_representation}</span>`

            if (settings.oorMarks)
                if (isLastStartOor && nonOors.length > 0)
                    res += `'`

        } else if (!draw_as_oor && !note.outOfRange) {
            res += note.char
        }
    } // end note loop

    if (isChord) {
        if (chord.is_quantized && settings.curlyQuantizes === true) {
            res += "}"
        } else
            res += "]"
    }

    // Separator
    res += settings.tempoMarks ?
        colored_string(separator(beat ?? undefined, difference), color)
        : ' ';
    return res + "</span>";
}

export { colors, render_chord, color_for_chord, colored_string }
