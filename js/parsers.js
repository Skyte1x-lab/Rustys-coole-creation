/*
 * Rustys Coole Creation — Farb-Daten
 * Farbnamen, Star-Wars-Farbpalette und Farbauflösung für den Editor.
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
