const firstPossibleNote  =  21
const lastPossibleNote   =  108

const capitalNotes = "!@#$%^&*()QWERTYUIOPASDFGHJKLZXCBVNM"

let not_chord = (x) => !x || (x.type && (x.type == "break" || x.type == "comment"))
let is_chord = (x) => !not_chord(x)

class Note {
    constructor(value, playTime, tempo, BPM, delta, shifts='keep', oors='keep') {
        this.original   =  value
        this.value      =  value
        this.playTime   =  playTime
        this.delta      =  delta
        this.char       =  vpScale[value - firstPossibleNote]
        this.tempo      =  tempo
        this.BPM        =  BPM
        
        // Only correct at runtime
        this.transposition = () => this.value - this.original

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
            else {
                // Inorder
                if (lowerOorScale.includes(this.char)) {
                    this.displayValue = value - 1024
                }
                else {
                    this.displayValue = value + 1024
                }
            }
        }
        else this.displayValue = value
    }
    
    new_with_saved_original(newValue) {
        let result = new Note(newValue, this.playTime, this.tempo, this.BPM, this.delta, this.shifts, this.oors)
        result.original = this.original
        return result
    }
}

class Chord {
    constructor(notes, classicChordOrder = true, sequentialQuantize = true) {
        let is_quantized = false
        let previous_note = notes[0]
        
        // console.log(previous_note);
        
        this.classicChordOrder = classicChordOrder
        this.sequentialQuantize = sequentialQuantize

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
    
    transpose = (by, relative = false, mutate = false) => {
        if (relative) {
            by = this.notes[0].transposition() + by
        }
        
        let new_chord = new Chord(this.notes, this.classicChordOrder, this.sequentialQuantize)
        for (let i = 0; i < new_chord.notes.length; i++) {
            let assignee = mutate ? this : new_chord 
            let new_notes = assignee.notes.map(note => note.new_with_saved_original(note.original + by)) // create a note with the correct "original" value
            new_chord = new Chord(new_notes, this.classicChordOrder, this.sequentialQuantize)
            assignee.notes = new_chord.notes
        }

        return new_chord
    }
    
    display = () => {
        if (!this.notes[0]?.char) return '?'

        else if (this.notes.length == 1) {
            return this.notes[0].char
        }

        else {
            let result = []
            for (let note of this.notes) {
                result.push(note.char ?? '?')
            }
            return '[' + result.join('') + ']'
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

function generateChords(events /* Only NOTE_ON & SET_TEMPO events */, settings, chords_and_otherwise = undefined) {
    const error_range = 0.5
    let penalty = 0.000

    function shouldBreak(note, penalty) {
        // console.log("tobreak:", note)
        if (!note) return false
        let tempo_ms = note.tempo / 1000 // turn 6/52174 into 652.174
        let goal = tempo_ms * settings.beats
        let normalizedplaytime = note.playTime - penalty
        // console.log(normalizedplaytime + error_range)
        // console.log(goal)
        if (normalizedplaytime + error_range >= goal) {
            // console.log("BREAKING!")
            return {doBreak: true, newPenalty: penalty + normalizedplaytime}
        }
        return {doBreak: false, newPenalty: penalty}
    }

    // console.log(settings)

    let quantize = settings.quantize
    let shifts = settings.pShifts
    let oors = settings.pOors
    let classicChordOrder = settings.classicChordOrder
    let sequentialQuantize = settings.sequentialQuantize
    let bpm = settings.bpm

    let chords = []
    let current_notes = []
    let lastPlaytime = undefined

    let previousBPM = undefined
    let previousTempo = undefined

    let nextBPM = bpm
    let nextTempo = bpm*4166.66 // Magic number

    function validNoteSpeed(event) {
        return event.tempo && event.tempoBPM && event.tempo !== 0 && event.tempoBPM !== 0
    }

    let index = 0
    let did_chord_quantize_math = false
    // Generate chords
    events.forEach(element => {
        // if event is SET_TEMPO
        if (element.subtype == 0x51 && validNoteSpeed(element)) {
            nextTempo = element.tempo
            nextBPM = element.tempoBPM
            if (previousTempo == undefined) {
                if(settings.bpmChanges)
                    chords.push({ type: 'comment', kind: 'tempo', text: `Tempo: ${Math.round(element.tempoBPM)} BPM` })
            }
            else if (previousTempo != undefined && (previousTempo != element.tempo) && (previousBPM != element.tempoBPM)) {
                if(settings.bpmChanges) {
                    let newBPM = Math.round(element.tempoBPM)
                    
                    let larger = newBPM > previousBPM ? newBPM : previousBPM
                    let smaller = newBPM < previousBPM ? newBPM : previousBPM
                    
                    let percent = ((larger - smaller) / smaller) * 100
                    
                    if (percent < settings.minSpeedChange) return
                    // chords.push({ type: 'comment', text: `BPM change to ${Math.round(element.tempoBPM)} (${Math.round(percent)}% ${newBPM > previousBPM ? 'faster' : 'slower'})` })
                    chords.push({ type: 'comment', kind: 'tempo', text: `${Math.round(percent)}% ${newBPM > previousBPM ? 'faster' : 'slower'} - BPM changed to ${Math.round(element.tempoBPM)}` })
                }
            }
            previousBPM = element.tempoBPM
            previousTempo = element.tempo
            return
        } 
        // event is NOTE_ON
        const key      = element.param1
        const playtime = element.playTime
        const delta    = element.delta
        
        if (!key) return

        if (lastPlaytime == undefined)
            lastPlaytime = playtime

        if (Math.abs(playtime - lastPlaytime) < quantize) {
            current_notes.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors))
            lastPlaytime = playtime
        } else {
            if (current_notes.length == 0) {
                lastPlaytime = playtime
                return
            }

            // Submit the chord and start the next one
            let resulting_chord = new Chord(current_notes, classicChordOrder, sequentialQuantize)
            resulting_chord.index = index
            
            // Transpose to previous
            let same_chord_that_existed_previously = chords_and_otherwise?.find((e) => e.index === index)
            // console.log(same_chord_that_existed_previously, index, chords_and_otherwise)
            if (same_chord_that_existed_previously && same_chord_that_existed_previously.notes[0].transposition() != 0) {
                resulting_chord.transpose(same_chord_that_existed_previously.notes[0].transposition(), false, true)
            }
            
            chords.push(resulting_chord)
            index++

            current_notes = []
            current_notes.push(new Note(key, playtime, nextTempo, nextBPM, delta, shifts, oors))

            lastPlaytime = playtime
        }

        const { doBreak, newPenalty } = shouldBreak(current_notes[0], penalty)
        penalty = newPenalty
        if(doBreak) { chords.push({type: 'break'}) }
    })

    // Final chord insertion to make sure no notes are left
    // chords.push(new Chord(currentChord, classicChordOrder))
    let resulting_chord = new Chord(current_notes, classicChordOrder, sequentialQuantize)
    resulting_chord.index = index

    // Transpose to previous
    let same_chord_that_existed_previously = chords_and_otherwise?.find((e) => e.index === index)
    if (same_chord_that_existed_previously && same_chord_that_existed_previously.notes[0].transposition() != 0) {
        resulting_chord.transpose(same_chord_that_existed_previously.notes[0].transposition(), false, true)
    }
            
    chords.push(resulting_chord)
    
    index++

    if (!previousTempo)
        console.log(`No tempo found in sheet, set to ${nextBPM}/${nextTempo}`); 

    // resultingSheet.missingTempo = !hasTempo

    return chords
}

const vpScale =
    `1234567890qwert` +

    `1!2@34$5%6^78*9(0` +
    `qQwWeErtTyYuiIoOpP` +
     `asSdDfgGhHjJklL` +
      `zZxcCvVbBnm` +

    `yuiopasdfghj`

const lowercases = '1234567890qwertyuiopasdfghjklzxcvbnm'

export const lowerOorScale = lowercases.slice(0, 15)
export const upperOorScale = lowercases.slice(15, 27)

/* Higher is better */
function score(chord) {
    let good_notes = chord.notes.filter(note => note.outOfRange === false && note.valid === true)
   
    let lowercase_notes = good_notes.filter(note => lowercases.includes(note.char))
    let uppercase_notes = good_notes.filter(note => !(lowercases.includes(note.char)))

    return ((good_notes.length * 2) + Math.abs(uppercase_notes.length-lowercase_notes.length))
}

function best_transposition_for_chord(chord, deviation, stickTo = 0) {
    if (!chord) return

    // console.log(chord)
    
    // console.log('[btfc] entry:', chord.display())
    if (not_chord(chord)) return stickTo
    
    let best_transpositions = [stickTo]
    
    // reconsider: oors are valid notes
    let good_note_count = chord.notes.filter(note => note.outOfRange === false && note.valid === true).length
    // console.log('goodnote count: ' + good_note_count)
    
    // let at_least_this_much_better = goodnote_count / 2

    let best_score = score(chord.transpose(best_transpositions))
    
    let consider = (n) => {
        let attempt_score = score(chord.transpose(n))
        if (attempt_score > best_score) {
            // console.log(`transposed by ${n} is better than ${best_transpositions} (${attempt_score} > ${best_score})`)
            best_score = attempt_score
            best_transpositions = [n]
        }
        else if (attempt_score == best_score) {
            if(n == 0 && best_transpositions.includes(0)) return attempt_score // prevent 0 & -0
            // console.log(`transposed by ${n} is equal to best transposition (${attempt_score} == ${best_score}), appending`)
            best_transpositions.push(n)
        }
        return attempt_score
    }
    
    for (let i = +stickTo; i <= deviation; i++) {
        // console.log(`transposed by +${+i}: ${chord.transpose(+i).display()}; score: ${score(chord.transpose(+i))}`)
        consider(+i)
        // console.log(`transposed by ${-i}: ${chord.transpose(-i).display()}; score: ${score(chord.transpose(-i))}`)
        consider(-i)
    }
    
    // console.log(`best transposition for ${chord.display()} is ${best_transpositions} (${chord.transpose(best_transpositions).display()})`)

    return best_transpositions
}

function best_transposition_for_chords(chords, deviation, stickTo = 0, atLeast = 4, startFrom = 0) {
    // console.log('[btfcs] entry:', chords)

    let best_transpositions_for_each_chord = chords.map((chord) => best_transposition_for_chord(chord, deviation, stickTo))
    // console.log('best transpositions for each chord: ', best_transpositions_for_each_chord)
    
    // // Most occurences of a single transposition (TODO: maybe reconsider)
    let best_count = 0
    let best_transposition_overall = 0
    let seen = []
    
    // mono type thing
    best_transpositions_for_each_chord = best_transpositions_for_each_chord.flat()

    for (let transposition of best_transpositions_for_each_chord) {
        if (seen.includes(transposition)) continue
        seen.push(transposition)

        let occurences = best_transpositions_for_each_chord.filter(x => x == transposition)
        let count = occurences.length
        if (count > best_count) {
            best_count = count
            best_transposition_overall = transposition
        }
    }
    
    // console.log(best_transposition_overall)
    
    return best_transposition_overall
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
    if (difference < beat * 3)
        return '... '
    if (difference < beat * 4)
        return '.... '
    else return '...... '
}

export { 
    vpScale, Note, Chord, 
    generateChords as generateSheet, 
    best_transposition_for_chords, 
    best_transposition_for_chord,
    separator,
    is_chord, not_chord
}
