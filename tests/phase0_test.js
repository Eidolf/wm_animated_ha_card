const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Simple DOM/CustomElements mock to load washing-machine-card.js in node
global.HTMLElement = class HTMLElement {};
global.customElements = {
    define: () => {},
    get: () => {}
};
global.window = {
    customCards: []
};
global.document = {
    createElement: () => ({})
};

const code = fs.readFileSync(path.join(__dirname, '../washing-machine-card.js'), 'utf8');

// Evaluate script in context to obtain WashingMachineCard class
const script = new Function(code + '\nreturn WashingMachineCard;');
const WashingMachineCard = script();

console.log('Testing Phase 0 Foundation logic...');

// 1. Check DEFAULTS
assert.strictEqual(WashingMachineCard.DEFAULTS.mode, 'standard', 'Default mode must be standard');
assert.strictEqual(WashingMachineCard.DEFAULTS.home_connect, null, 'Default home_connect must be null');
console.log('✔ Task 0.2: DEFAULTS updated correctly');

// 2. Test setConfig & mode detection
const card = new WashingMachineCard();

// Standard mode: status_entity required
assert.throws(() => {
    card.setConfig({ appliance_type: 'washer' });
}, /status_entity is required in standard mode/, 'Should throw when status_entity missing in standard mode');

// Standard minimal
card.setConfig({ status_entity: 'binary_sensor.test_washing' });
assert.strictEqual(card._getMode(), 'standard', '_getMode() should return standard by default');
assert.strictEqual(card._isStandardMode(), true, '_isStandardMode() should return true');
assert.strictEqual(card._isHomeConnectMode(), false, '_isHomeConnectMode() should return false');
console.log('✔ Task 0.1 & 0.3: Standard mode detection and validation verified');

// Home connect mode: home_connect object not yet configured shows setup message
card.setConfig({ mode: 'home_connect' });
assert.strictEqual(card._showSetupMessage, true, 'Should set _showSetupMessage when home_connect is missing');

// Home connect valid config
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            operation_state_entity: 'sensor.test_washer_state'
        }
    }
});
assert.strictEqual(card._getMode(), 'home_connect', '_getMode() should return home_connect');
assert.strictEqual(card._isHomeConnectMode(), true, '_isHomeConnectMode() should return true');
assert.strictEqual(card._isStandardMode(), false, '_isStandardMode() should return false');
console.log('✔ Task 0.1 & 0.3: Home Connect mode detection and validation verified');

// Rejection of unknown mode
assert.throws(() => {
    card.setConfig({
        mode: 'unknown_mode',
        status_entity: 'binary_sensor.test_washing'
    });
}, /Unsupported mode "unknown_mode"/, 'Unknown mode should throw an error');
console.log('✔ Unknown mode rejection verified');

// Reset to standard mode
card.setConfig({ status_entity: 'binary_sensor.test_washing' });

// 3. Test capability detection
// Standard mode capabilities
const standardCaps = card._getApplianceCapabilities();
assert.strictEqual(standardCaps.mode, 'standard');
assert.strictEqual(standardCaps.hasPrograms, false);
assert.strictEqual(standardCaps.hasDoor, false);
assert.strictEqual(standardCaps.hasInteractiveControls, false);
assert.strictEqual(standardCaps.hasConnectivity, false);
assert.strictEqual(standardCaps.hasOptions, false);
assert.strictEqual(standardCaps.hasFeatures, false);
assert.strictEqual(standardCaps.hasIDos, false);
assert.strictEqual(standardCaps.hasConsumables, false);
console.log('✔ Task 0.4: Standard capabilities are all false');

// Home Connect capabilities
card.setConfig({
    mode: 'home_connect',
    appliance_type: 'washer',
    home_connect: {
        washer: {
            program_selector_entity: 'select.washer_program',
            door_entity: 'binary_sensor.washer_door',
            power_entity: 'switch.washer_power',
            connectivity_entity: 'binary_sensor.washer_connected',
            temperature_entity: 'select.washer_temperature',
            hygiene_plus_entity: 'switch.washer_hygiene_plus',
            idos1_active_entity: 'switch.washer_idos1',
            salt_low_entity: 'binary_sensor.washer_salt_low',
            remote_control_entity: 'binary_sensor.washer_remote_control',
            remote_start_entity: 'binary_sensor.washer_remote_start'
        }
    }
});

const hcCaps = card._getApplianceCapabilities();
assert.strictEqual(hcCaps.mode, 'home_connect');
assert.strictEqual(hcCaps.hasPrograms, true);
assert.strictEqual(hcCaps.hasDoor, true);
assert.strictEqual(hcCaps.hasInteractiveControls, true);
assert.strictEqual(hcCaps.hasConnectivity, true);
assert.strictEqual(hcCaps.hasOptions, true);
assert.strictEqual(hcCaps.hasFeatures, true);
assert.strictEqual(hcCaps.hasIDos, true);
assert.strictEqual(hcCaps.hasConsumables, true);
assert.strictEqual(hcCaps.hasRemoteControl, true);
assert.strictEqual(hcCaps.hasRemoteStart, true);
console.log('✔ Task 0.4: Home Connect capabilities detected accurately');

console.log('All Phase 0 tests passed successfully!');
