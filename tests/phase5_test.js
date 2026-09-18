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

// Load washing machine card script via Function return
const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log("Testing Phase 5 Washer Door Animation...");

// Test Suite
function runTests() {
    // Task 5.1: SVG structure verification
    console.log("\nTesting Task 5.1: SVG Door & Drum Structure");
    {
        const card = new WashingMachineCard();
        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    door_entity: "binary_sensor.washer_door"
                }
            }
        });
        const svg = card._svgWasher("test_uid");
        assert(svg.includes('id="doorGroup"'), "Washer SVG must contain doorGroup element");
        assert(svg.includes('class="door-group"'), "Washer SVG must contain door-group class");
        assert(svg.includes('id="drumInterior"'), "Washer SVG must contain drumInterior element");
        assert(svg.includes('class="drum-interior"'), "Washer SVG must contain drum-interior class");
        assert(svg.includes('class="laundry"'), "Washer SVG must retain laundry graphic");
        console.log("  ✔ Washer SVG contains doorGroup and drumInterior elements");
    }

    // Task 5.2: CSS classes & opacity toggle on door open/closed
    console.log("\nTesting Task 5.2: Door state class toggling and interior opacity");
    {
        const card = new WashingMachineCard();
        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    door_entity: "binary_sensor.washer_door",
                    operation_state_entity: "sensor.washer_operation_state"
                }
            }
        });

        // Test 1: Door is OPEN
        card.hass = {
            states: {
                "binary_sensor.washer_door": { state: "on" },
                "sensor.washer_operation_state": { state: "Ready" }
            }
        };

        const doorGroup = card._el("doorGroup");
        const drumInterior = card._el("drumInterior");

        assert(doorGroup.classList.contains("door-open"), "doorGroup must have class 'door-open' when door is open");
        assert(!doorGroup.classList.contains("door-closed"), "doorGroup must NOT have class 'door-closed' when door is open");
        assert.strictEqual(drumInterior.style.opacity, "1", "drumInterior opacity must be 1 when door is open");
        console.log("  ✔ Open door sets door-open class and opacity 1");

        // Test 2: Door is CLOSED
        card.hass = {
            states: {
                "binary_sensor.washer_door": { state: "off" },
                "sensor.washer_operation_state": { state: "Ready" }
            }
        };

        assert(!doorGroup.classList.contains("door-open"), "doorGroup must NOT have class 'door-open' when door is closed");
        assert(doorGroup.classList.contains("door-closed"), "doorGroup must have class 'door-closed' when door is closed");
        assert.strictEqual(drumInterior.style.opacity, "0", "drumInterior opacity must be 0 when door is closed");
        console.log("  ✔ Closed door sets door-closed class and opacity 0");
    }

    // Task 5.3: Non-regression in standard mode
    console.log("\nTesting Task 5.3: Standard Mode Non-Regression");
    {
        const card = new WashingMachineCard();
        card.setConfig({
            mode: "standard",
            status_entity: "binary_sensor.washing_machine"
        });

        card.hass = {
            states: {
                "binary_sensor.washing_machine": { state: "on" }
            }
        };

        const doorGroup = card._el("doorGroup");
        // In standard mode, _updateDoorAnimation should do nothing / not apply HC open/closed logic
        assert(!doorGroup.classList.contains("door-open"), "Standard mode must not set door-open");
        assert(!doorGroup.classList.contains("door-closed"), "Standard mode must not set door-closed");
        console.log("  ✔ Standard mode unaffected by HC door animation");
    }

    console.log("\n========================================");
    console.log("All Phase 5 tests passed successfully!");
    console.log("========================================");
}

runTests();
