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
    constructor(notes, sequentialQuantize = true) {
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
            this.notes = no_dupes.sort((a, b) => { return a.displayValue - b.displayValue })
        } else {
            if (sequentialQuantize)
                this.notes = notes
            else
                this.notes = notes.sort((a, b) => { return a.displayValue - b.displayValue })
        }
    }
}

class Sheet {
    constructor(chords) { this.chords = chords }

    transpose(by, shifts='Start', oors='Start', sequentialQuantize=true) { /* Does not mutate */
        if (!this.chords) return
        let newChords = []
        this.chords.forEach((chord) => {
            let newChord = []
            chord.notes.forEach((note) => {
                newChord.push(new Note(note.value + by, note.playTime, note.tempo, note.BPM, note.delta, shifts, oors))
            })
            newChords.push(new Chord(newChord, sequentialQuantize))
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

// Takes NOTE_ON and SET_TEMPO events
function generateSheet(events, quantize = 100, shifts = 'Start', oors = 'Start', sequentialQuantize = true) /* -> Sheet */ { 
    // console.log({ quantize, shifts, oors, sequentialQuantize })

    let chords = []
    let currentChord = []
    let lastPlaytime = events[0].playTime ?? 0.0

    // default tempo
    let nextBPM = 120
    let nextTempo = 500000

    // Generate chords
    events.forEach(element => {
        const isNoteSpeedValid = element.tempo && element.tempoBPM && element.tempo !== 0 && element.tempoBPM !== 0
        if(isNoteSpeedValid && element.subtype == 0x51) { // SET TEMPO META EVENT
            nextTempo = element.tempo
            nextBPM = element.tempoBPM
            return
        } // else NOTE_ON
        const key       =  element.param1
        const playtime  =  element.playTime
        const delta     =  element.delta
        if(Math.abs(playtime - lastPlaytime) < quantize) {
            currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors))
            lastPlaytime = playtime
        } else { // Submit the chord
            chords.push(new Chord(currentChord, sequentialQuantize))
            currentChord = []
            currentChord.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors)) // Add the note as first if it's different
            lastPlaytime = playtime
        }
    })

    chords.push(new Chord(currentChord))
    return new Sheet(chords)
}

const vpScale =
    `1234567890qwert` +

    `1!2@34$5%6^78*9(0` +
    `qQwWeErtTyYuiIoOpP` +
     `asSdDfgGhHjJklL` +
      `zZxcCvVbBnm` +

    `yuiopasdfghj`

const lowercases = '1234567890qwertyuiopasdfghjklzxcvbnm'

/** Returns the transposition of a sheet (line) within [-deviation, +deviation] with the least lowercase letters */
function bestTransposition(sheet, deviation, stickTo = 0, strict = false, atLeast = 4, startFrom = 0) {
    if(!sheet?.chords) return stickTo
    function countLowercases(sheet) {
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

    let sticks = countLowercases(sheet.transpose(stickTo))

    let most = sticks
    let best = stickTo

    function consider(deviation) {
        let contender = sheet.transpose(deviation)
        let lowercases = countLowercases(contender)
        // console.log([`stickTo: ${stickTo}`,
        //              `Most: ${most}`,
        //              `Original: ${sheet.text()}`,
        //              `Stuck: ${sheet.transpose(stickTo).text()}`,
        //              `Transposed by ${deviation}: ${sheet.transpose(deviation).text()}`,
        //              `Gained: ${lowercases - most}`].join('\n'))
        if (lowercases > most) {
            if (!strict) {
                let difference = lowercases - most
                if (difference < atLeast) { // Minimal lowercase gain, not worth it, don't consider
                    return
                }
            }
            // console.log(`Good to go with ${most}, transposed by ${deviation}, sheet: ${sheet.text()}`)
            most = lowercases
            best = deviation
        }
    }

    // Run from stickTo to -deviation, then from stickTo to +deviation
    for (let i = startFrom; i <= deviation; i++) {
        consider(stickTo - i)
        consider(stickTo + i)
    }

    // console.log(`Giving back ${best}`)
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
