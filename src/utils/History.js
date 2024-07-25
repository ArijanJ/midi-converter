import pako from "pako"

const _key = 'pieces'

export async function compress(object) {
    return pako.deflate(JSON.stringify(object), { level: 9 })
}

export function decompress(string) {
    return JSON.parse(pako.inflate(string, { to: 'string' }), { level: 9 })
}

export function remainingSize() {
    let totalStorage = 0
    let keyLength

    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue
        
        keyLength = (localStorage[key].length + key.length)
        totalStorage += keyLength
    }

    return (totalStorage / 1024).toFixed(2)
}

async function piece(name, settings, data, skip_compression = false) {
    // console.log(skip_compression)
    return {
        name: name,
        settings: settings,
        updated: Date.now(),
        data: skip_compression ? data : await compress(data)
    }
}

const module = {
    getAll: () => {
        let pieces = JSON.parse(localStorage.getItem(_key))
        if (!pieces)
            pieces = []

        return pieces
    },

    add: async (name, settings, json, skip_compression = false) => {
        let pieces = module.getAll()

        let thisPieceRemoved = pieces.filter((entry) => entry.name != name)
        thisPieceRemoved.unshift(await piece(name, settings, json, skip_compression))

        try {
            localStorage.setItem(_key, JSON.stringify(thisPieceRemoved))
        } catch ({ error, message }) {
            if (error == "QuotaExceededError" || message == "The quota has been exceeded.") {
                console.log("Quota exceeded, dropping: ", thisPieceRemoved.pop())
                thisPieceRemoved.shift() // undo addition
                localStorage.setItem(_key, JSON.stringify(thisPieceRemoved))
                module.add(name, settings, json, skip_compression)
            }
            else console.error(error, message)
        }
    },

    export: async (name) => {
        let pieces = module.getAll()
        let thisPiece = pieces.filter((entry) => entry.name === name)[0]

        return thisPiece
    },

    delete: (name) => {
        let pieces = module.getAll().filter((entry) => entry.name != name)
        localStorage.setItem(_key, JSON.stringify(pieces))
    }
}

export default module