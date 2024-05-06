import pako from "pako"

const _key = 'pieces'

export async function compress(object) {
    return pako.deflate(JSON.stringify(object))
}

export function decompress(string) {
    return JSON.parse(pako.inflate(string, { to: 'string' }))
}

export function remainingSize() {
    var totalStorage = 0;
    var keyLength, key;

    for (key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue
        
        keyLength = (localStorage[key].length + key.length);
        totalStorage += keyLength; 
        return (keyLength / 1024).toFixed(2)
    }
}

async function piece(name, settings, data) {
    return {
        name: name,
        settings: settings,
        updated: Date.now(),
        data: await compress(data)
    }
}

const module = {
    getAll: () => {
        let pieces = JSON.parse(localStorage.getItem(_key))
        if (!pieces)
            pieces = []

        return pieces
    },

    add: async (name, settings, json) => {
        let pieces = module.getAll()

        let thisPieceRemoved = pieces.filter((entry) => entry.name != name)
        thisPieceRemoved.unshift(await piece(name, settings, json))

        try {
            localStorage.setItem(_key, JSON.stringify(thisPieceRemoved))
        } catch ({ error, message }) {
            if (error == "QuotaExceededError" || message == "The quota has been exceeded.") {
                console.log("Quota exceeded, dropping: ", thisPieceRemoved.pop())
                thisPieceRemoved.shift() // undo addition
                localStorage.setItem(_key, JSON.stringify(thisPieceRemoved))
                module.add(name, settings, json)
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