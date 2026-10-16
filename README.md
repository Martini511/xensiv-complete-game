# Sensor Hunt – Complete Game

Zusammenfuehrung von **Controller Game** und **Mouse Game** zu einem einzigen
Spiel (Three.js + Vite). Beim Start erscheint ein Hauptbildschirm, auf dem
man eine der beiden Maps auswaehlt:

| Map                         | Platine                        | Steuerung                          |
| --------------------------- | ------------------------------ | ---------------------------------- |
| **XENSIV™ Game Controller** | `src/maps/controller/assets/platine.glb` | Gamepad, Notfall: Tastatur + Maus |
| **XENSIV™ Mouse**           | `src/maps/mouse/assets/XENSIV_Mouse_with_wheel.glb` | Maus + Tastatur |

Spielziel, Steuerung und Mechaniken der Maps sind unveraendert aus den
Ursprungsprojekten uebernommen (siehe deren READMEs). Beide Maps fuehren
weiterhin getrennte Bestenlisten; die jeweils beste Zeit steht im Hauptmenue.

## Bedienung

**Hauptmenue**

| Eingabe                                   | Wirkung        |
| ----------------------------------------- | -------------- |
| Maus: Klick auf eine Karte                | Map starten    |
| `←` `→` / `A` `D`, D-Pad, linker Stick    | Map auswaehlen |
| `Enter` / `Leertaste`, Gamepad F (A) / T (Y) / Start | Map starten |
| `1` / `2`                                 | Map direkt starten |

**Im Spiel zurueck ins Hauptmenue**

Button *Main menu* oben in der Mitte, Taste `M` oder **Start** am Gamepad.
Ein Dialog fragt nach, das Spiel ist so lange pausiert (Uhr steht):
bestaetigen mit `Enter` bzw. T (Y), weiterspielen mit `Esc` / `M` bzw. F (A),
B oder Start.

Die gewaehlte Map steht in der URL (`?map=controller` bzw. `?map=mouse`) –
ein Reload bleibt in der Map, die Browser-Zuruecktaste fuehrt ins Menue.

## Setup

Voraussetzung: Node.js 18+ und npm.

```bash
npm install
npm run dev
```

| Script            | Beschreibung                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Dev-Server mit Hot Module Replacement |
| `npm run build`   | Produktions-Build nach `dist/`        |
| `npm run preview` | Build lokal testen                    |

> Die `index.html` laesst sich nicht per Doppelklick oeffnen (ES-Module, Bare
> Imports) – es braucht immer einen Webserver (`npm run dev` / `npm run preview`).

## Projektstruktur

```
src/
  main.js            Einstieg: Hauptmenue oder direkt die Map aus ?map=
  maps.js            Liste der Maps (Name, Beschreibung, Bild, Lade-Funktion)
  menu/
    MainMenu.js      Hauptbildschirm mit der Map-Auswahl
    InGameMenu.js    "Main menu"-Button + Bestaetigungsdialog im Spiel
    gamepad.js       Gamepad-Abfrage fuer die Menues
  shared/            In beiden Maps identischer Code und Assets
    core/            collision.js, createRenderer.js, createScene.js
    entities/        Character.js, ChipModel.js, SensorMarker.js
    assets/          player.glb, Infineon-Logo
  maps/
    controller/      Spiel "Controller Game" (core, entities, input, ui, assets)
    mouse/           Spiel "Mouse Game"      (core, entities, input, ui, assets)
```

Jede Map wird erst bei Auswahl per dynamischem `import()` geladen – das
Hauptmenue selbst ist nur wenige kB gross und laedt keine der Platinen.
Die Spielklassen haben dafuer zusaetzlich `pause()` / `resume()` bekommen.

**Weitere Map hinzufuegen:** Ordner unter `src/maps/<id>/` anlegen, dessen
`Game`-Klasse muss `load()`, `start()`, `pause()`, `resume()` und `dispose()`
bieten. Danach einen Eintrag in [src/maps.js](src/maps.js) ergaenzen.

## Deployment auf GitHub Pages

Wie im Controller Game: Jeder Push auf `main` startet
[.github/workflows/deploy.yml](.github/workflows/deploy.yml), baut das Projekt
und veroeffentlicht `dist/`. Der Build nutzt `base: "./"`, laeuft also unter
jeder URL. Falls noetig einmalig unter **Settings → Pages → Source** auf
*GitHub Actions* stellen.
