# Rustys Coole Creation

Ein Chat-Parser-Generator im Star-Wars-Stil. Statt die Formatierungs-Syntax deines Spiel-Chats auswendig zu tippen, klickst du dir den fertigen Code zusammen und siehst sofort eine Live-Vorschau, wie er im Chat aussehen würde.

## Funktionen

- **Individuell konfigurierbar**: In den Parser-Einstellungen legst du fest, welche Regeln du überhaupt sehen/nutzen willst.
- **Unterstützte Syntax**:
  - `<defc=color name/rgb/hex>` — setzt die Standardfarbe für den folgenden Text
  - `<color=r,g,b>text</color>` — färbt nur einen Textabschnitt
  - `^RGB` (drei Ziffern 0–9, z. B. `^009`) — Farb-Kurzcode
  - `:emoticon_name:` — Star-Wars-themed Emoticons
  - `<avatar>` — fügt dein gewähltes Avatar-Tag ein
- **Live-Vorschau**: zeigt den generierten Code gerendert (Farben, Emoticons, Avatar) an, genau wie er im Spiel-Chat erscheinen würde.
- **Eigene Profile**: speichere deine Lieblingsfarbe, Lieblings-Emoticons und deinen Avatar als benanntes Profil (lokal im Browser via `localStorage`) und lade es jederzeit wieder.
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

Farben können auf drei Arten angegeben werden:

- Name (z. B. `red`, `gold`, `cyan` — siehe `COLOR_NAMES` in `js/parsers.js`)
- RGB-Tripel (z. B. `255,140,0`)
- Hex (z. B. `#ff8c00` oder `ff8c00`)

Der `^RGB`-Kurzcode nutzt drei Ziffern (0–9) für Rot, Grün und Blau, z. B. `^009` für kräftiges Blau.
