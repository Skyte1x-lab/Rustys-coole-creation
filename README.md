# HoloComm von Rusty

*(Repository: Rustys-coole-creation)*

Ein Chat-Parser-Generator im Star-Wars-Stil. Du schreibst deine Nachricht ganz normal, markierst ein Stück Text und klickst eine Farbe — fertig. Den Spiel-Code (`<color=r,g,b>...</color>`) schreibt die App für dich; du siehst nie rohe Syntax in deinem Editor, nur deinen farbig eingefärbten Text.

## Funktionen

- **WYSIWYG-Editor**: Text tippen, markieren, Farbe klicken — der markierte Text wird direkt im Editor bunt dargestellt, genau wie er später im Spiel-Chat aussehen soll.
- **Automatischer Code**: Unter dem Editor erscheint live der fertige Chat-Code (`<color=r,g,b>text</color>`), bereit zum Kopieren — du musst nie selbst Syntax schreiben.
- **9 Star-Wars-Farb-Swatches** plus ein Custom-Swatch (natives Farbrad) für jede beliebige Farbe.
- **Eigene Profile**: speichere deine Lieblingsfarbe als benanntes Profil (lokal im Browser via `localStorage`) und lade sie jederzeit wieder.
- **Ein Klick zum Kopieren**: der fertige Code landet per Knopfdruck in der Zwischenablage.

## Nutzung

Kein Build-Schritt nötig — einfach `index.html` im Browser öffnen, oder das Repo z. B. über GitHub Pages hosten.

```
git clone <repo-url>
cd Rustys-coole-creation
# index.html direkt im Browser öffnen
```

## Projektstruktur

```
index.html        Haupt-App-Seite
css/style.css      Star-Wars-Theme (Sternenhimmel, Farbschema, Panels)
js/parsers.js       Farbnamen, Star-Wars-Farbpalette, Farbauflösung
js/app.js            UI-Logik: Swatches, WYSIWYG-Editor, Code-Ausgabe, Profile
```

## Farb-Formate

Farben lassen sich intern auf drei Arten angeben (z. B. beim Custom-Swatch oder in gespeicherten Profilen):

- Name (z. B. `red`, `gold`, `cyan` — siehe `COLOR_NAMES` in `js/parsers.js`)
- RGB-Tripel (z. B. `255,140,0`) — dieses Format erzeugen die Swatches im Chat-Code
- Hex (z. B. `#ff8c00` oder `ff8c00`)
