/**
 * Kleiner Gamepad-Abfrager fuer Menues: liefert pro Aufruf nur die Tasten,
 * die seit dem letzten Aufruf neu gedrueckt wurden (Flanken).
 *
 * Tasten tragen die Indizes des Standard-Mappings (0 = A, 1 = B, 3 = Y,
 * 8 = Select, 9 = Start, 12-15 = D-Pad). Der linke Stick meldet zusaetzlich
 * "left" / "right" / "up" / "down", sobald er weit genug ausgelenkt ist.
 */

const STICK_THRESHOLD = 0.6;

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
 * beschriftet, eine Start-Taste hat er nicht. Start bleibt fuer gewoehnliche
 * Gamepads zusaetzlich belegt.
 */
export const MENU_BUTTONS = [PAD.SELECT, PAD.START];
export const MENU_BUTTON_LABEL = "Control";

export class GamepadPoller {
  constructor() {
    /** Beim allerersten Abruf schon gehaltene Tasten zaehlen nicht als neu. */
    this._previous = null;
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

    const just = new Set(
      this._previous ? [...pressed].filter((key) => !this._previous.has(key)) : []
    );
    this._previous = pressed;
    return { just, anyPressed: pressed.size > 0 };
  }
}

function activeGamepad() {
  if (typeof navigator.getGamepads !== "function") return null;
  for (const pad of navigator.getGamepads()) {
    if (pad && pad.connected) return pad;
  }
  return null;
}

export const hasAny = (set, ...keys) => keys.some((key) => set.has(key));
