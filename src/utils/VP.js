import MIDIEvents from "midievents"

const firstPossibleNote  =  21
const lastPossibleNote   =  108

const capitalNotes = "!@#$%^&*()QWERTYUIOPASDFGHJKLZXCBVNM"

let is_chord = (x) => { try { return 'notes' in x && x.notes.length != 0 } catch { return false } }
let not_chord = (x) => { try { return !is_chord(x) } catch { return true } } // !x || (x.type && (x.type == "break" || x.type == "comment"))
class Note {
    constructor(value, playTime, ticks, tempo, BPM, delta, shifts='keep', oors='keep', skipOrdering=false) {
        if(typeof(value) == 'object') // Copy constructor
            var { original, value, playTime, tempo, BPM, delta, shifts, oors } = value

        this.original   =  original ?? value
        this.value      =  value
        this.playTime   =  playTime
        this.ticks      =  ticks
        this.delta      =  delta
        this.char       =  vpScale[value - firstPossibleNote]
        this.tempo      =  tempo
        this.BPM        =  BPM
        
        this.valid      = (value >= 21 && value <= 108)
        this.outOfRange = (value <= 35 || value >=  97)
        
        if(skipOrdering) {
            this.displayValue = value
            return
        }

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
    
    get transposition() {
        return this.value - this.original
    }
    
    static new_with_saved_original(note, newValue, skipOrdering = false) {
        let result = new Note(newValue, note.playTime, note.ticks, note.tempo, note.BPM, note.delta, note.shifts, note.oors, skipOrdering)
        result.original = note.original
        return result
    }
}

class Chord {
    constructor(notes, classicChordOrder = true, sequentialQuantize = true, skipProcessing = false) {
        if('notes' in notes) // It's actually another chord - copy constructor
            var { notes, classicChordOrder, sequentialQuantize } = notes       
        
        let is_quantized = false
        let previous_note = notes[0]
        
        // console.log(previous_note);
        
        this.classicChordOrder = classicChordOrder
        this.sequentialQuantize = sequentialQuantize
        
        if(skipProcessing) {
            this.notes = notes
            return
        }

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
            if (sequentialQuantize) {
                this.notes = notes.sort((a, b) => a.playTime - b.playTime);
            }
            else {
                this.notes = this.#sortChord(notes, classicChordOrder);
            }
        }
    }
    
    get transposition() {
        return this.notes?.[0]?.transposition
    }
    
    transpose = (by, relative = false, mutate = false, skipOrdering = false) => {
        if (relative)
            by = this.transposition + by
        
        let new_chord = new Chord(this.notes, this.classicChordOrder, this.sequentialQuantize)
        let assignee = mutate ? this : new_chord 

        let new_notes = assignee.notes.map(note => Note.new_with_saved_original(note, note.original + by, skipOrdering)) // create a note with the correct "original" value
        new_chord = new Chord(new_notes, this.classicChordOrder, this.sequentialQuantize, skipOrdering)

        assignee.notes = new_chord.notes
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

/**
 * Make a BPM change comment
 * 
 * @param {number} previousBPM 
 * @param {number} newBPM 
 * @param {('simple'|'advanced')} type - settings.bpmType
 * @param {number} minimum - If the difference is less than {@link minimum}, return undefined
 * @returns {(object|undefined)} - Comment or nothing
 */
function BPMComment(previousBPM, newBPM, type, minimum) /*  */ {
    let faster = newBPM > previousBPM

    let larger = faster ? newBPM : previousBPM
    let smaller = faster ? previousBPM : newBPM

    let percent = Math.round(((larger - smaller) / smaller) * 100)
    if (percent < minimum) return

    if (!type) { type = "detailed" }
    switch (type) {
        case "simple":
            let char = newBPM > previousBPM ? ">" : "<"
            let text = ""
            let notop = false // Whether to put the comment on the same line

            let increments = Math.floor(percent / 10)
            if (increments === 0) increments++

            for (let i = 0; i < increments; i++)
                text += char

            if (text.length > 20) { // would be spam, not worth
                text = `${char} ${percent}% ${faster ? "faster" : "slower"} ${char}`
                notop = false
            }

            return { type: 'comment', kind: 'tempo', text, notop }

        case "detailed":
            return { 
                type: 'comment', kind: 'tempo', 
                text: `${percent}% ${faster ? 'faster' : 'slower'} - BPM changed to ${Math.round(newBPM)}`
            }
    }
}

const SET_TEMPO = 0x51
function generateChords(events /* note_on, set_tempo and time_signature */, settings, previous_chords = undefined, ticks_per_beat = 480) {

    let current_time_signature = { data: [4, 2, 24, 8] } // Assume 4/4 if none available
    let set_time_signature = (event) => {
        // console.log('got new', event)
        current_time_signature = {
            scheduled_break: true,
            numerator: event.data?.[0] ?? current_time_signature.numerator,
            denominator: event.data?.[1] ?? current_time_signature.denominator,
            metronome: event.data?.[2] ?? current_time_signature.metronome,
            thirtyseconds: event.data?.[3] ?? current_time_signature.thirtyseconds,
            tempo: event.tempo ?? 500000,
            get tick_resolution() { // only used for converting from playTime into ticks
                return current_time_signature.tempo / ticks_per_beat               
            }
        }
    }
    
    let current_beat = 0
    let next_beat_border = 0
    let previously_reflowed = [] // idk how else to fix this

    let debug_comment = (window.debug_timing !== undefined)
        ? (text) => { chords.push({ type: 'comment', kind: 'inline', text }) }
        : () => { }

    function break_realistically(note, index = undefined) {

        if (previous_chords && index && !previously_reflowed.includes(index)) {
            // console.log(note)
            if (previous_chords?.[index_of_index(previous_chords, index)]?.reflow === true) {
                chords.push({type: 'break', why: 'reflow'})
                current_beat = undefined
                previously_reflowed.push(index)
            }
        }

        if (current_time_signature.scheduled_break != false) {
            debug_comment(' <scheduled break> ')
            if(current_time_signature.scheduled_break.break !== false)
                chords.push({type: 'break', why: 'scheduled'})

            current_time_signature.scheduled_break = false
            current_beat = undefined // set our own starting tick when we see this
        }

        let current_ticks = note.ticks

        if (current_beat === undefined) { // starting point, may be some delay before first note of bar plays
            current_beat = 0
            next_beat_border += note.ticks - next_beat_border + ticks_per_beat
            // console.log('starting point', next_beat_border)
            debug_comment(`<br>setting goal to ${next_beat_border}<br></br>`)
        }
        
        // console.log(note)
        // console.log(`curr: ${current_ticks}, next: ${next_beat_border}`)

        // chords.push({type: 'comment', kind: 'inline', text: `<${current_ticks}>`})
        
        if (current_ticks >= next_beat_border) {
            debug_comment(`and a ${current_beat+1} (${current_ticks}/${next_beat_border})`)
            current_beat++
            next_beat_border+=ticks_per_beat
        }

        // Did [x] beats already pass? (for 3/4, 3 beats need to pass for it to be a new bar)
        // TODO: Is 4/2 handled differently?
        if (current_beat == current_time_signature.numerator) {
            // chords.push({type: 'comment', kind: 'inline', text: ' /bar '})
            debug_comment(`and a break`)
            chords.push({type: 'break', why: 'beats'})
            current_beat = 0
        }

        // console.log(`this note is at ${current_beat} beats`)
    }

    // Legacy (non-"realistic" breaks)
    let penalty = 0
    const error_range = 0.5
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

    let index = 0

    const possibly_transpose_to_previous = (chord, index) => {
        let real_index_of = (x) => index_of_index(previous_chords, x)
        let chord_at = (x) => previous_chords[real_index_of(x)]

        if (!previous_chords) return
        let chord_previously = chord_at(index)
        if (chord_previously?.reflow === true) { chord.reflow = true }

        if (chord_previously && ![0, undefined].includes(chord_previously.transposition)) {
            chord.transpose(chord_previously.notes[0].transposition, false, true)
            // console.log('pttp', chord)
        }
    }
    
    // Generate chords
    events.forEach(element => {
        if (element.type == MIDIEvents.EVENT_META) {
            switch (element.subtype) {
                case MIDIEvents.EVENT_META_TIME_SIGNATURE:
                    set_time_signature(element)
                    // offset = Math.round(element.playTime * 1000 / current_time_signature.tick_resolution)
                    // console.log('TIME_SIGNATURE event: ', current_time_signature)
                    // Note comments are pushed below, so this comment will show up above the actual affected notes
                    debug_comment(`<br>(switch to ${current_time_signature.numerator}/${2**current_time_signature.denominator})<br>`)
                    return

                case MIDIEvents.EVENT_META_SET_TEMPO:
                    set_time_signature(element)
                    current_time_signature.scheduled_break = { break: false }
                    // current_bar++
                    // console.log('new TEMPO event: ', current_time_signature)
                    debug_comment(` <new tempo: ${current_time_signature.numerator}/${2 ** current_time_signature.denominator}>`)
                    
                    nextTempo = element.tempo
                    nextBPM = element.tempoBPM
                    if (previousTempo == undefined) {
                        if(settings.bpmChanges)
                            chords.push({ type: 'comment', kind: 'tempo', text: `Tempo: ${Math.round(element.tempoBPM)} BPM` })
                    }
                    else if (previousTempo != undefined && (previousTempo != element.tempo) && (previousBPM != element.tempoBPM)) {
                        if(settings.bpmChanges) {
                            let comment = BPMComment(Math.round(previousBPM), Math.round(element.tempoBPM), settings.bpmType, settings.minSpeedChange)
                            if (comment) chords.push(comment)
                        }
                    }
                    previousBPM = element.tempoBPM
                    previousTempo = element.tempo
                    return
            }
        } 
        
        if (element.type != MIDIEvents.EVENT_MIDI && element.subtype != MIDIEvents.EVENT_MIDI_NOTE_ON)
            return
        
        // event is NOTE_ON
        const key      = element.param1; if (!key) return
        const playtime = element.playTime
        const delta    = element.delta
        const ticks    = element.ticks

        if (lastPlaytime == undefined) lastPlaytime = playtime
        
        if (Math.abs(playtime - lastPlaytime) < quantize) {
            current_notes.push(new Note(key, playtime, ticks, nextTempo, nextBPM, delta, shifts, oors))
            lastPlaytime = playtime
        } else {
            if (current_notes.length == 0) {
                lastPlaytime = playtime
                return
            }

            // Submit the chord and start the next one
            let resulting_chord = new Chord(current_notes, classicChordOrder, sequentialQuantize)
            resulting_chord.index = index
            
            possibly_transpose_to_previous(resulting_chord, index)
            
            chords.push(resulting_chord)
            index++

            current_notes = []
            current_notes.push(new Note(key, playtime, ticks, nextTempo, nextBPM, delta, shifts, oors))

            lastPlaytime = playtime
        }

        switch (settings.breaks) {
            case 'realistic':
                // chords = chords.filter((e) => e.kind != "break") // Clean up
                break_realistically(current_notes[0], index-1)
                break

            case 'manual':
                const { doBreak, newPenalty } = shouldBreak(current_notes[0], penalty)
                penalty = newPenalty
                if(doBreak) { chords.push({type: 'break'}) }
        }
    })

    // Final chord insertion to make sure no notes are left
    let resulting_chord = new Chord(current_notes, classicChordOrder, sequentialQuantize)
    resulting_chord.index = index

    possibly_transpose_to_previous(resulting_chord, index)

    chords.push(resulting_chord)
    index++
    
    if (!previousTempo)
        console.log(`No tempo found in sheet, set to ${nextBPM}/${nextTempo}`); 
    
    return { chords: chords, hasTempo: !(!previousTempo) }
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

/**
 * Does not mutate
 * @param {object} chord 
 * @param {number} deviation 
 * @param {number} stickTo 
 * @param {number} resilience 
 * @returns {number[]} best multiple transpositions
 */
function best_transposition_for_chord(chord, deviation, stickTo = 0, resilience = 0) {
    if (!chord) return

    // console.log('[btfc] entry:', chord.display())
    if (not_chord(chord)) return stickTo
    
    let best_transpositions = [stickTo]
    
    /** 
     * Scores a chord based on how ... homogeneous? it is (higher is better)
     */
    function score(chord) {
        let good_notes = 0
        let lowercase_notes = 0
        let uppercase_notes = 0

        for (let note of chord.notes) {
            // reconsider: oors are valid notes
            if (note.outOfRange) continue
            if (!note.valid) continue
            
            good_notes++

            lowercases.includes(note.char) ? lowercase_notes++ : uppercase_notes++
        }

        return ((good_notes * 2) + Math.abs(uppercase_notes-lowercase_notes))
    }

    let best_score = score(chord.transpose(stickTo, false, false, true))
    
    let consider = (n) => {
        let attempt_score = score(chord.transpose(n))
        if (attempt_score > best_score + resilience) {
            // console.log(`transposed by ${n} is better (${attempt_score} > ${best_score})`)
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

    // console.log('btfc prelude done')
    
    let limit = stickTo + deviation
    for (let i = +stickTo; i <= limit; i++) {
        // console.log(`transposed by +${+i}: ${chord.transpose(+i).display()}; score: ${score(chord.transpose(+i))}`)
        consider(+i)
        // console.log(`transposed by ${-i}: ${chord.transpose(-i).display()}; score: ${score(chord.transpose(-i))}`)
        consider(-i)
        // console.log('considered', i)
    }
    
    // console.log(`best transposition for ${chord.display()} is ${best_transpositions}`)
    return best_transpositions
}

/**
 * Converts all chords into one before processing it
 * @param {number[]} [ignores=[]] 
 */
function best_transposition_for_monochord(chords, deviation, stickTo = 0, resilience = 4, ignores = []) {
    let notes = []
    
    for (let chord of chords) {
        if (not_chord(chord)) continue
        for (let note of chord.notes) {
            notes.push(new Note(note, 0, 0, 0, 0, 0, 0, 0, true)) // ...
        }
    }

    let monochord = new Chord(notes, false, false, true)
    
    let bests = best_transposition_for_chord(monochord, deviation, stickTo, resilience)
    let result =  bests.filter(x => !ignores.includes(x))[0] ?? bests[0] // If impossible to ignore, return the first one
        
    // console.log('all bests', bests)
    // console.log('returning', result)
    return result
}

// function best_transposition_for_chords(chords, deviation, stickTo = 0, resilience = 4) {
//     // console.log('[btfcs] entry:', chords)
    
//     let best_transpositions_for_each_chord = chords.map((chord) => best_transposition_for_chord(chord, deviation, stickTo, resilience))
//     // console.log('best transpositions for each chord: ', best_transpositions_for_each_chord)
    
//     // // Most occurences of a single transposition (TODO: maybe reconsider)
//     let best_count = 0
//     let best_transposition_overall = 0
//     let seen = []
    
//     best_transpositions_for_each_chord = best_transpositions_for_each_chord.flat()

//     for (let transposition of best_transpositions_for_each_chord) {
//         if (seen.includes(transposition)) continue
//         seen.push(transposition)

//         let occurences = best_transpositions_for_each_chord.filter(x => x == transposition)
//         let count = occurences.length
//         if (count > best_count + resilience/2) {
//             best_count = count
//             best_transposition_overall = transposition
//         }
//     }
    
//     // console.log(best_transposition_overall)
    
//     return best_transposition_overall
// }

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

// chatgpt binary search
function index_of_index(arr, targetIndex) {
    if(!arr) return
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        // Find the closest element with an index on the left
        while (mid >= left && !('index' in arr[mid])) {
            mid--;
        }

        if (mid < left) {
            left = Math.floor((left + right) / 2) + 1;
            continue;
        }

        if (arr[mid].index === targetIndex) {
            return mid; // Element found
        } else if (arr[mid].index < targetIndex) {
            left = mid + 1; // Continue search on the right half
        } else {
            right = mid - 1; // Continue search on the left half
        }
    }

    return undefined; // Element not found
}

export { 
    vpScale, Note, Chord, 
    generateChords as generateSheet, 
    // best_transposition_for_chords, 
    best_transposition_for_chord,
    best_transposition_for_monochord,
    index_of_index,
    separator,
    is_chord, not_chord
}