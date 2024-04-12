import pako from "pako"

const key = 'pieces'

function createPiece(name, data) {
    return {
        name: name,
        data: compress(data)
    }
}

export function compress(object) {
    return pako.deflate(JSON.stringify(object))
}

export function decompress(string) {
    return JSON.parse(pako.inflate(string, { to: 'string' }))
}

const module = {
    getAll: () => {
        let pieces = JSON.parse(localStorage.getItem(key))
        if (!pieces)
            pieces = []

        console.log(pieces)
        return pieces
    },

    add: (name, json) => {
        let pieces = module.getAll()
        console.log(pieces);
        let entry = createPiece(name, json)
        pieces.unshift(entry)
        localStorage.setItem(key, JSON.stringify(pieces))
    }
}

export default module