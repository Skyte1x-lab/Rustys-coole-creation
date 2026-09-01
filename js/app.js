/*
 * Rustys Coole Creation — App-Logik
 * Verdrahtet die UI: Farb-Swatches, WYSIWYG-Editor, Code-Ausgabe, Profile.
 */

const PRESETS_KEY = "rcc_profiles";

const chatEditor = document.getElementById("chat-editor");
const chatCode = document.getElementById("chat-code");

// Enter erzeugt <br> statt verschachtelter <div>-Zeilen, hält die Editor-DOM flach.
// In try/catch, da execCommand in manchen Browsern/Zuständen wirft und sonst
// die komplette restliche Initialisierung (Swatches, Buttons, Profile) blockieren würde.
try {
  document.execCommand("defaultParagraphSeparator", false, "br");
} catch {
  // ignorieren — Zeilenumbrüche funktionieren dann per Standardverhalten des Browsers
}

// ---------- Editor-Inhalt in Spiel-Code umwandeln ----------

function serializeEditor(node) {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent;
    } else if (child.nodeName === "BR") {
      out += "\n";
    } else if (child.nodeName === "SPAN" && child.style.color) {
      const rgb = child.style.color.match(/\d+/g).map(Number);
      out += `<color=${rgb.join(",")}>${serializeEditor(child)}</color>`;
    } else {
      out += serializeEditor(child);
    }
  });
  return out;
}

function updateCode() {
  chatCode.textContent = serializeEditor(chatEditor);
}

chatEditor.addEventListener("input", updateCode);

// ---------- Farbe: markierten Text einfärben ----------

function rgbToHex(rgb) {
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

let selectedColor = [79, 214, 255];

function showSelectHint() {
  const hint = document.getElementById("select-hint");
  hint.hidden = false;
  clearTimeout(hint._timer);
  hint._timer = setTimeout(() => (hint.hidden = true), 1800);
}

function markActiveSwatch(rgb) {
  const spec = rgb.join(",");
  document.querySelectorAll("#swatch-row .swatch:not(.is-custom)").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.rgb === spec);
  });
}

function applyColor(rgb) {
  selectedColor = rgb;
  markActiveSwatch(rgb);

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    showSelectHint();
    return;
  }
  const range = sel.getRangeAt(0);
  if (!chatEditor.contains(range.commonAncestorContainer)) {
    showSelectHint();
    return;
  }

  const span = document.createElement("span");
  span.style.color = rgbToCss(rgb);
  try {
    range.surroundContents(span);
  } catch {
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
  }

  // Bereits vorhandene Farb-Spans, die jetzt innerhalb des neuen Spans
  // gelandet sind (z.B. beim erneuten Einfärben), auflösen statt zu
  // verschachteln — es soll immer nur eine Farbe pro Abschnitt gelten.
  span.querySelectorAll("span").forEach((inner) => {
    const parent = inner.parentNode;
    while (inner.firstChild) parent.insertBefore(inner.firstChild, inner);
    parent.removeChild(inner);
  });

  // Alte Farb-Spans, die durch das Umfärben leer zurückgeblieben sind, entfernen.
  chatEditor.querySelectorAll("span").forEach((s) => {
    if (!s.textContent) s.remove();
  });

  sel.removeAllRanges();
  updateCode();
}

const swatchRow = document.getElementById("swatch-row");
const customSwatch = document.getElementById("custom-swatch");

PRESET_COLORS.forEach((preset) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "swatch";
  btn.dataset.rgb = preset.rgb.join(",");
  btn.style.backgroundColor = rgbToCss(preset.rgb);
  btn.title = preset.name;
  // Verhindert, dass der Klick auf den Button den Fokus (und damit die
  // Textmarkierung) aus dem Editor stiehlt, bevor applyColor sie auswerten kann.
  btn.addEventListener("mousedown", (e) => e.preventDefault());
  btn.addEventListener("click", () => applyColor(preset.rgb));
  swatchRow.insertBefore(btn, customSwatch);
});

customSwatch.addEventListener("input", () => {
  applyColor(resolveColor(customSwatch.value));
});

// ---------- Editor Buttons ----------

document.getElementById("clear-btn").addEventListener("click", () => {
  chatEditor.innerHTML = "";
  updateCode();
});

document.getElementById("copy-btn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(chatCode.textContent);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(chatCode);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
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
    color: selectedColor.join(","),
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
  if (!preset || !preset.color) return;

  selectedColor = resolveColor(preset.color);
  customSwatch.value = rgbToHex(selectedColor);
  markActiveSwatch(selectedColor);
});

document.getElementById("preset-delete-btn").addEventListener("click", () => {
  const name = presetSelect.value;
  if (!name) return;
  const presets = loadPresets();
  delete presets[name];
  savePresets(presets);
  refreshPresetSelect();
});

// ---------- Tabs ----------

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    const target = tab.dataset.tab;
    document.querySelectorAll("[data-tab-panel]").forEach((pane) => {
      pane.hidden = pane.dataset.tabPanel !== target;
    });
  });
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

// ---------- Initialer Code ----------
updateCode();
