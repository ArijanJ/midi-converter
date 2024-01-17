<script>
    export let track, idx;
    export let selected = false;
</script>

<div id="track">
    <input type="checkbox" bind:checked={selected}>
    Track {idx} - {track.getTrackLength()} events
</div>

