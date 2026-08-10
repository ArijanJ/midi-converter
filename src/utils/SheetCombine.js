import { getGlobalContext } from "./GlobalContext";
import { domToBlob } from "modern-screenshot";
import { decompress } from "./History";
import { is_chord } from "../utils/VP";
import { concatToBuffer } from "image-stitch/bundle";


export const CHUNK_MAX_ITEMS = 6400;

/**
 * Target rendered height (in px) for each captured chunk.
 * Keeps each DOM capture comfortably below browser element/canvas limits.
 */
const TARGET_CHUNK_HEIGHT = 9000;

/**
 * Absolute lower bound for a chunk, regardless of how tall a sheet renders.
 */
const MIN_CHUNK_MAX_ITEMS = 3200;

/**
 * Base font size (10pt from global.css) used to estimate line height.
 */
const BASE_FONT_SIZE = 13.33;

/**
 * Estimates how many rendered lines a sheet item produces.
 * Chords share a line between breaks/comments, so only breaks and comments add lines.
 */
function estimateLinesForItem(item) {
  if (!item) return 0;
  if (item.type === "break") return 1;
  if (item.type === "comment") {
    // Each comment is wrapped in <br>s and long comments wrap over multiple lines
    const wrappedLines = Math.max(0, Math.ceil((item.text?.length ?? 1) / 60) - 1);
    return 2 + wrappedLines;
  }
  return 0;
}

/**
 * Dynamically calculates a chunk size for a specific sheet so that each chunk
 * stays under a target rendered height, based on the sheet's estimated layout.
 *
 * @param {Array} data - The sheet items to be chunked.
 * @param {Object} [settings] - App settings (used for font/line-height).
 * @returns {number} The number of items each chunk should target.
 */
export function calculateChunkMaxItems(data, settings = {}) {
  if (!Array.isArray(data) || data.length === 0) return CHUNK_MAX_ITEMS;

  const fontSize = settings.fontSize ?? BASE_FONT_SIZE;
  const lineHeightPx = (fontSize * (settings.lineHeight ?? 135)) / 100;

  let lines = 1;
  for (const item of data) {
    lines += estimateLinesForItem(item);
  }
  lines = Math.max(1, lines);

  const totalHeight = lines * lineHeightPx;
  if (totalHeight <= 0) return CHUNK_MAX_ITEMS;

  // Fraction of the sheet that fits inside the target chunk height
  const chunkFraction = Math.min(1, TARGET_CHUNK_HEIGHT / totalHeight);
  const computed = Math.round(data.length * chunkFraction);

  return Math.max(MIN_CHUNK_MAX_ITEMS, Math.min(CHUNK_MAX_ITEMS, computed));
}

/**
 * Re-indexes transpose comments globally across one or more combined sheets and calculates relative differences.
 */
export function reindexTransposes(data, globalIndex, lastTransposeValue) {
  let currentIndex = globalIndex;
  let currentLastValue = lastTransposeValue;

  // Clone data to avoid mutating original source
  let workingData = [...data];

  // Check if we need to inject an initial transpose comment
  const hasTranspose = workingData.some(item => item.kind === "transpose");

  if (!hasTranspose) {
    let firstChordIndex = workingData.findIndex(item => is_chord(item));
    if (firstChordIndex !== -1) {
      const chord = workingData[firstChordIndex];
      if (chord.notes && chord.notes.length > 0) {
        const firstNote = chord.notes[0];
        const transposition = firstNote.value - (firstNote.original ?? firstNote.value);

        // App.svelte logic: text = `Transpose by: ${-transposition} #1`
        // We create the base text, reindexing loop will add the #index
        const newComment = {
          type: "comment",
          kind: "transpose",
          text: `Transpose by: ${-transposition}`,
          notop: true
        };

        // Insert before the first chord
        workingData.splice(firstChordIndex, 0, newComment);
      }
    }
  }

  const processedData = [];

  for (const item of workingData) {
    if (item.kind === "transpose") {
      const match = item.text.match(/Transpose by:?\s*([+-]?\d+)/);
      if (match) {
        const val = parseInt(match[1]);

        if (currentLastValue !== undefined && val === currentLastValue) {
          continue;
        }

        let label = `Transpose by: ${val > 0 ? "+" : ""}${val}`;

        if (currentLastValue !== undefined) {
          const diff = val - currentLastValue;
          label += ` (${diff > 0 ? "+" : ""}${diff})`;
        }

        currentLastValue = val;

        processedData.push({
          ...item,
          text: `${label} #${currentIndex++}`,
        });
      } else {
        let cleanText = item.text.replace(/ #\d+$/, "").trim();
        processedData.push({
          ...item,
          text: `${cleanText} #${currentIndex++}`,
        });
      }
    } else {
      processedData.push(item);
    }
  }

  return {
    data: processedData,
    nextIndex: currentIndex,
    nextLastValue: currentLastValue,
  };
}

/**
 * Finds the playtime of the first available note in the sheet data.
 */
function getFirstNotePlayTime(data) {
  const firstChord = data.find(is_chord);
  return firstChord?.notes?.[0]?.playTime;
}

/**
 * Removes leading and trailing breaks from the sheet data to eliminate extra vertical space.
 * Also strips breaks that are redundant because they sit next to a transpose comment at the start/end.
 */
function stripLeadingAndTrailingBreaks(data) {
  let result = [...data];

  // Strip leading breaks
  while (result.length > 0 && result[0].type === "break") {
    result.shift();
  }

  // Strip trailing breaks
  while (result.length > 0 && result[result.length - 1].type === "break") {
    result.pop();
  }

  return result;
}

/**
 * Merges consecutive breaks in the data to avoid double spacing.
 */
function mergeConsecutiveBreaks(data) {
  const stripped = stripLeadingAndTrailingBreaks(data);
  const result = [];
  for (let i = 0; i < stripped.length; i++) {
    const item = stripped[i];
    if (item.type === "break" && result[result.length - 1]?.type === "break") {
      continue; // Skip consecutive breaks
    }
    result.push(item);
  }
  return result;
}

/**
 * Splits sheet data into chunks of maximum size, ending each chunk at a break.
 */
export function chunkSheetData(data, chunkMaxItems = CHUNK_MAX_ITEMS) {
  const chunks = [];
  let currentChunk = [];
  for (const item of data) {
    currentChunk.push(item);
    if (item.type === "break" && currentChunk.length >= chunkMaxItems) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);
  return chunks;
}

/**
 * Helper to capture multiple chunks and stitch them together using image-stitch.
 */
export async function captureChunksAndStitch({ flatChunks, loadSheet, onProgress, onCloneNode }) {
  let captures = [];
  const totalChunks = flatChunks.length;

  for (let idx = 0; idx < totalChunks; idx++) {
    const chunk = flatChunks[idx];
    const target = await loadSheet(chunk.name, chunk.chunkData);
    const ctx = getGlobalContext();

    ctx.setForcedNextSheetStartTime(chunk.nextStart);
    ctx.softRegen();
    await ctx.tick();
    await new Promise(r => setTimeout(r, 100));

    target.style.height = "max-content";
    target.style.width = "max-content";
    target.style.whiteSpace = "nowrap";
    void target.offsetHeight;

    const rect = target.getBoundingClientRect();
    const padding = chunk.isLastOfAll ? 10 : 0;
    const chunkH = rect.height + padding;

    const options = {
      scale: 2,
      width: rect.width,
      height: chunkH,
      backgroundColor: "#2D2A32",
      style: {
        backgroundColor: "#2D2A32",
        width: rect.width + "px"
      },
      onCloneNode,
    };

    try {
      const blob = await domToBlob(target, options);
      if (!blob) throw new Error("Captured chunk blob is null");
      const buffer = await blob.arrayBuffer();
      captures.push(new Uint8Array(buffer));
    } catch (err) {
      console.error(`Chunk capture failed at chunk ${idx}:`, err);
      throw err;
    }

    if (onProgress) {
      const percent = ((idx + 1) / totalChunks) * 70;
      onProgress(percent, chunk.progressLabel || `Capturing chunk ${idx + 1} of ${totalChunks}`);
    }
  }

  if (captures.length === 0) return null;

  try {
    const resultBuffer = await concatToBuffer({
      inputs: captures,
      layout: { columns: 1 },
      outputFormat: 'png',
      backgroundColor: '#2D2A32',
      onProgress: (completed, total) => {
        if (onProgress) {
          const stitchPercent = 70 + (completed / total) * 30;
          onProgress(stitchPercent, "Stitching images together...");
        }
      },
    });

    if (onProgress) onProgress(100, "Done!");

    captures.length = 0;
    return new Blob([resultBuffer], { type: "image/png" });
  } catch (err) {
    console.error("Stitching failed:", err);
    throw new Error(`Failed to stitch images: ${err.message}`);
  }
}

/**
 * Iterates through sheets, loads them into the DOM, and captures snapshots of the sheet in chunks.
 * Uses image-stitch to combine PNGs directly, avoiding browser canvas size limits.
 */
export async function generateCombinedImage({ selectedSheets, loadSheet, onProgress }) {
  let globalTransposeIndex = 1;
  let lastTransposeValue = undefined;

  // Chunking and taking several images is safer and faster than taking a picture of a combined dom
  if (onProgress) onProgress(0, "Preparing sheets...");

  // Phase 1: Prepare all sheets and prepare each sheet as chunks
  const preparedSheets = [];
  for (let i = 0; i < selectedSheets.length; i++) {
    const sheet = selectedSheets[i];
    let data = decompress(sheet.data);

    // Look ahead to the next sheet for timing continuity
    let nextStart = undefined;
    if (i < selectedSheets.length - 1) {
      const nextData = decompress(selectedSheets[i + 1].data);
      nextStart = getFirstNotePlayTime(nextData);
    }

    const { data: reindexedData, nextIndex, nextLastValue } = reindexTransposes(
      data,
      globalTransposeIndex,
      lastTransposeValue,
    );
    globalTransposeIndex = nextIndex;
    lastTransposeValue = nextLastValue;

    // Strip leading/trailing breaks and merge consecutive ones
    const strippedData = mergeConsecutiveBreaks(reindexedData);

    // Dynamic chunk size so each chunk stays under the target rendered height
    const chunkMaxItems = calculateChunkMaxItems(strippedData);

    // Split the data into chunks before DOM loads
    const chunks = [];
    let currentChunk = [];
    for (const item of strippedData) {
      currentChunk.push(item);
      if (item.type === "break" && currentChunk.length >= chunkMaxItems) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    preparedSheets.push({ name: sheet.name, chunks, nextStart });
  }

  // Flatten the prepared chunks
  const flatChunks = [];
  for (let i = 0; i < preparedSheets.length; i++) {
    const prep = preparedSheets[i];
    for (let c = 0; c < prep.chunks.length; c++) {
      flatChunks.push({
        name: prep.name,
        chunkData: prep.chunks[c],
        nextStart: c === prep.chunks.length - 1 ? prep.nextStart : undefined,
        isLastOfAll: i === preparedSheets.length - 1 && c === prep.chunks.length - 1,
        progressLabel: `Capturing sheet ${i + 1} of ${selectedSheets.length}${prep.chunks.length > 1 ? ` (chunks ${c + 1}/${prep.chunks.length})` : ""}`
      });
    }
  }

  const resultBlob = await captureChunksAndStitch({
    flatChunks,
    loadSheet,
    onProgress,
  });

  preparedSheets.length = 0;
  return resultBlob;
}

/**
 * Generates combined text content from multiple sheets.
 */
export async function generateCombinedText({ selectedSheets, loadSheet, onProgress }) {
  let combinedText = "";
  let globalTransposeIndex = 1;
  let lastTransposeValue = undefined;

  for (let i = 0; i < selectedSheets.length; i++) {
    if (onProgress) onProgress(i + 1, selectedSheets.length);
    const sheet = selectedSheets[i];
    let data = decompress(sheet.data);

    // Look ahead to the next sheet for timing continuity
    let nextStart = undefined;
    if (i < selectedSheets.length - 1) {
      const nextData = decompress(selectedSheets[i + 1].data);
      nextStart = getFirstNotePlayTime(nextData);
    }

    const { data: reindexedData, nextIndex, nextLastValue } = reindexTransposes(
      data,
      globalTransposeIndex,
      lastTransposeValue,
    );
    globalTransposeIndex = nextIndex;
    lastTransposeValue = nextLastValue;

    // Strip leading/trailing breaks and merge consecutive ones
    const strippedData = mergeConsecutiveBreaks(reindexedData);

    const target = await loadSheet(sheet.name, strippedData, 400);

    // Apply temporary generation settings (ordering, quantization) via softRegen
    const ctx = getGlobalContext();
    ctx.setForcedNextSheetStartTime(nextStart);
    ctx.softRegen();

    await ctx.tick();

    let text = target.innerText;

    // Clean up redundant indices
    text = text.replace(/(Transpose by: [^#]*)(#\d+)/g, "$1");
    combinedText += `${text}\n`;
  }

  return combinedText.trim();
}

/**
 * Combines transpose values into a space-separated string.
 */
export function generateCombinedTransposes(selectedSheets) {
  let allTransposes = [];
  let globalTransposeIndex = 1;
  let lastTransposeValue = undefined;

  for (let i = 0; i < selectedSheets.length; i++) {
    const sheet = selectedSheets[i];
    let data = decompress(sheet.data);

    // Reuse reindexTransposes to handle:
    // 1. Injecting missing transpose comments (e.g. for split sheets)
    // 2. Filtering out consecutive duplicate values
    const { data: reindexedData, nextIndex, nextLastValue } = reindexTransposes(
      data,
      globalTransposeIndex,
      lastTransposeValue,
    );

    globalTransposeIndex = nextIndex;
    lastTransposeValue = nextLastValue;

    const transposes = reindexedData.filter((item) => item.kind === "transpose");

    let transposesText = transposes
      .map((e) => {
        const match = e.text.match(/Transpose by:\s(\+?(-?\d+))/);
        return match ? match[2] : null;
      })
      .filter((x) => x)
      .join(" ");

    if (transposesText) allTransposes.push(transposesText);
  }

  return allTransposes.join(" ");
}

/**
 * Helper for the HistoryCombine utility to load a sheet and wait for layout.
 */
export async function loadSheetForHistoryCombine(
  name,
  data,
  waitTime = 1200,
) {
  const ctx = getGlobalContext();
  ctx.setChordsAndOtherwise(data);
  ctx.setFilename(name);
  await new Promise((r) => setTimeout(r, waitTime));

  // Wait for the container DOM element to exist (sheetReady may have just been set)
  let container = ctx.getContainer();
  let attempts = 0;
  while (!container && attempts < 20) {
    await new Promise((r) => setTimeout(r, 100));
    container = ctx.getContainer();
    attempts++;
  }

  if (!container) {
    throw new Error("Sheet container not available");
  }

  return container.querySelector("div");
}

export async function handleHistoryCombineCommand(e) {
  const ctx = getGlobalContext();
  const { type, mode, tempSettings } = e.detail;

  let originalData = ctx.getChordsAndOtherwise();
  let originalFilename = ctx.getFilename();
  let originalSheetReady = ctx.getSheetReady();
  let originalSettings = { ...ctx.getSettings() };

  try {
    ctx.HistoryCombineDialogComp.setBusy(true);

    if (tempSettings) {
      ctx.updateSettings(tempSettings);
    }

    if (type === "image") {
      let downloadName = null;
      if (mode !== "copy") {
        downloadName = prompt("Enter a filename:", ctx.getFilename() || "");
        if (!downloadName || !downloadName.trim()) return; // User cancelled or left empty
      }

      ctx.addToast("Generating combined image...", "info");
      ctx.importer.hide();
      ctx.setIsHistoryMultiSelect(false);
      ctx.setSheetReady(true);
      ctx.updateSettings({ capturingImage: true, oorMarks: false });

      const blob = await generateCombinedImage({
        selectedSheets: ctx.getSelectedSheets(),
        settings: ctx.getSettings(),
        loadSheet: (name, data) =>
          loadSheetForHistoryCombine(name, data),
        onProgress: (percent, description) => {
          ctx.HistoryCombineDialogComp.setProgress(percent, description);
        }
      });

      if (blob) {
        if (mode === "copy") {
          // Note: copyCapturedImage in App.svelte already contains a safety size check (10MB)
          // to prevent browser crashes (RESULT_CODE_KILLED_BAD_MESSAGE)
          ctx.copyCapturedImage(blob);
        } else {
          ctx.downloadCapturedImage(blob, downloadName);
        }
      }
    } else if (type === "text") {
      ctx.addToast("Generating combined text...", "info");
      ctx.importer.hide();
      ctx.setIsHistoryMultiSelect(false);
      ctx.setSheetReady(true);

      const currSettings = ctx.getSettings()
      ctx.updateSettings({ oorMarks: true, tempoMarks: true });

      const text = await generateCombinedText({
        selectedSheets: ctx.getSelectedSheets(),
        loadSheet: (name, data, waitTime) =>
          loadSheetForHistoryCombine(name, data, waitTime),
        onProgress: (current, total) => {
          const percent = Math.round((current / total) * 100);
          ctx.HistoryCombineDialogComp.setProgress(percent, `Processing sheet ${current} of ${total}...`);
        }
      });

      navigator.clipboard.writeText(text);
      ctx.updateSettings({ oorMarks: currSettings.oorMarks, tempoMarks: currSettings.tempoMarks })

      ctx.addToast("Combined text copied to clipboard!", "success");
    } else if (type === "transposes") {
      ctx.addToast("Copying transposes...", "info");
      const text = generateCombinedTransposes(ctx.getSelectedSheets());
      if (text) {
        navigator.clipboard.writeText(text);
        ctx.addToast("Transposes copied to clipboard!", "success");
      } else {
        ctx.addToast("No transposes found in selected sheets", "warning");
      }
    }
  } catch (err) {
    console.error("Combining failed", err);
    ctx.addToast("Combining failed: " + err.message, "warning");
  } finally {
    ctx.setChordsAndOtherwise(originalData);
    ctx.setFilename(originalFilename);
    ctx.setSheetReady(originalSheetReady);
    ctx.updateSettings(originalSettings);
    ctx.setForcedNextSheetStartTime(undefined);

    if (!originalSheetReady) ctx.importer.show();
    ctx.setIsHistoryMultiSelect(true);
    ctx.HistoryCombineDialogComp.setBusy(false);
  }
}
