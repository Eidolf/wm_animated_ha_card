const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM elements
class MockElement {
    constructor(id = '') {
        this.id = id;
        this.textContent = '';
        this.innerHTML = '';
        this.style = {};
        this.attributes = {};
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
    addEventListener() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
}

global.HTMLElement = class HTMLElement {
    constructor() {
        this.classList = new MockElement().classList;
        this.shadowRoot = null;
    }
    attachShadow() {
        this.shadowRoot = new MockElement();
        return this.shadowRoot;
    }
    getBoundingClientRect() { return { width: 400 }; }
};
global.customElements = { define: () => {}, get: () => {} };
global.window = {
    customCards: [],
    confirm: () => true,
    alert: () => {}
};
global.document = {
    createElement: () => new MockElement()
};

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');
const script = new Function(code + '\nreturn { WashingMachineCard, WashingMachineCardEditor };');
const { WashingMachineCard, WashingMachineCardEditor } = script();

console.log('Testing Visual Editor Device Picker & Auto-Discovery...\n');

// --------------------------------------------------
// Test 1: Visual Editor Schema includes device_id selector
// --------------------------------------------------
console.log('Testing Test 1: Visual editor schema has device selector');
const sections = WashingMachineCardEditor._sections;
const modeSection = sections.find(s => s.title === 'Operating Mode');
assert(modeSection, 'Operating Mode section must exist');

const deviceField = modeSection.fields.find(f => f.key === 'device_id');
assert(deviceField, 'device_id field must exist in Operating Mode section');
assert.strictEqual(deviceField.selector.device.integration, 'home_connect', 'device selector must filter by home_connect integration');
console.log('  ✔ Visual editor schema has device_id selector for home_connect');

// --------------------------------------------------
// Test 2: _autoDiscoverEntities for Washer
// --------------------------------------------------
console.log('Testing Test 2: Auto-discovery for Washer');
const card = new WashingMachineCard();
card._hass = {
    states: {
        'sensor.bosch_washer_operation_state': { entity_id: 'sensor.bosch_washer_operation_state' },
        'sensor.bosch_washer_active_program': { entity_id: 'sensor.bosch_washer_active_program' },
        'select.bosch_washer_selected_program': { entity_id: 'select.bosch_washer_selected_program' },
        'sensor.bosch_washer_program_progress': { entity_id: 'sensor.bosch_washer_program_progress' },
        'sensor.bosch_washer_remaining_time': { entity_id: 'sensor.bosch_washer_remaining_time' },
        'sensor.bosch_washer_finish_time': { entity_id: 'sensor.bosch_washer_finish_time' },
        'switch.bosch_washer_power': { entity_id: 'switch.bosch_washer_power' },
        'switch.bosch_washer_start': { entity_id: 'switch.bosch_washer_start' },
        'switch.bosch_washer_pause': { entity_id: 'switch.bosch_washer_pause' },
        'button.bosch_washer_stop': { entity_id: 'button.bosch_washer_stop' },
        'binary_sensor.bosch_washer_door': { entity_id: 'binary_sensor.bosch_washer_door' },
        'binary_sensor.bosch_washer_connected': { entity_id: 'binary_sensor.bosch_washer_connected' },
        'binary_sensor.bosch_washer_remote_control': { entity_id: 'binary_sensor.bosch_washer_remote_control' },
        'binary_sensor.bosch_washer_remote_start': { entity_id: 'binary_sensor.bosch_washer_remote_start' },
        'select.bosch_washer_temperature': { entity_id: 'select.bosch_washer_temperature' },
        'select.bosch_washer_spin_speed': { entity_id: 'select.bosch_washer_spin_speed' },
        'switch.bosch_washer_idos1_dosing_active': { entity_id: 'switch.bosch_washer_idos1_dosing_active' },
        'switch.bosch_washer_child_lock': { entity_id: 'switch.bosch_washer_child_lock' },
    },
    entities: {}
};

// Map all states to device-123
for (const eid of Object.keys(card._hass.states)) {
    card._hass.entities[eid] = { device_id: 'device-123' };
}

card._config = {
    mode: 'home_connect',
    appliance_type: 'washer',
    device_id: 'device-123'
};

const discoveredWasher = card._autoDiscoverEntities('device-123');
assert(discoveredWasher, 'Auto-discovery must return a config object');

const washerEntities = discoveredWasher;
const detectedKeys = Object.keys(washerEntities);
assert(detectedKeys.length >= 10, `Should discover at least 10 entities, discovered ${detectedKeys.length}`);
assert.strictEqual(washerEntities.operation_state_entity, 'sensor.bosch_washer_operation_state');
assert.strictEqual(washerEntities.active_program_entity, 'sensor.bosch_washer_active_program');
assert.strictEqual(washerEntities.selected_program_entity, 'select.bosch_washer_selected_program');
assert.strictEqual(washerEntities.door_entity, 'binary_sensor.bosch_washer_door');
assert.strictEqual(washerEntities.power_entity, 'switch.bosch_washer_power');
assert.strictEqual(washerEntities.idos1_active_entity, 'switch.bosch_washer_idos1_dosing_active');
console.log(`  ✔ Auto-discovered ${detectedKeys.length} washer entities correctly`);

// --------------------------------------------------
// Test 3: _autoDiscoverEntities for Dishwasher
// --------------------------------------------------
console.log('Testing Test 3: Auto-discovery for Dishwasher');
card._hass.states['sensor.siemens_dw_operation_state'] = { entity_id: 'sensor.siemens_dw_operation_state' };
card._hass.states['binary_sensor.siemens_dw_salt_low'] = { entity_id: 'binary_sensor.siemens_dw_salt_low' };
card._hass.states['binary_sensor.siemens_dw_rinse_aid_low'] = { entity_id: 'binary_sensor.siemens_dw_rinse_aid_low' };
card._hass.states['switch.siemens_dw_hygiene_plus'] = { entity_id: 'switch.siemens_dw_hygiene_plus' };
card._hass.states['switch.siemens_dw_variospeed_plus'] = { entity_id: 'switch.siemens_dw_variospeed_plus' };
card._hass.states['switch.siemens_dw_brilliant_dry'] = { entity_id: 'switch.siemens_dw_brilliant_dry' };
card._hass.states['switch.siemens_dw_silence_on_demand'] = { entity_id: 'switch.siemens_dw_silence_on_demand' };

for (const eid of [
    'sensor.siemens_dw_operation_state',
    'binary_sensor.siemens_dw_salt_low',
    'binary_sensor.siemens_dw_rinse_aid_low',
    'switch.siemens_dw_hygiene_plus',
    'switch.siemens_dw_variospeed_plus',
    'switch.siemens_dw_brilliant_dry',
    'switch.siemens_dw_silence_on_demand'
]) {
    card._hass.entities[eid] = { device_id: 'dw-456' };
}

card._config.appliance_type = 'dishwasher';
card._config.device_id = 'dw-456';

const discoveredDishwasher = card._autoDiscoverEntities('dw-456');
assert(discoveredDishwasher, 'Should discover dishwasher config');
const dwEntities = discoveredDishwasher;
assert.strictEqual(dwEntities.salt_low_entity, 'binary_sensor.siemens_dw_salt_low');
assert.strictEqual(dwEntities.rinse_aid_low_entity, 'binary_sensor.siemens_dw_rinse_aid_low');
assert.strictEqual(dwEntities.hygiene_plus_entity, 'switch.siemens_dw_hygiene_plus');
assert.strictEqual(dwEntities.brilliant_dry_entity, 'switch.siemens_dw_brilliant_dry');
console.log('  ✔ Auto-discovered dishwasher-specific entities');

// --------------------------------------------------
// Test 4: setConfig & set hass auto-discovery triggers on device_id
// --------------------------------------------------
console.log('Testing Test 4: setConfig auto-discovery triggers on device_id');
const testCard = new WashingMachineCard();
testCard._hass = card._hass;
testCard.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    device_id: 'device-123'
});

assert(testCard._config.home_connect, 'setConfig must automatically populate home_connect config');
assert(testCard._config.home_connect.washer.operation_state_entity, 'home_connect.washer must have operation_state_entity');
assert.strictEqual(testCard._showSetupMessage, false, '_showSetupMessage must be false when device_id is discovered');
console.log('  ✔ setConfig auto-discovery populates home_connect from device_id');

// --------------------------------------------------
// Test 5: Manual YAML overrides auto-discovery
// --------------------------------------------------
console.log('Testing Test 5: Manual config overrides auto-discovery');
const manualCard = new WashingMachineCard();
manualCard._hass = card._hass;
manualCard.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    device_id: 'device-123',
    home_connect: {
        washer: {
            operation_state_entity: 'sensor.custom_operation_state'
        }
    }
});
assert.strictEqual(manualCard._config.home_connect.washer.operation_state_entity, 'sensor.custom_operation_state',
    'Manual config must not be overwritten by auto-discovery');
console.log('  ✔ Manual home_connect configuration overrides auto-discovery');

// --------------------------------------------------
// Test 6: Setup message shown when no config / device provided
// --------------------------------------------------
console.log('Testing Test 6: Setup message is shown when unconfigured');
const unconfiguredCard = new WashingMachineCard();
unconfiguredCard.setConfig({
    mode: 'home_connect'
});
assert.strictEqual(unconfiguredCard._showSetupMessage, true, 'Card must set _showSetupMessage = true when unconfigured');
const setupHtml = unconfiguredCard._renderSetupMessage();
assert(setupHtml.includes('setup-icon'), 'Setup message HTML should include setup-icon');
assert(setupHtml.includes('setup-step'), 'Setup message HTML should include step list');
console.log('  ✔ Setup message rendered and flagged when unconfigured');

// --------------------------------------------------
// Test 7: Error handling and auto-clear timer
// --------------------------------------------------
console.log('Testing Test 7: Error handling and auto-clearing');
const errorCard = new WashingMachineCard();
errorCard.setConfig({ mode: 'home_connect', appliance_type: 'washer', home_connect: { washer: {} } });
errorCard._updateCard = () => {};
errorCard._handleServiceError(new Error('Remote start not enabled'), 'start_program');
assert(errorCard._errorState, 'Error state must be set');
assert(errorCard._errorState.message.toLowerCase().includes('remote start'), 'Error message should describe remote start issue');
assert.strictEqual(errorCard._errorState.action, 'start_program');

// Test SVG overlay
const svgWithOverlay = errorCard._machineSvg();
assert(svgWithOverlay.includes('errorOverlay'), 'SVG should contain errorOverlay when _errorState is set');
assert(svgWithOverlay.includes(errorCard._errorState.message), 'SVG error overlay should contain localized message');

console.log('  ✔ Error handling sets error state and renders SVG overlay');

// --------------------------------------------------
// Test 8: Localization strings in all 4 languages
// --------------------------------------------------
console.log('Testing Test 8: Setup & Error localization strings in EN, DE, RU, FR');
const languages = ['en', 'de', 'ru', 'fr'];
const requiredKeys = [
    'setup_title',
    'setup_message',
    'setup_step1',
    'setup_step2',
    'setup_step3',
    'setup_step4',
    'remote_start_required',
    'door_must_be_closed'
];

for (const lang of languages) {
    const lCard = new WashingMachineCard();
    lCard._hass = { locale: { language: lang } };
    const t = lCard._t;
    for (const key of requiredKeys) {
        assert(t[key], `Language '${lang}' must have key '${key}'`);
    }
}
console.log('  ✔ All required setup and error strings present in EN, DE, RU, FR');

console.log('\n========================================');
console.log('All Visual Editor & Picker tests passed! 🎉');
console.log('========================================');
