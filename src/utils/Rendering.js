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
    const selection_color = "rgba(97, 97, 97, 50)";

    let color

    let curr_note = chord?.notes?.[0]
    let next_note = next?.notes?.[0]
    if (!curr_note) return {html: "", text: ""};
    
    let beat = 0, difference = 0

    if (!next_note) {
        color = colors.long
    } else {
        beat = curr_note.tempo / 1000;
        difference = next_note?.playTime - curr_note.playTime - 0.5;
        color = color_for_chord(beat, difference)
    }

    let text = "";
    let res = `<span style="color:${color}; ${selected ? "background-color: " + selection_color + ";" : ""}">`;

    let isChord = chord.notes.length > 1 && chord.notes.find((note) => note.valid === true)

    if (settings.oors === false)
        if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
            isChord = false

    if (isChord) {
        if (chord.is_quantized && settings.curlyQuantizes === true) {
            res += "{"
            text += "{"
        } else {
            res += "["
            text += "["
        }
    }

    for (const note of chord.notes) {
        if (!note.valid) {
            res += "_";
            text += "_";
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
                if (settings.tempoMarks) {
                    text += `${settings.oorSeparator}${note.char}`
                }
                else {
                    text += note.char
                }

                res += `<span style="display:inline-flex; justify-content: center; min-width: 10px; border-bottom: 2px solid; font-weight: 900">${note.char}</span>`

            }
            
            if (settings.tempoMarks)
                if (isLastStartOor && nonOors.length > 0)
                    text += `'`
        
        } else if (!draw_as_oor && !note.outOfRange) {
            res += note.char
            text += note.char
        }
    } // end note loop

    if (isChord) {
        if (chord.is_quantized && settings.curlyQuantizes === true) {
            res += "}"
            text += "}"
        } else {
            res += "]"
            text += "]"
        }
    }

    // Separator
    const sep = separator(beat ?? undefined, difference)
    res += settings.tempoMarks ? 
        colored_string(sep, color)
        : ' ';

    text += settings.tempoMarks ?
        sep
        : ' ';

    // console.log(text)
    return {html: res + "</span>", text: text};
}

export { colors, render_chord, color_for_chord, colored_string }
