const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM elements
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.textContent = '';
        this.innerHTML = '';
        this.style = {};
        this.attributes = {};
        this.dataset = {};
        this.eventListeners = {};
        this.classList = {
            _classes: new Set(),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); },
            toggle(c, force) {
                if (force === undefined) {
                    if (this._classes.has(c)) this._classes.delete(c);
                    else this._classes.add(c);
                } else if (force) {
                    this._classes.add(c);
                } else {
                    this._classes.delete(c);
                }
            },
            contains(c) { return this._classes.has(c); }
        };
    }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }
    dispatchEvent(event) {
        const fns = this.eventListeners[event.type] || [];
        fns.forEach(fn => fn(event));
    }
    click() {
        this.dispatchEvent({ type: 'click', stopPropagation: () => {} });
    }
    close() {
        this.isOpen = false;
        this.closed = true;
    }
    showModal() {
        this.isOpen = true;
        this.open = true;
    }
    querySelector(sel) {
        if (sel === '#closeHcDialog') return this.closeBtn || new MockElement('closeHcDialog');
        return null;
    }
    querySelectorAll(sel) {
        if (sel === '.hc-program-item') return this.programItems || [];
        return [];
    }
}

global.HTMLElement = class HTMLElement {
    constructor() {
        this.classList = new MockElement().classList;
        this.style = {};
    }
    attachShadow() {
        this.shadowRoot = new MockShadowRoot();
        return this.shadowRoot;
    }
    getBoundingClientRect() {
        return { width: 400, height: 500 };
    }
};

class MockShadowRoot {
    constructor() {
        this.elements = {};
        this.innerHTML = '';
    }
    getElementById(id) {
        if (!this.elements[id]) {
            this.elements[id] = new MockElement(id);
        }
        return this.elements[id];
    }
    querySelector(sel) {
        return null;
    }
    querySelectorAll(sel) {
        return [];
    }
}

global.customElements = {
    get: () => null,
    define: () => {}
};

global.window = {
    customCards: [],
    confirm: () => true,
    alert: () => {},
    addEventListener: () => {}
};

global.document = {
    createElement: (tag) => new MockElement('', tag)
};

// Load washing machine card script
const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log("Testing Phase 6 Dishwasher Interactive Controls...");

function runTests() {
    // Task 6.1: Dishwasher SVG Interactive Overlays in Home Connect mode
    console.log("\nTesting Task 6.1: Dishwasher SVG Interactive Overlays");
    {
        const card = new WashingMachineCard();
        card.setConfig({
            mode: "home_connect",
            appliance_type: "dishwasher",
            home_connect: {
                dishwasher: {
                    power_switch_entity: "switch.dishwasher_power"
                }
            }
        });

        const svgHc = card._svgDishwasher("test_dw_uid");
        assert(svgHc.includes('class="machine hc-interactive"'), "Dishwasher SVG must include hc-interactive class in HC mode");
        assert(svgHc.includes('id="hcProgramBtn"'), "Dishwasher SVG must include hcProgramBtn overlay");
        assert(svgHc.includes('id="hcStartBtn"'), "Dishwasher SVG must include hcStartBtn overlay");
        assert(svgHc.includes('id="hcPowerBtn"'), "Dishwasher SVG must include hcPowerBtn overlay");
        assert(svgHc.includes('class="hc-control"'), "Dishwasher SVG must have hc-control class on interactive overlays");

        // In standard mode, overlays must NOT be rendered
        const cardStd = new WashingMachineCard();
        cardStd.setConfig({
            mode: "standard",
            appliance_type: "dishwasher",
            status_entity: "sensor.dishwasher_status"
        });
        const svgStd = cardStd._svgDishwasher("test_dw_uid_std");
        assert(!svgStd.includes('hc-interactive'), "Dishwasher SVG must not include hc-interactive class in standard mode");
        assert(!svgStd.includes('id="hcProgramBtn"'), "Dishwasher SVG must not include hcProgramBtn in standard mode");
        assert(!svgStd.includes('id="hcStartBtn"'), "Dishwasher SVG must not include hcStartBtn in standard mode");
        assert(!svgStd.includes('id="hcPowerBtn"'), "Dishwasher SVG must not include hcPowerBtn in standard mode");

        console.log("  ✔ Dishwasher SVG overlays render conditionally based on mode");
    }

    // Task 6.2: Program Icon Mapping for Dishwasher Programs
    console.log("\nTesting Task 6.2: Program Icon Mapping");
    {
        const card = new WashingMachineCard();
        assert.strictEqual(card._getProgramIcon("DishCare.Dishwasher.Program.Eco50"), "🌿");
        assert.strictEqual(card._getProgramIcon("Auto2"), "🤖");
        assert.strictEqual(card._getProgramIcon("Intensiv70"), "🍲");
        assert.strictEqual(card._getProgramIcon("Pots and Pans"), "🍲");
        assert.strictEqual(card._getProgramIcon("Quick45"), "⚡");
        assert.strictEqual(card._getProgramIcon("PreRinse"), "💧");
        assert.strictEqual(card._getProgramIcon("NightWash"), "🌙");
        assert.strictEqual(card._getProgramIcon("MachineCare"), "✨");
        assert.strictEqual(card._getProgramIcon("Delicate Glass"), "🍷");
        assert.strictEqual(card._getProgramIcon("Sanitize Dishes"), "🧴");
        assert.strictEqual(card._getProgramIcon("Normal Dish"), "🍽️");
        console.log("  ✔ Dishwasher program icon mapping covers all relevant categories");
    }

    // Task 6.3: Dishwasher Default Fallback Programs in Program Selector
    console.log("\nTesting Task 6.3: Dishwasher Default Fallback Programs");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const dialog = new MockElement("hcDialog", "dialog");
        card.shadowRoot.elements["hcDialog"] = dialog;

        card.setConfig({
            mode: "home_connect",
            appliance_type: "dishwasher",
            home_connect: {
                dishwasher: {}
            }
        });
        card.hass = { states: {} };

        card._openProgramSelector();

        assert(dialog.innerHTML.includes('data-program="Eco50"'), "Default dishwasher program list should include Eco50");
        assert(dialog.innerHTML.includes('data-program="Intensiv70"'), "Default dishwasher program list should include Intensiv70");
        assert(dialog.innerHTML.includes('data-program="Auto1"'), "Default dishwasher program list should include Auto1");
        assert(dialog.innerHTML.includes('data-program="PreRinse"'), "Default dishwasher program list should include PreRinse");
        assert(dialog.innerHTML.includes('data-program="MachineCare"'), "Default dishwasher program list should include MachineCare");
        assert(!dialog.innerHTML.includes('data-program="Cotton"'), "Default dishwasher program list should not include washer Cotton program");

        console.log("  ✔ Default dishwasher program list fallback works properly");
    }

    // Task 6.4: Interactive SVG Event Attachment
    console.log("\nTesting Task 6.4: SVG Control Interactions");
    {
        const card = new WashingMachineCard();
        card.attachShadow();

        const progBtn = new MockElement("hcProgramBtn");
        const startBtn = new MockElement("hcStartBtn");
        const powerBtn = new MockElement("hcPowerBtn");

        card.shadowRoot.elements["hcProgramBtn"] = progBtn;
        card.shadowRoot.elements["hcStartBtn"] = startBtn;
        card.shadowRoot.elements["hcPowerBtn"] = powerBtn;

        card._el = (id) => card.shadowRoot.elements[id];

        card.setConfig({
            mode: "home_connect",
            appliance_type: "dishwasher",
            home_connect: {
                dishwasher: {
                    power_switch_entity: "switch.dishwasher_power"
                }
            }
        });

        let selectorOpened = false;
        card._openProgramSelector = () => { selectorOpened = true; };

        let startTriggered = false;
        card._hcToggleStartPause = () => { startTriggered = true; };

        let powerToggled = false;
        card._hcTogglePower = () => { powerToggled = true; };

        card._attachSVGInteractions();

        // Trigger clicks
        progBtn.dispatchEvent({ type: 'click', stopPropagation: () => {} });
        assert.strictEqual(selectorOpened, true, "Clicking hcProgramBtn should open program selector");

        startBtn.dispatchEvent({ type: 'click', stopPropagation: () => {} });
        assert.strictEqual(startTriggered, true, "Clicking hcStartBtn should trigger _hcStartOrPause");

        powerBtn.dispatchEvent({ type: 'click', stopPropagation: () => {} });
        assert.strictEqual(powerToggled, true, "Clicking hcPowerBtn should trigger _hcTogglePower");

        console.log("  ✔ SVG click interactions attach correctly and fire handlers");
    }

    console.log("\nAll Phase 6 tests passed successfully! 🎉\n");
}

runTests();
