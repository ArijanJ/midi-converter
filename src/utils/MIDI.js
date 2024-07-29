import MIDIFile from 'midifile'
import MIDIEvents, { EVENT_MIDI_NOTE_ON } from 'midievents'

function getMIDIFileFromArrayBuffer(array_buffer) {
    return new MIDIFile(array_buffer)
}

function getTempo(MIDIObject) {
    if (MIDIObject.header.getTimeDivision() === MIDIFile.Header.TICKS_PER_BEAT) {
        return { ticksPerBeat: MIDIObject.header.getTicksPerBeat() }
    } else {
        return { 
            SMPTEFrames:   MIDIObject.header.getSMPTEFrames(),
            ticksPerFrame: MIDIObject.header.getTicksPerFrame() 
        }
    }
}

function getEvents(MIDIObject, tracks) {
    let totalEvents = []

    let events = MIDIObject.getEvents()

    events.forEach((event) => {
        // console.log(event)
        
        if (event.subtype == MIDIEvents.EVENT_META_SET_TEMPO)
            totalEvents.push(event)

        if (event.subtype != EVENT_MIDI_NOTE_ON) return

        if(!event.track && tracks[0] === true) { // Only one track
            totalEvents.push(event)
            return
        }

        if ((tracks[event.track] === true)) {
            totalEvents.push(event)
        }
    })

    return totalEvents
}

function getAllEvents(MIDIObject) {
    MIDIObject.getEvents()
}

function getTracks(MIDIObject) {
    let tracks = []

    MIDIObject.tracks.forEach((track) => {
        tracks.push("Unknown")
    })

    
    let track_index = 0
    for (let event of MIDIObject.getEvents()) {
        if (event.type == MIDIEvents.EVENT_META &&
            event.subtype == MIDIEvents.EVENT_META_TRACK_NAME) {
            

            let name = new TextDecoder().decode(new Uint8Array(event.data))
            console.log(name)
            tracks[track_index] = name
            
            track_index++
        }
    }
    
    return tracks
}

export { getMIDIFileFromArrayBuffer, getEvents, getTempo, getTracks }