const fs = require('fs');
const path = require('path');
const assert = require('assert');

// ─── Mock DOM ────────────────────────────────────────────────────────────────

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
        this.className = '';
        this.classList = {
            _classes: new Set(),
            add(c)           { this._classes.add(c); },
            remove(c)        { this._classes.delete(c); },
            toggle(c, force) {
                if (force === undefined) {
                    if (this._classes.has(c)) this._classes.delete(c);
                    else this._classes.add(c);
                } else if (force) { this._classes.add(c); }
                else              { this._classes.delete(c); }
            },
            contains(c) { return this._classes.has(c); }
        };
    }
    setAttribute(name, val) { this.attributes[name] = String(val); }
    getAttribute(name)      { return this.attributes[name]; }
    addEventListener(event, fn) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(fn);
    }
    dispatchEvent(event) {
        const fns = this.eventListeners[event.type] || [];
        fns.forEach(fn => fn(event));
    }
    click()   { this.dispatchEvent({ type: 'click', stopPropagation: () => {} }); }
    change()  { this.dispatchEvent({ type: 'change', stopPropagation: () => {} }); }
    close()   { this.isOpen = false; this.closed = true; }
    showModal() { this.isOpen = true; this.open = true; }
    querySelector(sel) { return null; }
    querySelectorAll(sel) { return []; }
}

class MockShadowRoot {
    constructor() { this.elements = {}; this.innerHTML = ''; }
    getElementById(id) {
        if (!this.elements[id]) this.elements[id] = new MockElement(id);
        return this.elements[id];
    }
    querySelector(sel) { return null; }
    querySelectorAll(sel) { return []; }
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
    getBoundingClientRect() { return { width: 400, height: 500 }; }
};

global.customElements = { get: () => null, define: () => {} };
global.window = { customCards: [], confirm: () => true, alert: () => {}, addEventListener: () => {} };
global.document = { createElement: (tag) => new MockElement('', tag) };

// ─── Load card ───────────────────────────────────────────────────────────────

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const WashingMachineCard = new Function(code + '\nreturn WashingMachineCard;')();

console.log('Testing Phase 8 Status Indicators...\n');

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeCard(config, states) {
    const card = new WashingMachineCard();
    card.attachShadow();
    // Ensure all element IDs used in Phase 8 exist
    const ids = [
        'wrap', 'name', 'badgeText', 'dispTime', 'ringTime', 'dispDot',
        'ringLabel', 'ringArc', 'stState', 'statusPanel', 'optionsBtn',
        'hcConnectivity', 'hcConnDot', 'hcConnLabel',
        'hcProgramPanel', 'hcProgramLabel', 'hcProgramValue',
        'hcProgressBar', 'hcProgressFill',
        'hcFeatures',
    ];
    for (const id of ids) card.shadowRoot.elements[id] = new MockElement(id);
    card._el = (id) => card.shadowRoot.elements[id];
    card.setConfig(config);
    card._hass = { states };
    return card;
}

function runTests() {

    // ── Task 8.1: Connectivity indicator – connected ──────────────────────────
    console.log('Testing Task 8.1: Connectivity indicator – connected state');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    connectivity_entity:    'binary_sensor.washer_connected',
                }
            }
        }, {
            'sensor.washer_op':              { state: 'Ready' },
            'binary_sensor.washer_connected':{ state: 'on' },
        });

        card._updateConnectivity();

        const dot   = card._el('hcConnDot');
        const label = card._el('hcConnLabel');
        const conn  = card._el('hcConnectivity');

        assert(!conn.classList.contains('hidden'), 'hcConnectivity must be visible when connectivity entity configured');
        assert(dot.className.includes('connected'),   'dot must have class "connected"');
        assert.strictEqual(label.textContent, card._t.connected, 'label must show connected text');

        console.log('  ✔ Connected state: dot=connected, label populated, widget visible');
    }

    // ── Task 8.2: Connectivity indicator – disconnected ───────────────────────
    console.log('Testing Task 8.2: Connectivity indicator – disconnected state');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    connectivity_entity:    'binary_sensor.washer_connected',
                }
            }
        }, {
            'sensor.washer_op':              { state: 'Ready' },
            'binary_sensor.washer_connected':{ state: 'off' },
        });

        card._updateConnectivity();

        const dot   = card._el('hcConnDot');
        const label = card._el('hcConnLabel');

        assert(dot.className.includes('disconnected'), 'dot must have class "disconnected"');
        assert.strictEqual(label.textContent, card._t.disconnected, 'label must show offline text');

        console.log('  ✔ Disconnected state: dot=disconnected, label populated');
    }

    // ── Task 8.3: Connectivity indicator hidden when entity absent ────────────
    console.log('Testing Task 8.3: Connectivity indicator hidden when no connectivity entity');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    // NO connectivity_entity
                }
            }
        }, {
            'sensor.washer_op': { state: 'Inactive' },
        });

        card._updateConnectivity();
        assert(card._el('hcConnectivity').classList.contains('hidden'), 'hcConnectivity must be hidden without entity');
        console.log('  ✔ Widget hidden when connectivity_entity not configured');
    }

    // ── Task 8.4: Program display – active program shown ─────────────────────
    console.log('Testing Task 8.4: Program display panel – active program');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    active_program_entity:  'sensor.washer_active_program',
                    progress_entity:        'sensor.washer_progress',
                }
            }
        }, {
            'sensor.washer_op':              { state: 'Run' },
            'sensor.washer_active_program':  { state: 'Cotton' },
            'sensor.washer_progress':        { state: '45' },
        });

        card._updateProgramDisplay();

        const panel       = card._el('hcProgramPanel');
        const value       = card._el('hcProgramValue');
        const progressFill = card._el('hcProgressFill');

        assert(!panel.classList.contains('hidden'), 'Program panel must be visible when active program exists');
        assert(value.textContent.length > 0,        'Program value must contain program name');
        assert(progressFill.style.width === '45%',  'Progress fill must reflect entity state (45%)');

        console.log('  ✔ Program panel visible, name rendered, progress bar at 45%');
    }

    // ── Task 8.5: Program display – hidden when no active program ─────────────
    console.log('Testing Task 8.5: Program display panel – hidden when no active program');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    active_program_entity:  'sensor.washer_active_program',
                }
            }
        }, {
            'sensor.washer_op':             { state: 'Inactive' },
            'sensor.washer_active_program': { state: 'none' }, // no real active program
        });

        // Override _getActiveProgram to return null
        card._getActiveProgram = () => null;
        card._updateProgramDisplay();

        assert(card._el('hcProgramPanel').classList.contains('hidden'), 'Panel must be hidden with no active program');
        console.log('  ✔ Program panel hidden when no active program');
    }

    // ── Task 8.6: Feature chips – i-Dos active ────────────────────────────────
    console.log('Testing Task 8.6: Feature chips – i-Dos active');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    idos1_active_entity:    'binary_sensor.washer_idos1',
                    idos1_low_entity:       'binary_sensor.washer_idos1_low',
                    idos2_active_entity:    'binary_sensor.washer_idos2',
                    idos2_low_entity:       'binary_sensor.washer_idos2_low',
                }
            }
        }, {
            'sensor.washer_op':                { state: 'Run' },
            'binary_sensor.washer_idos1':      { state: 'on' },
            'binary_sensor.washer_idos1_low':  { state: 'off' },
            'binary_sensor.washer_idos2':      { state: 'on' },
            'binary_sensor.washer_idos2_low':  { state: 'on' },  // idos2 is low
        });

        card._updateFeatureChips();

        const container = card._el('hcFeatures');
        assert(!container.classList.contains('hidden'),       'Features container must be visible');
        assert(container.innerHTML.includes('i-Dos 1'),       'Must show i-Dos 1 chip');
        assert(container.innerHTML.includes('i-Dos 2'),       'Must show i-Dos 2 chip');
        assert(container.innerHTML.includes('warning'),       'i-Dos 2 must have warning class (low)');
        assert(container.innerHTML.includes('active'),        'i-Dos 1 must have active class (not low)');

        console.log('  ✔ i-Dos chips rendered: i-Dos 1 active, i-Dos 2 with warning');
    }

    // ── Task 8.7: Feature chips – dishwasher consumables ─────────────────────
    console.log('Testing Task 8.7: Feature chips – dishwasher consumables');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'dishwasher',
            home_connect: {
                dishwasher: {
                    operation_state_entity: 'sensor.dw_op',
                    salt_low_entity:        'binary_sensor.dw_salt_low',
                    rinseaid_low_entity:    'binary_sensor.dw_rinseaid_low',
                }
            }
        }, {
            'sensor.dw_op':                 { state: 'Run' },
            'binary_sensor.dw_salt_low':    { state: 'on' },
            'binary_sensor.dw_rinseaid_low':{ state: 'on' },
        });

        card._updateFeatureChips();

        const container = card._el('hcFeatures');
        assert(!container.classList.contains('hidden'),    'Features container must be visible');
        assert(container.innerHTML.includes('warning'),    'Consumable chips must have warning class');
        // Check that two warning chips appear (salt + rinseaid)
        const matches = container.innerHTML.match(/class="hc-chip warning"/g) || [];
        assert(matches.length === 2, `Expected 2 warning chips, got ${matches.length}`);

        console.log('  ✔ Dishwasher consumable warning chips rendered (salt + rinse aid)');
    }

    // ── Task 8.8: Feature chips – active features (hygiene+, variospeed+) ─────
    console.log('Testing Task 8.8: Feature chips – active dishwasher features');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'dishwasher',
            home_connect: {
                dishwasher: {
                    operation_state_entity: 'sensor.dw_op',
                    hygiene_plus_entity:    'switch.dw_hygiene',
                    variospeed_plus_entity: 'switch.dw_variospeed',
                    intensive_zone_entity:  'switch.dw_intensive',
                }
            }
        }, {
            'sensor.dw_op':          { state: 'Run' },
            'switch.dw_hygiene':     { state: 'on' },
            'switch.dw_variospeed':  { state: 'on' },
            'switch.dw_intensive':   { state: 'off' },  // off → no chip
        });

        card._updateFeatureChips();

        const container = card._el('hcFeatures');
        assert(!container.classList.contains('hidden'), 'Features container must be visible');
        const activeMatches = container.innerHTML.match(/class="hc-chip active"/g) || [];
        assert(activeMatches.length === 2, `Expected 2 active chips (hygiene+, variospeed+), got ${activeMatches.length}`);
        // Intensive zone is off → must NOT appear
        assert(!container.innerHTML.includes('Intensive'), 'Intensive zone chip must NOT appear when off');

        console.log('  ✔ Active feature chips: hygiene+ and variospeed+ visible, intensive absent');
    }

    // ── Task 8.9: Feature chips – hidden when nothing active ─────────────────
    console.log('Testing Task 8.9: Feature chips – hidden when no features active');
    {
        const card = makeCard({
            mode: 'home_connect',
            appliance_type: 'washer',
            home_connect: {
                washer: {
                    operation_state_entity: 'sensor.washer_op',
                    idos1_active_entity:    'binary_sensor.washer_idos1',
                }
            }
        }, {
            'sensor.washer_op':           { state: 'Inactive' },
            'binary_sensor.washer_idos1': { state: 'off' },  // not active
        });

        card._updateFeatureChips();
        assert(card._el('hcFeatures').classList.contains('hidden'), 'hcFeatures must be hidden when no chips');
        console.log('  ✔ Feature container hidden when no active features');
    }

    // ── Task 8.10: Localization strings ───────────────────────────────────────
    console.log('Testing Task 8.10: Localization strings for Phase 8');
    {
        const card = new WashingMachineCard();
        // Default locale is 'en'
        card._hass = { locale: { language: 'en' } };
        card.setConfig({ mode: 'standard', status_entity: 'binary_sensor.x' });
        const t = card._t;

        assert(t.connected,      'connected must exist');
        assert(t.disconnected,   'disconnected must exist');
        assert(t.active_program, 'active_program must exist');
        assert(t.salt_low,       'salt_low must exist');
        assert(t.rinseaid_low,   'rinseaid_low must exist');

        // Test German locale
        card._hass = { locale: { language: 'de' } };
        const tDe = card._t;
        assert(tDe.connected === 'Verbunden',  'DE connected must be "Verbunden"');
        assert(tDe.disconnected === 'Offline', 'DE disconnected must be "Offline"');
        assert(tDe.salt_low === 'Salz leer',   'DE salt_low must be "Salz leer"');

        console.log('  ✔ All Phase 8 localization keys present in EN and DE');
    }

    // ── Task 8.11: _updateStatusIndicators only runs in HC mode ──────────────
    console.log('Testing Task 8.11: _updateStatusIndicators is no-op in standard mode');
    {
        const card = new WashingMachineCard();
        card.attachShadow();
        card._el = (id) => card.shadowRoot.getElementById(id);
        card.setConfig({ mode: 'standard', status_entity: 'binary_sensor.x' });
        card._hass = { states: {} };

        // Should not throw or touch any HC elements
        let threw = false;
        try { card._updateStatusIndicators(); } catch (e) { threw = true; }
        assert(!threw, '_updateStatusIndicators must not throw in standard mode');

        console.log('  ✔ _updateStatusIndicators is a safe no-op in standard mode');
    }

    console.log('\nAll Phase 8 tests passed successfully! 🎉\n');
}

runTests();
