<script>
    import { colors } from '../utils/Rendering.js'
</script>

<div id="guide">
    Click on a note to set selection beginning/ending<br>
    Double-click on a note to select the whole line<br>
    Middle-click to select everything below the note<br>
    Ctrl-Z for a limited undo<br>
    <hr class="my-2 mx-1">
    Note that <span title="Track imports, break every x beats, quantize, and any tempo/BPM changes" class="underline cursor-help">some settings</span> must fully regenerate your sheet, so you may lose some manual changes.<br>
    <hr class="my-2 mx-1">
    Timing:<br>
    <span style="color: {colors.quadruple}">Longer than whole note</span><br>
    <span style="color: {colors.whole}">Whole note (s.... f)</span><br>
    <span style="color: {colors.half}">Half note (s, f)</span><br>
    <span style="color: {colors.quarter}">Quarter note (s - f)</span><br>
    <span style="color: {colors.eighth}">Eighth note (s f)</span><br>
    <span style="color: {colors.sixteenth}">Sixteenth note (s-f)</span><br>
    <span style="color: {colors.thirtysecond}">Thirty-second note</span><br>
    <span style="color: {colors.sixtyfourth}">Shorter than thirty-second</span><br>
    <span>Click <a target="_blank" href="https://youtu.be/ceGak_tzS5s" class="underline">here</a> for a video explanation of this timing.</span>
</div>