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

const rulePills = document.querySelectorAll("#rule-toggles .pill");

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
  rulePills.forEach((pill) => {
    settings[pill.dataset.rule] = pill.classList.contains("active");
  });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettings(settings);
}

function applySettings(settings) {
  const isEnabled = (rule) => (settings ? settings[rule] !== false : true);

  document.getElementById("defc-insert-btn").hidden = !isEnabled("defc");
  document.getElementById("range-wrap-btn").hidden = !isEnabled("color");
  document.querySelector('.gen-section[data-section="color-tools"]').hidden =
    !(isEnabled("defc") || isEnabled("color"));
  document.querySelector('.gen-section[data-rule="rgb"]').hidden = !isEnabled("rgb");
}

rulePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    pill.classList.toggle("active");
    saveSettings();
  });
});

(function initSettings() {
  const saved = loadSettings();
  rulePills.forEach((pill) => {
    const active = saved ? saved[pill.dataset.rule] !== false : true;
    pill.classList.toggle("active", active);
  });
  applySettings(saved);
})();

// ---------- Farbe: <defc=...> und <color=...>text</color> ----------

const colorPicker = document.getElementById("color-picker");
const colorValue = document.getElementById("color-value");

colorPicker.addEventListener("input", () => {
  colorValue.value = colorPicker.value;
});

function currentColorSpec() {
  return colorValue.value.trim() || colorPicker.value;
}

document.getElementById("defc-insert-btn").addEventListener("click", () => {
  insertAtCursor(`<defc=${currentColorSpec()}>`);
});

document.getElementById("range-wrap-btn").addEventListener("click", () => {
  wrapSelection(`<color=${currentColorSpec()}>`, "</color>", "Text");
});

// ---------- ^RGB Kurzcode ----------

const rgbR = document.getElementById("rgb-r");
const rgbG = document.getElementById("rgb-g");
const rgbB = document.getElementById("rgb-b");
const rgbSwatch = document.getElementById("rgb-swatch");
const rgbCodePreview = document.getElementById("rgb-code-preview");

function currentRgbDigits() {
  return `${rgbR.value}${rgbG.value}${rgbB.value}`;
}

function updateRgbUI() {
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
    defcColor: currentColorSpec(),
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
    colorValue.value = preset.defcColor;
    const hex = /^#?[0-9a-fA-F]{6}$/.test(preset.defcColor)
      ? (preset.defcColor.startsWith("#") ? preset.defcColor : `#${preset.defcColor}`)
      : null;
    if (hex) colorPicker.value = hex;
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
