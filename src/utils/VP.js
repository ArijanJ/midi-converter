const firstPossibleNote  =  21
const lastPossibleNote   =  108

const capitalNotes = "!@#$%^&*()QWERTYUIOPASDFGHJKLZXCBVNM"

class Note {
    constructor(value, playTime, tempo, BPM, delta, shifts='keep', oors='keep') {
        this.value      =  value
        this.playTime   =  playTime
        this.delta      =  delta
        this.char       =  vpScale[value - firstPossibleNote]
        this.tempo      =  tempo
        this.BPM        =  BPM

        this.valid      = (value >= 21 && value <= 108)
        this.outOfRange = (value <= 35 || value >=  97)

        // Make sure that capital notes go before lowercase ones
        if (capitalNotes.includes(this.char)) {
            if (shifts === 'Start') this.displayValue = value - lastPossibleNote
            else if (shifts == 'End') this.displayValue = value + lastPossibleNote
        }
        else if (this.outOfRange) {
            if (oors === 'Start') this.displayValue = value - 1024
            else if (oors == 'End') this.displayValue = value + 1024
        }
        else this.displayValue = value
    }
}

class Chord {
    constructor(notes, classicChordOrder = true, sequentialQuantize = true) {
        let is_quantized = false
        let previous_note = notes[0]

        for (let note of notes) {
            if (note.playTime != previous_note.playTime) {
                is_quantized = true
                break
            }
            previous_note = note
        }
        this.is_quantized = is_quantized

        if (!is_quantized) {
            let values = []
            let no_dupes = []

            notes.forEach(note => {
                if (!(values.includes(note.value))) {
                    values.push(note.value)
                    no_dupes.push(note)
                }
            })

            this.notes = this.#sortChord(no_dupes, classicChordOrder);
        } else if (is_quantized) {
            if (sequentialQuantize)
                this.notes = notes
            else {
                this.notes = this.#sortChord(notes, classicChordOrder);
            }
        }
    }

    #sortChord(notes, classicChordOrder) {
        return classicChordOrder ? this.#classicChordOrderSort(notes) : notes.sort((a, b) => a.displayValue - b.displayValue);
    }

    // ordering notes in chords based off the first vp converter created
    #classicChordOrderSort(notes) {
        let sortedKeys = [];
        let numericNotes = [];
        let upperNotes = [];
        let lowerNotes = [];

        let startOors = [];
        let endOors = [];

        let lastNonOorNote;

        // sort by midi value instead of display value first
        notes = notes.sort((a, b) => a.value - b.value);

        // split-up notes into categories, also find the last non-oor note
        for (const note of notes) {
            if (note.outOfRange) {
                if (note.value - 1024 === note.displayValue) {
                    startOors.push(note);
                }
                else if (note.value + 1024 === note.displayValue) {
                    endOors.push(note);
                }
            }
            else {
                if (!isNaN(note.char)) {
                    numericNotes.push(note);
                }
                else if (capitalNotes.includes(note.char)) {
                    upperNotes.push(note);
                }
                else {
                    lowerNotes.push(note);
                }

                lastNonOorNote = note;
            }
        }

        // determine the order based on the last non-oor note, if any
        if (lastNonOorNote) {
            sortedKeys = capitalNotes.includes(lastNonOorNote.char)
                ?
                [...numericNotes, ...lowerNotes, ...upperNotes]
                :
                [...upperNotes, ...numericNotes, ...lowerNotes]
        }

        return [...startOors, ...sortedKeys, ...endOors];
    }
}

class Sheet {
    constructor(chords) { this.chords = chords; this.missingTempo = false }

    transpose(by, shifts='Start', oors='Start', classicChordOrder=true, sequentialQuantize=true) { /* Returns a new sheet */
        if (!this.chords) return
        let newChords = []

        this.chords.forEach((chord) => {
            let newChord = []

            chord.notes.forEach((note) => {
                newChord.push(new Note(note.value + by, note.playTime, note.tempo, note.BPM, note.delta, shifts, oors))
            })

            newChords.push(new Chord(newChord, classicChordOrder, sequentialQuantize))
        })
        return new Sheet(newChords)
    }

    countNotes() {
        let notes = 0
        for (let chord of this.chords) {
            for (let _ of chord.notes)
                notes++
        }
        return notes
    }

    /** Returns the approximate text representation of the sheet for debugging purposes */
    text() {
        let result = '' 

        let chords = this.chords
        for (let i = 0; i < chords.length; i++) {
            if (!chords) { result += '[no-chords] '; continue }

            const chord = chords[i]

            let isChord = (chord.notes.length > 1 && chord.notes.find(note => note.valid === true))
            if (chord.notes.filter(note => note.outOfRange === false).length <= 1)
                isChord = false

            if (isChord) result += '['

            for (const note of chord.notes) {
                result += note.char
            } 

            if (isChord) result += ']'

            result += ' '
        }
        return result
    }
}

function validNoteSpeed(event) {
    return event.tempo && event.tempoBPM && event.tempo !== 0 && event.tempoBPM !== 0
}

function generateSheet(events /* Only NOTE_ON & SET_TEMPO events */, settings) /* -> Sheet */ {
    let quantize = settings.quantize
    let shifts = settings.pShifts
    let oors = settings.pOors
    let classicChordOrder = settings.classicChordOrder
    let sequentialQuantize = settings.sequentialQuantize
    let bpm = settings.bpm

    let chords = []
    let currentChord = []
    let lastPlaytime = undefined

    let hasTempo = false

    let nextBPM = bpm
    let nextTempo = bpm*4166.66 // Magic number

    // Generate chords
    events.forEach(element => {
        // if event is SET_TEMPO
        if (element.subtype == 0x51 && validNoteSpeed(element)) {
            hasTempo = true
            nextTempo = element.tempo
            nextBPM = element.tempoBPM
            return
        } 
        // event is NOTE_ON
        const key       =  element.param1
        const playtime  =  element.playTime
        const delta     =  element.delta

        if (!lastPlaytime) lastPlaytime = playtime

        if (Math.abs(playtime - lastPlaytime) < quantize) {
            currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors))
            lastPlaytime = playtime
        } else {
            if (currentChord.length == 0) {
                lastPlaytime = undefined
                currentChord = []
                return
            }

            // Submit the chord and start the next one
            chords.push(new Chord(currentChord, classicChordOrder, sequentialQuantize))

            currentChord = []
            currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors))

            lastPlaytime = playtime
        }
    })

    // Final chord insertion to make sure no notes are left
    chords.push(new Chord(currentChord, classicChordOrder))

    let resultingSheet = new Sheet(chords)

    if (!hasTempo)
        console.log(`No tempo found in sheet, set to ${nextBPM}/${nextTempo}`); 

    resultingSheet.missingTempo = !hasTempo

    return resultingSheet
}

const vpScale =
    `1234567890qwert` +

    `1!2@34$5%6^78*9(0` +
    `qQwWeErtTyYuiIoOpP` +
     `asSdDfgGhHjJklL` +
      `zZxcCvVbBnm` +

    `yuiopasdfghj`

const lowercases = '1234567890qwertyuiopasdfghjklzxcvbnm'

/** Returns the transposition of a sheet (line) within [-deviation, +deviation] with the least "effort" to shift */
function bestTransposition(sheet, deviation, stickTo = 0, strict = false, atLeast = 4, startFrom = 0) {
    if(!sheet?.chords) return stickTo

    function calculateScore(sheet) {
        let monochord = []
        for (let chord of sheet.chords) {
            for (let note of chord.notes)
                monochord.push({ char: note.char, oor: note.outOfRange, valid: note.valid })
        }
        // return monochord.filter(note => lowercases.includes(note.char) && note.oor === false && note.valid === true).length
        let all = monochord.filter(note => note.oor === false && note.valid === true)
        let lowercaseCount = all.filter(note => lowercases.includes(note.char))
        let uppercaseCount = all.filter(note => !(lowercases.includes(note.char)))
        return Math.abs(uppercaseCount.length-lowercaseCount.length)
    }

    let stickScore = calculateScore(sheet.transpose(stickTo))

    let most = stickScore
    let best = stickTo

    function consider(deviation) {
        let contender = sheet.transpose(deviation)
        let score = calculateScore(contender)
        // console.log('atleast:', atLeast)
        // console.log([`stickTo: ${stickTo}`,
        //              `Most: ${most}`,
        //              `Original: ${sheet.text()}`,
        //              `Stuck: ${sheet.transpose(stickTo).text()}`,
        //              `Transposed by ${deviation}: ${sheet.transpose(deviation).text()}`,
        //              `Score: ${score}`,
        //              `StartFrom: ${startFrom}`,
        //              `Gained: ${score - most}`].join('\n'))
        if (score > most) {
            if (!strict) {
                let difference = score - most
                if (difference <= atLeast) { // Minimal lowercase gain, not worth it, don't consider
                    return
                }
            }
            // console.log(`Good to go with ${most}, transposed by ${deviation}, sheet: ${sheet.text()}`)
            most = score
            best = deviation
        }
    }

    for (let i = 0; i <= deviation; i++) {
        consider(stickTo - i)
        consider(stickTo + i)
    }
    return best
}

function separator(beat, difference) {
    if (difference < beat / 4)
        return '-'
    if (difference < beat / 2)
        return ' '
    if (difference < beat) // Or equal to a beat
        return ' - '
    if (difference < beat * 2)
        return ', '
    if (difference < beat * 2.5)
        return '. '
    if (difference < beat * 3)
        return '.. '
    if (difference < beat * 4)
        return '... '
    else return '\n' // Long pause
}

export { vpScale, Sheet, Note, Chord, generateSheet, bestTransposition, separator }
