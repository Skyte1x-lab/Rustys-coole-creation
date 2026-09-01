/*
 * Rustys Coole Creation — Parser-Regeln
 * Definiert die unterstützte Chat-Parser-Syntax und die Logik,
 * um daraus eine gerenderte Live-Vorschau zu erzeugen.
 */

const COLOR_NAMES = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  white: [255, 255, 255],
  black: [40, 40, 40],
  orange: [255, 140, 0],
  purple: [160, 32, 240],
  cyan: [0, 255, 255],
  pink: [255, 105, 180],
  gray: [160, 160, 160],
  grey: [160, 160, 160],
  gold: [255, 215, 0],
  silver: [192, 192, 192],
  lime: [50, 205, 50],
  teal: [0, 128, 128],
};

const PRESET_COLORS = [
  { name: "Sith-Rot", rgb: [255, 30, 30] },
  { name: "Jedi-Cyan", rgb: [79, 214, 255] },
  { name: "Lichtschwert-Grün", rgb: [40, 255, 100] },
  { name: "Mace-Windu-Lila", rgb: [160, 32, 240] },
  { name: "Gold", rgb: [255, 215, 0] },
  { name: "Rebellen-Orange", rgb: [255, 140, 0] },
  { name: "Weiß", rgb: [255, 255, 255] },
  { name: "Sturmtruppen-Grau", rgb: [190, 195, 205] },
  { name: "Imperium-Blau", rgb: [60, 110, 255] },
];

function resolveColor(spec) {
  if (!spec) return null;
  spec = String(spec).trim();

  const hexMatch = /^#?([0-9a-fA-F]{6})$/.exec(spec);
  if (hexMatch) {
    const hex = hexMatch[1];
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  const rgbMatch = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/.exec(spec);
  if (rgbMatch) {
    return [1, 2, 3].map((i) => Math.min(255, parseInt(rgbMatch[i], 10)));
  }

  const named = COLOR_NAMES[spec.toLowerCase()];
  if (named) return named;

  return [255, 255, 255];
}

function rgbToCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function rgbDigitsToColor(digits) {
  // digits: string of exactly 3 chars, each 0-9, one per channel (R,G,B)
  return digits.split("").map((d) => Math.round((parseInt(d, 10) * 255) / 9));
}

function colorToDigits(rgb) {
  // inverse of rgbDigitsToColor: each channel (0-255) rounded to the nearest 0-9 level
  return rgb.map((c) => Math.round((c * 9) / 255)).join("");
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

const TOKEN_RE = /<defc=([^>]+)>|<color=([^>]+)>([\s\S]*?)<\/color>|\^(\d{3})/g;

/**
 * Rendert einen rohen Chat-Parser-Code als HTML für die Live-Vorschau.
 * @param {string} text - der rohe Code (z.B. aus dem Textfeld)
 * @returns {string} HTML-String
 */
function renderPreviewHTML(text) {
  let result = "";
  let currentColor = null;
  let lastIndex = 0;
  let match;

  const re = new RegExp(TOKEN_RE);

  function flushPlain(chunk) {
    if (!chunk) return;
    const escaped = escapeHtml(chunk);
    result += currentColor
      ? `<span style="color:${rgbToCss(currentColor)}">${escaped}</span>`
      : escaped;
  }

  while ((match = re.exec(text)) !== null) {
    flushPlain(text.slice(lastIndex, match.index));
    lastIndex = re.lastIndex;

    if (match[1] !== undefined) {
      currentColor = resolveColor(match[1]);
    } else if (match[2] !== undefined) {
      const rgb = resolveColor(match[2]);
      const inner = renderPreviewHTML(match[3]);
      result += `<span style="color:${rgbToCss(rgb)}">${inner}</span>`;
    } else if (match[4] !== undefined) {
      currentColor = rgbDigitsToColor(match[4]);
    }
  }
  flushPlain(text.slice(lastIndex));

  return result || "&nbsp;";
}
