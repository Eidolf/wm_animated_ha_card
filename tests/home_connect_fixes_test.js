const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM
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
    click() {
        if (this.eventListeners['click']) {
            const ev = { stopPropagation: () => {} };
            this.eventListeners['click'].forEach(fn => fn(ev));
        }
    }
    showModal() { this.isOpen = true; }
    close() { this.isOpen = false; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
}

global.HTMLElement = class HTMLElement {
    constructor() {
        this.classList = new MockElement().classList;
    }
    getBoundingClientRect() { return { width: 400 }; }
};
global.customElements = { define: () => {}, get: () => {} };
global.window = { customCards: [] };
global.document = { createElement: (tag) => new MockElement('', tag) };

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn { WashingMachineCard, WashingMachineCardEditor };');
const { WashingMachineCard, WashingMachineCardEditor } = script();

console.log("Testing Home Connect Fixes Specification...\n");

// -------------------------------------------------------------
// Test 1: Power monitoring fields visibility in visual editor
// -------------------------------------------------------------
console.log("Test 1: Power monitoring fields in visual editor schema");
const sections = WashingMachineCardEditor._sections;
const powerSection = sections.find(s => s.title === "Power monitoring");
assert(powerSection, "Power monitoring section must exist in schema");

const powerEntityField = powerSection.fields.find(f => f.key === "power_entity");
const powerThresholdField = powerSection.fields.find(f => f.key === "power_threshold");
const powerMaxField = powerSection.fields.find(f => f.key === "power_max");

assert.strictEqual(powerEntityField.visibleWhen, undefined, "power_entity must not have visibleWhen (visible in all modes)");
assert.strictEqual(powerMaxField.visibleWhen, undefined, "power_max must not have visibleWhen (visible in all modes)");
assert(typeof powerThresholdField.visibleWhen === "function", "power_threshold must have visibleWhen function");
assert.strictEqual(powerThresholdField.visibleWhen({ mode: "standard" }), true, "power_threshold visible in standard mode");
assert.strictEqual(powerThresholdField.visibleWhen({ mode: "home_connect" }), false, "power_threshold hidden in home_connect mode");
console.log("  ✔ Fix 1 passed: power_entity and power_max visible in all modes, power_threshold standard only");

// -------------------------------------------------------------
// Test 2: German progress entity auto-discovery pattern
// -------------------------------------------------------------
console.log("\nTest 2: Progress entity pattern matches German entity names");
const card = new WashingMachineCard();
card._hass = {
    states: {
        "sensor.waschmaschine_operation_state": { entity_id: "sensor.waschmaschine_operation_state" },
        "sensor.waschmaschine_programm_fortschritt": { entity_id: "sensor.waschmaschine_programm_fortschritt" },
        "switch.waschmaschine_power": { entity_id: "switch.waschmaschine_power" }
    },
    entities: {
        "sensor.waschmaschine_operation_state": { device_id: "dev_de" },
        "sensor.waschmaschine_programm_fortschritt": { device_id: "dev_de" },
        "switch.waschmaschine_power": { device_id: "dev_de" }
    }
};
card._config = {
    mode: "home_connect",
    appliance_type: "washer"
};

const discovered = card._autoDiscoverEntities("dev_de", "washer");
assert(discovered, "Auto discovery must succeed");
assert.strictEqual(discovered.progress_entity, "sensor.waschmaschine_programm_fortschritt", "German progress entity must be discovered");
console.log("  ✔ Fix 2 passed: German 'programm_fortschritt' successfully auto-discovered");

// -------------------------------------------------------------
// Test 3 & 5: _hcToggleStartPause behavior (washer vs dishwasher)
// -------------------------------------------------------------
console.log("\nTest 3 & 5: Start/Pause/Stop toggle for washer and dishwasher");
{
    // Washer running -> pause
    let pauseCalled = false;
    let stopCalled = false;
    let startCalled = false;

    card._config = { mode: "home_connect", appliance_type: "washer" };
    card._getOperationState = () => "Run";
    card._hcPause = () => { pauseCalled = true; };
    card._hcStop = () => { stopCalled = true; };
    card._hcStart = () => { startCalled = true; };

    card._hcToggleStartPause();
    assert.strictEqual(pauseCalled, true, "Washer in Run state must call _hcPause");
    assert.strictEqual(stopCalled, false, "Washer in Run state must not call _hcStop");

    // Dishwasher running -> stop
    pauseCalled = false;
    stopCalled = false;
    card._config = { mode: "home_connect", appliance_type: "dishwasher" };
    card._hcToggleStartPause();
    assert.strictEqual(stopCalled, true, "Dishwasher in Run state must call _hcStop");
    assert.strictEqual(pauseCalled, false, "Dishwasher in Run state must not call _hcPause");

    // Paused / Ready / Inactive / Finished -> start
    for (const st of ["Pause", "Ready", "Inactive", "Finished"]) {
        startCalled = false;
        card._getOperationState = () => st;
        card._hcToggleStartPause();
        assert.strictEqual(startCalled, true, `State ${st} must call _hcStart`);
    }
    console.log("  ✔ Fix 3 & 5 passed: _hcToggleStartPause pauses washer, stops dishwasher, starts on ready/pause/inactive/finished");
}

// -------------------------------------------------------------
// Test 6: i-Dos Panel Rendering in Washer Chassis
// -------------------------------------------------------------
console.log("\nTest 6: i-Dos Panel Rendering");
{
    // Case A: No i-Dos configured -> renders fallback static rectangles
    card._config = {
        mode: "home_connect",
        appliance_type: "washer",
        home_connect: { washer: {} }
    };
    const defaultSvg = card._svgWasher("u_default");
    assert(defaultSvg.includes('fill="#cfd7e0"'), "Default chassis top panel rendered when no i-Dos");

    // Case B: i-Dos configured
    card._config = {
        mode: "home_connect",
        appliance_type: "washer",
        home_connect: {
            washer: {
                idos1_level_entity: "sensor.idos1_level",
                idos2_level_entity: "sensor.idos2_level",
                idos1_active_entity: "switch.idos1_active",
                idos2_active_entity: "switch.idos2_active"
            }
        }
    };
    card._hass = {
        states: {
            "sensor.idos1_level": { state: "75" },
            "sensor.idos2_level": { state: "40" },
            "switch.idos1_active": { state: "on" },
            "switch.idos2_active": { state: "off" }
        }
    };

    const idosSvg = card._svgWasher("u_idos");
    assert(idosSvg.includes("i-Dos Panel Background"), "i-Dos background rendered");
    assert(idosSvg.includes("75%"), "i-Dos 1 percentage rendered");
    assert(idosSvg.includes("40%"), "i-Dos 2 percentage rendered");
    assert(idosSvg.includes("#4a90e2"), "Active i-Dos 1 uses blue accent");
    console.log("  ✔ Fix 6 passed: i-Dos panel renders fill levels and active status in top-left panel");
}

// -------------------------------------------------------------
// Test 7: Door and Animation visual states
// -------------------------------------------------------------
console.log("\nTest 7: Door open/closed and running animation classes");
{
    const wrapEl = new MockElement("wrap");
    const doorEl = new MockElement("doorGroup");
    const drumEl = new MockElement("drumInterior");
    const elements = { wrap: wrapEl, doorGroup: doorEl, drumInterior: drumEl };
    card._el = (id) => elements[id];

    card._config = {
        mode: "home_connect",
        appliance_type: "washer",
        home_connect: {
            washer: {
                door_entity: "binary_sensor.door",
                operation_state_entity: "sensor.op_state"
            }
        }
    };

    // Door Open
    card._hass = {
        states: {
            "binary_sensor.door": { state: "on" },
            "sensor.op_state": { state: "Run" }
        }
    };
    card._updateDoorAnimation();
    assert(doorEl.classList.contains("door-open"), "doorGroup has door-open class");
    assert(wrapEl.classList.contains("door-open"), "wrap has door-open class");
    assert.strictEqual(drumEl.style.opacity, "1", "drumInterior opacity is 1 when open");

    // Door Closed
    card._hass = {
        states: {
            "binary_sensor.door": { state: "off" },
            "sensor.op_state": { state: "Run" }
        }
    };
    card._updateDoorAnimation();
    assert(doorEl.classList.contains("door-closed"), "doorGroup has door-closed class");
    assert(wrapEl.classList.contains("door-closed"), "wrap has door-closed class");
    assert.strictEqual(drumEl.style.opacity, "0", "drumInterior opacity is 0 when closed");

    console.log("  ✔ Fix 7 passed: Door state toggles classes on doorGroup and wrap, and updates drumInterior opacity");
}

console.log("\n========================================");
console.log("All Home Connect Specification Fixes Verified! 🎉");
console.log("========================================");
