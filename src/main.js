import { MAPS, findMap } from "./maps.js";
import { MainMenu } from "./menu/MainMenu.js";
import { InGameMenu } from "./menu/InGameMenu.js";

/**
 * Einstieg: ohne `?map=` erscheint das Hauptmenue, mit `?map=<id>` startet
 * direkt die gewaehlte Map (Deep-Link, Reload bleibt in der Map).
 *
 * Zurueck ins Menue geht es immer ueber einen Seitenwechsel: die Spiele
 * haengen eigene HUD-Elemente und Listener an, ein frischer Seitenaufbau
 * ist der sicherste Weg, alles davon wieder loszuwerden.
 */

const container = document.getElementById("app");
if (!container) {
  throw new Error('Container "#app" nicht gefunden.');
}

let menu = null;
let inGameMenu = null;
let game = null;

function mapUrl(id) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("map", id);
  else url.searchParams.delete("map");
  return url;
}

function goToMenu() {
  window.location.assign(mapUrl(null));
}

function showMenu() {
  document.title = "Sensor Hunt";
  menu = new MainMenu(document.body, MAPS, (map) => {
    menu.dispose();
    menu = null;
    // Ohne Neuladen starten: so bleibt ein bereits erkanntes Gamepad aktiv.
    window.history.pushState({ map: map.id }, "", mapUrl(map.id));
    startMap(map);
  });
}

async function startMap(map) {
  document.title = `Sensor Hunt \u00b7 ${map.name}`;
  inGameMenu = new InGameMenu(document.body, { keys: map.keys, onExit: goToMenu });

  try {
    const { Game } = await map.load();
    game = new Game(container);
    if (import.meta.env.DEV) window.game = game;

    // Die Loop startet erst, wenn das Platinen-Modell komplett geladen ist.
    await game.load();
    game.start();
    inGameMenu.setGame(game);
  } catch (error) {
    console.error(error);
    if (!game) container.textContent = `Could not load the map: ${error.message}`;
  }
}

// Browser-Zurueck/-Vor zwischen Menue und Map: Seite passend neu aufbauen.
window.addEventListener("popstate", () => window.location.reload());

const requested = new URLSearchParams(window.location.search).get("map");
const initialMap = findMap(requested);
if (initialMap) {
  startMap(initialMap);
} else {
  if (requested) window.history.replaceState(null, "", mapUrl(null));
  showMenu();
}

// Vite HMR: alte Loop und Overlays beenden, bevor das Modul neu geladen wird
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    menu?.dispose();
    inGameMenu?.dispose();
    game?.dispose();
  });
}
