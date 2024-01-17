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

// These two are deprecated
function yellow_to_green(value) {
    value = Math.max(0.0, Math.min(4.0, value))
    const red = 255 - (255/4.0)*value
    const green = 255
    return `rgb(${red}, ${green}, 0)`
}

function yellow_to_red(value) {
    value = Math.max(0.0, Math.min(4.0, value))
    const red = 255
    const green = 255 - (255/4.0)*value 
    return `rgb(${red}, ${green}, 0)`
}

function colored_string(s, color) {
    return `<span style="color:${color}">${s}</span>`
}

export { colors, colored_string, yellow_to_green, yellow_to_red }
