# ShadowTales 🎭

Personalisiertes, interaktives Schattentheater. Verwandle ein Kennenlernen in
einen animierten Schattentheater-Film: Figuren gestalten, Stil wählen, Szene für
Szene abspielen — und mit „Was wäre, wenn?“ eine neue Version erzeugen.

Die App ist eine Route der Nomo-Marketplace: **`/shadowtales`**.

## Starten

```bash
corepack pnpm install
corepack pnpm run develop   # http://localhost:12000/shadowtales
```

Im Sandbox ist `localhost` nicht von außen erreichbar. Nutze die
Preview-URL: `https://<identifier>.prod-runtime.all-hands.dev/shadowtales/`.

Produktions-Build (statischer Export nach `out/`):

```bash
corepack pnpm run build
```

## Der Ablauf in fünf Schritten

1. **Geschichte eingeben** — „Erzähle eure Geschichte“ (Titel, beide Namen,
   Datum, Ort, Beschreibung, Anlass, Stil).
2. **Personen und Figuren gestalten** — Figurentyp, Frisur, Größe, Brille, Hut,
   Kleidung, Accessoire. Änderungen sind sofort in der Vorschau sichtbar.
3. **Stil und Stimmung wählen** — Romantisches Märchen, Episches Fantasy-Abenteuer,
   Lustige Komödie, Hollywood-Abenteuer.
4. **Abspielen und bearbeiten** — Theatermodus und Story Studio.
5. **Speichern oder teilen** — localStorage, JSON-Export und -Import.

## Seiten

| Seite | Zweck |
| --- | --- |
| Startseite | „Jede Geschichte verdient ein Märchen.“ mit Beispielen |
| Meine Geschichten | Gespeicherte Projekte, Abspielen / Bearbeiten / Löschen / Import |
| Geschichte erstellen | Eingabeformular |
| Figuren gestalten | Charaktereditor + Stilwahl + Live-Vorschau |
| Story Studio | Szenenliste, große Vorschau, Szenen-Editor |
| Theatermodus | ablenkungsfreie Wiedergabe |

Die Navigation funktioniert per URL, damit Zustände reproduzierbar sind:

```
/shadowtales?view=library
/shadowtales?story=demo-anna-max&view=theater
/shadowtales?story=demo-anna-max&view=studio
/shadowtales?story=demo-interactive&view=theater
```

## Beispieldaten

Beim ersten Öffnen sind zwei Geschichten vorhanden:

**`demo-anna-max` — Anna & Max, Der verschüttete Abend** (5 Szenen, Stil: Romantik)

1. Die Begegnung — Studentenparty, langsamer Kameraschwenk.
2. Das Missgeschick — Max verschüttet sein Getränk.
3. Das Gespräch — Dialog: „Passiert dir das öfter?“ / „Nur bei besonders
   interessanten Menschen.“
4. Der Heimweg — unter Sternen.
5. Das Ende — ein Herz erscheint, Einblendung „Und ihre Geschichte hatte gerade
   erst begonnen.“

**`demo-interactive` — Die Party, Du entscheidest** (interaktiv, Stil: Komödie)
Eine Entscheidung mit drei Ausgängen: mutig zugehen, erst ein Getränk holen oder
sich als berühmter Zauberer ausgeben. Jede Auswahl spielt eine eigene Folgeszene.

Die Demo ist zusätzlich als Vorlage im Formular hinterlegt.

## Funktionen

- **Story-Generator** — wandelt die Beschreibung regelbasiert in 3–5 Szenen
  (`src/lib/shadowtales/story-generator.ts`). Kein API-Key nötig; ein Sprachmodell
  könnte später dieselbe Datenstruktur erzeugen.
- **Animiertes Schattentheater** — Parallax-Kulissen, Nebel, Wolken, Kamerafahrten
  (Zoom, Pan), Figurenbewegungen (erscheinen, laufen, begegnen, drehen), Effekte
  (Herzen, fallende Gegenstände, Drache), Untertitel, Szenenübergänge.
- **Theater-Player** — Abspielen, Pause, Neustart, vorherige/nächste Szene,
  Fortschritt, Vollbild.
- **Szenen-Editor** — Titel, Erzähltext, Dialog, Hintergrund, Figuren (Position und
  Blickrichtung), Animation, Kamera, Dauer; Szenen umsortieren, löschen, ergänzen.
  Änderungen erscheinen sofort in der Vorschau.
- **Was wäre, wenn?** — drei funktionierende Vorlagen: Drachen-Abenteuer,
  Peinliches Missgeschick, Alternatives romantisches Ende. Das Original bleibt
  erhalten, die neue Version verweist darauf.
- **Interaktives Spiel** — Entscheidungen mit unterschiedlichen Folgeszenen.
- **Speichern/Teilen** — localStorage, JSON-Export und -Import.

Klar als **„Später verfügbar“** markiert: Foto-Import für Silhouetten,
PNG-Export, Share-Link.

## Struktur

```
src/app/shadowtales/           Route, Layout, Theatre-CSS
src/components/shadowtales/    TheaterPlayer, SceneRenderer, CharacterSilhouette,
                               CharacterEditor, StoryForm, Timeline, StyleSelector,
                               SceneEditor, WhatIfPanel, StageBackdrop, StageEffects
src/lib/shadowtales/           types, styles, demo-story, story-generator,
                               what-if, story-storage
```

Figuren und Kulissen sind reine SVG-Silhouetten — kein urheberrechtlich
geschütztes Material, keine externen Dienste, keine kostenpflichtigen APIs.

## Hinweis zur Musik

Die „Musikstimmung“ pro Szene ist eine Metadaten-Angabe (z. B. warm, episch).
Es wird bewusst keine Musik abgespielt, um keine geschützten Werke zu verwenden.
