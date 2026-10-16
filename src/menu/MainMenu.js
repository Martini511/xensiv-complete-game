import logoUrl from "../shared/assets/lowres-Logo_Infineon_RGB.eps.png";
import { GamepadPoller, PAD, hasAny } from "./gamepad.js";

/**
 * Hauptbildschirm mit der Map-Auswahl.
 *
 * Bedienung: Maus (Hover + Klick), Tastatur (Pfeile / A D, Enter oder
 * Leertaste, 1 / 2 direkt) und Gamepad (D-Pad / linker Stick, A, Y oder
 * Start). Beim XENSIV-Controller sind A und Y mit "F" und "T" beschriftet.
 */
export class MainMenu {
  /**
   * @param {HTMLElement} parent
   * @param {object[]} maps Eintraege aus maps.js
   * @param {(map: object) => void} onSelect
   */
  constructor(parent, maps, onSelect) {
    this.maps = maps;
    this.onSelect = onSelect;
    this.selected = 0;
    this._chosen = false;
    this._pad = new GamepadPoller();
    this._frameId = null;

    this.element = document.createElement("div");
    this.element.id = "main-menu";

    const inner = document.createElement("div");
    inner.className = "menu-inner";

    const logo = document.createElement("img");
    logo.className = "menu-logo";
    logo.src = logoUrl;
    logo.alt = "Infineon";

    const title = document.createElement("h1");
    title.className = "menu-title";
    title.textContent = "Sensor Hunt";

    const subtitle = document.createElement("div");
    subtitle.className = "menu-subtitle";
    subtitle.textContent = "Choose your map";

    const list = document.createElement("div");
    list.className = "menu-maps";
    this.cards = maps.map((map, index) => this._createCard(map, index));
    list.append(...this.cards);

    const hint = document.createElement("div");
    hint.className = "menu-hint";
    hint.innerHTML =
      "<kbd>\u2190</kbd> <kbd>\u2192</kbd> / D-Pad: choose map \u00b7 " +
      "<kbd>Enter</kbd> / <kbd>F</kbd> / <kbd>T</kbd>: start \u00b7 or click a map";

    inner.append(logo, title, subtitle, list, hint);
    this.element.append(inner);
    parent.append(this.element);

    this._onKeyDown = this._onKeyDown.bind(this);
    this._tick = this._tick.bind(this);
    window.addEventListener("keydown", this._onKeyDown);
    this._frameId = requestAnimationFrame(this._tick);

    this._select(0, false);
  }

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    if (this._frameId !== null) cancelAnimationFrame(this._frameId);
    this._frameId = null;
    this.element.remove();
  }

  _createCard(map, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "map-card";
    card.dataset.map = map.id;

    const art = document.createElement("div");
    art.className = "map-art";
    art.innerHTML = map.art;

    const name = document.createElement("div");
    name.className = "map-name";
    name.textContent = map.name;

    const description = document.createElement("div");
    description.className = "map-desc";
    description.textContent = map.description;

    const tags = document.createElement("ul");
    tags.className = "map-tags";
    for (const tag of map.tags) {
      const item = document.createElement("li");
      item.textContent = tag;
      tags.append(item);
    }

    const best = document.createElement("div");
    best.className = "map-best";
    const [top] = map.scores.loadScores();
    if (top) {
      const time = document.createElement("strong");
      time.textContent = map.scores.formatTime(top.seconds);
      best.append("Best time ", time);
    } else {
      best.textContent = "No runs yet";
    }

    const play = document.createElement("div");
    play.className = "map-play";
    play.textContent = "\u25b6 Play";

    card.append(art, name, description, tags, best, play);
    card.addEventListener("mouseenter", () => this._select(index));
    card.addEventListener("focus", () => this._select(index, false));
    card.addEventListener("click", () => this._choose(index));
    return card;
  }

  _select(index, focus = true) {
    const count = this.cards.length;
    this.selected = ((index % count) + count) % count;
    this.cards.forEach((card, i) => card.classList.toggle("is-selected", i === this.selected));
    if (focus && document.activeElement !== this.cards[this.selected]) {
      this.cards[this.selected].focus({ preventScroll: true });
    }
  }

  _choose(index) {
    if (this._chosen) return;
    this._chosen = true;
    this.onSelect(this.maps[index]);
  }

  _onKeyDown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    switch (event.code) {
      case "ArrowLeft":
      case "ArrowUp":
      case "KeyA":
      case "KeyW":
        this._select(this.selected - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
      case "KeyD":
      case "KeyS":
        this._select(this.selected + 1);
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
      case "KeyF":
      case "KeyT":
      case "KeyE":
        this._choose(this.selected);
        break;
      default: {
        const digit = /^(?:Digit|Numpad)(\d)$/.exec(event.code);
        const index = digit ? Number(digit[1]) - 1 : -1;
        if (index < 0 || index >= this.maps.length) return;
        this._choose(index);
      }
    }
    // Sonst loest der fokussierte Button zusaetzlich einen Klick aus.
    event.preventDefault();
  }

  _tick() {
    this._frameId = requestAnimationFrame(this._tick);
    const { just } = this._pad.poll();
    if (hasAny(just, PAD.DPAD_LEFT, PAD.DPAD_UP, "left", "up")) this._select(this.selected - 1);
    if (hasAny(just, PAD.DPAD_RIGHT, PAD.DPAD_DOWN, "right", "down")) this._select(this.selected + 1);
    if (hasAny(just, PAD.A, PAD.Y, PAD.START)) this._choose(this.selected);
  }
}
