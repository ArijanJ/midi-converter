import pako from "pako";
import { addToast } from "../stores/ToastStore.js";
import { showQuotaError, clearQuotaError } from "../stores/QuotaStore.js";

const _key = "pieces";

export async function compress(object) {
  return pako.deflate(JSON.stringify(object), { level: 9 });
}

export function decompress(string) {
  return JSON.parse(pako.inflate(string, { to: "string" }), { level: 9 });
}

export function remainingSize() {
  let totalStorage = 0;
  let keyLength;

  for (let key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;

    keyLength = localStorage[key].length + key.length;
    totalStorage += keyLength;
  }

  return (totalStorage / 1024).toFixed(2);
}

async function piece(name, settings, data, skip_compression = false) {
  // console.log(skip_compression)
  return {
    name: name,
    settings: settings,
    updated: Date.now(),
    data: skip_compression ? data : await compress(data),
  };
}

const module = {
  getAll: () => {
    let pieces = JSON.parse(localStorage.getItem(_key));
    if (!pieces) pieces = [];

    return pieces;
  },

  add: async (name, settings, json, skip_compression = false, opts = {}) => {
    let pieces = module.getAll();

    let thisPieceRemoved = pieces.filter((entry) => entry.name != name);
    thisPieceRemoved.unshift(
      await piece(name, settings, json, skip_compression),
    );

    try {
      localStorage.setItem(_key, JSON.stringify(thisPieceRemoved));
      clearQuotaError();
      addToast("Saved!", "success");
    } catch (e) {
      const errorMsg = e.message || "";
      const isQuotaError =
        e.name === "QuotaExceededError" ||
        e.code === 22 ||
        e.code === 1014 ||
        errorMsg.includes("QuotaExceededError") ||
        errorMsg.includes("The quota has been exceeded.") ||
        errorMsg.includes("NS_ERROR_DOM_QUOTA_REACHED");

      console.error(e);
      if (isQuotaError) {
        addToast("Storage quota exceeded! Sheet could not be saved. Please open a new tab and export/delete other sheets!", "error");
        showQuotaError({ name });
      } else {
        addToast("Failed to save sheet due to storage error!", "error");
      }
      throw e;
    }
  },

  export: async (name) => {
    let pieces = module.getAll();
    let thisPiece = pieces.filter((entry) => entry.name === name)[0];
    addToast("Exporting sheet...", "info");

    return thisPiece;
  },

  delete: (name) => {
    let pieces = module.getAll().filter((entry) => entry.name != name);
    localStorage.setItem(_key, JSON.stringify(pieces));
    addToast(`Deleted "${name}"`, "info");
  },
};

export default module;
