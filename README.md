# Rustys Coole Creation

Ein Chat-Parser-Generator im Star-Wars-Stil. Statt die Formatierungs-Syntax deines Spiel-Chats auswendig zu tippen, klickst du dir den fertigen Code zusammen und siehst sofort eine Live-Vorschau, wie er im Chat aussehen würde.

## Funktionen

- **Klick-to-Color**: Text im Nachrichtenfeld markieren und auf eine Farbe klicken — der markierte Text wird sofort mit `<color=r,g,b>...</color>` umschlossen. Ohne Markierung setzt ein Klick die Farbe ab der Cursorposition (`<defc=r,g,b>`, oder als Kurzcode `^RGB` wenn der Kurzcode-Schalter aktiv ist).
- **9 Star-Wars-Farb-Swatches** plus ein Custom-Swatch (natives Farbrad) für jede beliebige Farbe.
- **Unterstützte Syntax**:
  - `<defc=r,g,b>` — setzt die Standardfarbe für den folgenden Text
  - `<color=r,g,b>text</color>` — färbt nur einen Textabschnitt
  - `^RGB` (drei Ziffern 0–9, z. B. `^009`) — Farb-Kurzcode, per Schalter aktivierbar
- **Live-Vorschau**: zeigt den generierten Code farblich gerendert an, genau wie er im Spiel-Chat erscheinen würde.
- **Eigene Profile**: speichere deine Lieblingsfarbe als benanntes Profil (lokal im Browser via `localStorage`) und lade es jederzeit wieder.
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
js/parsers.js       Parser-Regeln, Farbauflösung, Vorschau-Rendering
js/app.js            UI-Logik: Einstellungen, Generator, Editor, Profile
```

## Farb-Formate

Die Live-Vorschau erkennt Farben in drei Schreibweisen (auch wenn du Code von Hand einfügst oder einfügst):

- Name (z. B. `red`, `gold`, `cyan` — siehe `COLOR_NAMES` in `js/parsers.js`)
- RGB-Tripel (z. B. `255,140,0`) — dieses Format erzeugen die Swatches
- Hex (z. B. `#ff8c00` oder `ff8c00`)

Der `^RGB`-Kurzcode nutzt drei Ziffern (0–9) für Rot, Grün und Blau, z. B. `^009` für kräftiges Blau.
