<script>
    import { domToBlob } from "modern-screenshot";
    import {
        getMIDIFileFromArrayBuffer,
        getEvents,
        getTracks,
        getTempo,
    } from "./utils/MIDI.js";
    import {
        generateSheet as generateChords,
        best_transposition_for_monochord,
        Chord as ChordObject,
        Note,
        is_chord,
        not_chord,
        index_of_index,
    } from "./utils/VP.js";
    let real_index_of = (x) => index_of_index(chords_and_otherwise, x);
    let chord_at = (x) => chords_and_otherwise[real_index_of(x)];

    import SheetOptions from "./components/SheetOptions.svelte";
    import Chord from "./components/Chord.svelte";
    import HistoryEntry from "./components/HistoryEntry.svelte";

    let importer = {
        element: undefined, // main welcome screen div
        hide: () => {
            importer.element.style.top = "-110vh";
            softRegen();
            resetSelection();
            repopulateTransposeComments();
        },
        show: () => {
            importer.element.style.top = "0px";
        },
    };

    import history, { decompress, remainingSize } from "./utils/History";
    let remaining = remainingSize();
    const sample_uri =
        "https://gist.githubusercontent.com/ArijanJ/" +
        "80f86cbe9dcf8384dbdf9578c83102a6/raw/4ec84c63f655866e6d0d4e1c75949a22537c417e/" +
        "Mar" +
        "iage_d" +
        "Amour_(sample).json";

    import SheetActions from "./components/SheetActions.svelte";
    import Guide from "./components/Guide.svelte";
    import ChordEditor from "./components/ChordEditor.svelte";

    let existingProject = {
        element: undefined,
        name: undefined,
        data: undefined,
        set: (project, exportedCurrent = false) => {
            MIDIObject = exportedCurrent ? MIDIObject : undefined;
            existingProject.name = filename ?? project.name;
            existingProject.data = decompress(project.data);
        },
        setAndProceed: (project, exportedCurrent = false) => {
            MIDIObject = exportedCurrent ? MIDIObject : undefined;
            existingProject.name = filename ?? project.name;
            existingProject.data = decompress(project.data);
            existingProject.proceed("load");
        },
        proceed: (force_decision = "prompt") => {
            let decision = existingProject.element?.returnValue; // dialog result
            if (force_decision !== "prompt") decision = force_decision;
            if (!decision) return;

            if (decision == "load" || decision == "existing") {
                console.log("Loading", existingProject.name);

                sheetReady = true;
                chords_and_otherwise = existingProject.data;
                undoStack = [];

                let old_style_project = !chords_and_otherwise.find((e) =>
                    is_chord(e),
                )?.notes;
                if (old_style_project) {
                    confirm(
                        "Looks like this project is from an older version, and unfortunately can't be opened anymore.\n" +
                            "You can right-click it on the main screen to export or delete it from your list.\n\n" +
                            "If you must view/edit it again, you can open it in an older version (reach me at @arijanj on Discord for help with this)",
                    );
                    window.location.reload();
                }

                softRegen();
            } else if (decision == "export-and-restart") {
                history.export(existingProject.name).then((piece) => {
                    downloadSheetData(piece);
                    importFile();
                });
            } else if (decision == "new") {
                importFile();
            }

            importer.hide();
        },
    };

    let filename;
    let basename = (s) => {
        if (!s) return;
        return s.split(".").slice(0, -1).join(".");
    };

    // DOM input element
    let fileInput;
    $: {
        if (fileInput)
            filename =
                basename(fileInput.files[0]?.name) ?? existingProject.name;
    }

    let sheetReady = false;
    let isAutoTransposing = false;

    function handleAutoTranspose(type) {
        if (isAutoTransposing) return;
        isAutoTransposing = true;

        // Allow UI to update
        setTimeout(() => {
            if (type === "single") {
                autoRegion(selection.left, selection.right, {
                    ignorePrevious: true,
                });
            } else {
                multiTransposeRegion(selection.left, selection.right);
            }
            isAutoTransposing = false;
        }, 20);
    }

    let MIDIObject;
    let tracks;

    let chords_and_otherwise;

    let container;

    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", (e) => {
        // TODO: ctrl + a is causing out of range separator input text to be selected from the sidebar, sheet text should only ever get selected
        const activeElIsComment =
            document.activeElement.classList.contains("comment");
        if (!activeElIsComment && e.ctrlKey && e.key.toLowerCase() === "a") {
            e.preventDefault();
        }
    });
    document.addEventListener("selectionchange", handleNativeSelection);

    async function onFileChange() {
        filename = basename(fileInput.files[0].name);
        let exists = pieces.find((entry) => entry.name == filename) ?? false;
        if (exists /* in history */) {
            existingProject.name = filename;
            existingProject.data = decompress(exists.data);
            existingProject.element.showModal();
        } else {
            importFile();
            importer.hide();
        }
    }

    async function importFile(dataTransfer = undefined) {
        if (dataTransfer) fileInput.files = dataTransfer.files;

        const file_is_json = fileInput.files[0].type.split("/")[1] === "json";
        if (file_is_json) {
            let sheetData = await fileInput.files[0].text();
            existingProject.set(JSON.parse(sheetData));

            sheetReady = true;
            chords_and_otherwise = existingProject.data;
            undoStack = []; // Reset undo stack when importing
            softRegen();

            const first_transpose = chords_and_otherwise.find(
                (x) => x.kind === "transpose",
            );

            // compatability with older json files which don't include: transpose indexes,
            if (!first_transpose.text.includes("#")) {
                // if exported with the latest json version, this will not need to run again
                repopulateTransposeComments();
            }

            return;
        }

        await fileInput.files[0].arrayBuffer().then((arrbuf) => {
            MIDIObject = getMIDIFileFromArrayBuffer(arrbuf);

            if (!getTempo(MIDIObject).ticksPerBeat)
                console.error("No ticksPerBeat in this midi file");

            tracks = getTracks(MIDIObject);
            settings.tracks = tracks.map((t) => {
                t.selected = true;
                return t;
            }); // initial population

            sheetReady = false;
        });
    }

    let saveSheet = () => {
        if (!MIDIObject) {
            console.log("no midiobject");
            return;
        }
        // console.log(MIDIObject.tracks)
        let events = getEvents(
            MIDIObject,
            settings.tracks.map((t) => t.selected),
        );

        let res = generateChords(
            events,
            settings,
            chords_and_otherwise,
            getTempo(MIDIObject).ticksPerBeat,
        );

        chords_and_otherwise = res.chords;
        settings.missingTempo = !res.hasTempo;

        let only_chords = chords_and_otherwise.filter((e) => is_chord(e));
        only_chords.forEach((chord, i) => {
            chord.next = {
                notes: [{ playTime: only_chords[i + 1]?.notes[0]?.playTime }],
            };
        }); // trust

        // Couldn't parse realistically, switch to manual
        // TODO: bad ux if user wants to change back to realistically for some reason
        if (chords_and_otherwise.filter((e) => e.type == "break").length <= 1) {
            settings.breaks = "manual";
        }

        updateChords();
        repopulateTransposeComments();

        sheetReady = true;
    };

    /**
     * Recreate all chords with existing data (e.g. for reordering purposes)
     *
     * Calls updateChords()
     */
    function softRegen() {
        if (!chords_and_otherwise) return;
        for (let i = 0; i < chords_and_otherwise.length; i++) {
            let chord = chords_and_otherwise[i];
            if (is_chord(chord)) {
                let new_notes = [];
                for (let note of chord.notes) {
                    let new_note = new Note(
                        note.value,
                        note.playTime,
                        note.ticks,
                        note.tempo,
                        note.BPM,
                        note.delta,
                        chord.overrides?.shifts ?? settings.pShifts,
                        chord.overrides?.oors ?? settings.pOors,
                    );
                    new_note.original = note.original;
                    new_notes.push(new_note);
                }
                let new_chord = new ChordObject(
                    new_notes,
                    chord.overrides ? false : settings.classicChordOrder,
                    chord.overrides?.sequential ?? settings.sequentialQuantize,
                );
                if (chord.overrides)
                    new_chord.overrides = JSON.parse(
                        JSON.stringify(chord.overrides),
                    );
                new_chord.index = chord.index;

                let next_valid_chord = next_not(
                    chords_and_otherwise,
                    not_chord,
                    real_index_of(chord.index + 1),
                );
                if (!next_valid_chord) next_valid_chord = chord;
                new_chord.next = {
                    notes: [{ playTime: next_valid_chord.notes[0].playTime }],
                };
                if ("reflow" in chord) new_chord.reflow = chord.reflow;

                // new_note = new_note.sort((a, b) => a.displayValue - b.displayValue);
                chords_and_otherwise[i].notes = new_notes;

                chords_and_otherwise[i] = new_chord;
            }
        }

        updateChords();
    }

    let oldSettings;
    let settings;

    try {
        settings = JSON.parse(localStorage.getItem("preferences"));
        settings.beats = 4;
        settings.breaks = "realistic";
        settings.bpm = 120; // doesn't make sense to save this
    } catch (e) {
        settings = undefined;
    }
    $: {
        if (!oldSettings) {
            oldSettings = { ...settings };
            break $;
        }

        let changed = (key) => settings[key] != oldSettings[key];

        if (
            [
                "beats",
                "breaks",
                "quantize",
                "sequentialQuantize",
                "minSpeedChange",
                "bpmChanges",
                "bpmType",
                "bpm",
                "tracks",
            ].some(changed)
        ) {
            saveSheet(); // Full regeneration needed
            undoStack = [];
        }

        // Regeneration that doesn't require a MIDIObject
        if (
            [
                "pShifts",
                "pOors",
                "classicChordOrder",
                "sequentialQuantize",
            ].some(changed)
        )
            softRegen();

        if (MIDIObject)
            localStorage.setItem("preferences", JSON.stringify(settings));

        renderSelection();

        oldSettings = { ...settings };
    }

    let updateChords = () => {
        chords_and_otherwise = chords_and_otherwise;
    };

    let addComment = (index) => {
        let real = real_index_of(index);
        chords_and_otherwise.splice(real, 0, {
            type: "comment",
            kind: "custom",
            text: "Add a comment...",
        });
        pushUndoAction({ type: "addComment", index: real });
        renderSelection();
    };

    let updateComment = (index, text) => {
        if (text == "") chords_and_otherwise.splice(index, 1);
        else chords_and_otherwise[index].text = text;
        renderSelection();
        autosave();
    };

    let transposeRegion = (left, right, by, opts = undefined) => {
        let relative = opts?.relative ?? false;

        // Store undo action
        if (!opts?.skipSave)
            pushUndoAction({ type: "transposeRegion", left, right, by, opts });

        for (let i = left; i <= chords_and_otherwise.length; i++) {
            let chord = chord_at(i);
            if (not_chord(chord)) continue;

            if (chord.index > right) break;
            transposeChord(i, by, { relative, skipUpdate: true });
        }

        if (opts?.skipSave === true) return;
        repopulateTransposeComments();
        renderSelection();
        autosave();
    };

    let autoRegion = (left, right, opts = undefined) => {
        let stickTo = settings.stickyAutoTransposition ? opts?.stickTo : 0;
        let skipSave = opts?.skipSave ?? false;
        let ignorePrevious = opts?.ignorePrevious ?? false;

        // Store original transpositions
        let originalTranspositions = [];
        for (let i = left; i <= right; i++) {
            let chord = chord_at(i);
            if (not_chord(chord)) continue;
            originalTranspositions.push({
                index: i,
                transposition: chord.notes[0].transposition,
            });
        }

        let chords_in_region = [];
        for (let i = left; i <= right; i++) {
            let selected_chord = chords_and_otherwise[real_index_of(i)];
            chords_in_region.push(selected_chord);
        }

        if (stickTo == "same")
            stickTo = chords_in_region[0].notes[0].transposition();

        let ignores = ignorePrevious
            ? [chords_in_region[0].notes[0].transposition]
            : [];
        let best = best_transposition_for_monochord(
            chords_in_region,
            11,
            stickTo,
            settings.resilience ?? 4,
            ignores,
        );
        transposeRegion(left, right, best, { relative: false, skipSave: true });

        // Store undo action
        if (!skipSave) {
            pushUndoAction({
                type: "autoRegion",
                originalTranspositions,
            });
        }

        repopulateTransposeComments();
        if (!skipSave) autosave();

        return best;
    };

    let repopulateTransposeComments = () => {
        if (!chords_and_otherwise) return;

        // console.log(chords_and_otherwise)
        chords_and_otherwise = chords_and_otherwise.filter((e) => {
            /* console.log(e); */ return e.kind != "transpose";
        });

        let first_note = next_not(chords_and_otherwise, not_chord, 0)
            ?.notes?.[0];
        if (!first_note) return;

        let initial_transposition = first_note.transposition;

        // Add first transpose comment
        let previous_title = undefined;
        // Always keep title on top
        for (let i = 0; i < 5; i++) {
            if (chords_and_otherwise[i]?.kind == "title") {
                previous_title = chords_and_otherwise[i].text;
                // Remove old title
                chords_and_otherwise.splice(i, 1);
            }
        }

        if (previous_title) {
            // Add new title
            chords_and_otherwise.splice(0, 0, {
                type: "comment",
                kind: "title",
                text: previous_title,
                notop: true,
            });
        }

        let first_transpose_position = 0;
        for (const [index, e] of chords_and_otherwise.entries()) {
            if (e.kind == "title") first_transpose_position = index + 1;
        }

        console.log(first_transpose_position);

        chords_and_otherwise.splice(first_transpose_position, 0, {
            type: "comment",
            kind: "transpose",
            text: `Transpose by: ${-initial_transposition} #1`,
            notop: true,
        });
        let transpose_index = 1;

        let previous_transposition = initial_transposition;

        for (let i = 0; i < chords_and_otherwise.length; i++) {
            let current = chords_and_otherwise[i];
            if (not_chord(current)) continue;

            let transposition = current.notes[0].transposition;
            let difference = transposition - previous_transposition;

            if (difference != 0) {
                // Add comment
                let text = `Transpose by: ${-transposition > 0 ? "+" : ""}${-transposition}`;
                text += ` (${-difference > 0 ? "+" : ""}${-difference})`;
                text += ` #${++transpose_index}`;

                let non_comment_index = i;

                // Make sure to add the transpose before all other comments for consistency
                // while (chords_and_otherwise[non_comment_index]?.type == "comment")
                //     non_comment_index--

                chords_and_otherwise.splice(non_comment_index, 0, {
                    type: "comment",
                    kind: "transpose",
                    text,
                });
                previous_transposition = transposition;
            }
        }

        softRegen();
        renderSelection();
    };

    let transposeChord = (
        index,
        by,
        opts /* { relative = false, skipUpdate = false } */,
    ) => {
        let relative = opts?.relative ?? false;
        let skipUpdate = opts?.skipUpdate ?? false;

        let chord = chord_at(index);
        if (not_chord(chord)) return;

        // Store undo action
        if (!skipUpdate) {
            pushUndoAction({
                type: "transposeChord",
                index,
                by,
                opts,
            });
        }

        chord.transpose(by, relative, true); // mutate

        if (!skipUpdate) updateChords();
    };

    let multiTransposeRegion = (left, right /* [{left, right}, {...}] */) => {
        let regions = [];

        let idx = real_index_of(left);
        for (let i = idx; i < chords_and_otherwise.length; i++) {
            let event = chords_and_otherwise[i] ?? undefined;
            if (event.index >= right) {
                regions.push({ left, right: event.index });
                break;
            }
            if (event.type == "break" || !chords_and_otherwise[i + 1]) {
                let next_chord = next_not(chords_and_otherwise, not_chord, i);
                regions.push({ left, right: next_chord.index });
                left = next_chord.index;
            }
        }

        // Store original transpositions for each region
        let regionTranspositions = regions.map((region) => {
            let originalTranspositions = [];
            for (let i = region.left; i <= region.right; i++) {
                let chord = chord_at(i);
                if (not_chord(chord)) continue;
                originalTranspositions.push({
                    index: i,
                    transposition: chord.notes[0].transposition,
                });
            }
            return { ...region, originalTranspositions };
        });

        let chord = chords_and_otherwise[real_index_of(regions[0].left)];
        let previous_transposition = chord.notes[0]?.transposition ?? 0;

        for (let region of regions) {
            let best = autoRegion(region.left, region.right, {
                stickTo: previous_transposition,
                skipSave: true,
            });
            previous_transposition = best;
        }

        // Store undo action
        pushUndoAction({
            type: "multiTransposeRegion",
            regions: regionTranspositions,
        });

        repopulateTransposeComments();
        autosave();
    };

    let sheetTransposes = () => {
        let transposes = [];

        if (has_selection) {
            let start_real_index = real_index_of(selection.left);
            let end_real_index = real_index_of(selection.right);

            let initial_transpose_el = null;
            for (let i = start_real_index; i >= 0; i--) {
                if (chords_and_otherwise[i]?.kind === "transpose") {
                    initial_transpose_el = chords_and_otherwise[i];
                    transposes.push(initial_transpose_el);
                    break;
                }
            }

            for (let i = start_real_index; i <= end_real_index; i++) {
                let el = chords_and_otherwise[i];
                if (!el) break;
                if (el.kind === "transpose" && el !== initial_transpose_el) {
                    transposes.push(el);
                }
            }
        } else {
            transposes = chords_and_otherwise.filter(
                (e) => e.kind == "transpose",
            );
        }

        return transposes
            .map((e) => {
                const match = e.text.match(/Transpose by:\s(\+?(-?\d+))/);
                return match ? match[2] : null;
            })
            .join(" ");
    };

    function handleCopy(e) {
        settings.tempoMarks = true;
        settings.oorMarks = true;

        setTimeout(() => {
            let text;
            const nativeSelection = window.getSelection();

            if (nativeSelection.toString().length > 0) {
                // copy part of the sheet by native selection
                text = nativeSelection.toString();
            } else {
                // copy the entire sheet
                text = container.firstChild.innerText;
            }

            nativeSelection.removeAllRanges();

            text = text.replace(/(Transpose by: [^#]*)(#\d+)/g, "$1"); // removes all "#{number}" occurrences

            navigator.clipboard.writeText(text);
        }, 0);
    }

    function handleNativeSelection() {
        if (has_selection) {
            // if notes are actually selected with our custom selection logic, prevent native selection
            const nativeSelection = window.getSelection();
            nativeSelection.removeAllRanges();
        }
    }

    /**
     * Takes an image of the sheet, which can then be either copied/downloaded.
     * The image should be cropped to the maximum measure length via the value notesContainerWidth.
     * It's value depends on the max-content width of the div where notesContainerWidth is set.
     * @param {string} mode - A string indicating how the user wants to retrieve the image.
     * @param {boolean} selectionOnly - A boolean indicating whether to capture only the selected notes.
     * @enum {string} ["download", "copy"]
     */
    function captureSheetAsImage(mode, selectionOnly = false) {
        settings.capturingImage = true;
        settings.oorMarks = false;
        settings = settings; // Force reactivity for render_chord

        let notesContainer = container.firstChild;

        // Increase actual container's size to prevent cutoff
        notesContainer.style.width = `calc(${notesContainer.clientWidth}px + 1em)`;
        notesContainer.style.height = `calc(${notesContainer.clientHeight}px + 1em)`;

        let options = {
            scale: 2,
            onCloneNode: (node) => {
                let transposeCount = 1;
                let comments = node.querySelectorAll(".comment");
                comments.forEach((comment) => {
                    if (comment.textContent.includes("Transpose by:")) {
                        let indexSpan = Array.from(comment.children).find(
                            (c) =>
                                c.tagName === "SPAN" &&
                                c.textContent.trim().startsWith("#"),
                        );
                        if (indexSpan) {
                            indexSpan.textContent = "#" + transposeCount++;
                        }
                    }
                });
            },
        };

        // capturing selected notes into an image
        if (selectionOnly && has_selection) {
            let start = real_index_of(selection.left);
            let end = real_index_of(selection.right);

            // Backtrack to include header comments (e.g. Transpose by ...)
            let scan = start - 1;
            while (scan >= 0) {
                let item = chords_and_otherwise[scan];
                if (item.type == "comment" && item.kind != "inline") {
                    start = scan;
                    scan--;
                } else {
                    break;
                }
            }

            // Check if we have a transpose above the first line in the selection, if not, find the previous one
            let extraTransposeIndex = -1;
            let firstItem = chords_and_otherwise[start];
            if (firstItem.kind !== "transpose") {
                let backScan = start - 1;
                while (backScan >= 0) {
                    let item = chords_and_otherwise[backScan];
                    if (item.type == "comment" && item.kind == "transpose") {
                        extraTransposeIndex = backScan;
                        break;
                    }
                    backScan--;
                }
            }

            // Create a temporary container to measure the exact size of the selected content
            let tempDiv = notesContainer.cloneNode(false);
            tempDiv.style.position = "absolute";
            tempDiv.style.visibility = "hidden";
            tempDiv.style.width = "max-content";
            tempDiv.style.height = "auto";
            tempDiv.style.minHeight = "0";
            tempDiv.style.padding = "0";

            // We need to replicate the class/id/style context if possible,
            // but cloning notesContainer should cover the immediate styles.

            let items = notesContainer.querySelectorAll(".sheet-item");

            items.forEach((node) => {
                let index = +node.dataset.index;
                if (index === extraTransposeIndex) {
                    tempDiv.appendChild(node.cloneNode(true));
                }
                if (index >= start && index <= end) {
                    tempDiv.appendChild(node.cloneNode(true));
                }
            });

            container.appendChild(tempDiv);
            options.width = tempDiv.offsetWidth;

            // Add a small buffer to height to avoid bottom clipping due to rounding
            options.height = tempDiv.offsetHeight + 5;
            container.removeChild(tempDiv);

            options.filter = (node) => {
                if (node.classList?.contains("sheet-item")) {
                    let index = +node.dataset.index;
                    return (
                        (index >= start && index <= end) ||
                        index === extraTransposeIndex
                    );
                }
                return true;
            };
        }

        setTimeout(
            () =>
                domToBlob(container, options).then((blob) => {
                    if (mode === "copy") {
                        copyCapturedImage(blob);
                    } else {
                        downloadCapturedImage(blob);
                    }

                    settings.capturingImage = false;
                    settings = settings;

                    // Restore original element size
                    notesContainer.style.width = notesContainer.style.height =
                        "max-content";
                }),
            250,
        );
    }

    function copyCapturedImage(blob) {
        // note: ClipboardItem is not supported by mozilla
        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob,
                }),
            ]);
        } catch (err) {
            console.error(err);
        }
    }

    function downloadCapturedImage(blob) {
        download(blob, "png");
    }

    function downloadSheetData(piece) {
        filename = piece.name;
        let blob = new Blob([JSON.stringify(piece)], { type: "text/json" });
        download(blob, "json");
    }

    function download(blob, extension) {
        const url = URL.createObjectURL(blob);

        let output = `${filename}.${extension}`;

        // create a temporary element to download the data
        let linkEl = document.createElement("a");
        linkEl.href = url;
        linkEl.download = output;

        document.body.appendChild(linkEl);
        linkEl.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(linkEl);
    }

    function droppedFile(e) {
        e.preventDefault();

        let file = e?.dataTransfer?.items?.[0];
        if (!file || !file.getAsFile) {
            console.error("bad file dropped");
            return;
        }

        fileInput.files = e.dataTransfer.files;
        onFileChange();
    }

    function clearFiles() {
        chords_and_otherwise = undefined;
        document.getElementById("drop").value = "";
    }

    let pieces = history.getAll();
    if (pieces.length == 0 && !localStorage.getItem("hadSample")) {
        localStorage.setItem("hadSample", true);

        fetch(sample_uri)
            .then((response) => response.json())
            .then((other) => {
                history.add(other.name, other.settings, other.data, true);
                setTimeout(() => {
                    pieces = history.getAll((remaining = remainingSize()));
                }, 0);
            });
    }

    function autosave() {
        if (filename)
            history
                .add(filename, settings, chords_and_otherwise)
                .then(() => (pieces = history.getAll()));

        remaining = remainingSize();
        console.log("saving", chords_and_otherwise);
        return;
    }

    function next_not(coll, pred, start = 0) {
        let i = start;
        while (coll[i] && pred(coll[i])) {
            i++;
        }
        /* then */ return coll[i];
    }

    let has_selection = false;
    let selection = {
        left: undefined,
        right: undefined,
    };
    $: {
        has_selection =
            selection.left != undefined && selection.right != undefined;
        handleNativeSelection(); // would unset natively selected content if it now has_selection
        // print("Selection: ", selection)
    }

    function resetSelection(e) {
        if (
            !sheetReady ||
            (selection.left === undefined && !selection.right === undefined)
        )
            return;

        for (let i = selection.left; i < chords_and_otherwise.length; i++) {
            const chord = chords_and_otherwise[i];
            if (not_chord(chord)) continue;

            if (chord.index > selection.right) break;

            chord.selected = undefined;
        }

        selection.left = undefined;
        selection.right = undefined;

        updateChords();
    }

    function selectAll() {
        selection.left = 0;
        selection.right =
            chords_and_otherwise[chords_and_otherwise.length - 1].index;

        renderSelection();
    }

    function renderSelection(e) {
        if (!chords_and_otherwise) return;
        // console.log('rendering', selection)

        // Deselect everything
        for (let i = selection.left; i < chords_and_otherwise.length; i++) {
            let chord = chords_and_otherwise[real_index_of(i)];
            if (not_chord(chord)) continue;
            chord.selected = undefined;
            if (i > chord.index) break;
        }

        // Select pertinent part
        for (let i = selection.left; i <= selection.right; i++) {
            let chord = chords_and_otherwise[real_index_of(i)];
            if (!chord) continue;
            if (chord.index > selection.right) break;

            chord.selected = true;
        }

        updateChords();
    }

    function setSelection(event_or_index) {
        let index = event_or_index.detail?.index ?? event_or_index;
        if (event_or_index.detail?.toBottom) {
            resetSelection();
            selection.left = index;
            index = chords_and_otherwise[chords_and_otherwise.length - 1].index;
        }

        // Double-click to select line
        if (selection.left === index && selection.right === index) {
            // Find line bounds
            let left = real_index_of(index);
            // console.log(left)
            while (is_chord(chords_and_otherwise[left])) {
                left--;
            }
            left++;
            let right = left;
            while (is_chord(chords_and_otherwise[right])) {
                right++;
            }
            right--;

            selection.left = chords_and_otherwise[left].index;
            selection.right = chords_and_otherwise[right].index;
        }
        // Swap left and right if needed
        else if (index < selection.left || selection.left === undefined) {
            selection.right = selection.left ?? index;
            selection.left = index;
        } else {
            selection.right = index;
        }

        renderSelection();
    }

    function splitLineAt(index) {
        let real_index = real_index_of(index);

        // Store undo action
        pushUndoAction({
            type: "splitLineAt",
            left: index,
            right: index,
        });

        chords_and_otherwise.splice(real_index, 0, { type: "break" });
        updateChords();
    }

    function joinRegion(left, right) {
        let start = real_index_of(left);

        // Store break positions for undo
        let breakIndices = [];
        for (let i = start; i < chords_and_otherwise.length; i++) {
            if (chords_and_otherwise[i]?.type == "break") {
                breakIndices.push(i);
            }
            if (i > real_index_of(right)) break;
        }

        // Store undo action
        pushUndoAction({
            type: "joinRegion",
            breakIndices,
        });

        for (let i = start; i < chords_and_otherwise.length; i++) {
            if (chords_and_otherwise[i]?.type == "break") {
                chords_and_otherwise.splice(i, 1);
                i--;
            }
            if (i > real_index_of(right)) break;
        }
        updateChords();
    }

    function continueTranspose(direction /* 'ltr' or 'rtl' */) {
        let start = direction == "ltr" ? selection.left : selection.right;
        let transposition =
            chords_and_otherwise[real_index_of(start)].notes[0].transposition;

        transposeRegion(selection.left, selection.right, transposition);
    }

    let editChordDialog = undefined;
    let chordToEdit = undefined;
    let editChord = () => {
        let chord = chord_at(selection.left);
        if (not_chord(chord)) return;
        chordToEdit = chord;

        editChordDialog.showModal();
    };

    let chordChanged = (e) => {
        let recipient = chord_at(chordToEdit.index);
        recipient.notes = e.detail.notes;
        if (e.detail.overrides) recipient.overrides = e.detail.overrides;
        softRegen();
        autosave();
    };

    let undoStack = [];
    const MAX_UNDO_STEPS = 50;
    let undoing = false;
    function pushUndoAction(action) {
        if (undoing) return; // Don't overwrite the same thing
        undoStack.push(action);
        if (undoStack.length > MAX_UNDO_STEPS) {
            undoStack.shift();
        }
    }

    function undo() {
        if (undoStack.length === 0) return;
        const action = undoStack.pop();
        undoing = true;
        switch (action.type) {
            case "transposeChord":
                transposeChord(action.index, -action.by, action.opts);
                break;
            case "transposeRegion":
                transposeRegion(
                    action.left,
                    action.right,
                    -action.by,
                    action.opts,
                );
                break;
            case "autoRegion":
                // Restore original transpositions
                for (let i = 0; i < action.originalTranspositions.length; i++) {
                    const { index, transposition } =
                        action.originalTranspositions[i];
                    transposeChord(index, transposition, {
                        relative: false,
                        skipUpdate: true,
                    });
                }
                updateChords();
                break;
            case "multiTransposeRegion":
                // Restore original transpositions for each region
                for (const region of action.regions) {
                    for (
                        let i = 0;
                        i < region.originalTranspositions.length;
                        i++
                    ) {
                        const { index, transposition } =
                            region.originalTranspositions[i];
                        transposeChord(index, transposition, {
                            relative: false,
                            skipUpdate: true,
                        });
                    }
                }
                updateChords();
                break;
            case "addComment":
                chords_and_otherwise.splice(action.index, 1);
                updateChords();
                break;
            case "splitLineAt":
                joinRegion(action.left - 1, action.right);
                break;
            case "joinRegion":
                for (const breakIndex of action.breakIndices)
                    chords_and_otherwise.splice(breakIndex, 0, {
                        type: "break",
                    });
                updateChords();
                break;
        }
        undoing = false;
        repopulateTransposeComments();
        renderSelection();
        autosave();
    }
</script>

<svelte:window
    on:keydown={(e) => {
        if (e.key == "Escape") resetSelection();
        // console.log(e.target)
        if (
            e.target.tagName != "INPUT" &&
            e.target.tagName != "TEXTAREA" &&
            e.target.contentEditable != "true"
        ) {
            if (e.key == "b") {
                let chord_to_print = chord_at(selection.left);
                console.log("-----------");
                console.log(chord_to_print);
                console.log(chord_to_print.notes[0]);
                console.log("-----------");
            }
            if (e.key == "B") {
                console.log(chords_and_otherwise);
            }

            if (selection.left !== undefined) {
                if (e.key == "s") splitLineAt(selection.left);
                if (e.key == "j" || e.key == "g")
                    joinRegion(selection.left, selection.right);
            }
            if (e.ctrlKey && e.key.toLowerCase() === "z") undo();
        }
    }}
/>

<!-- Only shown if needed -->
<ChordEditor
    chord={chordToEdit}
    {settings}
    bind:dialog={editChordDialog}
    on:chordChanged={chordChanged}
    on:closed={resetSelection}
/>

<svelte:head>
    <title>MIDI Converter</title>
</svelte:head>

<svelte:body on:click|self={resetSelection} on:keypress|self={() => {}} />

<!-- <button class="sticky" on:click={() => { repopulateTransposeComments() }}>do stuff</button> -->

<dialog
    bind:this={existingProject.element}
    class="rounded-lg overflow-hidden"
    on:close={() => {
        existingProject.proceed();
    }}
>
    <form class="flex flex-col row-auto items-center">
        <p class="p-3 text-center">
            Careful, you've previously edited this sheet!
            <br />
            Loading it again will overwrite your progress.
        </p>
        <div class="mx-2 mb-2 flex gap-2 w-full justify-center">
            <button formmethod="dialog" class="p-1" value="load"
                >Load saved</button
            >
            <button formmethod="dialog" class="p-1" value="export-and-restart"
                >Export and Start over</button
            >
            <button formmethod="dialog" class="p-1" value="new"
                >Start over</button
            >
        </div>
    </form>
</dialog>

<div
    bind:this={importer.element}
    class="flex flex-col gap-12 w-full h-full items-center align-center justify-center content-center
            absolute top-0 z-50"
    style="height:100%; background: rgb(45,42,50);
            background: linear-gradient(45deg, rgba(45,42,50,1) 0%, rgba(50,40,40,1) 50%, rgba(71,57,37,1) 100%);
            transition: all 0.6s ease-in-out;"
>
    <div class="flex flex-col items-center gap-6">
        <p class="text-white text-3xl">
            Import a MIDI/JSON file to get started:
        </p>
        <label
            on:drop|preventDefault={droppedFile}
            on:dragover|preventDefault
            for="drop"
            class="cursor-pointer
                                 rounded-xl
                                 text-xl
                                 p-4"
            style="border: 2px solid dimgrey"
        >
            Click or drop a MIDI/JSON file here!
        </label>
        <input
            id="drop"
            class="hidden"
            type="file"
            bind:this={fileInput}
            accept=".mid,.midi,.json"
            on:change={onFileChange}
        />
    </div>

    {#if pieces.length > 0}
        <!-- Has piece(s) in history? -->
        <hr class="w-[58em]" style="border: 1px solid #a0a0a0" />

        <div class="flex flex-col items-center gap-6">
            {#if pieces.length == 1 && pieces[0].name.endsWith("(sample)")}
                <p class="text-white text-3xl">Or, try this sample piece:</p>
            {:else}
                <p class="text-white text-3xl">
                    Or, continue one of your previous projects:
                </p>
            {/if}
            <div
                class="w-3/4 flex flex-wrap justify-center gap-2 overflow-clip text-ellipsis"
            >
                {#each pieces as piece}
                    <HistoryEntry
                        {piece}
                        on:load={(x) => {
                            existingProject.setAndProceed(x.detail.project);
                            importer.hide();
                        }}
                        on:refresh={() => {
                            pieces = history.getAll();
                            remaining = remainingSize();
                        }}
                        on:export={() => downloadSheetData(piece)}
                    />
                {/each}
            </div>
        </div>

        <div>
            Used ~{remaining} / 5000 kB
            <span
                title="The last entry (or multiple) will automatically be dropped if an autosave fails.
You can also right-click a saved sheet to manually delete it.
Individual sizes are an estimation, the total is correct.">ⓘ</span
            >
        </div>
    {/if}
</div>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="flex flex-row"
    on:click|self={resetSelection}
    on:keypress|self={() => {}}
>
    <div
        id="sidebar"
        class="mx-1 my-0 flex flex-col sticky overflow-y-auto top-0"
        style="min-width:25em; max-width:25em; max-height: 99vh; max-height: 99dvh"
    >
        <div>
            {#if sheetReady}
                <p class="mb-2">You are currently editing: {filename}</p>
                <button
                    class="w-full"
                    on:click={() => {
                        importer.show();
                        setTimeout(() => {
                            sheetReady = false;
                            filename = null;
                            clearFiles();
                        }, 600);
                    }}
                >
                    Import another MIDI/JSON file
                </button>
                <hr class="my-2 mx-1" />
            {/if}
            <!-- Selection control -->
            <div class="flex flex-col gap-2">
                <button on:click={selectAll}>Select all</button>
                {#if has_selection}
                    <div
                        class="flex flex-row justify-around items-center gap-2"
                    >
                        <button
                            class="w-full block"
                            on:click={() => {
                                transposeRegion(
                                    selection.left,
                                    selection.right,
                                    1,
                                    { relative: true },
                                );
                                repopulateTransposeComments();
                            }}>Transpose selection down</button
                        >
                        <button
                            class="w-full block"
                            on:click={() => {
                                transposeRegion(
                                    selection.left,
                                    selection.right,
                                    -1,
                                    { relative: true },
                                );
                                repopulateTransposeComments();
                            }}>Transpose selection up</button
                        >
                    </div>
                    <button
                        disabled={isAutoTransposing}
                        on:click={() => handleAutoTranspose("single")}
                    >
                        {isAutoTransposing
                            ? "Please Wait..."
                            : "Auto-transpose (single)"}
                    </button>
                    <button
                        disabled={isAutoTransposing}
                        on:click={() => handleAutoTranspose("multi")}
                    >
                        {isAutoTransposing
                            ? "Please Wait..."
                            : "Auto-transpose (multi)"}
                    </button>

                    <!-- Continue transpose L/R -->
                    <div
                        class="flex flex-row justify-around items-stretch gap-2"
                    >
                        <button
                            class="w-full block"
                            on:click={() => {
                                continueTranspose("rtl");
                            }}>Continue transposition (right to left)</button
                        >
                        <button
                            class="w-full block"
                            on:click={() => {
                                continueTranspose("ltr");
                            }}>Continue transposition (left to right)</button
                        >
                    </div>
                    <hr class="my-2 mx-1" />
                    <div
                        class="flex flex-row justify-around items-stretch gap-2"
                    >
                        <button
                            class="w-full block cursor-help"
                            title="Shortcut: J or G"
                            on:click={() => {
                                joinRegion(selection.left, selection.right);
                            }}>Join selection</button
                        >
                        <button
                            class="w-full block cursor-help"
                            title="Shortcut: S"
                            on:click={() => {
                                splitLineAt(selection.left);
                            }}>Split selection</button
                        >
                    </div>
                    <div
                        class="flex flex-row justify-around items-stretch gap-2"
                    >
                        <button
                            class="w-full block"
                            disabled={settings.breaks != "realistic"}
                            title={settings.breaks != "realistic"
                                ? "Only available with 'Realistic' breaks mode"
                                : ""}
                            on:click={() => {
                                chord_at(selection.left - 1).reflow = true;
                                saveSheet();
                            }}>Make measure beginning</button
                        >
                        <button
                            class="w-full block"
                            on:click={() => {
                                addComment(selection.left);
                            }}>Add a comment</button
                        >
                    </div>

                    <button
                        on:click={() => {
                            editChord();
                        }}>Edit chord</button
                    >
                {/if}
            </div>
            <SheetOptions
                bind:settings
                show={sheetReady}
                hasMIDI={!!MIDIObject}
            />
        </div>
        <Guide />
        <hr class="mx-2 my-1" />
        <a
            target="_blank"
            class="underline text-white"
            href="https://github.com/ArijanJ/midi-converter/issues"
        >
            Suggestions, bug reports, or just need help?
        </a>
    </div>

    {#if sheetReady == true}
        <div
            class="flex flex-col items-start"
            on:click|self={resetSelection}
            on:keypress|self={() => {}}
            on:contextmenu|preventDefault
        >
            <SheetActions
                {settings}
                hasSelection={has_selection}
                on:captureSheetAsImage={(event) => {
                    captureSheetAsImage(
                        event.detail.mode,
                        event.detail.selectionOnly,
                    );
                }}
                on:copyText={handleCopy}
                on:copyTransposes={() => {
                    navigator.clipboard.writeText(sheetTransposes());
                }}
                on:export={() => {
                    autosave();
                    setTimeout(() => {
                        if (existingProject?.data === undefined) {
                            let pieces = history.getAll();
                            let thisPiece = pieces.filter(
                                (entry) => entry.name === filename,
                            )[0];

                            existingProject.setAndProceed(thisPiece, true);
                        }

                        history
                            .export(existingProject.name)
                            .then((piece) => downloadSheetData(piece));
                    }, 0);
                }}
                on:addTitle={() => {
                    chords_and_otherwise.splice(0, 0, {
                        type: "comment",
                        kind: "title",
                        text: "Add a title...",
                    });
                    renderSelection();
                    window.scroll(0, 0);
                }}
            />

            <div
                class:select-none={has_selection}
                class:select-text={!has_selection}
                style="background: #2D2A32;"
                bind:this={container}
            >
                <div
                    style="width: max-content; font-family:{settings.font}; line-height:{settings.lineHeight}%"
                    on:click|self={resetSelection}
                    on:keypress|self={() => {}}
                >
                    {#each chords_and_otherwise as inner, index}
                        <!-- not a chord -->
                        {#if inner.type}
                            {@const next_thing = chords_and_otherwise[+index + 1]}
                            {@const previous_thing = chords_and_otherwise[+index - 1]}
                            {#if inner.type === "break" && next_thing.type != "comment" && previous_thing?.type != "comment"}
                                <br data-index={index} class="sheet-item" />
                            {:else if inner.type === "comment"}
                                {#if previous_thing?.type != "comment" && inner.notop != true && inner.kind != "inline"}
                                    <br data-index={index} class="sheet-item" />
                                {/if}
                                {#if ["custom", "tempo", "inline", "title"].includes(inner.kind)}
                                    <span
                                        class="comment sheet-item"
                                        data-index={index}
                                        on:click|stopPropagation
                                        on:keypress|stopPropagation
                                        contenteditable="true"
                                        on:contextmenu|preventDefault
                                        style="white-space:pre-wrap;"
                                        on:focusout={(e) => {
                                            updateComment(
                                                index,
                                                e.target.innerText,
                                            );
                                        }}
                                    >
                                        {#if inner.kind == "inline"}
                                            {@html inner.text}
                                        {:else}
                                            {inner.text}
                                        {/if}
                                    </span>
                                {:else}
                                    <span
                                        on:contextmenu|preventDefault
                                        class="comment sheet-item"
                                        data-index={index}
                                    >
                                        {#if inner.kind === "transpose"}
                                            {@const [transposeText, transposeIndex] = inner.text.split(" #")}

                                            {transposeText}
                                            <span style="font-size: 10px; opacity: 0.25;">
                                                #{transposeIndex}
                                            </span>
                                        {:else}
                                            {inner.text}
                                        {/if}
                                    </span>
                                {/if}
                                {#if inner.kind != "inline"}
                                    <!-- and is any comment, break after -->
                                    <br data-index={index} class="sheet-item" />
                                {/if}
                            {/if}
                        {:else}
                            <Chord
                                chord={inner}
                                next={inner.next ?? undefined}
                                selected={inner.selected}
                                index={inner.index}
                                data-index={index}
                                class="sheet-item"
                                on:select={setSelection}
                                {settings}
                            />
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>
