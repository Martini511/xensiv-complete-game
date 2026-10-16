/**
 * Alle spielbaren Maps. Jede Map ist ein eigenstaendiges Spiel unter
 * src/maps/<id>/ und wird erst bei Auswahl nachgeladen (dynamischer Import),
 * damit das Hauptmenue nicht beide mehrere MB grossen Platinen laedt.
 */

import * as controllerScores from "./maps/controller/core/leaderboard.js";
import * as mouseScores from "./maps/mouse/core/leaderboard.js";

const CONTROLLER_ART = `
<svg viewBox="0 0 200 120" aria-hidden="true">
  <path d="M52 18 H148 C174 18 189 40 194 70 C199 100 186 116 168 113 C154 111 147 97 137 89 H63 C53 97 46 111 32 113 C14 116 1 100 6 70 C11 40 26 18 52 18 Z"
        fill="#1f6b3a" stroke="#7ee787" stroke-width="2" />
  <path d="M46 46 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10 Z" fill="#0e2318" />
  <circle cx="148" cy="44" r="6" fill="#0e2318" />
  <circle cx="160" cy="57" r="6" fill="#0e2318" />
  <circle cx="136" cy="57" r="6" fill="#0e2318" />
  <circle cx="148" cy="70" r="6" fill="#0e2318" />
  <circle cx="78" cy="84" r="10" fill="#0e2318" stroke="#2f8a50" stroke-width="2" />
  <circle cx="122" cy="84" r="10" fill="#0e2318" stroke="#2f8a50" stroke-width="2" />
  <circle cx="100" cy="52" r="10" fill="none" stroke="#d6e1f0" stroke-width="1.5" stroke-dasharray="3 2" />
  <rect x="36" y="25" width="7" height="7" fill="#ffd166" />
  <rect x="157" y="25" width="7" height="7" fill="#ffd166" />
</svg>`;

const MOUSE_ART = `
<svg viewBox="0 0 120 160" aria-hidden="true">
  <path d="M60 6 C96 6 112 40 112 82 C112 126 92 154 60 154 C28 154 8 126 8 82 C8 40 24 6 60 6 Z"
        fill="#1f6b3a" stroke="#7ee787" stroke-width="2" />
  <path d="M60 6 V22 M60 58 V66 M10 66 Q60 74 110 66" stroke="#2f8a50" stroke-width="2" fill="none" />
  <rect x="52" y="22" width="16" height="36" rx="8" fill="#0e2318" stroke="#2f8a50" stroke-width="2" />
  <rect x="44" y="90" width="32" height="32" rx="2" fill="#0e2318" stroke="#d6e1f0" stroke-width="1.5" stroke-dasharray="3 2" />
  <rect x="26" y="30" width="7" height="7" fill="#ffd166" />
  <rect x="87" y="30" width="7" height="7" fill="#ffd166" />
  <rect x="45" y="44" width="5" height="5" fill="#ffd166" />
  <rect x="70" y="44" width="5" height="5" fill="#ffd166" />
</svg>`;

export const MAPS = [
  {
    id: "controller",
    name: "XENSIV\u2122 Game Controller",
    description:
      "Shrink down onto the PCB of the XENSIV game controller and track down six magnetic sensors - each one reacts to a button on your gamepad.",
    tags: ["Gamepad", "Keyboard + mouse fallback", "6 sensors"],
    art: CONTROLLER_ART,
    scores: controllerScores,
    /** Tastenhinweise im "Zurueck zum Hauptmenue"-Dialog. */
    keys: { menu: "M \u00b7 Start", confirm: "T \u00b7 Enter", cancel: "F \u00b7 Esc" },
    load: () => import("./maps/controller/core/Game.js"),
  },
  {
    id: "mouse",
    name: "XENSIV\u2122 Mouse",
    description:
      "Explore the board inside the XENSIV mouse. Click, right-click and scroll to make its six sensors blink - and mark them all.",
    tags: ["Mouse + keyboard", "Gamepad fallback", "6 sensors"],
    art: MOUSE_ART,
    scores: mouseScores,
    keys: { menu: "M \u00b7 Start", confirm: "Enter \u00b7 T", cancel: "Esc \u00b7 F" },
    load: () => import("./maps/mouse/core/Game.js"),
  },
];

export function findMap(id) {
  return MAPS.find((map) => map.id === id) ?? null;
}
