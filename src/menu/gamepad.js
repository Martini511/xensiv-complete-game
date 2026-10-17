/**
 * Kleiner Gamepad-Abfrager fuer Menues: liefert pro Aufruf nur die Tasten,
 * die seit dem letzten Aufruf neu gedrueckt wurden (Flanken).
 *
 * Tasten tragen die Indizes des Standard-Mappings (0 = A, 1 = B, 3 = Y,
 * 8 = Select, 9 = Start, 12-15 = D-Pad). Der linke Stick meldet zusaetzlich
 * "left" / "right" / "up" / "down", sobald er weit genug ausgelenkt ist.
 */

const STICK_THRESHOLD = 0.6;

/** sessionStorage: Seitenwechsel per Gamepad-Taste, die evtl. noch gehalten wird. */
const CARRY_OVER_KEY = "sensor-hunt.pad-carry-over";

/** Vor einem Seitenwechsel, den eine Gamepad-Taste ausgeloest hat. */
export function markPadCarryOver() {
  try {
    window.sessionStorage.setItem(CARRY_OVER_KEY, "1");
  } catch {
    // Ohne sessionStorage zaehlt die gehaltene Taste eben sofort.
  }
}

/** Liest (und loescht) die Markierung aus markPadCarryOver(). */
export function takePadCarryOver() {
  try {
    const value = window.sessionStorage.getItem(CARRY_OVER_KEY) === "1";
    window.sessionStorage.removeItem(CARRY_OVER_KEY);
    return value;
  } catch {
    return false;
  }
}

export const PAD = {
  A: 0,
  B: 1,
  Y: 3,
  SELECT: 8,
  START: 9,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
};

/**
 * Menue-Taste: Select - beim XENSIV Game Controller mit "Control"
 * beschriftet, eine Start-Taste hat er nicht. Start bleibt zusaetzlich belegt.
 */
export const MENU_BUTTONS = [PAD.SELECT, PAD.START];
export const MENU_BUTTON_LABEL = "Control";

export class GamepadPoller {
  /**
   * @param {{ ignoreCarriedOver?: boolean }} [options] `ignoreCarriedOver`:
   *   Die Seite wurde per Gamepad-Taste geoeffnet (takePadCarryOver()). Was
   *   beim ersten Auftauchen des Controllers gedrueckt ist, zaehlt dann erst
   *   nach dem Loslassen - der Browser meldet den Controller nach einem
   *   Seitenwechsel erst mit dieser noch gehaltenen Taste.
   */
  constructor({ ignoreCarriedOver = false } = {}) {
    /** Beim allerersten Abruf schon gehaltene Tasten zaehlen nicht als neu. */
    this._previous = null;
    this._ignoreCarriedOver = ignoreCarriedOver;
  }

  /** @returns {{ just: Set<number|string>, anyPressed: boolean }} */
  poll() {
    const pressed = new Set();
    const pad = activeGamepad();

    if (pad) {
      pad.buttons.forEach((button, index) => {
        if (button.pressed) pressed.add(index);
      });
      const x = pad.axes[0] ?? 0;
      const y = pad.axes[1] ?? 0;
      if (x < -STICK_THRESHOLD) pressed.add("left");
      else if (x > STICK_THRESHOLD) pressed.add("right");
      if (y < -STICK_THRESHOLD) pressed.add("up");
      else if (y > STICK_THRESHOLD) pressed.add("down");
    }

    // Erster Abruf mit sichtbarem Controller nach einem Seitenwechsel per Taste:
    // das Gehaltene ist "mitgebracht" und zaehlt nicht als neuer Druck.
    const carriedOver = this._ignoreCarriedOver && pad !== null;
    if (carriedOver) this._ignoreCarriedOver = false;

    const just = new Set(
      this._previous && !carriedOver
        ? [...pressed].filter((key) => !this._previous.has(key))
        : []
    );
    this._previous = pressed;
    return { just, anyPressed: pressed.size > 0 };
  }
}

function activeGamepad() {
  if (typeof navigator.getGamepads !== "function") return null;
  for (const pad of navigator.getGamepads()) {
    if (pad && pad.connected && isSupportedGamepad(pad)) return pad;
  }
  return null;
}

/**
 * Geraeteprofil des XENSIV-Controllers, wie in der Controller-Dashboard-
 * Website und den GamepadManagern der Maps: Die Gamepad API meldet auch
 * Geraete, die keine richtigen Controller sind - die werden ignoriert.
 */
const REQUIRED_BUTTONS = 16;
const REQUIRED_AXES = 4;

const isSupportedGamepad = (pad) =>
  pad.buttons.length === REQUIRED_BUTTONS && pad.axes.length === REQUIRED_AXES;

export const hasAny = (set, ...keys) => keys.some((key) => set.has(key));
