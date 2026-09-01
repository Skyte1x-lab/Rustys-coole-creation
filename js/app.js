/*
 * Rustys Coole Creation — App-Logik
 * Verdrahtet die UI: Einstellungen, Generator, Editor, Vorschau, Profile.
 */

const PRESETS_KEY = "rcc_profiles";
const SETTINGS_KEY = "rcc_settings";

const chatInput = document.getElementById("chat-input");
const chatPreview = document.getElementById("chat-preview");

// ---------- Hilfsfunktionen: Text einfügen ----------

function insertAtCursor(text) {
  const el = chatInput;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  const newPos = start + text.length;
  el.focus();
  el.setSelectionRange(newPos, newPos);
  updatePreview();
}

function wrapSelection(before, after, placeholder) {
  const el = chatInput;
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const selected = el.value.slice(start, end) || placeholder;
  el.value = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
  const newPos = start + before.length + selected.length + after.length;
  el.focus();
  el.setSelectionRange(newPos, newPos);
  updatePreview();
}

function updatePreview() {
  chatPreview.innerHTML = renderPreviewHTML(chatInput.value);
}

chatInput.addEventListener("input", updatePreview);

// ---------- Einstellungen: welche Regeln sind aktiv ----------

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings() {
  const settings = {};
  document.querySelectorAll("#settings-panel input[type=checkbox]").forEach((cb) => {
    settings[cb.dataset.rule] = cb.checked;
  });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettings(settings);
}

function applySettings(settings) {
  document.querySelectorAll(".gen-section").forEach((section) => {
    const rule = section.dataset.rule;
    const enabled = settings ? settings[rule] !== false : true;
    section.hidden = !enabled;
  });
}

document.querySelectorAll("#settings-panel input[type=checkbox]").forEach((cb) => {
  cb.addEventListener("change", saveSettings);
});

(function initSettings() {
  const saved = loadSettings();
  if (saved) {
    document.querySelectorAll("#settings-panel input[type=checkbox]").forEach((cb) => {
      if (saved[cb.dataset.rule] !== undefined) cb.checked = saved[cb.dataset.rule];
    });
  }
  applySettings(saved);
})();

// ---------- <defc=...> ----------

const defcPicker = document.getElementById("defc-color-picker");
const defcValue = document.getElementById("defc-color-value");

defcPicker.addEventListener("input", () => {
  defcValue.value = defcPicker.value;
});

document.getElementById("defc-insert-btn").addEventListener("click", () => {
  const spec = defcValue.value.trim() || defcPicker.value;
  insertAtCursor(`<defc=${spec}>`);
});

// ---------- <color=...>text</color> ----------

const rangePicker = document.getElementById("range-color-picker");
const rangeValue = document.getElementById("range-color-value");

rangePicker.addEventListener("input", () => {
  rangeValue.value = rangePicker.value;
});

document.getElementById("range-wrap-btn").addEventListener("click", () => {
  const spec = rangeValue.value.trim() || rangePicker.value;
  wrapSelection(`<color=${spec}>`, "</color>", "Text");
});

document.getElementById("range-insert-btn").addEventListener("click", () => {
  const spec = rangeValue.value.trim() || rangePicker.value;
  insertAtCursor(`<color=${spec}>Text</color>`);
});

// ---------- ^RGB Kurzcode ----------

const rgbR = document.getElementById("rgb-r");
const rgbG = document.getElementById("rgb-g");
const rgbB = document.getElementById("rgb-b");
const rgbRVal = document.getElementById("rgb-r-val");
const rgbGVal = document.getElementById("rgb-g-val");
const rgbBVal = document.getElementById("rgb-b-val");
const rgbSwatch = document.getElementById("rgb-swatch");
const rgbCodePreview = document.getElementById("rgb-code-preview");

function currentRgbDigits() {
  return `${rgbR.value}${rgbG.value}${rgbB.value}`;
}

function updateRgbUI() {
  rgbRVal.textContent = rgbR.value;
  rgbGVal.textContent = rgbG.value;
  rgbBVal.textContent = rgbB.value;
  const digits = currentRgbDigits();
  rgbCodePreview.textContent = `^${digits}`;
  rgbSwatch.style.background = rgbToCss(rgbDigitsToColor(digits));
}

[rgbR, rgbG, rgbB].forEach((el) => el.addEventListener("input", updateRgbUI));
updateRgbUI();

document.getElementById("rgb-insert-btn").addEventListener("click", () => {
  insertAtCursor(`^${currentRgbDigits()}`);
});

// ---------- Editor Buttons ----------

document.getElementById("clear-btn").addEventListener("click", () => {
  chatInput.value = "";
  updatePreview();
});

document.getElementById("copy-btn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(chatInput.value);
  } catch {
    chatInput.select();
    document.execCommand("copy");
  }
  const confirmEl = document.getElementById("copy-confirm");
  confirmEl.hidden = false;
  clearTimeout(confirmEl._timer);
  confirmEl._timer = setTimeout(() => (confirmEl.hidden = true), 1500);
});

// ---------- Profile / Presets ----------

const presetNameInput = document.getElementById("preset-name");
const presetSelect = document.getElementById("preset-select");

function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePresets(presets) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function refreshPresetSelect() {
  const presets = loadPresets();
  presetSelect.innerHTML = '<option value="">— gespeicherte Profile —</option>';
  Object.keys(presets).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    presetSelect.appendChild(opt);
  });
}
refreshPresetSelect();

document.getElementById("preset-save-btn").addEventListener("click", () => {
  const name = presetNameInput.value.trim();
  if (!name) return;
  const presets = loadPresets();
  presets[name] = {
    defcColor: defcValue.value.trim() || defcPicker.value,
  };
  savePresets(presets);
  refreshPresetSelect();
  presetSelect.value = name;
});

document.getElementById("preset-load-btn").addEventListener("click", () => {
  const name = presetSelect.value;
  if (!name) return;
  const presets = loadPresets();
  const preset = presets[name];
  if (!preset) return;

  if (preset.defcColor) {
    defcValue.value = preset.defcColor;
    const hex = /^#?[0-9a-fA-F]{6}$/.test(preset.defcColor)
      ? (preset.defcColor.startsWith("#") ? preset.defcColor : `#${preset.defcColor}`)
      : null;
    if (hex) defcPicker.value = hex;
  }
  updatePreview();
});

document.getElementById("preset-delete-btn").addEventListener("click", () => {
  const name = presetSelect.value;
  if (!name) return;
  const presets = loadPresets();
  delete presets[name];
  savePresets(presets);
  refreshPresetSelect();
});

// ---------- Starfield-Hintergrund ----------

(function starfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.4 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#cfefff";
    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(t / 800 + s.phase);
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.speed;
      if (s.y > canvas.height) s.y = 0;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

// ---------- Initiale Vorschau ----------
updatePreview();
