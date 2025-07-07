import MIDIFile from 'midifile'
import MIDIEvents, { EVENT_MIDI_NOTE_ON } from 'midievents'

function getMIDIFileFromArrayBuffer(array_buffer) {
    return new MIDIFile(array_buffer)
}

function getTempo(MIDIObject) {
    if (MIDIObject.header.getTimeDivision() === MIDIFile.Header.TICKS_PER_BEAT) {
        // console.log('tpb', MIDIObject.header.getTicksPerBeat())
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

    events[0].ticks = 0
    for (let i = 0; i < events.length; i++) {
        // console.log(events.at(i-1))
        events[i].ticks = events[i].delta + (events.at(i-1)?.ticks ?? 0)
    }

    events.forEach((event) => {
        // console.log(event)

        if(event.type == MIDIEvents.EVENT_META) {
            let pushabes = [
                MIDIEvents.EVENT_META_SET_TEMPO,
                MIDIEvents.EVENT_META_TIME_SIGNATURE,
            ]

            if (!pushabes.includes(event.subtype)) return

            totalEvents.push(event)

            return
        }

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

    // Issue #26
    // MIDIObject.tracks.forEach((track) => {
    //     tracks.push({ name: "Unknown", length: track.getTrackLength() })
    // })

    let track_index = 0

    let track_name = undefined
    let track_instrument = undefined

    let push_track = (name, instrument) => {
        tracks.push({ name: `${name ?? 'Unknown'} (${instrument ?? 'Unknown'})`, length: MIDIObject.tracks[track_index]?.getTrackLength() ?? 0 })
        console.log("Pushed", name)
        track_index++
        track_name = undefined
        track_instrument = undefined
    }

    for (let event of MIDIObject.getEvents()) {
        if (event.type == MIDIEvents.EVENT_META && event.subtype == MIDIEvents.EVENT_META_TRACK_NAME) {
            if (track_name !== undefined) { // Already have track name = this is another track
                push_track(track_name, track_instrument)
            }
            track_name = new TextDecoder().decode(new Uint8Array(event.data))
        }
        if (event.type == MIDIEvents.EVENT_META && event.subtype == MIDIEvents.EVENT_META_INSTRUMENT_NAME) {
            if (track_instrument !== undefined) { // Already have track instrument = this is another track
                push_track(track_name, track_instrument)
            }
            track_instrument = new TextDecoder().decode(new Uint8Array(event.data))
        }
    }

    // Always push last track
    push_track(track_name, track_instrument)

    return tracks
}

export { getMIDIFileFromArrayBuffer, getEvents, getTempo, getTracks }