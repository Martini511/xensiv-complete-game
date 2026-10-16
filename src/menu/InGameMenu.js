import { GamepadPoller, MENU_BUTTONS, PAD, hasAny } from "./gamepad.js";

/**
 * Rueckweg aus einer Map ins Hauptmenue: kleiner Button oben in der Mitte,
 * Taste M bzw. Control (Select) am Gamepad. Vor dem Verlassen fragt ein
 * Dialog nach - das Spiel ist so lange pausiert (Loop und Eingaben angehalten).
 *
 * Bestaetigen: Enter / Y (beim XENSIV-Controller "T").
 * Abbrechen:   Esc / M / A ("F") / B / Control.
 */
export class InGameMenu {
  /**
   * @param {HTMLElement} parent
   * @param {{ keys: { menu: string, confirm: string, cancel: string }, onExit: () => void }} options
   */
  constructor(parent, { keys, onExit }) {
    this.onExit = onExit;
    this.game = null;
    this.isOpen = false;
    this._resumePending = false;
    this._pad = new GamepadPoller();

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.id = "menu-button";
    this.button.textContent = `\u2630 Main menu \u00b7 ${keys.menu}`;
    this.button.addEventListener("click", () => {
      // Sonst loesen Leertaste/Enter im Spiel spaeter erneut den Button aus.
      this.button.blur();
      this.open();
    });

    this.dialog = document.createElement("div");
    this.dialog.id = "menu-dialog";
    this.dialog.hidden = true;

    const card = document.createElement("div");
    card.className = "message-card";

    const heading = document.createElement("h1");
    heading.textContent = "Back to the main menu?";

    const text = document.createElement("p");
    text.textContent = "You will leave this map. Your current run will be lost.";

    const actions = document.createElement("div");
    actions.className = "menu-dialog-actions";
    const confirm = createDialogButton("Main menu", keys.confirm, true);
    const cancel = createDialogButton("Keep playing", keys.cancel, false);
    confirm.addEventListener("click", () => this.onExit());
    cancel.addEventListener("click", () => this.close());
    actions.append(confirm, cancel);

    card.append(heading, text, actions);
    this.dialog.append(card);
    parent.append(this.button, this.dialog);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener("keydown", this._onKeyDown);
    this._frameId = requestAnimationFrame(this._tick);
  }

  /** Erst ab hier gibt es einen Spielstand, den der Dialog schuetzen muss. */
  setGame(game) {
    this.game = game;
  }

  open() {
    if (this.isOpen) return;
    // Noch am Laden (oder Laden fehlgeschlagen): nichts zu verlieren.
    if (!this.game) {
      this.onExit();
      return;
    }
    this.isOpen = true;
    this._resumePending = false;
    this.game.pause();
    this.dialog.hidden = false;
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.dialog.hidden = true;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    // Fortgesetzt wird erst, wenn am Gamepad nichts mehr gehalten wird -
    // sonst kaeme die Abbrechen-Taste im Spiel als neuer Druck an (Sprung).
    this._resumePending = true;
  }

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    cancelAnimationFrame(this._frameId);
    this.button.remove();
    this.dialog.remove();
  }

  _onKeyDown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

    if (!this.isOpen) {
      if (event.code === "KeyM") {
        event.preventDefault();
        this.open();
      }
      return;
    }

    if (event.code === "Enter" || event.code === "NumpadEnter") {
      event.preventDefault();
      this.onExit();
    } else if (event.code === "Escape" || event.code === "KeyM") {
      event.preventDefault();
      this.close();
    }
  }

  _tick() {
    this._frameId = requestAnimationFrame(this._tick);
    const { just, anyPressed } = this._pad.poll();

    if (this.isOpen) {
      if (just.has(PAD.Y)) this.onExit();
      else if (hasAny(just, PAD.A, PAD.B, ...MENU_BUTTONS)) this.close();
      return;
    }

    if (this._resumePending && !anyPressed) {
      this._resumePending = false;
      this.game?.resume();
      return;
    }

    if (hasAny(just, ...MENU_BUTTONS)) this.open();
  }
}

function createDialogButton(label, key, primary) {
  const button = document.createElement("button");
  button.type = "button";
  if (primary) button.className = "is-primary";
  button.textContent = label;
  const hint = document.createElement("span");
  hint.className = "menu-dialog-key";
  hint.textContent = key;
  button.append(hint);
  return button;
}
