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
        this.children = [];
        this.checked = false;
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
    change() {
        this.dispatchEvent({ type: 'change', stopPropagation: () => {} });
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
        if (sel.includes('button[data-temp]')) return this.tempButtons || [];
        if (sel.includes('button[data-spin]')) return this.spinButtons || [];
        if (sel.includes('input[data-feature]')) return this.featureInputs || [];
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

console.log("Testing Phase 7 UI Controls Layer 2 (Options Dialog)...");

function runTests() {
    // Task 7.1: Options button presence in DOM and visibility toggling
    console.log("\nTesting Task 7.1: Options Button Visibility");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const optionsBtn = new MockElement("optionsBtn");
        card.shadowRoot.elements["optionsBtn"] = optionsBtn;
        card.shadowRoot.elements["wrap"] = new MockElement("wrap");
        card.shadowRoot.elements["name"] = new MockElement("name");
        card.shadowRoot.elements["badgeText"] = new MockElement("badgeText");
        card.shadowRoot.elements["dispTime"] = new MockElement("dispTime");
        card.shadowRoot.elements["ringTime"] = new MockElement("ringTime");
        card.shadowRoot.elements["dispDot"] = new MockElement("dispDot");
        card.shadowRoot.elements["ringLabel"] = new MockElement("ringLabel");
        card.shadowRoot.elements["ringArc"] = new MockElement("ringArc");
        card.shadowRoot.elements["stState"] = new MockElement("stState");
        card.shadowRoot.elements["statusPanel"] = new MockElement("statusPanel");
        card._el = (id) => card.shadowRoot.elements[id];

        // Case 1: HC mode with options entities configured -> button visible (hidden class removed)
        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    operation_state_entity: "sensor.washer_operation_state",
                    temperature_entity: "select.washer_temp",
                    spin_speed_entity: "select.washer_spin"
                }
            }
        });
        card.hass = {
            states: {
                "sensor.washer_operation_state": { state: "Ready" },
                "select.washer_temp": { state: "40°C", attributes: { options: ["Cold", "30°C", "40°C", "60°C"] } },
                "select.washer_spin": { state: "1200", attributes: { options: ["0", "800", "1200", "1400"] } }
            }
        };

        card._updateHomeConnect();
        assert.strictEqual(optionsBtn.classList.contains("hidden"), false, "Options button should NOT have hidden class when options are configured");

        // Case 2: HC mode with NO option entities configured -> button hidden
        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    operation_state_entity: "sensor.washer_operation_state"
                }
            }
        });
        card._updateHomeConnect();
        assert.strictEqual(optionsBtn.classList.contains("hidden"), true, "Options button should have hidden class when no options are configured");

        console.log("  ✔ Options button visibility conditionally toggled based on available entities");
    }

    // Task 7.2: Options Dialog Rendering with temperature, spin speed, and features
    console.log("\nTesting Task 7.2: Options Dialog HTML Rendering");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const dialog = new MockElement("hcDialog", "dialog");
        card.shadowRoot.elements["hcDialog"] = dialog;

        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    temperature_entity: "select.washer_temp",
                    spin_speed_entity: "select.washer_spin",
                    child_lock_entity: "switch.washer_child_lock"
                }
            }
        });
        card.hass = {
            states: {
                "select.washer_temp": { state: "40°C", attributes: { options: ["Cold", "30°C", "40°C", "60°C", "90°C"] } },
                "select.washer_spin": { state: "1200", attributes: { options: ["0", "800", "1200", "1400"] } },
                "switch.washer_child_lock": { state: "on" }
            }
        };

        card._openOptionsDialog();

        assert(dialog.innerHTML.includes('id="tempOptionSection"'), "Dialog must render temperature option section");
        assert(dialog.innerHTML.includes('id="spinOptionSection"'), "Dialog must render spin speed option section");
        assert(dialog.innerHTML.includes('id="featuresOptionSection"'), "Dialog must render features section");
        assert(dialog.innerHTML.includes('data-temp="40°C"'), "Dialog must render 40°C button");
        assert(dialog.innerHTML.includes('data-spin="1200"'), "Dialog must render 1200 spin button");
        assert(dialog.innerHTML.includes('data-feature="child_lock_entity"'), "Dialog must render child lock toggle");
        assert(dialog.innerHTML.includes('checked'), "Active feature switch must be checked");

        console.log("  ✔ Options dialog renders temperature, spin, and feature sections");
    }

    // Task 7.3: Dishwasher Specific Feature Rendering (IntensiveZone, HygienePlus, VarioSpeedPlus)
    console.log("\nTesting Task 7.3: Dishwasher Options Rendering");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const dialog = new MockElement("hcDialog", "dialog");
        card.shadowRoot.elements["hcDialog"] = dialog;

        card.setConfig({
            mode: "home_connect",
            appliance_type: "dishwasher",
            home_connect: {
                dishwasher: {
                    intensive_zone_entity: "switch.dishwasher_intensive_zone",
                    variospeed_plus_entity: "switch.dishwasher_variospeed_plus",
                    hygiene_plus_entity: "switch.dishwasher_hygiene_plus",
                    silence_on_demand_entity: "switch.dishwasher_silence_on_demand",
                    brilliant_dry_entity: "switch.dishwasher_brilliant_dry"
                }
            }
        });
        card.hass = {
            states: {
                "switch.dishwasher_intensive_zone": { state: "on" },
                "switch.dishwasher_variospeed_plus": { state: "off" },
                "switch.dishwasher_hygiene_plus": { state: "off" },
                "switch.dishwasher_silence_on_demand": { state: "off" },
                "switch.dishwasher_brilliant_dry": { state: "off" }
            }
        };

        card._openOptionsDialog();

        assert(dialog.innerHTML.includes('data-feature="intensive_zone_entity"'), "Must include intensive_zone toggle");
        assert(dialog.innerHTML.includes('data-feature="variospeed_plus_entity"'), "Must include variospeed_plus toggle");
        assert(dialog.innerHTML.includes('data-feature="hygiene_plus_entity"'), "Must include hygiene_plus toggle");
        assert(dialog.innerHTML.includes('data-feature="silence_on_demand_entity"'), "Must include silence_on_demand toggle");
        assert(dialog.innerHTML.includes('data-feature="brilliant_dry_entity"'), "Must include brilliant_dry toggle");

        console.log("  ✔ Dishwasher options and features render correctly");
    }

    // Task 7.4: Empty State when no options configured
    console.log("\nTesting Task 7.4: Empty Options State");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const dialog = new MockElement("hcDialog", "dialog");
        card.shadowRoot.elements["hcDialog"] = dialog;

        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {}
            }
        });
        card.hass = { states: {} };

        card._openOptionsDialog();
        assert(dialog.innerHTML.includes('class="hc-empty-options"'), "Must render empty options placeholder");

        console.log("  ✔ Empty options handled gracefully with localized notice");
    }

    // Task 7.5: Interactive Selection & Service Calls
    console.log("\nTesting Task 7.5: Option Selection Interactions");
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        const dialog = new MockElement("hcDialog", "dialog");
        card.shadowRoot.elements["hcDialog"] = dialog;

        const btnTemp60 = new MockElement("", "button");
        btnTemp60.dataset.temp = "60°C";
        const btnSpin1400 = new MockElement("", "button");
        btnSpin1400.dataset.spin = "1400";
        const inputChildLock = new MockElement("", "input");
        inputChildLock.dataset.feature = "child_lock_entity";

        dialog.tempButtons = [btnTemp60];
        dialog.spinButtons = [btnSpin1400];
        dialog.featureInputs = [inputChildLock];

        card.setConfig({
            mode: "home_connect",
            appliance_type: "washer",
            home_connect: {
                washer: {
                    temperature_entity: "select.washer_temp",
                    spin_speed_entity: "select.washer_spin",
                    child_lock_entity: "switch.washer_child_lock"
                }
            }
        });
        card.hass = {
            states: {
                "select.washer_temp": { state: "40°C", attributes: { options: ["40°C", "60°C"] } },
                "select.washer_spin": { state: "1200", attributes: { options: ["1200", "1400"] } },
                "switch.washer_child_lock": { state: "off" }
            }
        };

        let selectedTemp = null;
        card._hcSetTemperature = (temp) => { selectedTemp = temp; };

        let selectedSpin = null;
        card._hcSetSpinSpeed = (spin) => { selectedSpin = spin; };

        let childLockToggled = false;
        card._hcToggleChildLock = () => { childLockToggled = true; };

        card._openOptionsDialog();

        // Click temperature button
        btnTemp60.click();
        assert.strictEqual(selectedTemp, "60°C", "Clicking temperature pill should call _hcSetTemperature");

        // Click spin button
        btnSpin1400.click();
        assert.strictEqual(selectedSpin, "1400", "Clicking spin pill should call _hcSetSpinSpeed");

        // Toggle feature
        inputChildLock.change();
        assert.strictEqual(childLockToggled, true, "Changing feature toggle should call toggleFn");

        console.log("  ✔ Option interactions trigger corresponding control methods");
    }

    // Task 7.6: Localization Strings Verification
    console.log("\nTesting Task 7.6: Localization Strings");
    {
        const card = new WashingMachineCard();
        const t = card._t;
        assert(t.options_title, "options_title must exist in _t");
        assert(t.tip_options_btn, "tip_options_btn must exist in _t");
        assert(t.temperature, "temperature must exist in _t");
        assert(t.spin_speed, "spin_speed must exist in _t");
        assert(t.child_lock, "child_lock must exist in _t");
        assert(t.hygiene_plus, "hygiene_plus must exist in _t");
        assert(t.intensive_zone, "intensive_zone must exist in _t");
        assert(t.variospeed_plus, "variospeed_plus must exist in _t");
        assert(t.silence_on_demand, "silence_on_demand must exist in _t");
        assert(t.brilliant_dry, "brilliant_dry must exist in _t");
        assert(t.no_options_available, "no_options_available must exist in _t");
        console.log("  ✔ All Phase 7 localization keys present in _t");
    }

    console.log("\nAll Phase 7 tests passed successfully! 🎉\n");
}

runTests();
